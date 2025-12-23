import { getDB } from '~/server/database';
import { users } from '~/server/database/schema';
import { getUserSession } from '~/server/utils/session';
import { desc } from 'drizzle-orm';

/**
 * 일반 회원(Member) 목록 조회 API
 * GET /api/users
 *
 * 권한: 관리자 (Admin)
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await getUserSession(event);

    if (!user || !['admin', 'editor', 'writer'].includes(user.role)) {
        throw createError({
            statusCode: 403,
            message: '접근 권한이 없습니다.',
        });
    }

    const db = await getDB();

    // 3. 사용자 목록 조회 (users 테이블)
    const userList = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            provider: users.provider,
            avatar: users.avatar,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    // 4. 결과 반환
    return {
        success: true,
        data: userList,
    };
});
