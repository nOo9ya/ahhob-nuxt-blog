import { getUserSession } from '../../../utils/session';
import { pages } from '../../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';
import {
    validateSlugAvailability,
} from '../../../utils/slugValidator';
import { generateSlug } from '~/shared/utils/slug';

/**
 * 페이지 수정 API
 * PUT /api/pages/:id
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (Admin)
 * 2. ID 및 Body 데이터 검증
 * 3. Slug 검증 (변경된 경우) 및 중복 자동 해결
 * 4. DB UPDATE (메타데이터 포함)
 * 5. 수정된 페이지 반환
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

    // 3. Body 데이터 확인
    const body = await readBody(event);
    const {
        title,
        slug,
        content,
        thumbnail,
        // 메타데이터
        metaTitle,
        metaDescription,
        ogImage,
        summary,
        keyTakeaways,
    } = body;

    if (!title || !content) {
        throw createError({
            statusCode: 400,
            message: '제목과 내용은 필수 항목입니다.',
        });
    }

    const db = await getDB();

    // 4. 기존 페이지 확인
    const [existingPage] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);

    if (!existingPage) {
        throw createError({
            statusCode: 404,
            message: '페이지를 찾을 수 없습니다.',
        });
    }

    // 5. Slug 검증 (변경된 경우에만)
    let targetSlug = slug || existingPage.slug;

    if (targetSlug !== existingPage.slug) {
        // 입력 없으면 title 기반 생성
        if (!slug) {
            targetSlug = generateSlug(title);
        }

        let validation = await validateSlugAvailability(targetSlug, 'page', id);

        if (!validation.isValid) {
            // 중복 시 타임스탬프 추가 (Auto-correction)
            targetSlug = `${targetSlug}-${Date.now().toString(36)}`;

            // 재검증
            validation = await validateSlugAvailability(targetSlug, 'page', id);
            if (!validation.isValid) {
                throw createError({
                    statusCode: 409,
                    message: `페이지 수정 실패: 유효하지 않은 슬러그입니다. (${validation.message})`,
                });
            }
        }
    }

    // 6. DB UPDATE
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .update(pages)
                .set({
                    title,
                    slug: targetSlug,
                    content,
                    thumbnail,
                    updatedAt: new Date(),
                    // JSON 컬럼 매핑 (SEO/Social/GEO)
                    seoMeta: {
                        title: metaTitle || title,
                        description:
                            metaDescription || content.substring(0, 150),
                    },
                    socialMeta: {
                        ogTitle: metaTitle || title,
                        ogDescription:
                            metaDescription || content.substring(0, 150),
                        ogImage: ogImage || thumbnail,
                    },
                    geoMeta: {
                        summary: summary || content.substring(0, 300),
                        keyTakeaways: keyTakeaways || [],
                    },
                })
                .where(eq(pages.id, id));
        },
        {
            errorMessage: '페이지 수정 중 오류가 발생했습니다.',
        }
    );

    // 7. 수정된 페이지 반환
    const [updatedPage] = await db
        .select()
        .from(pages)
        .where(eq(pages.id, id))
        .limit(1);

    return {
        success: true,
        page: updatedPage,
    };
});
