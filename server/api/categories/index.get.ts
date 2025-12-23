import { getDB } from '../../database';
import { categories, articles } from '../../database/schema';
import { sql, eq, count, desc } from 'drizzle-orm';

/**
 * 카테고리 목록 조회 API
 * GET /api/categories
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 데이터 흐름:
 * 1. DB 연결
 * 2. 카테고리 목록 조회 (기사 수 포함)
 * 3. 카테고리 목록 반환
 */
export default defineEventHandler(async (event) => {
    const db = await getDB();
    const query = getQuery(event);
    const pathParams = query.path as string;

    // 2. 쿼리 빌더 초기화
    // articles와 조인하여 기사 수(articleCount)를 계산합니다.
    const queryBuilder = db
        .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            path: categories.path,
            description: categories.description,
            parentId: categories.parentId,
            createdAt: categories.createdAt,
            updatedAt: categories.updatedAt,
            articleCount: count(articles.id), // 기사 수 집계
        })
        .from(categories)
        .leftJoin(articles, eq(categories.id, articles.categoryId))
        .groupBy(categories.id); // 그룹핑 필수

    // 3. 조건 추가 (Path 필터링)
    if (pathParams) {
        queryBuilder.where(sql`${categories.path} = ${pathParams}`);
    } else {
        queryBuilder.orderBy(desc(categories.createdAt));
    }

    const categoryList = await queryBuilder;

    // 3. 응답 반환
    return {
        categories: categoryList,
    };
});
