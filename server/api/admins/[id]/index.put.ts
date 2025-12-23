
import { getDB } from '~/server/database';
import { admins } from '~/server/database/schema';
import { getUserSession } from '~/server/utils/session';
import { useSafeQuery } from '~/server/utils/db';
import { eq, and, ne } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import {
    isValidEmail,
    isValidPassword,
    isValidRole,
} from '~/shared/utils/validation';

/**
 * 관리자 정보 수정 API
 * PUT /api/admins/:id
 */
export default defineEventHandler(async (event) => {
    const user = await getUserSession(event);

    if (!user || user.role !== 'admin') {
         throw createError({
            statusCode: 403,
            message: '수정 권한이 없습니다.',
        });
    }

    const id = Number(event.context.params?.id);
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '잘못된 ID입니다.',
        });
    }

    const body = await readBody(event);
    const { name, email, credentials, bio, role, password, status } = body;

    const updateData: any = {
        updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (credentials !== undefined) updateData.credentials = credentials;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const db = await getDB();

    if (email) {
         if (!isValidEmail(email)) {
            throw createError({ statusCode: 400, message: '이메일 형식이 올바르지 않습니다.' });
        }
        const duplicateCheck = await db
            .select({ id: admins.id })
            .from(admins)
            .where(and(eq(admins.email, email), ne(admins.id, id)))
            .limit(1);

        if (duplicateCheck.length > 0) {
            throw createError({ statusCode: 409, message: '이미 사용 중인 이메일입니다.' });
        }
        updateData.email = email;
    }

    if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    await useSafeQuery(
        async () => {
            return await db.update(admins).set(updateData).where(eq(admins.id, id));
        },
        { errorMessage: '관리자 수정 중 오류가 발생했습니다.' }
    );

    return {
        success: true,
        message: '관리자 정보가 수정되었습니다.',
    };
});
