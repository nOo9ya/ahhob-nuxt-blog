/**
 * 파일 기능: OAuth 인증 시작 (리다이렉트)
 * 위치: server/api/auth/oauth/[provider].get.ts
 * 권한: Public
 * 
 * 데이터 흐름:
 * 1. 사용자가 /api/auth/oauth/google 접근
 * 2. State 생성 (CSRF 방지)
 * 3. OAuth 제공자 인증 URL로 리다이렉트
 */

export default defineEventHandler(async (event) => {
    const provider = getRouterParam(event, 'provider') as 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft';

    // 지원하는 제공자 확인
    if (!['google', 'naver', 'kakao', 'apple', 'microsoft'].includes(provider)) {
        throw createError({
            statusCode: 400,
            message: 'Unsupported OAuth provider',
        });
    }

    // State 생성 (CSRF 방지)
    const state = Math.random().toString(36).substring(7);

    // State를 세션에 저장
    const session = await getUserSession(event);
    await setUserSession(event, {
        ...(session || {}),
        oauthState: state,
    } as ISessionUser);

    // OAuth 인증 URL 생성 및 리다이렉트
    const authUrl = generateAuthUrl(provider, state);

    return sendRedirect(event, authUrl);
});
