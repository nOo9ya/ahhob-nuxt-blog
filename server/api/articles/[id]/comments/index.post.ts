import { comments } from '~/server/database/schema';
import { getDB } from '~/server/utils/db';
import { getUserSession } from '~/server/utils/session';
import type { CommentInput } from '~/shared/types/comment';

export default defineEventHandler(async (event) => {
    // 1. 로그인 확인
    const user = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        });
    }

    const articleId = getRouterParam(event, 'id');
    const body = await readBody<CommentInput>(event);

    if (!articleId) {
        throw createError({
            statusCode: 400,
            message: 'Article ID is required',
        });
    }

    if (!body.content || !body.content.trim()) {
        throw createError({
            statusCode: 400,
            message: 'Content is required',
        });
    }

    const db = await getDB();

    // 2. 댓글 저장
    const result = await db.insert(comments).values({
        articleId: parseInt(articleId),
        userId: user.userId,
        content: body.content,
        parentId: body.parentId || null,
    });

    // Drizzle insert result is [ResultSetHeader] in MySQL2
    const insertId = (result as any)[0].insertId;

    return {
        success: true,
        message: 'Comment created',
        id: insertId,
    };
});
