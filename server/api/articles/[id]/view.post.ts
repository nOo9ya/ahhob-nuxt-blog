import { eq, and, sql, gt } from 'drizzle-orm';
import { articleViews, articles } from '~/server/database/schema';
import { getDB } from '~/server/utils/db';
import { getUserSession } from '~/server/utils/session';

export default defineEventHandler(async (event) => {
    const articleId = getRouterParam(event, 'id');
    const user = await getUserSession(event);
    
    // Identifier Strategy:
    // 1. Logged in: User ID (Reliable)
    // 2. Guest: IP Address + User Agent Hash (Basic Fingerprint)
    //    Note: Nuxt/Nitro might need proxy config for real IP in production.
    const ip = getRequestHeader(event, 'x-forwarded-for') || event.node.req.socket.remoteAddress || 'unknown';
    const userAgent = getRequestHeader(event, 'user-agent') || '';
    
    // Simple hash for identifier if guest
    const guestIdentifier = `guest_${Buffer.from(ip + userAgent).toString('base64').substring(0, 50)}`;
    const identifier = user ? `user_${user.userId}` : guestIdentifier;

    if (!articleId) {
        throw createError({
            statusCode: 400,
            message: 'Article ID is required',
        });
    }

    const db = await getDB();
    const aid = parseInt(articleId);

    // Check duplicated view in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // @ts-ignore
    const recentView = await db.query.articleViews.findFirst({
        where: and(
            eq(articleViews.articleId, aid),
            eq(articleViews.identifier, identifier),
            gt(articleViews.createdAt, oneDayAgo)
        ),
    });

    if (recentView) {
        // Already viewed recently, do nothing
        return { viewed: false, message: 'Already viewed recently' };
    }

    // Record view & increment count
    await db.transaction(async (tx) => {
        await tx.insert(articleViews).values({
            articleId: aid,
            identifier: identifier,
        });

        await tx.update(articles)
            .set({ viewCount: sql`${articles.viewCount} + 1` })
            .where(eq(articles.id, aid));
    });

    return { viewed: true };
});
