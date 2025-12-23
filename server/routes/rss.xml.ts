import { defineEventHandler, setResponseHeader } from 'h3';
import { getDB } from '../database';
import { articles, admins } from '../database/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * RSS Feed 생성 핸들러
 * GET /rss.xml
 *
 * 기능: 사이트의 최신 기사를 RSS 2.0 포맷으로 제공합니다.
 * 용도: RSS 리더기, 콘텐츠 신디케이션 등에서 사용
 */
export default defineEventHandler(async (event) => {
    const db = await getDB();
    const config = useRuntimeConfig();
    const baseUrl = config.public.siteUrl || 'http://localhost:3000';
    const siteTitle = config.public.siteName || '나의 블로그';
    const siteDescription =
        config.public.siteDescription || '최신 뉴스 및 기술 블로그';

    // 1. 최신 기사 조회 (최대 20개) - Query Builder (Join)
    const result = await db
        .select()
        .from(articles)
        .leftJoin(admins, eq(articles.adminId, admins.id))
        .where(eq(articles.status, 'published'))
        .orderBy(desc(articles.publishedAt))
        .limit(20);

    // 2. RSS XML 헤더 구성
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>ko</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

    // 3. 기사 아이템 추가
    result.forEach(({ articles: article, admins: author }) => {
        const link = `${baseUrl}/article/${article.slug}`;
        const pubDate = article.publishedAt
            ? new Date(article.publishedAt).toUTCString()
            : new Date().toUTCString();

        rss += `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${author?.email || 'no-reply@example.com'} (${author?.name || 'Unknown'})</author>
    </item>
`;
    });

    // 4. RSS 종료 태그
    rss += `  </channel>
</rss>`;

    // 5. 헤더 설정 및 반환
    setResponseHeader(event, 'Content-Type', 'application/xml');
    return rss;
});
