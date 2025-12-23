/**
 * SEO 헬퍼 유틸리티
 * server/utils/seoHelper.ts
 *
 * 기능:
 * - 페이지별 메타 태그(Title, Description, OG, Twitter, GEO, Robots 등)를 표준화된 방식으로 생성
 * - 검색 엔진(Google, Naver) 및 AI 엔진(ChatGPT, Perplexity) 최적화
 * - 구조화 데이터(JSON-LD) 자동 생성
 */

// Schema.ts의 인터페이스와 동기화 (순환 참조 방지를 위해 재정의 권장하나, 여기서는 편의상 동일 구조 사용)
import type { SeoMeta, SocialMeta, GeoMeta } from '~/shared/types';

export interface SeoConfig {
    // 기본 정보
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';

    // 저자/발행 정보
    author?: string;
    publishedAt?: string;
    modifiedAt?: string;

    // 상세 메타데이터 (DB에서 로드)
    seoMeta?: SeoMeta | null;
    socialMeta?: SocialMeta | null;
    geoMeta?: GeoMeta | null;
}

/**
 * 메타 태그 생성 함수 (generateSeoMeta)
 *
 * 기능: SEO 설정을 기반으로 Nuxt의 useSeoMeta와 호환되는 메타 태그 객체를 생성합니다.
 *
 * 데이터 흐름:
 * 1. 런타임 설정(siteUrl, siteName 등) 로드
 * 2. URL 경로 처리 (절대 경로 변환)
 * 3. 기본 메타데이터 처리 (Title, Description, Open Graph, Twitter Card)
 * 4. Robots 설정 처리 (noIndex, noFollow)
 * 5. 이미지 URL 절대 경로 변환 및 할당
 * 6. 키워드 및 뉴스 태그 처리
 * 7. GEO 태그 및 기타 소셜 태그 할당
 * 8. 완성된 메타 태그 객체 반환
 *
 * @param config SeoConfig 객체 (페이지별 SEO 설정)
 * @returns Nuxt useSeoMeta 호환 객체
 */
export const generateSeoMeta = (config: SeoConfig) => {
    const runtimeConfig = useRuntimeConfig();
    const siteUrl = runtimeConfig.public.siteUrl; // nuxt.config.ts에서 기본값 처리됨
    const siteName = runtimeConfig.public.siteName;
    const twitterSite = runtimeConfig.public.twitterSite;

    const fullUrl = config.url
        ? config.url.startsWith('http')
            ? config.url
            : `${siteUrl}${config.url}`
        : siteUrl;

    // 1. 기본값 설정 (Fallback)
    const title = config.seoMeta?.title || config.title;
    const description = config.seoMeta?.description || config.description;
    const items: Record<string, any> = {
        title,
        description,

        // Open Graph
        ogTitle: config.socialMeta?.ogTitle || title,
        ogDescription: config.socialMeta?.ogDescription || description,
        ogType: config.socialMeta?.ogType || config.type || 'website',
        ogUrl: fullUrl,
        ogSiteName: siteName,

        // Twitter
        twitterCard: config.socialMeta?.twitterCard || 'summary_large_image',
        twitterSite: config.socialMeta?.twitterSite || twitterSite,
        twitterTitle: config.socialMeta?.twitterTitle || title,
        twitterDescription:
            config.socialMeta?.twitterDescription || description,
    };

    // 2. Robots 설정 (noIndex, noFollow)
    if (config.seoMeta?.noIndex) {
        items.robots = 'noindex, nofollow'; // Indexing 방지 시 follow도 보통 막음
    } else if (config.seoMeta?.noFollow) {
        items.robots = 'index, nofollow';
    } else {
        items.robots = 'index, follow'; // 기본값
    }

    // 3. 이미지 처리
    const mainImage = config.socialMeta?.ogImage || config.image;
    if (mainImage) {
        const imageUrl = mainImage.startsWith('http')
            ? mainImage
            : `${siteUrl}${mainImage}`;
        items.ogImage = imageUrl;
        items.twitterImage = config.socialMeta?.twitterImage || imageUrl;

        if (config.socialMeta?.pinterestImage) {
            // @ts-ignore: custom meta
            items['pinterest:image'] = config.socialMeta.pinterestImage;
        }
    }

    // 4. 키워드 및 뉴스 태그
    if (config.seoMeta?.keywords && config.seoMeta.keywords.length > 0) {
        // @ts-ignore
        items.keywords = config.seoMeta.keywords.join(', ');
    }
    if (
        config.seoMeta?.newsKeywords &&
        config.seoMeta.newsKeywords.length > 0
    ) {
        // @ts-ignore: Google News
        items.news_keywords = config.seoMeta.newsKeywords.join(', ');
    }

    // 5. GEO 태그 (Local SEO)
    if (config.seoMeta?.geoRegion)
        items['geo.region'] = config.seoMeta.geoRegion;
    if (config.seoMeta?.geoPlacename)
        items['geo.placename'] = config.seoMeta.geoPlacename;
    if (config.seoMeta?.geoPosition) {
        items['geo.position'] = config.seoMeta.geoPosition;
        items['ICBM'] = config.seoMeta.geoPosition; // Legacy support
    }

    // 6. 기타 Social (Discord 등)
    if (config.socialMeta?.discordColor) {
        items.themeColor = config.socialMeta.discordColor;
    }
    if (config.socialMeta?.twitterCreator) {
        items.twitterCreator = config.socialMeta.twitterCreator;
    }

    // 7. 기사 전용 태그
    if (config.type === 'article') {
        if (config.author) items['article:author'] = config.author;
        if (config.publishedAt)
            items['article:published_time'] = config.publishedAt;
        if (config.modifiedAt)
            items['article:modified_time'] = config.modifiedAt;
    }

    return items;
};

