import { eq, and } from 'drizzle-orm';
import { articleLikes } from '~/server/database/schema';
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
        return { liked: false };
    }

    const db = await getDB();

    // @ts-ignore
    const existingLike = await db.query.articleLikes.findFirst({
        where: and(
            eq(articleLikes.articleId, parseInt(articleId)),
            eq(articleLikes.userId, user.userId)
        ),
    });

    return {
        liked: !!existingLike,
    };
});
