import { getUserSession } from '../../../utils/session';
import { pages } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';

/**
 * 페이지 삭제 API
 * DELETE /api/pages/:id
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (Admin)
 * 2. ID 파라미터 검증
 * 3. DB DELETE
 * 4. 결과 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: '로그인이 필요합니다.' });
    }

    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    // 2. ID 파라미터 확인
    const id = Number(event.context.params?.id);
    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    // 3. DB DELETE
    await useSafeQuery(
        async () => {
            const db = await getDB();
            await db.delete(pages).where(eq(pages.id, id));
        },
        {
            errorMessage: '페이지 삭제 중 오류가 발생했습니다.',
        }
    );

    return {
        success: true,
        message: '페이지가 삭제되었습니다.',
    };
});
