import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../server/database/schema';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

dotenv.config();

async function check() {
    console.log('Connecting to DB...');
    // Docker 환경에서는 DB_HOST가 서비스명(db, mariadb 등)이거나 컨테이너 IP여야 함.
    // 여기서는 환경변수를 믿되, 실패 시 기본값을 조정함.
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db', 
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'newsblog',
        password: process.env.DB_PASSWORD || 'newsblog123!',
        database: process.env.DB_NAME || 'news_blog_dev',
    });

    const db = drizzle(connection, { schema, mode: 'default' });

    console.log('--- Categories ---');
    const categories = await db.query.categories.findMany();
    console.table(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, path: c.path, order: c.order })));

    console.log('\n--- Articles ---');
    // SQL Syntax 에러 회피를 위해 Relation Join 대신 단순 조회 사용
    const allArticles = await db.select().from(schema.articles);
    const allCategories = await db.select().from(schema.categories);
    console.log('Categories:', allCategories.map(c => ({ 
        id: c.id, 
        name: c.name, 
        parentId: c.parentId,
        slug: c.slug,
        path: c.path,   // [NEW]
        order: c.order  // [NEW]
    })));

    const categoryMap = new Map(allCategories.map(c => [c.id, c]));

    // 콘솔 테이블 출력
    if (allArticles.length === 0) {
        console.log('No articles found.');
    } else {
        console.table(allArticles.map(a => {
            const cat = a.categoryId ? categoryMap.get(a.categoryId) : null;
            return {
                id: a.id,
                title: a.title,
                categoryId: a.categoryId,
                categoryName: cat ? cat.name : '*** MISSING ***', // 카테고리 없으면 경고 표시
                categorySlug: cat ? cat.slug : ''
            };
        }));
    }

    await connection.end();
}

check().catch(console.error);
