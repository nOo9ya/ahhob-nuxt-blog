import { getUserSession } from '../../../utils/session';
import { tags } from '../../../database/schema';
import { eq, ne, and } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';
import { validateSlugAvailability } from '../../../utils/slugValidator';

// 두개의 권한이므로 && 연산을 사용하면 더 효율적이지만 학습을 위한 예제를 위하여 상수 선언 후 includes 메서드 사용
const ALLOWED_ROLES = ['editor', 'admin'];

/**
 * 태그 수정 API
 * PUT /api/tags/:id
 *
 * 권한: editor, admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. 권한 체크 (editor, admin)
 * 3. Route Parameter에서 ID 추출
 * 4. Request Body 읽기 (name, slug)
 * 5. Validation (필수 필드)
 * 6. 태그 존재 확인 (404)
 * 7. Slug 중복 체크 (자기 자신 제외, 409)
 * 8. DB UPDATE
 * 9. 수정된 태그 반환
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

    // 2. 권한 체크 (editor 또는 admin)
    // user.role이 undefined일 수 있으므로 안전하게 처리
    const userRole = user.role || '';
    if (!ALLOWED_ROLES.includes(userRole)) {
        throw createError({
            statusCode: 403,
            message: 'Editor 또는 Admin 권한이 필요합니다.',
        });
    }

    // 3. Route Parameter에서 ID 추출
    const id = Number(event.context.params?.id);

    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'ID가 유효하지 않습니다.',
        });
    }

    // 4. Request Body 읽기
    const body = await readBody(event);
    const { name, slug } = body;

    // 5. Validation - 필수 필드 확인
    if (!name || !slug) {
        throw createError({
            statusCode: 400,
            message: 'name과 slug는 필수 항목입니다.',
        });
    }

    const db = await getDB();

    // 6. 태그 존재 확인
    const existingTag = await db
        .select()
        .from(tags)
        .where(eq(tags.id, id))
        .limit(1);

    if (existingTag.length === 0) {
        throw createError({
            statusCode: 404,
            message: '태그를 찾을 수 없습니다.',
        });
    }

    // 7. Slug 유효성 및 중복 체크 (통합 검증 함수 사용, 자기 자신 제외)
    // validateSlugAvailability의 세 번째 인자로 currentId를 전달하여 Update 시 자기 자신과의 중복을 무시함
    const slugValidation = await validateSlugAvailability(slug, 'tag', id);

    if (!slugValidation.isValid) {
        throw createError({
            statusCode: slugValidation.message?.includes('이미') ? 409 : 400,
            message: slugValidation.message || '슬러그 형식이 올바르지 않습니다.',
        });
    }

    // 8. DB UPDATE
    // useSafeQuery를 사용하여 에러 처리 자동화
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .update(tags)
                .set({
                    name,
                    slug,
                })
                .where(eq(tags.id, id));
        },
        {
            errorMessage: '태그 수정 중 오류가 발생했습니다.',
        }
    );

    // 9. 수정된 태그 조회 및 반환
    const [updatedTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.id, id))
        .limit(1);

    return {
        success: true,
        message: '태그가 수정되었습니다.',
        tag: updatedTag,
    };
});
