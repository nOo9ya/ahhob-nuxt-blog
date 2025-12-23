/**
 * POST /api/articles/:id/bookmark
 * 기사 북마크 토글 (저장/취소)
 * 권한: User (로그인 필수)
 */
import { getDB, schema } from '~/server/database';
import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    const user = await requireAuth(event);
    const userId = user.userId;

    // 2. 파라미터 검증
    const articleId = getRouterParam(event, 'id');
    if (!articleId || isNaN(Number(articleId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid ID',
        });
    }

    const db = await getDB();

    // 3. 기사 존재 여부 확인
    const article = await db.query.articles.findFirst({
        where: eq(schema.articles.id, Number(articleId)),
    });

    if (!article) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Article not found',
        });
    }

    // 4. 북마크 상태 확인
    const existingBookmark = await db.query.bookmarks.findFirst({
        where: and(
            eq(schema.bookmarks.userId, userId),
            eq(schema.bookmarks.articleId, Number(articleId))
        ),
    });

    try {
        if (existingBookmark) {
            // 이미 존재하면 삭제 (Unbookmark)
            await db
                .delete(schema.bookmarks)
                .where(
                    and(
                        eq(schema.bookmarks.userId, userId),
                        eq(schema.bookmarks.articleId, Number(articleId))
                    )
                );

            return { success: true, bookmarked: false };
        } else {
            // 없으면 추가 (Bookmark)
            await db.insert(schema.bookmarks).values({
                userId: userId,
                articleId: Number(articleId),
            });

            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error('Bookmark toggle error:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to toggle bookmark',
        });
    }
});
