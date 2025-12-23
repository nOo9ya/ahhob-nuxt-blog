/**
 * GET /api/bookmarks
 * 내 북마크 목록 조회
 * 권한: User (로그인 필수)
 */
import { getDB, schema } from '~/server/database';
import { eq, desc, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const db = await getDB();

    // Drizzle Relational Query 제거 (LATERAL Join 회피) -> Explicit Joins
    const bookmarkList = await db
        .select({
            bookmark: schema.bookmarks,
            article: schema.articles,
            category: schema.categories,
            author: { // admin -> author
                id: schema.admins.id,
                name: schema.admins.name,
                avatar: schema.admins.avatar,
            },
        })
        .from(schema.bookmarks)
        .leftJoin(schema.articles, eq(schema.bookmarks.articleId, schema.articles.id))
        .leftJoin(schema.categories, eq(schema.articles.categoryId, schema.categories.id))
        .leftJoin(schema.admins, eq(schema.articles.adminId, schema.admins.id))
        .where(eq(schema.bookmarks.userId, user.userId))
        .orderBy(desc(schema.bookmarks.createdAt))
        .limit(limit)
        .offset(offset);

    return {
        success: true,
        data: bookmarkList.map(({ bookmark, article, category, author }) => ({
            id: article!.id,
            bookmarkedAt: bookmark.createdAt,
            article: {
                ...article!,
                category: category || null,
                author: author || null,
            },
        })),
        page,
        limit,
    };
});
