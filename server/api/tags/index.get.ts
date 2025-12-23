import { getDB } from '../../database';
import { tags, articleTags } from '../../database/schema';
import { sql, eq, count, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. DB 연결
    const db = await getDB();

    // 2. 태그 목록 조회 (기사 개수 포함)
    // GROUP BY를 사용하여 각 태그별 기사 수를 카운트
    const tagList = await db
        .select({
            id: tags.id,
            name: tags.name,
            slug: tags.slug,
            createdAt: tags.createdAt,
            articleCount: count(articleTags.articleId),
        })
        .from(tags)
        .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
        .groupBy(tags.id)
        .orderBy(desc(tags.createdAt));

    // 3. 응답 반환
    return {
        tags: tagList,
    };
});
