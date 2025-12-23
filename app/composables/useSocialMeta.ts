import { useRuntimeConfig, useRoute, useSeoMeta } from '#imports';

/**
 * 소셜 미디어 메타 태그 생성 Composable
 * 
 * 기능:
 * - Open Graph (Facebook/Kakao/LinkedIn) 태그 생성
 * - Twitter Card 태그 생성
 * - useSeoMeta를 통해 메타 태그 주입
 */
export const useSocialMeta = (options: {
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
    url?: string;
    type?: 'website' | 'article';
    siteName?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    twitterCreator?: string;
}) => {
    const config = useRuntimeConfig();
    const route = useRoute();

    const siteUrl = config.public.siteUrl as string;
    const currentUrl = options.url || `${siteUrl}${route.path}`;
    const defaultImage = config.public.siteLogo || '/logo.png'; // Fallback image

    useSeoMeta({
        // Open Graph
        ogType: options.type || 'website',
        ogTitle: options.title,
        ogDescription: options.description,
        ogImage: options.image || defaultImage,
        ogUrl: currentUrl,
        ogSiteName: options.siteName || config.public.siteName,
        ogLocale: 'ko_KR',

        // Twitter
        twitterCard: options.twitterCard || 'summary_large_image',
        twitterTitle: options.title,
        twitterDescription: options.description,
        twitterImage: options.image || defaultImage,
        twitterImageAlt: options.imageAlt || options.title,
        twitterCreator: options.twitterCreator || config.public.twitterSite,
        twitterSite: config.public.twitterSite,
    });
};
