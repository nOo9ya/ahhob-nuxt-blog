import { getUserSession } from '../../utils/session';
import { pages } from '../../database/schema';
import { useSafeQuery } from '../../utils/db';
import { getDB } from '../../database';
import {
    validateSlugAvailability,
} from '../../utils/slugValidator';
import { generateSlug } from '../../../shared/utils/slug';
import { sql } from 'drizzle-orm';
import { moveImagesToFinal } from '../../utils/moveImages';

/**
 * 페이지 생성 API
 * POST /api/pages
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (Admin)
 * 2. Request Body 읽기 및 필수 필드 검증
 * 3. Slug 생성 및 검증 (Auto-correction)
 * 4. DB INSERT (메타데이터 포함)
 * 5. 생성된 페이지 반환
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

    // 2. Request Body 읽기
    const body = await readBody(event);
    const {
        title,
        slug, // 직접 입력 가능
        content,
        thumbnail,
        // 메타데이터
        metaTitle,
        metaDescription,
        ogImage,
        summary,
        keyTakeaways,
    } = body;

    // 필수 필드 검증
    if (!title || !content) {
        throw createError({
            statusCode: 400,
            message: '제목과 내용은 필수 항목입니다.',
        });
    }

    // 3. Slug 처리
    // 입력된 slug가 없으면 title로 생성
    let targetSlug = slug || generateSlug(title);

    // Slug 검증 및 중복 처리 (Auto-correction)
    let validation = await validateSlugAvailability(targetSlug, 'page');

    if (!validation.isValid) {
        // 중복 시 타임스탬프 추가
        if (targetSlug === slug) {
            // 사용자가 직접 입력한 경우 에러 반환 (선택 사항이나 명시적 에러가 나을 수 있음)
            // 하지만 일관성을 위해 Auto-correction 적용
            targetSlug = `${targetSlug}-${Date.now().toString(36)}`;
        } else {
            targetSlug = `${targetSlug}-${Date.now().toString(36)}`;
        }

        // 재검증
        validation = await validateSlugAvailability(targetSlug, 'page');
        if (!validation.isValid) {
            throw createError({
                statusCode: 409,
                message: `페이지 생성 실패: 유효하지 않은 슬러그입니다. (${validation.message})`,
            });
        }
    }

    // 3.1 temp 폴더의 이미지를 최종 경로로 이동
    const movedImages = await moveImagesToFinal({
        content,
        thumbnail: thumbnail || ogImage || null,
        contentType: 'page',
        slug: targetSlug,
        userId: user.userId,
    });

    // 이동된 경로로 업데이트
    const finalContent = movedImages.content;
    const finalThumbnail = movedImages.thumbnail;

    // 4. DB INSERT (이동된 이미지 경로 사용)
    const [newPage] = await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .insert(pages)
                .values({
                    title,
                    slug: targetSlug,
                    content: finalContent, // 이동된 이미지 경로가 포함된 content
                    thumbnail: finalThumbnail, // 이동된 썸네일 경로 사용
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
                        ogImage: finalThumbnail || ogImage || thumbnail, // 이동된 썸네일 경로 사용
                    },
                    geoMeta: {
                        summary: summary || content.substring(0, 300),
                        keyTakeaways: keyTakeaways || [],
                    },
                })
                .$returningId();
        },
        {
            errorMessage: '페이지 생성 중 오류가 발생했습니다.',
        }
    );

    if (!newPage) {
        throw createError({
            statusCode: 500,
            message: '페이지 생성에 실패했습니다.',
        });
    }

    // 5. 생성된 페이지 반환
    const db = await getDB();
    const [createdPage] = await db
        .select()
        .from(pages)
        .where(sql`id = ${newPage.id}`)
        .limit(1);

    return {
        success: true,
        page: createdPage,
    };
});
