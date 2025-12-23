import { getDB } from '../../../database';
import {
    articles,
    users,
    admins,
    categories,
    articleTags,
    tags,
} from '../../../database/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * 기사 상세 조회 API
 * GET /api/articles/:id_or_slug
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 특징:
 * - 파라미터가 숫자면 ID로 조회
 * - 파라미터가 문자열이면 Slug로 조회
 * - 라우팅 충돌 방지를 위해 통합됨
 */
export default defineEventHandler(async (event) => {
    // 1. 파라미터 추출
    const param = getRouterParam(event, 'id');
    const decodedParam = decodeURIComponent(param || '');

    if (!decodedParam) {
        throw createError({ statusCode: 400, message: '잘못된 요청입니다.' });
    }

    const db = await getDB();
    let query = db
        .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            content: articles.content,
            excerpt: articles.excerpt,
            thumbnail: articles.thumbnail,
            viewCount: articles.viewCount,
            publishedAt: articles.publishedAt,
            categoryId: articles.categoryId,
            isCommentEnabled: articles.isCommentEnabled,
            commentPolicy: articles.commentPolicy,
            // Rich Metadata 추가
            metaTitle: articles.metaTitle,
            metaDescription: articles.metaDescription,
            ogImage: articles.ogImage,
            seoMeta: articles.seoMeta,
            socialMeta: articles.socialMeta,
            geoMeta: articles.geoMeta,
            createdAt: articles.createdAt,
            author: {
                name: admins.name,
                avatar: admins.avatar,
                bio: admins.bio,
            },
            category: {
                name: categories.name,
                slug: categories.slug,
                path: categories.path, // [NEW] Path 추가
            },
        })
        .from(articles)
        .leftJoin(admins, eq(articles.adminId, admins.id))
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .limit(1);

    // 2. ID vs Slug 분기 처리
    // 숫자로만 구성되어 있으면 ID로 간주, 그렇지 않으면 Slug
    // (Slug가 숫자로만 구성될 일은 거의 없다고 가정, 혹은 Slug 생성 규칙에서 숫자만 있는 경우 배제 필요)
    const isId = /^\d+$/.test(decodedParam);

    if (isId) {
        query.where(eq(articles.id, parseInt(decodedParam)));
    } else {
        query.where(eq(articles.slug, decodedParam));
    }

    const [article] = await query;

    if (!article) {
        throw createError({
            statusCode: 404,
            message: '기사를 찾을 수 없습니다.',
        });
    }

    // JSON Parsing (If returned as string)
    const parseJsonField = (field: any) => {
        if (typeof field === 'string') {
            try { return JSON.parse(field); } catch (e) { return field; }
        }
        return field;
    };

    article.seoMeta = parseJsonField(article.seoMeta);
    article.socialMeta = parseJsonField(article.socialMeta);
    article.geoMeta = parseJsonField(article.geoMeta);

    // 3. 조회수 증가 (비동기 처리, 에러 무시)
    // GET 요청에서 부작용(Side Effect)이 있는 것이 REST 원칙에 위배될 수 있으나,
    // 편의상 여기서 처리하거나 별도 조회수 API를 분리할 수 있음. 여기서는 일단 패스하거나 간단히 update.
    // await db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, article.id));

    // 4. 태그 정보 조회
    const tagList = await db
        .select({
            name: tags.name,
            slug: tags.slug,
        })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(eq(articleTags.articleId, article.id));

    // 5. 카테고리 전체 경로 조회 (Path 기반 최적화)
    let categoryPath = '';
    let breadcrumbs: { name: string; slug: string }[] = [];

    if (article.category?.slug && article.category.path) { // path가 있다고 가정
        categoryPath = article.category.path;
        const slugs = categoryPath.split('/');

        // Breadcrumbs 이름 조회를 위해 한 번의 쿼리 실행 (IN 연산)
        const pathCategories = await db.query.categories.findMany({
            where: (categories, { inArray }) => inArray(categories.slug, slugs),
            columns: { name: true, slug: true }
        });

        // 결과는 순서가 보장되지 않으므로, slugs 순서대로 정렬
        breadcrumbs = slugs.map(slug => {
            const found = pathCategories.find(c => c.slug === slug);
            return { name: found?.name || slug, slug };
        });
    }

    // 6. 글로벌 설정 적용 (댓글 정책)
    const siteSettings = await getSiteSettings();
    const globalPolicy = siteSettings.comment_policy;

    let effectiveCommentPolicy = article.commentPolicy;
    
    // 1. 글로벌이 비활성화면 무조건 비활성화 (Master Switch)
    if (globalPolicy === 'disabled') {
        effectiveCommentPolicy = 'disabled';
    } 
    // 2. 기사 개별 설정이 'default'이면 글로벌 설정 따름
    else if (effectiveCommentPolicy === 'default') {
        effectiveCommentPolicy = globalPolicy as any;
    }
    // 3. 그 외(기사가 explicit하게 users_only/anyone 등으로 설정된 경우)는 기사 설정 우선
    
    // 응답 반환
    return {
        success: true,
        data: {
            ...article,
            commentPolicy: effectiveCommentPolicy as 'default' | 'disabled' | 'users_only' | 'anyone', // 오버라이드
            tags: tagList,
            category: article.category
                ? {
                      ...article.category,
                      path: categoryPath,
                      breadcrumbs: breadcrumbs,
                  }
                : null,
        },
    };
});
