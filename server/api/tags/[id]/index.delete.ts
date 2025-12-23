import { getUserSession } from '../../../utils/session';
import { tags } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';

/**
 * 태그 삭제 API
 * DELETE /api/tags/:id
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. Admin 권한 확인
 * 3. Route Parameter에서 ID 추출 및 검증
 * 4. 태그 존재 확인 (404 에러 방지)
 * 5. DB DELETE - 태그 삭제
 * 6. 성공 응답 반환
 *
 * 주의사항:
 * - CASCADE 설정: 태그 삭제 시 article_tags 관계도 자동 삭제됨
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
    // 태그 삭제는 admin만 가능
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
            message: '유효하지 않은 태그 ID입니다.',
        });
    }

    const db = await getDB();

    // 5. 태그 존재 확인
    // 삭제 전 태그가 존재하는지 확인 (404 에러 방지)
    const [existingTag] = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.id, id))
        .limit(1);

    if (!existingTag) {
        throw createError({
            statusCode: 404,
            message: '삭제할 태그를 찾을 수 없습니다.',
        });
    }

    // 6. DB DELETE
    // Hard Delete 방식: DB에서 완전히 삭제
    // CASCADE 설정으로 article_tags 관계도 자동 삭제됨
    // useSafeQuery를 사용하여 에러 처리 자동화
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db.delete(tags).where(eq(tags.id, id));
        },
        {
            errorMessage: '태그 삭제 중 오류가 발생했습니다.',
        }
    );

    // 7. 응답 반환
    return {
        success: true,
        message: '태그가 삭제되었습니다.',
    };
});
