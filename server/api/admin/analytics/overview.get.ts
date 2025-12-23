/**
 * 파일 기능: 관리자 통계 대시보드 개요 API
 * 위치: server/api/admin/analytics/overview.get.ts
 * 권한: 관리자 전용
 *
 * 데이터 흐름:
 * 1. 관리자 권한 확인
 * 2. 쿼리 파라미터 파싱 (날짜 범위)
 * 3. 페이지 뷰 통계 조회:
 *    - 총 방문자 수
 *    - 유입 유형별 통계 (direct, search, ai_search, social, referral)
 *    - 검색엔진별 통계
 *    - 일별 추이
 * 4. JSON 응답 반환
 */

import { pageViews } from '~/server/database/schema';
import { count, sql, and, gte, lte, eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 관리자 권한 확인
    await requireAdmin(event);

    // 2. 쿼리 파라미터 파싱 (날짜 범위)
    const query = getQuery(event);
    const days = Number(query.days) || 30; // 기본 30일
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const db = await getDB();

    // 3. 총 방문자 수 조회
    const [totalViews] = await db
        .select({ count: count() })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate)
            )
        );

    // 4. 유입 유형별 통계
    const referrerTypeStats = await db
        .select({
            type: pageViews.referrerType,
            count: count(),
        })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate)
            )
        )
        .groupBy(pageViews.referrerType);

    // 5. 검색엔진별 통계 (전통 검색 + AI 검색 모두 포함)
    const searchEngineStats = await db
        .select({
            engine: pageViews.searchEngine,
            type: pageViews.referrerType,
            count: count(),
        })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate),
                sql`${pageViews.searchEngine} IS NOT NULL`
            )
        )
        .groupBy(pageViews.searchEngine, pageViews.referrerType)
        .orderBy(desc(count()));

    // 6. 일별 방문자 추이 (최근 30일)
    const dailyTrend = await db
        .select({
            date: sql<string>`DATE(${pageViews.createdAt})`.as('date'),
            count: count(),
        })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate)
            )
        )
        .groupBy(sql`DATE(${pageViews.createdAt})`)
        .orderBy(sql`DATE(${pageViews.createdAt})`);

    // 7. 검색 키워드 TOP 10 (전통 검색엔진에서만 추출 가능)
    const topKeywords = await db
        .select({
            keyword: pageViews.searchKeyword,
            count: count(),
        })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate),
                sql`${pageViews.searchKeyword} IS NOT NULL`,
                eq(pageViews.referrerType, 'search')
            )
        )
        .groupBy(pageViews.searchKeyword)
        .orderBy(desc(count()))
        .limit(10);

    // 8. 인기 페이지 TOP 10
    const topPages = await db
        .select({
            path: pageViews.path,
            count: count(),
        })
        .from(pageViews)
        .where(
            and(
                gte(pageViews.createdAt, startDate),
                lte(pageViews.createdAt, endDate)
            )
        )
        .groupBy(pageViews.path)
        .orderBy(desc(count()))
        .limit(10);

    // 9. 응답 반환
    return {
        success: true,
        data: {
            period: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                days,
            },
            totalViews: totalViews?.count || 0,
            referrerTypeStats: referrerTypeStats.map(stat => ({
                type: stat.type,
                count: stat.count,
                percentage: totalViews?.count
                    ? ((stat.count / totalViews.count) * 100).toFixed(2)
                    : '0.00',
            })),
            searchEngineStats: searchEngineStats.map(stat => ({
                engine: stat.engine,
                type: stat.type, // 'search' or 'ai_search'
                count: stat.count,
            })),
            dailyTrend,
            topKeywords,
            topPages,
        },
    };
});
