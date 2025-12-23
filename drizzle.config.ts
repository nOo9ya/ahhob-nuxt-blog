import type { Config } from 'drizzle-kit';

export default {
    schema: './server/database/schema.ts',
    out: './server/database/migrations',
    dialect: 'mysql',
    dbCredentials: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'blog',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'news_blog_dev',
    },
} satisfies Config;
