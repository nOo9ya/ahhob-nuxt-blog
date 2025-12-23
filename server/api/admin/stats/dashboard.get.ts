import { getDB } from '../../../database';
import { articles, comments, newsletterSubscribers, articleViews } from '../../../database/schema';
import { count, desc, sql, eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 관리자 권한 확인
    await requireAdmin(event);

    const db = await getDB();

    // 2. 기본 통계 (Cards)
    // - Total Articles
    const [totalArticlesObj] = await db.select({ value: count() }).from(articles);
    // - Published Articles
    const [publishedArticlesObj] = await db.select({ value: count() }).from(articles).where(eq(articles.status, 'published'));
    // - Total Comments
    const [totalCommentsObj] = await db.select({ value: count() }).from(comments);
    // - Total Subscribers (Newsletter)
    const [totalSubscribersObj] = await db.select({ value: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.isActive, true));

    // 3. 최근 게시글 Top 10 (조회수 기준)
    const topArticles = await db.select({
        id: articles.id,
        title: articles.title,
        viewCount: articles.viewCount,
        publishedAt: articles.publishedAt,
        authorName: articles.adminId, // Note: JOIN needed for real name, simplification for now
        status: articles.status
    })
    .from(articles)
    .orderBy(desc(articles.viewCount))
    .limit(10);

    // 4. 방문자 통계 (최근 30일)
    // MySQL DATE() 함수 사용하여 날짜별 그룹핑
    // article_views 테이블 활용
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyViews = await db.select({
        date: sql<string>`DATE(created_at)`,
        count: count()
    })
    .from(articleViews)
    .where(sql`created_at >= ${thirtyDaysAgo}`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);
    
    // 차트용 데이터 포맷팅 (빈 날짜 채우기는 프론트엔드 또는 여기서 처리)
    // 여기서는 Raw Data 전송

    return {
        stats: {
            totalArticles: totalArticlesObj?.value || 0,
            publishedArticles: publishedArticlesObj?.value || 0,
            totalComments: totalCommentsObj?.value || 0,
            totalSubscribers: totalSubscribersObj?.value || 0,
        },
        topArticles,
        visitorChart: dailyViews
    };
});
