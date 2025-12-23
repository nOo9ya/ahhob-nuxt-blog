/**
 * 파일 기능: OAuth 공통 유틸리티
 * 위치: server/utils/oauth.ts
 * 권한: Public (OAuth 플로우)
 * 
 * 데이터 흐름:
 * 1. 사용자가 소셜 로그인 버튼 클릭
 * 2. OAuth 제공자로 리다이렉트 (인증 URL 생성)
 * 3. 사용자 인증 후 콜백 URL로 리다이렉트
 * 4. 인증 코드로 액세스 토큰 교환
 * 5. 액세스 토큰으로 사용자 정보 조회
 * 6. DB에 사용자 저장 및 세션 생성
 */

interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scope: string;
}

interface OAuthUserInfo {
    id: string;
    email: string;
    name: string;
    avatar?: string;
}

/**
 * OAuth 설정 가져오기
 */
/**
 * OAuth 설정 가져오기
 */
export function getOAuthConfig(provider: 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft' | 'github'): OAuthConfig {
    const config = useRuntimeConfig();
    const baseUrl = config.public.oauthCallbackUrl || 'http://localhost:3000';

    const configs: Record<string, OAuthConfig> = {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/google`,
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            scope: 'openid email profile',
        },
        naver: {
            clientId: process.env.NAVER_CLIENT_ID || '',
            clientSecret: process.env.NAVER_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/naver`,
            authorizationUrl: 'https://nid.naver.com/oauth2.0/authorize',
            tokenUrl: 'https://nid.naver.com/oauth2.0/token',
            userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
            scope: 'email name profile_image',
        },
        kakao: {
            clientId: process.env.KAKAO_CLIENT_ID || '',
            clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/kakao`,
            authorizationUrl: 'https://kauth.kakao.com/oauth/authorize',
            tokenUrl: 'https://kauth.kakao.com/oauth/token',
            userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
            scope: 'account_email profile_nickname profile_image',
        },
        apple: {
            clientId: process.env.APPLE_CLIENT_ID || '',
            clientSecret: process.env.APPLE_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/apple`,
            authorizationUrl: 'https://appleid.apple.com/auth/authorize',
            tokenUrl: 'https://appleid.apple.com/auth/token',
            userInfoUrl: '', // Apple uses ID token
            scope: 'email name',
        },
        microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID || '',
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/microsoft`,
            authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
            userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
            scope: 'openid email profile User.Read',
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            redirectUri: `${baseUrl}/api/auth/callback/github`,
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            userInfoUrl: 'https://api.github.com/user',
            scope: 'user:email read:user',
        },
    };

    return configs[provider];
}

/**
 * OAuth 인증 URL 생성
 */
export function generateAuthUrl(provider: 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft' | 'github', state: string): string {
    const config = getOAuthConfig(provider);

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'code',
        scope: config.scope,
        state,
    });

    return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * 인증 코드로 액세스 토큰 교환
 */
export async function exchangeCodeForToken(
    provider: 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft' | 'github',
    code: string
): Promise<string> {
    const config = getOAuthConfig(provider);

    const body = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
    });

    const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json', // GitHub returns JSON if requested
        },
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

/**
 * 액세스 토큰으로 사용자 정보 조회
 */
export async function getUserInfo(
    provider: 'google' | 'naver' | 'kakao' | 'apple' | 'microsoft' | 'github',
    accessToken: string
): Promise<OAuthUserInfo> {
    const config = getOAuthConfig(provider);

    const response = await fetch(config.userInfoUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const data = await response.json();

    // 제공자별로 응답 형식이 다르므로 변환
    switch (provider) {
        case 'google':
            return {
                id: data.id,
                email: data.email,
                name: data.name,
                avatar: data.picture,
            };

        case 'naver':
            return {
                id: data.response.id,
                email: data.response.email,
                name: data.response.name,
                avatar: data.response.profile_image,
            };

        case 'kakao':
            return {
                id: String(data.id),
                email: data.kakao_account.email,
                name: data.kakao_account.profile.nickname,
                avatar: data.kakao_account.profile.profile_image_url,
            };

        case 'apple':
            // Apple uses ID token for user info
            return {
                id: data.sub,
                email: data.email,
                name: data.name || data.email.split('@')[0],
                avatar: undefined,
            };

        case 'microsoft':
            return {
                id: data.id,
                email: data.mail || data.userPrincipalName,
                name: data.displayName,
                avatar: undefined,
            };

        case 'github':
            // GitHub may not return email in /user if it's private.
            // Need to fetch emails endpoint ideally, but for MVP let's check basic email field.
             // If email is null, fetch from /user/emails
            let email = data.email;
            if (!email) {
                 const emailsRes = await fetch('https://api.github.com/user/emails', {
                     headers: { Authorization: `Bearer ${accessToken}` }
                 });
                 if (emailsRes.ok) {
                     const emails = await emailsRes.json();
                     const primary = emails.find((e: any) => e.primary && e.verified);
                     email = primary ? primary.email : emails[0]?.email;
                 }
            }
            
            return {
                id: String(data.id),
                email: email,
                name: data.name || data.login,
                avatar: data.avatar_url,
            };

        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
