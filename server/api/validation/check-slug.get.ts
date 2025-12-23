
import { validateSlugAvailability, type SlugType } from '../../utils/slugValidator';

/**
 * 슬러그 중복 및 유효성 확인 API
 * GET /api/validation/check-slug
 * 
 * Query Params:
 * - slug: 검증할 슬러그 문자열 (필수)
 * - type: 'tag' | 'category' | 'article' | 'page' (필수)
 * - excludeId: 수정 시 본인 ID 제외 (선택)
 * 
 * Response:
 * - { isValid: boolean, message?: string }
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const slug = query.slug as string;
    const type = query.type as SlugType;
    const excludeId = query.excludeId ? Number(query.excludeId) : undefined;

    if (!slug || !type) {
        throw createError({
            statusCode: 400,
            message: 'slug와 type은 필수 파라미터입니다.'
        });
    }

    // 유효성 및 중복 체크 수행
    const result = await validateSlugAvailability(slug, type, excludeId);

    return result;
});
