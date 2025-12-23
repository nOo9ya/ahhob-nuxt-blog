import { getUserSession } from '../../utils/session';
import { articles, articleTags, tags, categories } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeTransaction } from '../../utils/db';
import {
    validateSlugAvailability,
} from '../../utils/slugValidator';
import { generateSlug } from '../../../shared/utils/slug';
import { getDB } from '../../database';
import { moveImagesToFinal } from '../../utils/moveImages';

/**
 * 기사 생성 API
 * POST /api/articles
 *
 * 권한: editor, admin (로그인한 사용자)
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. Request Body 읽기 (title, content, categoryId, tagNames)
 * 3. 필수 필드 검증
 * 4. Slug 생성 (제목 기반) 및 중복 자동 해결
 * 5. 트랜잭션 시작
 *    5-1. 기사 INSERT
 *    5-2. 태그 처리 (존재하면 연결, 없으면 생성 후 연결)
 *    5-3. 기사-태그 관계 INSERT
 * 6. 생성된 기사 ID 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인 (로그인한 사용자만 가능)
    const user = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    // 2. 요청 바디 데이터 가져오기
    const body = await readBody(event);
    const {
        title,
        content,
        categoryId,
        tagNames,
        // 메타데이터
        metaTitle,
        metaDescription,
        ogImage,
        summary,
        keyTakeaways,
        canonicalUrl: _canonicalUrl, // Rename to avoid conflict if we modify it
    } = body; // tagNames: ['AI', 'Nuxt'] 예시

    if (!title || !content || !categoryId) {
        throw createError({
            statusCode: 400,
            message: '필수 항목이 누락되었습니다.',
        });
    }

    // 3. Slug 결정 (요청된 slug가 있으면 사용, 없으면 제목 기반 생성)
    const slug = body.slug ? body.slug : generateSlug(title);

    // 4. Slug 검증 및 중복 처리 (Auto-correction)
    let finalSlug = slug;
    let validation = await validateSlugAvailability(finalSlug, 'article');

    // 중복되거나 유효하지 않은 경우 처리
    if (!validation.isValid) {
        // 이미 존재하는 슬러그라면 타임스탬프를 붙여서 고유하게 만듦
        finalSlug = `${slug}-${Date.now().toString(36)}`;

        // 재검증
        validation = await validateSlugAvailability(finalSlug, 'article');
        if (!validation.isValid) {
            throw createError({
                statusCode: 409,
                message: `슬러그 생성에 실패했습니다: ${validation.message}`,
            });
        }
    }

    // 4.1 카테고리 경로 조회 및 Canonical URL 자동 생성
    const db = await getDB();
    const [category] = await db.select({ path: categories.path }).from(categories).where(eq(categories.id, categoryId)).limit(1);

    let categoryPath = 'uncategorized';
    let canonicalUrl = _canonicalUrl;

    if (category) {
        categoryPath = category.path || 'uncategorized';

        if (!canonicalUrl) {
            const siteUrl = useRuntimeConfig().public.siteUrl || 'https://example.com';
            // Remove leading/trailing slashes from parts
            const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
            const cleanPath = category.path ? category.path.replace(/^\/+|\/+$/g, '') : '';
            const cleanSlug = finalSlug.replace(/^\/+|\/+$/g, '');

            // Path construction: {siteUrl}/categories/{pathWithSlug} or {siteUrl}/{path}/{slug}
            // Assuming pattern: /categories/:categoryPath/:slug or similar.
            // Let's us standard /articles/:id or /:slug if simple but user asked for category reference.
            // Impl plan says: {siteUrl}/categories/{categoryPath}/{slug}
            canonicalUrl = cleanPath
               ? `${cleanSiteUrl}/${cleanPath}/${cleanSlug}`
               : `${cleanSiteUrl}/articles/${cleanSlug}`;
        }
    }

    // 4.2 temp 폴더의 이미지를 최종 경로로 이동
    const movedImages = await moveImagesToFinal({
        content,
        thumbnail: ogImage || null,
        contentType: 'article',
        categoryPath,
        slug: finalSlug,
        userId: user.userId,
    });

    // 이동된 경로로 업데이트
    const finalContent = movedImages.content;
    const finalThumbnail = movedImages.thumbnail;

    // 5. 트랜잭션으로 기사 생성 및 태그 연결 구현
    // useSafeTransaction을 사용하여 에러 처리 자동화
    const newArticleId = await useSafeTransaction(
        async (tx) => {
            // 5-1. 기사 삽입 (이동된 이미지 경로 사용)
            const [createdArticle] = await tx
                .insert(articles)
                .values({
                    title,
                    slug: finalSlug, // 검증된 슬러그 사용
                    content: finalContent, // 이동된 이미지 경로가 포함된 content
                    excerpt: content.substring(0, 200) + '...', // 간단한 요약 생성
                    authorId: user.userId, // 현재 로그인한 사용자 ID
                    categoryId,
                    status: 'published', // 일단 바로 발행 상태로
                    publishedAt: new Date(),
                    // JSON 컬럼 매핑 (SEO/Social/GEO)
                    // JSON 컬럼 매핑 (SEO/Social/GEO)
                    metaTitle: metaTitle,
                    metaDescription: metaDescription,
                    ogImage: finalThumbnail || ogImage, // 이동된 썸네일 경로 사용
                    canonicalUrl: canonicalUrl,
                    // JSON Fields
                    seoMeta: {
                        ...body.seoMeta,
                        title: metaTitle || title,
                        description: metaDescription || content.substring(0, 150),
                    },
                    socialMeta: {
                        ...body.socialMeta,
                        ogTitle: metaTitle || title,
                        ogDescription: metaDescription || content.substring(0, 150),
                        ogImage: finalThumbnail || ogImage, // 이동된 썸네일 경로 사용
                    },
                    geoMeta: {
                        ...body.geoMeta,
                        summary: summary || content.substring(0, 300),
                        keyTakeaways: keyTakeaways || [],
                    },
                    isCommentEnabled: body.isCommentEnabled ?? true, // 기본값 true
                })
                .$returningId(); // { id: number }

            if (!createdArticle) {
                throw new Error('기사 생성 실패');
            }
            const articleId = createdArticle.id;

            // 5-2. 태그 처리 (있으면)
            if (tagNames && tagNames.length > 0) {
                for (const tagName of tagNames) {
                    // 태그 Slug 생성
                    const tagSlug = generateSlug(tagName);

                    // 태그가 이미 존재하는지 확인 (이름 또는 Slug 기준)
                    const [existingTag] = await tx
                        .select()
                        .from(tags)
                        .where(eq(tags.name, tagName)) // 또는 eq(tags.slug, tagSlug)
                        .limit(1);

                    let tagId = existingTag?.id;

                    if (!tagId) {
                        // 태그가 없으면 자동 생성
                        const [tagResult] = await tx
                            .insert(tags)
                            .values({
                                name: tagName,
                                slug: tagSlug,
                            })
                            .$returningId(); // { id: number }
                        if (!tagResult) {
                            throw new Error('태그 생성 실패');
                        }
                        tagId = tagResult.id;
                    }

                    // 기사와 태그 연결
                    await tx.insert(articleTags).values({ articleId, tagId });
                }
            }

            return articleId;
        },
        {
            errorMessage: '기사 생성 중 오류가 발생했습니다.',
            // debug 옵션은 자동으로 NODE_ENV에 따라 설정됨
        }
    );

    return {
        success: true,
        data: {
            id: newArticleId,
            slug: finalSlug,
        },
    };
});
