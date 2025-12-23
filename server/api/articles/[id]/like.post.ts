import { eq, and, sql } from 'drizzle-orm';
import { articleLikes, articles } from '~/server/database/schema';
import { getDB } from '~/server/utils/db';
import { getUserSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
    const articleId = getRouterParam(event, 'id');
    const user = await getUserSession(event);

    if (!articleId) {
        throw createError({
            statusCode: 400,
            message: 'Article ID is required',
        });
    }

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Login required',
        });
    }

    const db = await getDB();
    const aid = parseInt(articleId);
    const uid = user.userId;

    // Check if already liked
    // @ts-ignore
    const existingLike = await db.query.articleLikes.findFirst({
        where: and(
            eq(articleLikes.articleId, aid),
            eq(articleLikes.userId, uid)
        ),
    });

    if (existingLike) {
        // Unlike: Remove record & decrement count
        await db.transaction(async (tx) => {
            await tx.delete(articleLikes)
                .where(and(eq(articleLikes.articleId, aid), eq(articleLikes.userId, uid)));
            
            await tx.update(articles)
                .set({ likeCount: sql`${articles.likeCount} - 1` })
                .where(eq(articles.id, aid));
        });

        return { liked: false };
    } else {
        // Like: Add record & increment count
        await db.transaction(async (tx) => {
            await tx.insert(articleLikes).values({
                articleId: aid,
                userId: uid,
            });

            await tx.update(articles)
                .set({ likeCount: sql`${articles.likeCount} + 1` })
                .where(eq(articles.id, aid));
        });

        return { liked: true };
    }
});
