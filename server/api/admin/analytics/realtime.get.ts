/**
 * 파일 기능: 실시간 방문자 통계 API
 * 위치: server/api/admin/analytics/realtime.get.ts
 * 권한: 관리자 전용
 *
 * 데이터 흐름:
 * 1. 관리자 권한 확인
 * 2. 최근 5분간의 페이지 뷰 조회
 * 3. 실시간 방문 현황 반환
 */

import { pageViews } from '~/server/database/schema';
import { count, sql, gte, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 관리자 권한 확인
    await requireAdmin(event);

    const db = await getDB();

    // 2. 최근 5분간의 데이터
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // 3. 최근 5분 총 방문자 수
    const [recentViews] = await db
        .select({ count: count() })
        .from(pageViews)
        .where(gte(pageViews.createdAt, fiveMinutesAgo));

    // 4. 최근 방문 페이지 (최근 20개)
    const recentPages = await db
        .select({
            path: pageViews.path,
            referrerType: pageViews.referrerType,
            searchEngine: pageViews.searchEngine,
            createdAt: pageViews.createdAt,
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, fiveMinutesAgo))
        .orderBy(desc(pageViews.createdAt))
        .limit(20);

    // 5. 최근 5분 유입 유형별 분포
    const recentReferrerTypes = await db
        .select({
            type: pageViews.referrerType,
            count: count(),
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, fiveMinutesAgo))
        .groupBy(pageViews.referrerType);

    return {
        success: true,
        data: {
            recentViews: recentViews?.count || 0,
            recentPages,
            recentReferrerTypes,
            timestamp: new Date().toISOString(),
        },
    };
});
