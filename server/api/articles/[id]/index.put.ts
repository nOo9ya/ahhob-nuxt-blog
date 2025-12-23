import { getUserSession } from '~/server/utils/session';
import {
    articles,
    articleTags,
    tags,
    categories,
} from '~/server/database/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { useSafeTransaction } from '~/server/utils/db';
import { getDB } from '~/server/database';
import {
    validateSlugAvailability,
} from '~/server/utils/slugValidator';
import { generateSlug } from '~/shared/utils/slug';
// Image Cleanup Utility
import { extractImageUrls, deleteUnusedImages } from '~/server/utils/image';
import { moveImagesToFinal } from '~/server/utils/moveImages';

/**
 * 기사 수정 API
 * PUT /api/articles/:id
 *
 * 권한: 작성자 본인 또는 admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. ID 파라미터 검증
 * 3. Request Body 읽기 및 필드 검증 (메타데이터 포함)
 * 4. 카테고리 존재 확인
 * 5. 기사 존재 및 권한 확인
 * 6. 트랜잭션 시작
 *    6-1. Slug 검증 (수정된 경우)
 *    6-2. 기사 정보 UPDATE
 *    6-3. 태그 변경 처리
 * 7. 수정된 기사 정보 조회 및 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await getUserSession(event);

    if (!user) {
        throw createError({ statusCode: 401, message: '로그인이 필요합니다.' });
    }

    // 2. ID 파라미터 확인
    const id = Number(getRouterParam(event, 'id'));

    if (!id) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    // 3. 바디 데이터 확인 및 Validation
    const body = await readBody(event);
    const {
        title,
        slug, // Slug 수정 지원
        content,
        categoryId,
        tagNames,
        status,
        // 메타데이터
        metaTitle,
        metaDescription,
        ogImage,
        summary,
        keyTakeaways,
        canonicalUrl: _canonicalUrl,
    } = body;

    // ... (Validation logic skipped for brevity in replace tool, but will be preserved by surrounding context match)

    // 4.1 Canonical URL Logic (Pre-computation needed if only category changed?)
    // Actually inside transaction is safer if slug changes, but we need DB access for category path.
    // Let's prepare db instance first.

    // 필수 필드 검증
    if (!title || typeof title !== 'string' || title.trim() === '') {
        throw createError({ statusCode: 400, message: '제목을 입력해주세요.' });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
        throw createError({ statusCode: 400, message: '내용을 입력해주세요.' });
    }

    if (!categoryId || typeof categoryId !== 'number') {
        throw createError({
            statusCode: 400,
            message: '카테고리를 선택해주세요.',
        });
    }

    // status 검증
    const validStatuses = ['draft', 'published', 'archived'];
    if (status && !validStatuses.includes(status)) {
        throw createError({ statusCode: 400, message: '잘못된 상태값입니다.' });
    }

    // tagNames 검증
    if (tagNames && !Array.isArray(tagNames)) {
        throw createError({
            statusCode: 400,
            message: '태그 형식이 올바르지 않습니다.',
        });
    }

    const db = await getDB();

    // 4. 카테고리 존재 여부 확인
    const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

    if (!category) {
        throw createError({
            statusCode: 400,
            message: '존재하지 않는 카테고리입니다.',
        });
    }

    // 5. 기사 존재 여부 및 권한 확인 (작성자 본인 또는 관리자만 수정 가능)
    const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    if (!article) {
        throw createError({
            statusCode: 404,
            message: '기사를 찾을 수 없습니다.',
        });
    }

    if (article.adminId !== user.userId && user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '수정 권한이 없습니다.',
        });
    }

    // 5.1 Slug 결정 (수정된 경우 또는 기존 slug 사용)
    const finalSlug = slug && slug !== article.slug ? slug : article.slug;

    // 5.2 카테고리 경로 조회
    let categoryPath = 'uncategorized';
    if (category.path) {
        categoryPath = category.path;
    }

    // 5.3 temp 폴더의 이미지를 최종 경로로 이동
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

    // 6. 트랜잭션으로 수정 처리
    await useSafeTransaction(
        async (tx) => {
            // 6-0. 이미지 GC (Garbage Collection)
            // 수정 전 본문에만 있고 수정 후 본문에는 없는 이미지를 찾아 삭제
            try {
                const oldImages = extractImageUrls(article.content);
                const newImages = extractImageUrls(content);
                
                const deletedImages = oldImages.filter((img: string) => !newImages.includes(img));
                
                if (deletedImages.length > 0) {
                    await deleteUnusedImages(deletedImages);
                }
            } catch (e) {
                console.error('[ImageGC] Error processing images:', e);
            }

            // 6-0-1. Slug 업데이트 로직
            let finalSlug = article.slug;
            if (slug && slug !== article.slug) {
                // Slug가 변경된 경우 유효성 검사 진행
                const validation = await validateSlugAvailability(
                    slug,
                    'article',
                    id // 자기 자신 제외
                );

                if (!validation.isValid) {
                    throw createError({
                        statusCode: 409,
                        message: validation.message,
                    });
                }
                finalSlug = slug;
            }

            // 6-0-1. Canonical URL 자동 업데이트
            // 사용자가 명시적으로 보낸 값이 있으면 우선 사용(_canonicalUrl)
            // 없으면, 슬러그나 카테고리가 변경되었을 때, 혹은 기존에 없었을 때 자동 생성 시도
            let canonicalUrl = _canonicalUrl || article.canonicalUrl;
            
            // 만약 사용자가 비워뒀거나(의도적 리셋), 슬러그/카테고리가 변경되어 재생성이 필요한 경우
            // 여기서는 "입력되지 않았다면" 자동 생성 조건이므로, _canonicalUrl이 falsy일 때만 로직 수행
            if (!_canonicalUrl) {
                 const targetSlg = finalSlug;
                 const targetCatId = categoryId;
                 
                 // 카테고리가 변경되었거나, 기존 URL이 없거나, 슬러그가 변경된 경우 재생성
                 if (targetCatId !== article.categoryId || targetSlg !== article.slug || !article.canonicalUrl) {
                      // 변경된 카테고리 정보 가져오기 (이미 위에서 category 존재 확인 함, 그러나 path가 필요)
                      // 위에서 category 조회시 select()로 다 가져왔으므로 path가 있는지 확인
                      const [targetCategory] = await tx
                        .select({ path: categories.path })
                        .from(categories)
                        .where(eq(categories.id, targetCatId))
                        .limit(1);

                      if (targetCategory) {
                        const siteUrl = useRuntimeConfig().public.siteUrl || 'https://example.com';
                        const cleanSiteUrl = siteUrl.replace(/\/+$/, '');
                        const cleanPath = targetCategory.path ? targetCategory.path.replace(/^\/+|\/+$/g, '') : '';
                        const cleanSlug = targetSlg.replace(/^\/+|\/+$/g, '');
                        
                        canonicalUrl = cleanPath 
                            ? `${cleanSiteUrl}/${cleanPath}/${cleanSlug}`
                            : `${cleanSiteUrl}/articles/${cleanSlug}`;
                      }
                 }
            }

            // 6-1. 기사 정보 업데이트 (이동된 이미지 경로 사용)
            await tx
                .update(articles)
                .set({
                    title,
                    slug: finalSlug,
                    content: finalContent, // 이동된 이미지 경로가 포함된 content
                    categoryId,
                    status, // 'draft' | 'published'
                    updatedAt: new Date(),
                    // 메타데이터 매핑
                    metaTitle,
                    metaDescription,
                    ogImage: finalThumbnail || ogImage, // 이동된 썸네일 경로 사용
                    canonicalUrl,

                    seoMeta: {
                        ...body.seoMeta,
                        title: metaTitle || title,
                        description: metaDescription || finalContent.substring(0, 150),
                    },
                    socialMeta: {
                        ...body.socialMeta,
                        ogTitle: metaTitle || title,
                        ogDescription: metaDescription || finalContent.substring(0, 150),
                        ogImage: finalThumbnail || ogImage, // 이동된 썸네일 경로 사용
                    },
                    geoMeta: {
                        ...body.geoMeta,
                        summary: summary || finalContent.substring(0, 300),
                        keyTakeaways: keyTakeaways || [],
                    },
                    isCommentEnabled: body.isCommentEnabled ?? article.isCommentEnabled, // 변경 시 업데이트
                })
                .where(eq(articles.id, id));

            // 6-2. 태그 업데이트 (최적화: 차이만 계산해서 추가/삭제)
            if (tagNames) {
                // 1. 기존 태그 ID 목록 조회
                const existingArticleTags = await tx
                    .select({ tagId: articleTags.tagId })
                    .from(articleTags)
                    .where(eq(articleTags.articleId, id));

                const existingTagIds = new Set(
                    existingArticleTags.map((at) => at.tagId)
                );

                // 2. 새로운 태그 이름 → 태그 ID 변환 (없으면 생성)
                const newTagIds: number[] = [];
                for (const tagName of tagNames) {
                    const tagSlug = generateSlug(tagName);

                    // 태그 조회 또는 생성
                    const [existingTag] = await tx
                        .select()
                        .from(tags)
                        .where(eq(tags.name, tagName))
                        .limit(1);

                    let tagId = existingTag?.id;

                    if (!tagId) {
                        // 태그가 없으면 자동 생성
                        const [tagResult] = await tx
                            .insert(tags)
                            .values({ name: tagName, slug: tagSlug })
                            .$returningId(); // { id: number }
                        if (!tagResult) {
                            throw new Error('태그 생성 실패');
                        }
                        tagId = tagResult.id;
                    }

                    newTagIds.push(tagId);
                }

                const newTagIdSet = new Set(newTagIds);

                // 3. 차이 계산
                const tagIdsToDelete = [...existingTagIds].filter(
                    (id) => !newTagIdSet.has(id)
                );

                const tagIdsToAdd = [...newTagIdSet].filter(
                    (id) => !existingTagIds.has(id)
                );

                // 4. 삭제할 태그만 삭제
                if (tagIdsToDelete.length > 0) {
                    await tx
                        .delete(articleTags)
                        .where(
                            and(
                                eq(articleTags.articleId, id),
                                inArray(articleTags.tagId, tagIdsToDelete)
                            )
                        );
                }

                // 5. 추가할 태그만 추가
                if (tagIdsToAdd.length > 0) {
                    const values = tagIdsToAdd.map((tagId) => ({
                        articleId: id,
                        tagId,
                    }));

                    await tx.insert(articleTags).values(values);
                }
            }
        },
        {
            errorMessage: '기사 수정 중 오류가 발생했습니다.',
        }
    );

    // 7. 수정된 기사 정보 조회 및 반환
    const [updatedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    return {
        success: true,
        article: updatedArticle,
    };
});
