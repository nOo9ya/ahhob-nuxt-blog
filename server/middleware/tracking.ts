/**
 * 파일 기능: 페이지 뷰 추적 미들웨어
 * 위치: server/middleware/tracking.ts
 * 권한: 모든 요청에 적용
 *
 * 데이터 흐름:
 * 1. 모든 페이지 요청을 가로챔
 * 2. Referrer, IP, User-Agent 수집
 * 3. 유입 경로 분석
 * 4. page_views 테이블에 비동기로 저장
 *
 * 주의사항:
 * - 성능 영향 최소화를 위해 비동기 저장
 * - API 요청, 정적 리소스 요청은 제외
 * - 봇 트래픽 필터링 (선택적)
 */

import { analyzeReferrer, hashIP, extractArticleId } from '../utils/tracking';
import { pageViews } from '../database/schema';

/**
 * 추적 제외 경로 패턴
 * - API 엔드포인트
 * - 정적 리소스 (_nuxt, assets, favicon 등)
 * - 관리자 페이지 (/admin/*)
 */
const EXCLUDED_PATHS = [
    /^\/api\//,           // API 요청
    /^\/_nuxt\//,         // Nuxt 빌드 파일
    /^\/assets\//,        // 정적 자산
    /^\/uploads\//,       // 업로드 파일
    /^\/favicon\./,       // 파비콘
    /^\/robots\.txt$/,    // robots.txt
    /^\/sitemap\.xml$/,   // sitemap
    /^\/admin\//,         // 관리자 페이지 (통계에서 제외)
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i, // 정적 파일 확장자
];

/**
 * 봇 User-Agent 패턴 (선택적 필터링)
 * 필요시 주석 해제하여 봇 트래픽 제외
 */
const BOT_USER_AGENTS = [
    /bot/i,
    /crawl/i,
    /spider/i,
    /slurp/i,
    /mediapartners/i,
    /lighthouse/i,
];

/**
 * 봇 트래픽 감지
 */
function isBot(userAgent: string | undefined): boolean {
    if (!userAgent) return false;
    return BOT_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

export default defineEventHandler(async (event) => {
    const path = event.path;

    // 1. 제외 경로 체크
    if (EXCLUDED_PATHS.some(pattern => pattern.test(path))) {
        return; // 추적하지 않음
    }

    // 2. GET 요청만 추적 (POST, PUT, DELETE 등은 제외)
    if (event.method !== 'GET') {
        return;
    }

    // 3. Referrer, IP, User-Agent 수집
    const headers = event.headers;
    const referrer = headers.get('referer') || headers.get('referrer') || null;
    const userAgent = headers.get('user-agent') || null;
    const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               headers.get('x-real-ip') ||
               event.node.req.socket.remoteAddress ||
               null;

    // 4. 봇 트래픽 필터링 (선택적 - 필요시 활성화)
    // if (isBot(userAgent || undefined)) {
    //     return; // 봇 트래픽은 추적하지 않음
    // }

    // 5. Referrer 분석
    const analysis = analyzeReferrer(referrer);

    // 6. Article ID 추출 (비동기)
    let articleId: number | null = null;
    if (path.startsWith('/articles/')) {
        articleId = await extractArticleId(path);
    }

    // 7. IP 해싱
    const ipHash = hashIP(ip);

    // 8. 데이터베이스에 비동기로 저장 (성능 최적화)
    // await를 사용하지 않아 요청 응답 시간에 영향을 주지 않음
    savePageView({
        path,
        articleId,
        ipHash,
        userAgent,
        referrer,
        referrerType: analysis.referrerType,
        searchEngine: analysis.searchEngine,
        searchKeyword: analysis.searchKeyword,
    }).catch(error => {
        // 에러가 발생해도 요청 처리는 계속 진행
        console.error('[Tracking Middleware] Failed to save page view:', error);
    });

    // 요청 처리 계속 진행
});

/**
 * 페이지 뷰 데이터 저장 (비동기)
 */
async function savePageView(data: {
    path: string;
    articleId: number | null;
    ipHash: string;
    userAgent: string | null;
    referrer: string | null;
    referrerType: 'direct' | 'search' | 'ai_search' | 'social' | 'referral';
    searchEngine?: string;
    searchKeyword?: string;
}) {
    try {
        const db = await getDB();

        await db.insert(pageViews).values({
            path: data.path,
            articleId: data.articleId,
            ipHash: data.ipHash,
            userAgent: data.userAgent,
            referrer: data.referrer,
            referrerType: data.referrerType,
            searchEngine: data.searchEngine || null,
            searchKeyword: data.searchKeyword || null,
        });
    } catch (error) {
        // DB 에러 로깅 (Sentry 등으로 전송 가능)
        console.error('[Tracking] DB Insert Error:', error);
        throw error;
    }
}
