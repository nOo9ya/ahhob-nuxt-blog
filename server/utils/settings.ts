import { getDB } from '~/server/database';
import { siteSettings } from '~/server/database/schema';
import { eq } from 'drizzle-orm';

/**
 * 사이트 설정 인터페이스
 */
export interface SiteSettings {
    // 기본 사이트 정보
    site_name: string;
    site_description: string;
    site_logo: string;
    twitter_site: string;
    site_url: string;
    site_type: string;

    // 기능 설정
    allow_registration: boolean;
    comment_policy: 'disabled' | 'users_only' | 'anyone';
    // registrationEnabled, emailRegistrationEnabled -> removed in favor of snake_case
    email_registration_enabled: boolean;
    oauth_providers: Record<string, any>;
    newsletter: {
        enabled: boolean;
        provider: 'resend' | 'sendgrid';
    };
    // AdSense Settings
    adsense_client_id?: string;
    adsense_slots?: {
        header?: string;
        footer?: string;
        article_top?: string;
        article_bottom?: string;
        sidebar?: string;
    };
    adsense_enabled?: {
        header: boolean;
        footer: boolean;
        article_top: boolean;
        article_bottom: boolean;
        sidebar: boolean;
    };
    // 추후 확장 가능
    [key: string]: any;
}

const CACHE_KEY = 'cache:site_settings:v2';

/**
 * 전역 사이트 설정 관리 유틸리티
 *
 * 기능: DB의 사이트 설정을 조회하고 캐싱하여 성능을 최적화합니다.
 * 경로: server/utils/settings.ts
 * 권한: 서버 내부 전용
 */
