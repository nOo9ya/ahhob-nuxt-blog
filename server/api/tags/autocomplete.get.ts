import { stringifyQuery } from 'vue-router';
import { getDB } from '../../database';
import { tags } from '../../database/schema';
import { or, like } from 'drizzle-orm';

/**
 * 태그 자동완성 API
 * GET /api/tags/autocomplete?q=...
 *
 * 권한: 공개 (Public)
 *
 * 데이터 흐름:
 * 1. Query Parameter 'q' 추출
 * 2. 검색어 유효성 검사 (빈 값 체크)
 * 3. DB 조회 (name 또는 slug에 검색어 포함)
 * 4. 결과 반환 (최대 10개)
 */
export default defineEventHandler(async (event) => {
    // 1. Query Parameter 'q' 추출
    const query = getQuery(event);
    const q = query.q;

    // 2. 검색어 유효성 검사
    if (!q || String(q).trim().length === 0) {
        return {
            tags: [],
        };
    }

    const db = await getDB();

    // 3. DB 조회
    const foundTags = await db
        .select()
        .from(tags)
        .where(or(like(tags.name, `%${q}%`), like(tags.slug, `%${q}%`)))
        .limit(10);

    // 4. 결과 반환
    return {
        tags: foundTags,
    };
});