/**
 * JSON-LD 구조화 데이터 생성 함수 (generateArticleJsonLd)
 *
 * 기능: 검색 엔진이 기사 내용을 잘 이해할 수 있도록 Schema.org 기반의 JSON-LD 데이터를 생성합니다.
 * AI 엔진을 위한 요약 및 핵심 포인트 정보도 포함합니다.
 *
 * 데이터 흐름:
 * 1. 런타임 설정 로드
 * 2. GeoMeta 및 AI 메타데이터 데이터 추출
 * 3. JSON-LD 객체 구성
 *    - @context, @type 설정
 *    - 제목, 설명(AI 요약 포함), 이미지, 날짜, 저자, 발행자 정보 매핑
 *    - 키워드, 섹션 정보 할당
 *    - GEO 및 AI 확장 데이터(abstract, citation, about) 추가
 * 4. 완성된 JSON-LD 객체 반환
 *
 * @param article 기사 데이터 객체 (DB 조회 결과)
 * @returns Schema.org BlogPosting 타입의 JSON 객체
 */
export const generateArticleJsonLd = (article: any) => {
    const runtimeConfig = useRuntimeConfig();
    const siteUrl = runtimeConfig.public.siteUrl;
    const siteName = runtimeConfig.public.siteName;
    const siteType = runtimeConfig.public.siteType; // Person or Organization
    const siteLogo = runtimeConfig.public.siteLogo;

    // GeoMeta 정보 추출
    const geoMeta = article.geoMeta as GeoMeta | null;

    // AI 엔진 최적화: keyTakeaways를 description에 포함하거나 별도 필드 활용
    // Schema.org에는 'abstract'나 'speakable'가 있지만,
    // 여기서는 AI가 잘 긁어갈 수 있도록 description을 보강하거나 custom field 느낌으로 처리
    // 또는 'keywords' 필드 활용

    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.seoMeta?.title || article.title,
        description:
            article.seoMeta?.description || article.summary || article.excerpt, // AI Summary 우선

        // 이미지
        image:
            article.socialMeta?.ogImage || article.thumbnail
                ? [
                      `${siteUrl}${article.socialMeta?.ogImage || article.thumbnail}`,
                  ]
                : [],

        // 날짜
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,

        // 저자
        author: {
            '@type': 'Person',
            name: article.author?.name || 'Unknown',
            // url: article.author?.id ? `${siteUrl}/author/${article.author.id}` : undefined
        },

        // 발행자 (설정된 siteType 사용)
        publisher: {
            '@type': siteType,
            name: siteName,
            logo: {
                '@type': 'ImageObject',
                url: siteLogo.startsWith('http')
                    ? siteLogo
                    : `${siteUrl}${siteLogo}`,
            },
        },

        // 키워드
        keywords: article.seoMeta?.keywords
            ? article.seoMeta.keywords.join(', ')
            : undefined,

        // 카테고리/섹션
        articleSection: article.category?.name,

        // --- GEO & AI Enhanced Data ---

        // 요약 (Direct Answer)
        abstract: geoMeta?.summary,

        // 인용 (Citations / Credibility)
        citation: geoMeta?.citations?.map((c) => c.url),

        // 관련 개념 (Knowledge Graph Connection)
        about: geoMeta?.relevantEntities?.map((entity) => ({
            '@type': 'Thing',
            name: entity,
        })),

        // 핵심 포인트 (Note: 표준 필드는 아니지만 일부 엔진 인식 가능성 있음,
        // 또는 articleBody 앞부분에 주입하는 것도 방법이나 여기서는 메타데이터로만 넣음)
        // mainEntityOfPage: ...
    };
};