export const getSiteSettings = async (): Promise<SiteSettings> => {
    // Runtime Config (Environment Variables as Fallback)
    const config = useRuntimeConfig();
    const publicConfig = config.public as any;
    console.log('[Settings] Runtime Config Public:', JSON.stringify(publicConfig, null, 2));

    const defaultSettings: SiteSettings = {
        site_name: publicConfig.siteName || '블로그',
        site_description: publicConfig.siteDescription || '최신 뉴스 및 기술 블로그',
        site_logo: publicConfig.siteLogo || '/favicon.ico', // 기본값 변경: logo.png 없음 -> favicon.ico
        twitter_site: publicConfig.twitterSite || '@blog',
        site_url: publicConfig.siteUrl || 'http://localhost:3000',
        site_type: publicConfig.siteType || 'Person',
        
        allow_registration: true,
        comment_policy: 'users_only',
        email_registration_enabled: false,
        oauth_providers: {},
        newsletter: {
            enabled: false,
            provider: 'resend',
        },
        adsense_client_id: '',
        adsense_slots: {},
        adsense_enabled: {
            header: false,
            footer: false,
            article_top: false,
            article_bottom: false,
            sidebar: false,
        },
    };

    // 2. Fetch from DB
    const db = await getDB();
    try {
        const allSettings = await db.select().from(siteSettings);
        
        // [New] DB에 없는 키가 있다면 초기값(Env)으로 채워넣기 (Lazy Migration for missing keys)
        const existingKeys = new Set(allSettings.map(row => row.key));
        const missingOps = Object.entries(defaultSettings)
            .filter(([key]) => !existingKeys.has(key))
            .map(([key, value]) => {
                let stringValue = String(value);
                if (typeof value === 'object' && value !== null) {
                    stringValue = JSON.stringify(value);
                }
                const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
                
                console.info(`Initializing missing setting key: ${key}`);
                return db.insert(siteSettings).values({
                    key,
                    value: stringValue,
                    type,
                    description: getDescription(key),
                });
            });

        if (missingOps.length > 0) {
            await Promise.all(missingOps);
            // Inserted items should be reflected in the current request context
            // Re-fetching might be cleaner, but merging defaultSettings works too
        }

        // [New] 키는 있는데 값이 비어있는 경우 (Migration for empty values) - 필수 필드에 한해
        const emptyOps = allSettings
            .filter(row => (row.value === '' || row.value === null) && defaultSettings[row.key as keyof SiteSettings])
            .map(row => {
                const key = row.key;
                const value = defaultSettings[key as keyof SiteSettings];
                console.info(`Refilling empty setting key: ${key}`);
                
                let stringValue = String(value);
                if (typeof value === 'object' && value !== null) {
                    stringValue = JSON.stringify(value);
                }
                
                return db.update(siteSettings)
                    .set({ value: stringValue, updatedAt: new Date() })
                    .where(eq(siteSettings.key, key));
            });

        if (emptyOps.length > 0) {
            await Promise.all(emptyOps);
        }

        const repairOps: any[] = [];

        // [New] 변경사항이 있었다면 최신 데이터를 다시 조회 (Re-fetch to ensure consistency)
        if (missingOps.length > 0 || emptyOps.length > 0) {
            const updatedSettings = await db.select().from(siteSettings);
            // allSettings 변수를 업데이트하려면 let 선언이 필요하지만 여기선 다른 변수를 사용하거나 덮어쓰기
            // 상단 const allSettings 대신 let으로 변경하기 번거로우므로 기존 변수를 활용하지 않고 새로운 반복문 로직 적용
            // 하지만 아래 로직은 allSettings를 사용하므로, 여기서 할당해주는 것이 좋음.
            // 그러나 const 위반이므로, settingsObj를 구성할 때 updatedSettings를 우선 사용하도록 로직을 변경하거나
            // 간단히 allSettings 배열의 내용을 교체하는 방식(splice 등) 사용.
            // 여기서는 가장 깔끔하게 아래 loop 로직을 위해 settingsObj를 미리 구성하는 방식 사용.
            
            // Re-fetch한 데이터로 교체
            allSettings.length = 0; // Clear array
            allSettings.push(...updatedSettings); 
        }

        const settingsObj: Record<string, any> = {};
        
        allSettings.forEach((row) => {
            let value = row.value;

            // 값이 비어있으면 DB에서 가져왔더라도 명시적으로 Default(Env) 값 사용
            if ((value === '' || value === null) && defaultSettings[row.key as keyof SiteSettings]) {
                value = defaultSettings[row.key as keyof SiteSettings];
                // 주의: value는 여기서 any 타입이 됨. 아래 타입 변환 로직 전에 덮어썼으므로 바로 할당
                settingsObj[row.key] = value;
                return; 
            }

            let key = row.key;
            let isLegacy = false;

            // Map legacy camelCase to snake_case (Backward Compatibility)
            if (key === 'siteName') { key = 'site_name'; isLegacy = true; }
            if (key === 'siteDescription') { key = 'site_description'; isLegacy = true; }
            if (key === 'siteUrl') { key = 'site_url'; isLegacy = true; }
            if (key === 'siteLogo') { key = 'site_logo'; isLegacy = true; }
            if (key === 'oauthProviders') { key = 'oauth_providers'; isLegacy = true; }

            // Priority Check:
            // 1. If key is legacy (mapped) and value already exists (presumably from a non-legacy source or earlier legacy), skip.
            // 2. If key is original (non-legacy), always overwrite (it's the source of truth).
            if (isLegacy && settingsObj[key] !== undefined) {
                return;
            }

            if (row.type === 'boolean') {
                settingsObj[key] = row.value === 'true';
            } else if (row.type === 'number') {
                settingsObj[key] = Number(row.value);
            } else if (key === 'oauth_providers' || key === 'newsletter' || key === 'seo_meta' || key === 'social_meta' || key === 'geo_meta' || key === 'adsense_slots' || key === 'adsense_enabled') {
                try {
                    const val = row.value;
                    const parsed = JSON.parse(val || '{}');
                    
                    // Sanity Check: 숫자로 파싱되거나, null이거나, 배열이면 유효하지 않음
                    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                         console.warn(`[Settings] Invalid JSON for ${key}:`, val);
                         // 잘못된 JSON 값을 빈 값으로 간주하여 재설정 유도
                         repairOps.push(db.update(siteSettings).set({ value: '', updatedAt: new Date() }).where(eq(siteSettings.key, key)));
                         settingsObj[key] = defaultSettings[key as keyof SiteSettings] || {}; // 기본값으로 대체
                    } else {
                        // Data Sanitization: "0", "1" 같은 인덱스 키 제거 (문자열 스프레드 부작용 복구)
                        const sanitized = { ...parsed };
                        Object.keys(sanitized).forEach(k => {
                            if (!isNaN(Number(k))) {
                                delete sanitized[k]; // 숫자 키("0", "1") 제거
                            }
                        });
                        
                        // 기존 값과 병합 (oauth_providers와 oauthProviders가 둘 다 있을 경우를 대비해 병합)
                        // 주의: 스네이크 케이스 키 데이터가 오염되었을 가능성이 높으므로, 여기서 정화된 데이터를 사용
                        settingsObj[key] = { ...(settingsObj[key] || {}), ...sanitized };
                    }
                } catch (e) {
                    console.warn(`[Settings] JSON Parse Error for ${key}:`, row.value, e);
                    // 파싱 에러 시 빈 값으로 간주하여 재설정 유도
                    repairOps.push(db.update(siteSettings).set({ value: '', updatedAt: new Date() }).where(eq(siteSettings.key, key)));
                    settingsObj[key] = defaultSettings[key as keyof SiteSettings] || {}; // 기본값으로 대체
                }
            } else {
                settingsObj[key] = row.value;
            }
        });

        // JSON 파싱 중 발견된 잘못된 건들은 위에서 repairOps에 추가되었으므로 처리
        if (repairOps.length > 0) {
            await Promise.all(repairOps);
        }

        // 기본값 및 매핑 처리 (DB 값 우선, 없으면 Default/Env 값)
        const finalSettings: SiteSettings = {
            ...defaultSettings,
            ...settingsObj,
            
            // 중첩 객체 병합
            oauth_providers: {
                ...defaultSettings.oauth_providers,
                ...(settingsObj.oauth_providers || {}),
            },
            newsletter: {
                ...defaultSettings.newsletter,
                ...(settingsObj.newsletter || {}),
                enabled: settingsObj.newsletter?.enabled ?? defaultSettings.newsletter.enabled,
                provider: settingsObj.newsletter?.provider || defaultSettings.newsletter.provider,
            },
        };

        // 4. Final Safety Net (최후의 보루: 캐시 저장 및 반환 전 빈 값 강제 채움)
        // 로직상 여기까지 와서 비어있으면 안 되지만, 만약 비어있다면 강제 할당
        if (!finalSettings.site_name) finalSettings.site_name = defaultSettings.site_name || '블로그';
        if (!finalSettings.site_description) finalSettings.site_description = defaultSettings.site_description;
        if (!finalSettings.site_url) finalSettings.site_url = defaultSettings.site_url;
        if (!finalSettings.site_logo) finalSettings.site_logo = defaultSettings.site_logo;

        // 3. Set Cache
        await useStorage().setItem(CACHE_KEY, finalSettings);
        
        console.log('[Settings] Final Settings Returning:', JSON.stringify(finalSettings, null, 2));

        return finalSettings;
    } catch (e) {
        console.error('Failed to fetch site settings:', e);
        return defaultSettings;
    }
};

