import { getDB } from '../../database';
import { categories, articles } from '../../database/schema';
import { eq, count } from 'drizzle-orm';

/**
 * 카테고리 트리 조회 API
 * GET /api/categories/tree
 *
 * 모든 카테고리를 계층 구조(Tree) 형태로 반환합니다.
 * Footer, Sidebar 메뉴 등에서 사용됩니다.
 */
export default defineEventHandler(async (event) => {
    const db = await getDB();

    // 1. 모든 카테고리 조회 (Query Builder 사용)
    const allCategories = await db
        .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            path: categories.path,
            order: categories.order,
            parentId: categories.parentId,
            description: categories.description, // description 추가
            articleCount: count(articles.id),    // 기사 수 추가
        })
        .from(categories)
        .leftJoin(articles, eq(categories.id, articles.categoryId))
        .groupBy(categories.id);

    // 2. 트리 구조로 변환
    const categoryMap = new Map();
    const roots: any[] = [];

    // Map 초기화
    allCategories.forEach((cat) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // 부모-자식 연결
    allCategories.forEach((cat) => {
        const node = categoryMap.get(cat.id);
        if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
                parent.children.push(node);
            } else {
                // 부모가 없으면 루트로 취급 (데이터 무결성 문제 시)
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    return {
        success: true,
        data: roots,
    };
});
