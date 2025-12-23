import type { H3Event } from 'h3';
import { createError, readBody } from 'h3';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { getDB } from '../../database';
import { admins } from '../../database/schema';
import { setUserSession } from '../../utils/session';

/**
 * 로그인 API
 * POST /api/auth/login
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 데이터 흐름:
 * 1. Request Body 읽기 (email, password)
 * 2. 필수 필드 검증
 * 3. DB에서 사용자 조회 (이메일 기준)
 * 4. 사용자 존재 확인
 * 5. 비밀번호 검증 (bcrypt.compare)
 * 6. 세션 생성 및 사용자 정보 저장
 * 7. 사용자 정보 반환 (비밀번호 제외)
 */
export default defineEventHandler(async (event) => {
    // 1. 요청 본문에서 email, password 추출
    const body = await readBody(event);
    const { email, password } = body;

    // 2. 입력값 검증 (빈 값 체크)
    if (!email || !password) {
        throw createError({
            statusCode: 400,
            message: '이메일 또는 비밀번호가 입력되지 않았습니다.',
        });
    }

    // 3. DB에서 사용자 조회 (Admins Table)
    // 3. DB에서 사용자 조회 (Admins Table)
    const db = await getDB();
    console.log('[Login] Querying for email:', email);
    
    let adminUser;
    
    try {
        const users = await db
            .select({
                id: admins.id,
                email: admins.email,
                passwordHash: admins.passwordHash,
                role: admins.role,
                name: admins.name,
                status: admins.status,
                avatar: admins.avatar,
            })
            .from(admins)
            .where(eq(admins.email, email))
            .limit(1);
            
        adminUser = users[0];
        console.log('[Login] User found:', adminUser ? adminUser.id : 'None');
    } catch (e) {
        console.error('[Login] DB Query Error:', e);
        throw createError({
            statusCode: 500,
            message: 'Internal Server Error during login query',
        });
    }

    // 4. 사용자 존재 여부 및 role 확인
    if (!adminUser || !adminUser.role) {
        throw createError({
            statusCode: 401,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
    }

    // 5. 비밀번호 검증 (bcrypt.compare)
    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isPasswordValid) {
        throw createError({
            statusCode: 401,
            message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        });
    }

    // [NEW] 5-1. 승인 상태 확인
    if (adminUser.status !== 'active') {
        throw createError({
            statusCode: 403,
            message: '관리자 승인 대기 중인 계정입니다.',
        });
    }

    // 6. 세션에 사용자 정보 저장
    await setUserSession(event, {
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        userType: 'admin', // 구분값 추가
        avatar: adminUser.avatar || undefined,
    });

    // 7. 응답 반환 (비밀번호 제외)
    return {
        success: true,
        user: {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            avatar: adminUser.avatar,
        },
    };
});