/**
 * 사이트 설정을 업데이트합니다. (캐시 갱신)
 * 1. DB 업데이트
 * 2. 캐시 무효화 또는 갱신
 */
export const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    const db = await getDB();
    try {
        const operations = Object.entries(updates).map(([key, value]) => {
            // 이제 입력값(updates)이 snake_case이므로 변환 불필요
            const dbKey = key;
            
            let stringValue = String(value);
            // 객체 타입은 JSON 문자열로 저장
            if (typeof value === 'object' && value !== null) {
                stringValue = JSON.stringify(value);
            }
            
            const type = typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string';
            
            return db
                .insert(siteSettings)
                .values({
                    key: dbKey,
                    value: stringValue,
                    type,
                    description: getDescription(dbKey),
                })
                .onDuplicateKeyUpdate({
                    set: {
                        value: stringValue,
                        type,
                        updatedAt: new Date(),
                    },
                });
        });

        if (operations.length > 0) {
            await Promise.all(operations);
        }

        // Cache Invalidation (or Update)
        await useStorage().removeItem(CACHE_KEY); // Remove to force re-fetch next time
        await getSiteSettings(); // Re-fetch immediately to warm cache

        return true;
    } catch (e) {
        console.error('Failed to update site settings:', e);
        throw e;
    }
};

const getDescription = (key: string): string => {
    switch (key) {
        case 'site_name': return '사이트 이름';
        case 'site_description': return '사이트 설명';
        case 'site_logo': return '사이트 로고 URL';
        case 'twitter_site': return '트위터 계정';
        case 'site_url': return '사이트 URL';
        case 'site_type': return '사이트 타입 (Person/Organization)';
        case 'allow_registration': return '회원가입 허용 여부';
        case 'comment_policy': return '댓글 정책';
        case 'email_registration_enabled': return '이메일 회원가입 활성화';
        case 'oauth_providers': return 'OAuth 프로바이더 설정';
        case 'newsletter': return '뉴스레터 설정';
        case 'adsense_client_id': return 'Google AdSense Client ID';
        case 'adsense_slots': return 'AdSense 광고 단위 ID';
        case 'adsense_enabled': return 'AdSense 영역별 활성화';
        default: return '기타 설정';
    }
};
