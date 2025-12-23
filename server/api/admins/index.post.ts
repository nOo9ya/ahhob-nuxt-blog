
import { getDB } from '~/server/database';
import { admins } from '~/server/database/schema';
import { getUserSession } from '~/server/utils/session';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { DrizzleQueryError } from 'drizzle-orm';
import {
    isValidEmail,
    isValidPassword,
    isValidRole,
} from '~/shared/utils/validation';

/**
 * 관리자 생성 API
 * POST /api/admins
 */
export default defineEventHandler(async (event) => {
    const user = await getUserSession(event);

    if (!user || user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '권한이 없습니다.',
        });
    }

    const { email, password, name, role, bio, credentials, status } = await readBody(event);

    if (!email || !password || !name) {
        throw createError({
            statusCode: 400,
            message: '필수 항목이 누락되었습니다.',
        });
    }

    if (!isValidEmail(email)) {
        throw createError({
            statusCode: 400,
            message: '올바른 이메일 형식이 아닙니다.',
        });
    }

    // Role 검증
    if (role && !['admin', 'editor', 'writer'].includes(role)) {
         throw createError({
            statusCode: 400,
            message: '유효하지 않은 역할(Role)입니다.',
        });
    }

    const db = await getDB();

    // 이메일 중복 체크
    const existingUser = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        throw createError({
            statusCode: 409,
            message: '이미 존재하는 이메일입니다.',
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        await db.insert(admins).values({
            email,
            passwordHash,
            name,
            role: role || 'writer',
            status: status || 'active',
            bio: bio || null,
            credentials: credentials || null,
        });
    } catch (error) {
        throw createError({
            statusCode: 500,
            message: '관리자 생성 중 오류가 발생했습니다.',
        });
    }

    return {
        success: true,
        message: '관리자가 생성되었습니다.',
    };
});
