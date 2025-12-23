import { getDB } from '../../../database';
import { categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';

/**
 * 카테고리 상세 조회 API
 * GET /api/categories/:id
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 데이터 흐름:
 * 1. Route Parameter에서 ID 추출
 * 2. ID Validation
 * 3. DB 조회 (특정 카테고리)
 * 4. 카테고리 존재 확인 (404 에러)
 * 5. 카테고리 정보 반환
 */
export default defineEventHandler(async (event) => {
    // 1. Route Parameter에서 ID 또는 Slug 추출
    const param = event.context.params?.id;
    if (!param) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    const db = await getDB();
    let category;

    // 2. ID인지 Slug인지 판별하여 조회
    // 숫자로만 구성되어 있으면 ID로 간주
    if (/^\d+$/.test(param)) {
        const id = Number(param);
        [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);
    } else {
        // 문자열이면 Slug로 간주
        const slug = param;
        [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug))
            .limit(1);
    }

    // 4. 404 처리 - 카테고리가 없는 경우
    if (!category) {
        throw createError({
            statusCode: 404,
            message: '카테고리를 찾을 수 없습니다.',
        });
    }

    // 5. 응답 반환
    return category; // { category: ... } 대신 객체 자체를 반환하거나 통일성 유지
});
