import { getUserSession } from '~/server/utils/session';
import { getDB } from '~/server/database';
import { users, admins } from '~/server/database/schema';
import { eq } from 'drizzle-orm';
import { getSiteSettings } from '~/server/utils/settings';

/**
 * [기능] 현재 로그인한 사용자 정보 조회 API
 * [경로] server/api/auth/me.get.ts
 * [권한] 로그인한 사용자
 * [데이터 흐름] Session -> DB(users or admins) -> Client
 */
export default defineEventHandler(async (event) => {
    // 1. 세션에서 현재 로그인 사용자 확인
    const sessionUser = await getUserSession(event);

    // 2. 세션 유효성 검증 (없으면 401 에러)
    if (!sessionUser) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    // 3. DB 연결 가져오기
    const db = await getDB();
    let user = null;

    // 3-1. 사용자 타입에 따라 적절한 테이블 조회
    if (sessionUser.userType === 'admin') {
        const [adminUser] = await db
            .select()
            .from(admins)
            .where(eq(admins.id, sessionUser.userId))
            .limit(1);
        
        user = adminUser ? { ...adminUser, provider: 'email' } : null;

    } else {
        // userType === 'user' OR legacy session
        const [normalUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, sessionUser.userId))
            .limit(1);
        
        user = normalUser;
    }

    // 4. 사용자 존재 확인 (없으면 404 에러)
    if (!user) {
        throw createError({
            statusCode: 404,
            message: '사용자를 찾을 수 없습니다.',
        });
    }

    // 5. 응답 반환 (비밀번호 제외)
    return {
        success: true,
        user,
    };
});
