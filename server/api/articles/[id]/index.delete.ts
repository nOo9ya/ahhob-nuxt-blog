import { getUserSession } from '../../../utils/session';
import { articles } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';

/**
 * 기사 삭제 API
 * DELETE /api/articles/:id
 *
 * 권한: 작성자 본인 또는 admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. ID 파라미터 검증
 * 3. 기사 존재 및 권한 확인
 * 4. 기사 삭제 (CASCADE로 article_tags 자동 삭제)
 * 5. 성공 응답 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await getUserSession(event);
    if (!user) {
        throw createError({ statusCode: 401, message: '로그인이 필요합니다.' });
    }

    // 2. ID 파라미터 확인
    const id = Number(getRouterParam(event, 'id'));
    if (!id) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    const db = await getDB();

    // 3. 기사 존재 여부 및 권한 확인
    const [article] = await db
        .select({
            id: articles.id,
            adminId: articles.adminId,
        })
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    if (!article) {
        throw createError({
            statusCode: 404,
            message: '기사를 찾을 수 없습니다.',
        });
    }

    if (article.adminId !== user.userId && user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '삭제 권한이 없습니다.',
        });
    }

    // 4. 삭제 처리
    // article_tags 테이블은 외래키 설정(onDelete: 'cascade')이 되어 있어 자동 삭제됨
    // useSafeQuery를 사용하여 에러 처리 자동화
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db.delete(articles).where(eq(articles.id, id));
        },
        {
            errorMessage: '기사 삭제 중 오류가 발생했습니다.',
        }
    );

    // 5. 성공 응답 반환
    return {
        success: true,
        message: '기사가 삭제되었습니다.',
    };
});
