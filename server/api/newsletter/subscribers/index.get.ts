import { newsletterSubscribers } from '~/server/database/schema';
import { getDB } from '~/server/database';
import { getUserSession } from '~/server/utils/session';
import { desc, count } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 관리자/스태프 권한 체크
    const user = await getUserSession(event);
    if (!user || !['admin', 'editor', 'writer'].includes(user.role)) {
        throw createError({
            statusCode: 403,
            message: '접근 권한이 없습니다.',
        });
    }

    const db = await getDB();

    // 2. 쿼리 파라미터 파싱
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    // 3. 전체 개수 조회
    const [totalResult] = await db.select({ count: count() }).from(newsletterSubscribers);
    const total = totalResult.count;

    // 4. 데이터 조회
    const items = await db
        .select()
        .from(newsletterSubscribers)
        .orderBy(desc(newsletterSubscribers.createdAt))
        .limit(limit)
        .offset(offset);

    // 5. 응답 반환 (페이지네이션 포맷 준수)
    return {
        subscribers: items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: offset + items.length < total,
            hasPrev: page > 1,
        },
    };
});
