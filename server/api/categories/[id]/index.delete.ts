import { getUserSession } from '../../../utils/session';
import { categories } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';

/**
 * 카테고리 삭제 API
 * DELETE /api/categories/:id
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. Admin 권한 확인
 * 3. Route Parameter에서 ID 추출 및 검증
 * 4. 카테고리 존재 확인 (404 에러)
 * 5. DB DELETE
 * 6. 성공 응답 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    // 세션에서 사용자 정보 가져오기
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    // 2. Admin 권한 체크
    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    // 3. Route Parameter에서 ID 추출
    const id = Number(event.context.params?.id);

    // 4. ID Validation
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '유효하지 않은 카테고리 ID입니다.',
        });
    }

    const db = await getDB();

    // 5. 기존 카테고리 존재 확인 (구조분해할당 패턴)
    // categories 테이블에서 id로 조회
    const [existingCategory] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

    if (!existingCategory) {
        throw createError({
            statusCode: 404,
            message: '삭제할 카테고리를 찾을 수 없습니다.',
        });
    }

    // 6. DB DELETE
    // categories 테이블에서 삭제
    // useSafeQuery를 사용하여 에러 처리 자동화
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db.delete(categories).where(eq(categories.id, id));
        },
        {
            errorMessage: '카테고리 삭제 중 오류가 발생했습니다.',
        }
    );

    // 7. 응답 반환
    return {
        success: true,
        message: '카테고리가 삭제되었습니다.',
    };
});
