import { defineEventHandler } from 'h3';
import { getDB } from '../database';
import { articles, categories, tags } from '../database/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Sitemap XML 생성 핸들러
 * GET /sitemap.xml
 *
 * 기능: 사이트의 모든 접근 가능한 URL을 XML 형태로 반환합니다.
 * 포함 대상:
 * 1. 정적 페이지 (메인, 태그 목록 등)
 * 2. 카테고리 페이지
 * 3. 태그 페이지
 * 4. 기사 상세 페이지 (발행된 기사만)
 */
export default defineEventHandler(async (event) => {
    const db = await getDB();
    const config = useRuntimeConfig();
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'; // 환경 변수에서 사이트 URL 가져오기

    // 1. 데이터 병렬 조회 (성능 최적화)
    const [allArticles, allCategories, allTags] = await Promise.all([
        // 발행된 기사만 조회, 최신순
        db
            .select({
                slug: articles.slug,
                updatedAt: articles.updatedAt,
                publishedAt: articles.publishedAt,
            })
            .from(articles)
            .where(eq(articles.status, 'published'))
            .orderBy(desc(articles.publishedAt)),

        // 모든 카테고리 조회
        db.select({ slug: categories.slug }).from(categories),

        // 모든 태그 조회
        db.select({ slug: tags.slug }).from(tags),
    ]);

    // 2. XML 시작 태그
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // 3. 정적 URL 추가
    const staticUrls = [
        { loc: '/', priority: '1.0' },
        { loc: '/tags', priority: '0.8' },
        // 필요한 경우 추가 정적 페이지 등록
    ];

    staticUrls.forEach((url) => {
        sitemap += `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <changefreq>daily</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
    });

    // 4. 카테고리 URL 추가
    allCategories.forEach((category) => {
        sitemap += `  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    // 5. 태그 URL 추가
    allTags.forEach((tag) => {
        sitemap += `  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // 6. 기사 URL 추가
    allArticles.forEach((article) => {
        // 마지막 수정일 or 발행일 사용
        const lastMod = article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : article.publishedAt
              ? new Date(article.publishedAt).toISOString()
              : new Date().toISOString();

        sitemap += `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    });

    // 7. XML 종료 태그
    sitemap += `</urlset>`;

    // 8. 헤더 설정 및 반환
    setResponseHeader(event, 'Content-Type', 'application/xml');
    return sitemap;
});
