import { useRuntimeConfig, useRoute, useHead } from '#imports';

/**
 * JSON-LD 구조화 데이터 생성 Composable
 * 
 * 기능:
 * - BreadcrumbList: 탐색 경로 구조화 데이터
 * - Article: 블로그 포스트 구조화 데이터 (Google 검색 결과용)
 * - Website: 웹사이트 정보
 */

export const useJsonLd = () => {
    const config = useRuntimeConfig();
    const route = useRoute();
    const siteUrl = config.public.siteUrl;

    /**
     * BreadcrumbList JSON-LD 생성
     * @param items { name: string, path: string }[]
     */
    const setBreadcrumbsJsonLd = (items: { name: string; path: string }[]) => {
        const breadcrumbList = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: `${siteUrl}${item.path.startsWith('/') ? item.path : '/' + item.path}`
            }))
        };

        useHead({
            script: [
                {
                    type: 'application/ld+json',
                    innerHTML: JSON.stringify(breadcrumbList)
                }
            ]
        });
    };

    /**
     * Article JSON-LD 생성
     * @param article 기사 데이터
     */
    const setArticleJsonLd = (article: any) => {
        if (!article) return;

        const articleSchema = {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: article.title,
            description: article.metaDescription || article.content?.substring(0, 160).replace(/<[^>]*>?/gm, ''),
            image: article.ogImage ? [article.ogImage] : [],
            datePublished: article.publishedAt || article.createdAt,
            dateModified: article.updatedAt || article.publishedAt,
            author: {
                '@type': 'Person',
                name: article.author?.name || config.public.siteName,
                url: `${siteUrl}/author/${article.author?.id || 'admin'}` // 임시 URL
            },
            publisher: {
                '@type': 'Organization',
                name: config.public.siteName,
                logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/logo.png`
                }
            },
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': `${siteUrl}${route.path}`
            }
        };

        useHead({
            script: [
                {
                    type: 'application/ld+json',
                    innerHTML: JSON.stringify(articleSchema)
                }
            ]
        });
    };

    return {
        setBreadcrumbsJsonLd,
        setArticleJsonLd
    };
};
