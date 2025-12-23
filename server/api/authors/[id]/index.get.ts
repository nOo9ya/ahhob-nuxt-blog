import { getDB } from '../../../database';
import { users } from '../../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = Number(getRouterParam(event, 'id'));
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid author ID',
        });
    }

    const db = await getDB();

    // 저자 정보 조회 (민감 정보 제외)
    const author = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            socialLinks: true,
            role: true,
            createdAt: true,
        },
    });

    if (!author) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Author not found',
        });
    }

    return {
        success: true,
        data: author,
    };
});
