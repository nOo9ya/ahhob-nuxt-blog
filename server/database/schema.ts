import {
    mysqlTable,
    varchar,
    text,
    longtext,
    int,
    timestamp,
    mysqlEnum,
    boolean,
    json,
    index,
    primaryKey,
    AnyMySqlColumn,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ========== 타입 정의 (Type Definitions) ==========

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
    summary?: string;
    keyTakeaways?: string[];
    relevantEntities?: string[];
    citations?: Array<{ title: string; url: string }>;
}

export interface SocialLinks {
    twitter?: string;
    linkedin?: string;
    website?: string;
    github?: string;
}

// ========== 관리자 테이블 (Admins - 이메일/비밀번호 로그인) ==========
export const admins = mysqlTable('admins', {
    id: int('id').primaryKey().autoincrement(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    role: mysqlEnum('role', ['admin', 'editor', 'writer']).default('writer'),
    status: mysqlEnum('admin_status', ['pending', 'active', 'suspended']).default('active'),
    bio: text('bio'),
    avatar: varchar('avatar', { length: 500 }),
    // socialLinks: json('social_links').$type<SocialLinks>(),
    credentials: varchar('credentials', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ========== 사용자 테이블 (Users - 소셜 로그인) ==========
export const users = mysqlTable(
    'users',
    {
        id: int('id').primaryKey().autoincrement(),
        provider: mysqlEnum('provider', ['google', 'naver', 'kakao', 'apple', 'microsoft', 'github']).notNull(),
        providerId: varchar('provider_id', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull(),
        name: varchar('name', { length: 100 }).notNull(),
        avatar: varchar('avatar', { length: 500 }),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        // 같은 제공자에서 같은 ID는 중복 불가
        uniqueProviderUser: index('unique_provider_user').on(table.provider, table.providerId),
    })
);

export const categories = mysqlTable(
    'categories',
    {
        id: int('id').primaryKey().autoincrement(),
        name: varchar('name', { length: 100 }).notNull(),
        slug: varchar('slug', { length: 100 }).notNull().unique(),
        description: text('description'),
        
        // [NEW] 정렬 순서 (오름차순)
        order: int('order').default(0),

        // [NEW] 하위 카테고리 지원을 위한 Parent ID
        parentId: int('parent_id'),

        // [NEW] Materialized Path (e.g. "tech/programming/web")
        path: varchar('path', { length: 500 }),

        seoMeta: json('seo_meta').$type<SeoMeta>(),
        socialMeta: json('social_meta').$type<SocialMeta>(),
        geoMeta: json('geo_meta').$type<GeoMeta>(),
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        parentIdx: index('idx_parent_id').on(table.parentId),
    })
);

export const tags = mysqlTable('tags', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 50 }).notNull(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const newsletterSubscribers = mysqlTable('newsletter_subscribers', {
    id: int('id').primaryKey().autoincrement(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const articles = mysqlTable(
    'articles',
    {
        id: int('id').primaryKey().autoincrement(),
        title: varchar('title', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        content: longtext('content'),
        excerpt: varchar('excerpt', { length: 500 }),
        thumbnail: varchar('thumbnail', { length: 500 }),
        metaTitle: varchar('meta_title', { length: 70 }),
        metaDescription: varchar('meta_description', { length: 160 }),
        canonicalUrl: varchar('canonical_url', { length: 500 }),
        ogImage: varchar('og_image', { length: 500 }),
        ogImageAlt: varchar('og_image_alt', { length: 125 }),
        seoMeta: json('seo_meta').$type<SeoMeta>(),
        socialMeta: json('social_meta').$type<SocialMeta>(),
        geoMeta: json('geo_meta').$type<GeoMeta>(),
        adminId: int('admin_id').references(() => admins.id),
        categoryId: int('category_id').references(() => categories.id),
        status: mysqlEnum('status', ['draft', 'review', 'published']).default(
            'draft'
        ),
        isFeatured: boolean('is_featured').default(false),
        viewCount: int('view_count').default(0),
        likeCount: int('like_count').default(0),
        publishedAt: timestamp('published_at'),
        isCommentEnabled: boolean('is_comment_enabled').default(true),
    
    // 댓글 정책: default(사이트 기본값), disabled(비허용), users_only(회원만), anyone(누구나)
    commentPolicy: mysqlEnum('comment_policy', ['default', 'disabled', 'users_only', 'anyone']).default('default'),
    
    createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        statusIdx: index('idx_status').on(table.status),
        publishedIdx: index('idx_published_at').on(table.publishedAt),
        categoryIdx: index('idx_category').on(table.categoryId),
        adminIdx: index('idx_admin').on(table.adminId),
    })
);

export const siteSettings = mysqlTable('site_settings', {
    key: varchar('key', { length: 50 }).primaryKey(),
    value: text('value'),
    description: varchar('description', { length: 255 }),
    type: mysqlEnum('type', ['boolean', 'string', 'number']).default('string'),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const articleTags = mysqlTable(
    'article_tags',
    {
        articleId: int('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        tagId: int('tag_id')
            .notNull()
            .references(() => tags.id, { onDelete: 'cascade' }),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.articleId, table.tagId] }),
    })
);

export const pages = mysqlTable('pages', {
    id: int('id').primaryKey().autoincrement(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    content: longtext('content').notNull(),
    thumbnail: varchar('thumbnail', { length: 500 }),
    seoMeta: json('seo_meta').$type<SeoMeta>(),
    socialMeta: json('social_meta').$type<SocialMeta>(),
    geoMeta: json('geo_meta').$type<GeoMeta>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const comments = mysqlTable(
    'comments',
    {
        id: int('id').primaryKey().autoincrement(),
        articleId: int('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        
        // 회원 댓글 (userId가 있으면 회원)
        userId: int('user_id')
            .references(() => users.id, { onDelete: 'cascade' }),
        
        // 비회원 댓글 (userId가 null이면 비회원)
        guestName: varchar('guest_name', { length: 100 }),
        guestEmail: varchar('guest_email', { length: 255 }),
        guestPasswordHash: varchar('guest_password_hash', { length: 255 }),
        
        content: text('content').notNull(),
        isPrivate: boolean('is_private').default(false), // 비공개 댓글 (작성자와 관리자만 볼 수 있음)
        parentId: int('parent_id'), // Self-reference for replies
        createdAt: timestamp('created_at').defaultNow(),
        updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    },
    (table) => ({
        articleIdx: index('idx_article_id').on(table.articleId),
        userIdx: index('idx_user_id').on(table.userId),
        parentIdx: index('idx_parent_id').on(table.parentId),
        guestEmailIdx: index('idx_guest_email').on(table.guestEmail),
    })
);

// 좋아요 테이블
export const articleLikes = mysqlTable(
    'article_likes',
    {
        userId: int('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        articleId: int('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.articleId] }), // 복합키 (중복 좋아요 방지)
        articleIdx: index('idx_article_id').on(table.articleId),
    })
);

// 조회수 로그 테이블 (중복 조회 방지용)
export const articleViews = mysqlTable(
    'article_views',
    {
        id: int('id').primaryKey().autoincrement(),
        articleId: int('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        // IP 주소 또는 세션 식별자 (해싱하여 저장 권장하나 여기선 MVP로 직접 저장)
        identifier: varchar('identifier', { length: 255 }).notNull(),
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => ({
        articleIdx: index('idx_article_id').on(table.articleId),
        identifierIdx: index('idx_identifier').on(table.identifier),
        // 복합 인덱스로 조회 성능 최적화 (articleId + identifier)
        uniqueViewIdx: index('idx_view_check').on(table.articleId, table.identifier),
    })
);

// 북마크 테이블
export const bookmarks = mysqlTable(
    'bookmarks',
    {
        userId: int('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'cascade' }),
        articleId: int('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.articleId] }), // 복합키
        userIdx: index('idx_user_bookmarks').on(table.userId), // 내 북마크 조회용
    })
);

// ========== 페이지 뷰 추적 테이블 (Page Views Tracking) ==========
// 기능: 모든 페이지 방문 기록 및 유입 경로 분석
// - Referrer 기반 유입 경로 추적
// - 검색엔진 및 AI 검색 엔진 감지
// - 검색 키워드 추출 (가능한 경우)
// - GEO/SEO 최적화를 위한 트래픽 분석
export const pageViews = mysqlTable(
    'page_views',
    {
        id: int('id').primaryKey().autoincrement(),

        // 페이지 정보
        path: varchar('path', { length: 500 }).notNull(), // 방문한 페이지 경로
        articleId: int('article_id').references(() => articles.id, { onDelete: 'set null' }), // NULL 가능 (일반 페이지도 추적)

        // 방문자 정보 (개인정보 보호를 위해 해시 저장)
        ipHash: varchar('ip_hash', { length: 64 }).notNull(), // IP 주소 SHA-256 해시
        userAgent: text('user_agent'), // User-Agent 문자열

        // 유입 경로 정보
        referrer: text('referrer'), // 전체 Referrer URL
        referrerType: mysqlEnum('referrer_type', [
            'direct',      // 직접 접속
            'search',      // 전통 검색엔진 (Google, Naver, Bing 등)
            'ai_search',   // AI 검색엔진 (Perplexity, ChatGPT, Gemini 등)
            'social',      // 소셜 미디어
            'referral',    // 기타 외부 링크
        ]).default('direct'),
        searchEngine: varchar('search_engine', { length: 50 }), // 검색엔진 이름 (google, naver, perplexity 등)
        searchKeyword: varchar('search_keyword', { length: 255 }), // 검색 키워드 (추출 가능한 경우)

        // 타임스탬프
        createdAt: timestamp('created_at').defaultNow(),
    },
    (table) => ({
        // 인덱스 설정 (조회 성능 최적화)
        createdAtIdx: index('idx_created_at').on(table.createdAt), // 날짜별 조회
        referrerTypeIdx: index('idx_referrer_type').on(table.referrerType), // 유입 유형별 조회
        searchEngineIdx: index('idx_search_engine').on(table.searchEngine), // 검색엔진별 조회
        articleIdIdx: index('idx_article_id').on(table.articleId), // 기사별 조회
        pathIdx: index('idx_path').on(table.path), // 페이지별 조회
        // 복합 인덱스: 날짜 + 유입 유형 (통계 쿼리 최적화)
        dateTypeIdx: index('idx_date_type').on(table.createdAt, table.referrerType),
    })
);


// ========== Relations (Drizzle ORM Relational Query) ==========
// NOTE: Relations MUST be defined AFTER all tables are defined to avoid "undefined" errors.

export const adminsRelations = relations(admins, ({ many }) => ({
    articles: many(articles),
}));

export const usersRelations = relations(users, ({ many }) => ({
    comments: many(comments),
    likes: many(articleLikes),
    bookmarks: many(bookmarks),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    articles: many(articles),
    // Self-Referencing Relations (Hierarchy)
    parent: one(categories, {
        fields: [categories.parentId],
        references: [categories.id],
        relationName: 'category_hierarchy',
    }),
    children: many(categories, {
        relationName: 'category_hierarchy',
    }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
    admin: one(admins, {
        fields: [articles.adminId],
        references: [admins.id],
    }),
    category: one(categories, {
        fields: [articles.categoryId],
        references: [categories.id],
    }),
    articleTags: many(articleTags),
    comments: many(comments),
    likes: many(articleLikes),
    bookmarks: many(bookmarks),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
    articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
    article: one(articles, {
        fields: [articleTags.articleId],
        references: [articles.id],
    }),
    tag: one(tags, {
        fields: [articleTags.tagId],
        references: [tags.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
    user: one(users, {
        fields: [comments.userId],
        references: [users.id],
    }),
    article: one(articles, {
        fields: [comments.articleId],
        references: [articles.id],
    }),
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
        relationName: 'comment_hierarchy',
    }),
    children: many(comments, {
        relationName: 'comment_hierarchy',
    }),
}));

export const articleLikesRelations = relations(articleLikes, ({ one }) => ({
    user: one(users, {
        fields: [articleLikes.userId],
        references: [users.id],
    }),
    article: one(articles, {
        fields: [articleLikes.articleId],
        references: [articles.id],
    }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
    user: one(users, {
        fields: [bookmarks.userId],
        references: [users.id],
    }),
    article: one(articles, {
        fields: [bookmarks.articleId],
        references: [articles.id],
    }),
}));
