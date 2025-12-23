import { count, eq, sql } from 'drizzle-orm';
import { getDB } from '../database';
import { articles, categories, tags, users } from '../database/schema';
import { getUserSession } from '../utils/session';

/**
 * 통계 조회 API
 * GET /api/stats
 *
 * 권한: 관리자 (Admin)
 *
 * 데이터 흐름:
 * 1. 세션 확인 및 관리자 권한 검증
 * 2. DB 연결
 * 3. 병렬 쿼리 실행 (Promise.all)
 *    - 전체 사용자 수
 *    - 전체 기사 수
 *    - 발행된 기사 수
 *    - 임시저장 기사 수
 *    - 카테고리 수
 *    - 태그 수
 * 4. 결과 집계 및 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 및 권한 확인
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    const db = await getDB();

    // 2. 통계 데이터 조회 (병렬 실행)
    const [
        [usersCount],
        [totalArticlesCount],
        [publishedArticlesCount],
        [draftArticlesCount],
        [categoriesCount],
        [tagsCount],
    ] = await Promise.all([
        // 사용자 수
        db.select({ count: count() }).from(users),
        // 전체 기사 수
        db.select({ count: count() }).from(articles),
        // 발행된 기사 수
        db
            .select({ count: count() })
            .from(articles)
            .where(eq(articles.status, 'published')),
        // 임시저장 기사 수
        db
            .select({ count: count() })
            .from(articles)
            .where(eq(articles.status, 'draft')),
        // 카테고리 수
        db.select({ count: count() }).from(categories),
        // 태그 수
        db.select({ count: count() }).from(tags),
    ]);

    // 3. 결과 반환
    return {
        success: true,
        stats: {
            totalUsers: usersCount?.count || 0,
            totalArticles: totalArticlesCount?.count || 0,
            publishedArticles: publishedArticlesCount?.count || 0,
            draftArticles: draftArticlesCount?.count || 0,
            totalCategories: categoriesCount?.count || 0,
            totalTags: tagsCount?.count || 0,
        },
    };
});
