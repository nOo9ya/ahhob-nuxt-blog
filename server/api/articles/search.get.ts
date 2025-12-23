import { getDB } from '../../database';
import {
    articles,
    categories,
    users,
    articleTags,
    tags,
} from '../../database/schema';
import { eq, and, sql, SQL } from 'drizzle-orm';

/**
 * 기사 검색 API (FULLTEXT 검색)
 * GET /api/articles/search
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 데이터 흐름:
 * 1. 쿼리 파라미터 파싱 (q, categoryId, tagId, status, page, limit)
 * 2. 검색어 필수 검증
 * 3. WHERE 조건 생성 (FULLTEXT + 필터)
 * 4. 카테고리 필터링
 * 5. 태그 필터링
 * 6. 페이징 계산
 * 7. 검색 결과 조회 (Author + Category 조인)
 * 8. 전체 개수 조회
 * 9. 검색 결과 + 페이지네이션 정보 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 쿼리 파라미터 받기
    const query = getQuery(event);
    const keyword = (query.q as string) || '';
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const tagId = query.tagId ? Number(query.tagId) : undefined;
    const status = (query.status as string) || 'published';
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));

    // 2. Validation - 검색어 필수
    if (!keyword || keyword.trim() === '') {
        throw createError({
            statusCode: 400,
            message: '검색어를 입력해주세요.',
        });
    }

    // 3. DB 연결
    const db = await getDB();

    // 3-1. WHERE 조건 배열 생성
    const whereConditions: SQL[] = [];

    // FULLTEXT 검색 조건 추가
    whereConditions.push(
        sql`MATCH(${articles.title}, ${articles.content}) AGAINST (${keyword} IN NATURAL LANGUAGE MODE)`
    );

    // 4. 상태 필터링
    if (status) {
        whereConditions.push(eq(articles.status, status as any));
    }

    // 5. 카테고리 필터링
    if (categoryId) {
        whereConditions.push(eq(articles.categoryId, categoryId));
    }

    // 6. 태그 필터링 (tagId가 있는 경우)
    if (tagId) {
        const articlesWithTag = await db
            .select({ articleId: articleTags.articleId })
            .from(articleTags)
            .where(eq(articleTags.tagId, tagId));

        const articleIds = articlesWithTag.map((item) => item.articleId);

        if (articleIds.length > 0) {
            whereConditions.push(
                sql`${articles.id} IN (${sql.join(
                    articleIds.map((id) => sql`${id}`),
                    sql`, `
                )})`
            );
        } else {
            // 태그에 해당하는 기사가 없으면 빈 결과 반환
            return {
                articles: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            };
        }
    }

    // 7. 페이징 계산
    const offset = (page - 1) * limit;

    // 7-1. DB 쿼리 실행 - 검색 결과 조회
    const results = await db
        .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            excerpt: articles.excerpt,
            thumbnail: articles.thumbnail,
            status: articles.status,
            viewCount: articles.viewCount,
            publishedAt: articles.publishedAt,
            createdAt: articles.createdAt,
            category: {
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
            },
            author: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
        })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(users, eq(articles.authorId, users.id))
        .where(and(...whereConditions))
        .orderBy(sql`${articles.publishedAt} DESC`)
        .limit(limit)
        .offset(offset);

    // 8. Count 쿼리 실행 - 전체 결과 개수
    const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(articles)
        .where(and(...whereConditions));

    const total = countResult?.count || 0;

    // 9. 응답 반환
    return {
        articles: results,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
});
