import { computed, watch, isRef, type Ref } from 'vue';
import { useJsonLd, useSeoMeta, useHead } from '#imports';
import { useSocialMeta } from './useSocialMeta';

/**
 * 기사 전용 SEO 관리 Composable
 * 
 * 기능:
 * - 기사 데이터를 받아 SEO 메타 태그 자동 설정
 * - JSON-LD 데이터 주입
 * - Social Meta 태그 주입
 */
export const useArticleSeo = (article: Ref<any> | any) => {
    const { setArticleJsonLd } = useJsonLd();
    
    // Reactive 해제 및 감시
    const unrefArticle = computed(() => {
        return isRef(article) ? article.value : article;
    });

    watch(() => unrefArticle.value, (data) => {
        if (!data) return;

        const title = data.metaTitle || data.title;
        const description = data.metaDescription || data.excerpt || data.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || '';
        const image = data.ogImage || data.thumbnail;
        
        // 1. Basic SEO
        useSeoMeta({
            title,
            description,
            keywords: data.seoMeta?.keywords?.join(', ') || '',
            robots: {
                index: !data.seoMeta?.noIndex,
                follow: !data.seoMeta?.noFollow
            },
            author: data.author?.name || 'Editor'
        });

        // 2. Social Meta
        useSocialMeta({
            title: data.socialMeta?.ogTitle || title,
            description: data.socialMeta?.ogDescription || description,
            image,
            imageAlt: data.ogImageAlt || title,
            type: 'article',
            twitterCard: data.socialMeta?.twitterCard || 'summary_large_image',
            twitterCreator: data.socialMeta?.twitterCreator
        });

        // 3. JSON-LD
        setArticleJsonLd(data);
        
        // 4. Link Tags (Canonical)
        if (data.canonicalUrl) {
            useHead({
                link: [{ rel: 'canonical', href: data.canonicalUrl }]
            });
        }
    }, { immediate: true, deep: true });
};
