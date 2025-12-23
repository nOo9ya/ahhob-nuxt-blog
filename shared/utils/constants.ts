export const RESERVED_SLUGS = [
    'admin',
    'login',
    'api',
    'auth',
    'search',
    'tags',
    'categories',
    'users',
    'public',
    '_nuxt',
    'sitemap.xml',
    'rss.xml',
    'robots.txt',
    'favicon.ico',
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];
