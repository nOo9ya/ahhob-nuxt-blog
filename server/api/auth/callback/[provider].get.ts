/**
 * 파일 기능: OAuth 콜백 처리
 * 위치: server/api/auth/callback/[provider].get.ts
 * 권한: Public
 * 
 * 데이터 흐름:
 * 1. OAuth 제공자로부터 인증 코드 수신
 * 2. State 검증 (CSRF 방지)
 * 3. 인증 코드로 액세스 토큰 교환
 * 4. 액세스 토큰으로 사용자 정보 조회
 * 5. DB에서 사용자 조회 또는 생성
 * 6. 세션 생성 및 홈으로 리다이렉트
 */

import { eq, and } from 'drizzle-orm';
import { users } from '~/server/database/schema';

export default defineEventHandler(async (event) => {
    const provider = getRouterParam(event, 'provider') as 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft';
    const query = getQuery(event);

    const code = query.code as string;
    const state = query.state as string;

    // 필수 파라미터 확인
    if (!code || !state) {
        throw createError({
            statusCode: 400,
            message: 'Missing code or state parameter',
        });
    }

    // State 검증 (CSRF 방지)
    const session = await getUserSession(event);
    if (!session || session.oauthState !== state) {
        throw createError({
            statusCode: 400,
            message: 'Invalid state parameter',
        });
    }

    try {
        // 1. 인증 코드로 액세스 토큰 교환
        const accessToken = await exchangeCodeForToken(provider, code);

        // 2. 액세스 토큰으로 사용자 정보 조회
        const userInfo = await getUserInfo(provider, accessToken);

        // 3. DB에서 사용자 조회
        const db = await getDB();
        let user = await db.query.users.findFirst({
            where: and(
                eq(users.provider, provider),
                eq(users.providerId, userInfo.id)
            ),
        });

        // 4. 사용자가 없으면 생성
        if (!user) {
            const [newUser] = await db.insert(users).values({
                provider,
                providerId: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                avatar: userInfo.avatar,
            });

            user = await db.query.users.findFirst({
                where: eq(users.id, newUser.insertId),
            });
        }

        // 5. 세션 생성
        await setUserSession(event, {
            userType: 'user',
            userId: user!.id,
            email: user!.email,
            name: user!.name,
            provider: user!.provider,
            avatar: user!.avatar || undefined,
        } as ISessionUser);

        // 6. 홈으로 리다이렉트
        return sendRedirect(event, '/');

    } catch (error) {
        console.error('OAuth callback error:', error);
        throw createError({
            statusCode: 500,
            message: 'OAuth authentication failed',
        });
    }
});
