import { getDB } from '../../database';
import { pages } from '../../database/schema';
import { sql } from 'drizzle-orm';

/**
 * 페이지 목록 조회 API
 * GET /api/pages
 *
 * 권한: 없음 (누구나 접근 가능)
 *
 * 데이터 흐름:
 * 1. DB 연결
 * 2. 페이지 목록 조회 (최신순 정렬)
 * 3. 페이지 목록 반환
 */
export default defineEventHandler(async (event) => {
    // 1. DB 연결
    const db = await getDB();

    // 2. 페이지 목록 조회 (생성일 기준 내림차순 정렬)
    const pageList = await db
        .select()
        .from(pages)
        .orderBy(sql`${pages.createdAt} DESC`);

    // 3. 응답 반환
    return {
        success: true,
        pages: pageList,
    };
});
