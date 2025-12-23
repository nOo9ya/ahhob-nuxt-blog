
import { getDB } from '~/server/database';
import { admins } from '~/server/database/schema';
import { getUserSession } from '~/server/utils/session';
import { desc } from 'drizzle-orm';

/**
 * 관리자(Admin/Staff) 목록 조회 API
 * GET /api/admins
 * 
 * 권한: 관리자 (Admin)
 */
export default defineEventHandler(async (event) => {
    const user = await getUserSession(event);

    if (!user || !['admin', 'editor', 'writer'].includes(user.role)) {
        throw createError({
            statusCode: 403,
            message: '접근 권한이 없습니다.',
        });
    }

    const db = await getDB();

    const adminList = await db
        .select({
            id: admins.id,
            email: admins.email,
            name: admins.name,
            role: admins.role,
            status: admins.status,
            avatar: admins.avatar,
            bio: admins.bio,
            createdAt: admins.createdAt,
            credentials: admins.credentials,
        })
        .from(admins)
        .orderBy(desc(admins.createdAt));

    return {
        success: true,
        data: adminList,
    };
});
