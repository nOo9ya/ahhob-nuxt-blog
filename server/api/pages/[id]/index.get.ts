import { getDB } from '../../../database';
import { pages } from '../../../database/schema';
import { eq } from 'drizzle-orm';

/**
 * 페이지 상세 조회 API (ID 기반)
 * GET /api/pages/:id
 *
 * 권한: 없음
 *
 * 데이터 흐름:
 * 1. ID 파라미터 검증
 * 2. DB 조회
 * 3. 결과 반환
 */
export default defineEventHandler(async (event) => {
    // 1. ID 파라미터 확인
    const id = Number(event.context.params?.id);
    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    const db = await getDB();

    // 2. DB 조회
    const [page] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);

    if (!page) {
        throw createError({
            statusCode: 404,
            message: '페이지를 찾을 수 없습니다.',
        });
    }

    return {
        success: true,
        page,
    };
});
