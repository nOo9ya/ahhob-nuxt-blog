import { getUserSession } from '../../utils/session';
import { tags } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../utils/db';
import { getDB } from '../../database';
import { validateSlugAvailability } from '../../utils/slugValidator';

/**
 * 태그 생성 API
 * POST /api/tags
 *
 * 권한: editor, admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. Editor 또는 Admin 권한 확인
 * 3. Request Body 읽기 (name, slug)
 * 4. 필수 필드 검증
 * 5. Slug 중복 체크
 * 6. DB INSERT - 새 태그 생성
 * 7. 생성된 태그 조회 및 반환
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

    // 2. Editor 또는 Admin 권한 체크
    // 태그는 editor와 admin 모두 생성 가능
    if (user.role !== 'editor' && user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: 'Editor 또는 Admin 권한이 필요합니다.',
        });
    }

    // 3. Request Body 읽기
    const body = await readBody(event);
    const { name, slug } = body;

    // 4. Validation - 필수 필드 확인
    if (!name || !slug) {
        throw createError({
            statusCode: 400,
            message: 'name과 slug는 필수 항목입니다.',
        });
    }

    // 5. Slug 유효성 및 중복 체크 (통합 검증 함수 사용)
    const slugValidation = await validateSlugAvailability(slug, 'tag');
    
    if (!slugValidation.isValid) {
        throw createError({
            statusCode: slugValidation.message?.includes('이미') ? 409 : 400,
            message: slugValidation.message || '슬러그 형식이 올바르지 않습니다.',
        });
    }

    const db = await getDB();

    // 6. DB INSERT - 새 태그 생성
    // useSafeQuery를 사용하여 에러 처리 자동화
    const [newTag] = await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .insert(tags)
                .values({
                    name,
                    slug,
                })
                .$returningId();
        },
        {
            errorMessage: '태그 생성 중 오류가 발생했습니다.',
        }
    );

    if (!newTag) {
        throw createError({
            statusCode: 500,
            message: '태그 생성에 실패했습니다.',
        });
    }

    // 7. 생성된 태그 조회 및 반환
    const [tag] = await db
        .select()
        .from(tags)
        .where(eq(tags.id, newTag.id))
        .limit(1);

    return {
        success: true,
        message: '태그가 생성되었습니다.',
        tag: tag,
    };
});
