import type { H3Event } from 'h3';
import { useSession, createError } from 'h3';

export interface ISessionUser {
    userType?: 'admin' | 'user'; // admin: 관리자, user: 소셜 로그인 사용자
    userId: number;
    email: string;
    name: string;
    role?: string; // admin만 해당
    provider?: 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft'; // user만 해당
    avatar?: string; // user만 해당
    oauthState?: string; // OAuth CSRF 방지용
}

/**
 * 세션 저장 함수 (setUserSession)
 *
 * 기능: 사용자 정보를 암호화된 세션(쿠키)에 저장합니다.
 *
 * 데이터 흐름:
 * 1. H3 useSession으로 세션 로드 (비밀키 사용)
 * 2. 세션 데이터에 사용자 정보 업데이트
 * 3. 응답 쿠키 설정 (자동 처리)
 *
 * @param event H3Event 객체
 * @param user 저장할 사용자 정보 (ISessionUser)
 */
export async function setUserSession(event: H3Event, user: ISessionUser) {
    const session = await useSession(event, {
        password:
            process.env.SESSION_SECRET || 'default-secret-change-in-production',
        cookie: {
            secure: false,
            sameSite: 'lax',
        },
    });
    await session.update({ user });
}

/**
 * 세션 조회 함수 (getUserSession)
 *
 * 기능: 현재 요청의 쿠키에서 세션을 복호화하여 사용자 정보를 조회합니다.
 *
 * 데이터 흐름:
 * 1. H3 useSession으로 세션 로드
 * 2. 세션 데이터 내 'user' 속성 확인
 * 3. 사용자 정보 반환 (없으면 null)
 *
 * @param event H3Event 객체
 * @returns 사용자 정보 객체 또는 null
 */
export async function getUserSession(
    event: H3Event
): Promise<ISessionUser | null> {
    const session = await useSession(event, {
        password:
            process.env.SESSION_SECRET || 'default-secret-change-in-production',
        cookie: {
            secure: false,
            sameSite: 'lax',
        },
    });
    return session.data.user || null;
}

/**
 * 세션 초기화 함수 (clearUserSession)
 *
 * 기능: 현재 사용자의 세션을 만료시키고 로그아웃 처리합니다.
 *
 * 데이터 흐름:
 * 1. H3 useSession으로 세션 로드
 * 2. session.clear() 호출하여 데이터 삭제
 * 3. 세션 쿠키 만료 처리
 *
 * @param event H3Event 객체
 */
export async function clearUserSession(event: H3Event): Promise<void> {
    const session = await useSession(event, {
        password:
            process.env.SESSION_SECRET || 'default-secret-change-in-production',
        cookie: {
            secure: false,
            sameSite: 'lax',
        },
    });
    await session.clear();
}

/**
 * 인증 요구 미들웨어 (requireAuth)
 *
 * 기능: 로그인 여부를 확인하고, 비로그인 상태면 401 에러를 발생시킵니다.
 *
 * 데이터 흐름:
 * 1. getUserSession 호출하여 사용자 정보 조회
 * 2. 사용자 정보가 없으면 401 Unauthorized 에러 throw
 * 3. 있으면 사용자 정보 반환
 *
 * @param event H3Event 객체
 * @returns 인증된 사용자 정보
 * @throws {H3Error} 401 Unauthorized
 */
export async function requireAuth(event: H3Event): Promise<ISessionUser> {
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    return user;
}

/**
 * 관리자 권한 요구 미들웨어 (requireAdmin)
 *
 * 기능: 사용자 인증 후, 'admin' 권한을 가졌는지 확인합니다.
 *
 * 데이터 흐름:
 * 1. requireAuth 호출하여 1차 인증 확인
 * 2. user.role이 'admin'인지 검사
 * 3. 아니면 403 Forbidden 에러 throw
 * 4. 맞으면 사용자 정보 반환
 *
 * @param event H3Event 객체
 * @returns 관리자 권한을 가진 사용자 정보
 * @throws {H3Error} 403 Forbidden
 */
export async function requireAdmin(event: H3Event): Promise<ISessionUser> {
    const user = await requireAuth(event);

    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    return user;
}
