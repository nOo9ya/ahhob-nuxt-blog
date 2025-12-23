import type { User } from './user';
import type { SeoMeta, SocialMeta, GeoMeta } from './seo';

export type ArticleStatus = 'draft' | 'review' | 'published';

export interface Category {
    id: number;
    name: string;
    slug: string;
    path?: string; // Materialized path (e.g. "tech/web")
    description?: string;
    parentId?: number | null; // 상위 카테고리 ID (계층 구조)

    // SEO & Meta
    seoMeta?: SeoMeta;
    socialMeta?: SocialMeta;
    geoMeta?: GeoMeta;

    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    createdAt?: string | Date;
    articleCount?: number;
}

export interface Article {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail?: string; // 썸네일 이미지 URL
    status?: ArticleStatus; // 게시 상태 (draft, review, published)

    viewCount?: number;
    likeCount?: number;
    isCommentEnabled?: boolean;
    commentPolicy?: 'disabled' | 'anyone' | 'users_only';

    // Meta
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    ogImageAlt?: string;

    // Rich Meta
    seoMeta?: SeoMeta;
    socialMeta?: SocialMeta;
    geoMeta?: GeoMeta;

    // Relations
    authorId: number;
    categoryId: number;
    author?: User;
    category?: Category;
    tags?: Tag[];

    // Dates
    publishedAt?: string | Date;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    thumbnail?: string;

    // Meta
    seoMeta?: SeoMeta;
    socialMeta?: SocialMeta;
    geoMeta?: GeoMeta;

    createdAt: string | Date;
    updatedAt: string | Date;
}

// API 응답 타입
export interface ApiResponse<T = any> {
    success?: boolean;
    data?: T;
    categories?: Category[]; // 카테고리 목록 응답용
    articles?: Article[]; // 기사 목록 응답용
    tags?: Tag[]; // 태그 목록 응답용
    message?: string;
    error?: string;
    // 페이지네이션 등의 메타 정보
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}
