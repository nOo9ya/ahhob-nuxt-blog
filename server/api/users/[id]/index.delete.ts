import { getDB } from '~/server/database';
import { users, articles } from '~/server/database/schema';
import { getUserSession, clearUserSession } from '~/server/utils/session';
import { useSafeQuery } from '~/server/utils/db';
import { eq } from 'drizzle-orm';

/**
 * 사용자 삭제 API
 * DELETE /api/users/:id
 *
 * 권한:
 * - 관리자 (Admin): 모든 사용자 삭제 가능
 * - 일반 사용자: 본인 계정만 삭제 가능
 *
 * 제약사항:
 * - 작성한 기사(Articles)가 있는 경우 삭제 불가 (데이터 무결성)
 * - 409 Conflict 에러 반환
 *
 * 데이터 흐름:
 * 1. 인증 및 권한 체크
 * 2. 작성한 기사 존재 여부 확인
 * 3. 기사가 없으면 삭제 수행
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    // 2. ID 파싱 및 검증
    const id = Number(event.context.params?.id);
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '잘못된 사용자 ID입니다.',
        });
    }

    // 3. 권한 체크 (본인 또는 관리자)
    const isSelf = user.userId === id;
    const isAdmin = user.role === 'admin';

    if (!isSelf && !isAdmin) {
        throw createError({
            statusCode: 403,
            message: '삭제 권한이 없습니다.',
        });
    }

    const db = await getDB();

    // 4. 삭제 전 제약사항 확인 (작성한 기사가 있는지)
    // users 테이블 삭제 시 articles의 authorId가 문제될 수 있음 (CASCADE 미설정 가정)
    const userArticles = await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.authorId, id))
        .limit(1);

    if (userArticles.length > 0) {
        throw createError({
            statusCode: 409, // Conflict
            message:
                '작성한 기사가 있는 사용자는 삭제할 수 없습니다. 기사를 먼저 삭제하거나 소유권을 이전해주세요.',
        });
    }

    // 5. DB 삭제 수행
    await useSafeQuery(
        async () => {
            return await db.delete(users).where(eq(users.id, id));
        },
        { errorMessage: '사용자 삭제 중 오류가 발생했습니다.' }
    );

    // 6. 세션 처리 (본인이 삭제한 경우 로그아웃 필요)
    if (isSelf) {
        await clearUserSession(event);
    }

    return {
        success: true,
        message: '사용자가 삭제되었습니다.',
    };
});
