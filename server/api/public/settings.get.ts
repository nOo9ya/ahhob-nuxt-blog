/**
 * 파일 기능: 공개 설정 조회 API
 * 위치: server/api/public/settings.get.ts
 * 권한: 누구나
 *
 * 데이터 흐름:
 * 1. getSiteSettings 유틸리티를 통해 전체 설정 조회 (캐싱 포함)
 * 2. 공개 가능한 설정만 필터링하여 반환
 * 3. 로그인 페이지, AdSense 컴포넌트 등에서 사용
 */

export default defineEventHandler(async (event) => {
    // 유틸리티 함수를 통해 설정 조회 (캐싱, 기본값 로직 포함)
    const settings = await getSiteSettings();

    // 활성화된 OAuth 프로바이더만 필터링
    const oauthProviders = settings.oauth_providers || {};
    const enabledProviders = Object.keys(oauthProviders).filter(
        (provider) => oauthProviders[provider] === true
    );

    // 공개 가능한 설정만 반환
    return {
        // 회원가입 관련
        registrationEnabled: settings.allow_registration || false,
        emailRegistrationEnabled: settings.email_registration_enabled || false,
        enabledOAuthProviders: enabledProviders,

        // AdSense 관련 (공개 설정)
        adsense_client_id: settings.adsense_client_id || '',
        adsense_slots: settings.adsense_slots || {},
        adsense_enabled: settings.adsense_enabled || {
            header: false,
            footer: false,
            article_top: false,
            article_bottom: false,
            sidebar: false,
        },
    };
});
