export interface SeoMeta {
    title?: string;
    description?: string;
    keywords?: string[];
    noIndex?: boolean;
    noFollow?: boolean;
    newsKeywords?: string[];
    originalSource?: string;
    syndicationSource?: string;
    isOpinion?: boolean;
    geoRegion?: string;
    geoPlacename?: string;
    geoPosition?: string;
    locale?: string;
    alternateLocales?: Array<{ locale: string; url: string }>;
}

export interface SocialMeta {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: 'article' | 'website';
    ogLocale?: string;
    twitterCard?: 'summary' | 'summary_large_image';
    twitterSite?: string;
    twitterCreator?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterImageAlt?: string;
    pinterestImage?: string;
    pinterestDescription?: string;
    discordColor?: string;
    telegramChannel?: string;
    articleSection?: string;
    articleTags?: string[];
    articleAuthorUrl?: string;
    articlePublisherUrl?: string;
}

export interface GeoMeta {
    region?: string;
    placename?: string;
    position?: string;
    summary?: string;
    keyTakeaways?: string[];
    relevantEntities?: string[];
    citations?: Array<{ title: string; url: string }>;
}
