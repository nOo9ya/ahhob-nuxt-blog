/**
 * 파일 기능: 페이지 뷰 추적 유틸리티
 * 위치: server/utils/tracking.ts
 * 권한: 서버 내부 전용
 *
 * 데이터 흐름:
 * 1. Referrer URL 분석
 * 2. 검색엔진 및 AI 검색엔진 감지
 * 3. 검색 키워드 추출
 * 4. 유입 유형 분류
 */

import crypto from 'crypto';

/**
 * 검색엔진 매핑 (Traditional Search Engines)
 * 전통적인 검색엔진 목록
 */
const SEARCH_ENGINES: Record<string, { name: string; paramKey: string }> = {
    'google.com': { name: 'google', paramKey: 'q' },
    'google.co.kr': { name: 'google', paramKey: 'q' },
    'bing.com': { name: 'bing', paramKey: 'q' },
    'yahoo.com': { name: 'yahoo', paramKey: 'p' },
    'naver.com': { name: 'naver', paramKey: 'query' },
    'daum.net': { name: 'daum', paramKey: 'q' },
    'duckduckgo.com': { name: 'duckduckgo', paramKey: 'q' },
    'baidu.com': { name: 'baidu', paramKey: 'wd' },
    'yandex.com': { name: 'yandex', paramKey: 'text' },
};

/**
 * AI 검색엔진 매핑 (AI Search Engines)
 * GEO(Generative Engine Optimization) 대상 엔진
 */
const AI_SEARCH_ENGINES: Record<string, string> = {
    'perplexity.ai': 'perplexity',
    'chat.openai.com': 'chatgpt',
    'chatgpt.com': 'chatgpt',
    'gemini.google.com': 'gemini',
    'bard.google.com': 'gemini', // Bard -> Gemini로 이름 변경
    'claude.ai': 'claude',
    'you.com': 'you',
    'phind.com': 'phind',
    'andi.com': 'andi',
};

/**
 * 소셜 미디어 매핑 (Social Media Platforms)
 */
const SOCIAL_MEDIA: Record<string, string> = {
    'facebook.com': 'facebook',
    'twitter.com': 'twitter',
    'x.com': 'twitter', // Twitter -> X
    't.co': 'twitter',
    'instagram.com': 'instagram',
    'linkedin.com': 'linkedin',
    'pinterest.com': 'pinterest',
    'reddit.com': 'reddit',
    'youtube.com': 'youtube',
    'tiktok.com': 'tiktok',
    'telegram.org': 'telegram',
    't.me': 'telegram',
    'discord.com': 'discord',
};

/**
 * Referrer 분석 결과 인터페이스
 */
export interface ReferrerAnalysis {
    referrerType: 'direct' | 'search' | 'ai_search' | 'social' | 'referral';
    searchEngine?: string;
    searchKeyword?: string;
}

/**
 * Referrer URL 분석
 * @param referrer - HTTP Referer 헤더 값
 * @returns ReferrerAnalysis 객체
 */
export function analyzeReferrer(referrer: string | null | undefined): ReferrerAnalysis {
    // Referrer가 없는 경우 (직접 접속)
    if (!referrer || referrer.trim() === '') {
        return { referrerType: 'direct' };
    }

    try {
        const url = new URL(referrer);
        const hostname = url.hostname.toLowerCase();

        // 1. AI 검색엔진 체크 (최우선 - GEO 최적화 핵심)
        for (const [domain, engineName] of Object.entries(AI_SEARCH_ENGINES)) {
            if (hostname.includes(domain)) {
                return {
                    referrerType: 'ai_search',
                    searchEngine: engineName,
                    // AI 검색엔진은 대부분 검색어를 URL에 노출하지 않음
                    searchKeyword: undefined,
                };
            }
        }

        // 2. 전통 검색엔진 체크
        for (const [domain, config] of Object.entries(SEARCH_ENGINES)) {
            if (hostname.includes(domain)) {
                // URL 파라미터에서 검색어 추출
                const keyword = url.searchParams.get(config.paramKey) || undefined;

                return {
                    referrerType: 'search',
                    searchEngine: config.name,
                    searchKeyword: keyword,
                };
            }
        }

        // 3. 소셜 미디어 체크
        for (const [domain, platformName] of Object.entries(SOCIAL_MEDIA)) {
            if (hostname.includes(domain)) {
                return {
                    referrerType: 'social',
                    searchEngine: platformName, // searchEngine 필드를 플랫폼 이름으로 활용
                };
            }
        }

        // 4. 기타 외부 링크 (Referral)
        return {
            referrerType: 'referral',
            searchEngine: hostname, // 도메인 이름 저장
        };
    } catch (error) {
        // URL 파싱 실패 시 direct로 간주
        console.error('Failed to parse referrer URL:', referrer, error);
        return { referrerType: 'direct' };
    }
}

/**
 * IP 주소 해싱 (개인정보 보호)
 * SHA-256 해시를 사용하여 IP 주소를 익명화
 *
 * @param ip - 원본 IP 주소
 * @returns SHA-256 해시 문자열
 */
export function hashIP(ip: string | undefined | null): string {
    if (!ip || ip === '') {
        return crypto.createHash('sha256').update('unknown').digest('hex');
    }

    // IP 주소 정규화 (IPv6 축약형 처리 등)
    const normalizedIP = ip.trim().toLowerCase();

    return crypto.createHash('sha256').update(normalizedIP).digest('hex');
}

/**
 * Article ID 추출 (URL 경로에서)
 * /articles/:slug 또는 /articles/:id 형식에서 ID 추출
 *
 * @param path - 요청 경로
 * @returns Article ID 또는 null
 */
export async function extractArticleId(path: string): Promise<number | null> {
    // /articles/slug-example 형식 체크
    const articlePathMatch = path.match(/^\/articles\/([^\/\?]+)/);
    if (!articlePathMatch) {
        return null;
    }

    const slugOrId = articlePathMatch[1];

    // 숫자인 경우 ID로 간주
    if (/^\d+$/.test(slugOrId)) {
        return parseInt(slugOrId, 10);
    }

    // Slug인 경우 DB에서 조회
    try {
        const db = await getDB();
        const { articles } = await import('../database/schema');
        const { eq } = await import('drizzle-orm');

        const [article] = await db
            .select({ id: articles.id })
            .from(articles)
            .where(eq(articles.slug, slugOrId))
            .limit(1);

        return article?.id || null;
    } catch (error) {
        console.error('Failed to extract article ID from slug:', error);
        return null;
    }
}
