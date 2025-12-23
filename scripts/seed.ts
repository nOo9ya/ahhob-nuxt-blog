import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../server/database/schema';
import {
    users,
    admins,
    categories,
    tags,
    articles,
    articleTags,
    pages,
    siteSettings,
    newsletterSubscribers
} from '../server/database/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// DB 연결 설정
const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'newsblog',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'news_blog_dev',
    charset: 'utf8mb4',
});

const db = drizzle(connection, { schema, mode: 'default' });

// ========== 1. 사용자 생성 ==========
async function seedUsers() {
    console.log('👤 사용자 데이터 삽입 중...');

    // 기존 데이터 확인 (중복 방지)
    const existingAdmin = await db.query.admins.findFirst({
        where: eq(admins.email, 'admin@example.com'),
    });

    if (existingAdmin) {
        return existingAdmin.id;
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('admin123!', 10);

    // 관리자 계정 삽입
    const [admin] = await db
        .insert(admins)
        .values({
            email: 'admin@example.com',
            passwordHash: hashedPassword,
            name: '관리자',
            role: 'admin',
            bio: '블로그 편집장',
            credentials: 'Chief Editor',

        })
        .$returningId();

    console.log(`  ✅ 관리자 계정 생성 (ID: ${admin.id})`);

    return admin.id;
}

// ========== 2. 카테고리 생성 (N-Depth, Rich Metadata) ==========
async function seedCategories() {
    console.log('📁 카테고리 데이터 삽입 중...');

    // 1. 최상위 카테고리
    const rootCategories = [
        { name: '기술', slug: 'tech', description: 'IT, 개발, AI' },
        { name: '라이프', slug: 'life', description: '일상, 여행, 건강' },
        { name: '비즈니스', slug: 'business', description: '경제, 스타트업' },
        { name: '과학', slug: 'science', description: '기초과학, 우주' },
    ];

    const categoryMap = new Map<string, { id: number; path: string }>(); // slug -> { id, path }

    for (const cat of rootCategories) {
        const existing = await db.query.categories.findFirst({
            where: eq(categories.slug, cat.slug),
        });
        if (existing) {
            categoryMap.set(cat.slug, { id: existing.id, path: existing.path || cat.slug });
            continue;
        }
        // @ts-ignore
        const [inserted] = await db
            .insert(categories)
            .values({ ...cat, path: cat.slug })
            .$returningId();
        categoryMap.set(cat.slug, { id: inserted.id, path: cat.slug });
        console.log(`  ✅ Root: "${cat.name}" (${cat.slug})`);
    }

    // 2. Tech 하위 4단계 (총 5단계)
    // 구조: tech -> programming -> web -> framework -> nuxt
    const techChain = [
        { name: '프로그래밍', slug: 'programming', parentSlug: 'tech' },
        { name: '웹 개발', slug: 'web', parentSlug: 'programming' },
        { name: '프레임워크', slug: 'framework', parentSlug: 'web' },
        { name: 'Nuxt.js', slug: 'nuxt', parentSlug: 'framework' },
    ];

    for (const cat of techChain) {
        const parentId = categoryMap.get(cat.parentSlug);
        if (!parentId) continue;

        const existing = await db.query.categories.findFirst({
            where: eq(categories.slug, cat.slug),
        });
        if (existing) {
            categoryMap.set(cat.slug, { id: existing.id, path: existing.path || '' });
            continue;
        }

        const parentPath = parentId.path;
        const currentPath = `${parentPath}/${cat.slug}`;

        // @ts-ignore
        const [inserted] = await db
            .insert(categories)
            .values({
                name: cat.name,
                slug: cat.slug,
                parentId: parentId.id,
                path: currentPath,
                description: `${cat.name} 관련 카테고리`,
            })
            .$returningId();

        categoryMap.set(cat.slug, { id: inserted.id, path: currentPath });
        console.log(`    ↳ Child: "${cat.name}" (${cat.slug})`);
    }

    // 3. Life 하위 예시 (2단계)
    const lifeChain = [
        { name: '여행', slug: 'travel', parentSlug: 'life' },
        { name: '맛집', slug: 'food', parentSlug: 'life' },
    ];

    for (const cat of lifeChain) {
        const parentId = categoryMap.get(cat.parentSlug);
        if (!parentId) continue;

        const existing = await db.query.categories.findFirst({
            where: eq(categories.slug, cat.slug),
        });
        if (existing) {
            categoryMap.set(cat.slug, { id: existing.id, path: existing.path || '' });
            continue;
        }

        const parentPath = parentId.path;
        const currentPath = `${parentPath}/${cat.slug}`;

        // @ts-ignore
        const [inserted] = await db
            .insert(categories)
            .values({
                name: cat.name,
                slug: cat.slug,
                parentId: parentId.id,
                path: currentPath,
            })
            .$returningId();
        categoryMap.set(cat.slug, { id: inserted.id, path: currentPath });
    }

    return categoryMap;
}

// ========== 3. 태그 생성 ==========
async function seedTags() {
    console.log('🏷️  태그 데이터 삽입 중...');

    const tagData = [
        { name: 'AI', slug: 'ai' },
        { name: 'ChatGPT', slug: 'chatgpt' },
        { name: '스타트업', slug: 'startup' },
    ];

    const tagIds: number[] = [];

    for (const tag of tagData) {
        const existing = await db.query.tags.findFirst({
            where: eq(tags.slug, tag.slug),
        });

        if (existing) {
            tagIds.push(existing.id);
            continue;
        }

        const [inserted] = await db.insert(tags).values(tag).$returningId();
        tagIds.push(inserted.id);
    }

    return tagIds;
}

// ========== 4. 정적 페이지 생성 (Pages) ==========
async function seedPages() {
    console.log('📄 정적 페이지 데이터 삽입 중...');
    const pageData = [
        {
            title: '회사 소개',
            slug: 'about',
            content:
                '<h1>블로그 소개</h1><p>우리는 기술과 비즈니스의 미래를 잇는 미디어입니다.</p>',
            seoMeta: { keywords: ['회사소개', '미션', '비전'] },
            geoMeta: {
                summary: '블로그는 기술 중심의 차세대 미디어 기업입니다.',
                keyTakeaways: ['신뢰할 수 있는 저널리즘', '깊이 있는 분석'],
                relevantEntities: ['NewsBlog', 'Media'],
            },
        },
        {
            title: '이용약관',
            slug: 'terms',
            content: '<h1>이용약관</h1><p>본 약관은...</p>',
            seoMeta: { noIndex: true }, // 약관은 검색 노출 제한
            geoMeta: { summary: '서비스 이용에 관한 규정 및 조건' },
        },
    ];

    for (const page of pageData) {
        const existing = await db.query.pages.findFirst({
            where: eq(pages.slug, page.slug),
        });
        if (existing) continue;

        // @ts-ignore
        await db.insert(pages).values(page);
        console.log(`  ✅ "${page.title}" 페이지 생성`);
    }
}

// ========== 4-1. 사이트 설정 생성 (NEW) ==========
async function seedSiteSettings() {
    console.log('⚙️  사이트 설정 삽입 중...');
    const settings = [
        { key: 'comment_policy', value: 'public' }, // 누구나 댓글 작성 가능
    ];

    for (const s of settings) {
         const existing = await db.query.siteSettings.findFirst({
            where: eq(siteSettings.key, s.key),
        });
        if (existing) continue;

        await db.insert(siteSettings).values(s);
        console.log(`  ✅ 설정: "${s.key}" = "${s.value}"`);
    }
}

// ========== 4-2. 소셜 사용자 생성 (NEW - for FK constraints) ==========
async function seedSocialUsers() {
    console.log('👤 소셜 사용자 데이터 삽입 중...');

    // Admin과 ID를 맞추기 위해 더미 유저 생성 (ID: 1)
    const existing = await db.query.users.findFirst({
        where: eq(users.email, 'test@example.com'),
    });

    if (!existing) {
        await db.insert(users).values({
            email: 'test@example.com',
            name: 'Test User',
            provider: 'google',
            providerId: 'test_provider_id',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        });
        console.log('  ✅ 소셜 사용자 생성 완료 (ID 1)');
    }
}

// ========== 5. 기사 생성 (Rich Metadata) ==========
async function seedArticles(
    authorId: number,
    categoryMap: Map<string, { id: number; path: string }>,
    tagIds: number[]
) {
    console.log('📰 기사 데이터 삽입 중...');

    const articleData = [
        {
            title: 'AI의 미래: 2025년 전망',
            slug: 'ai-future-2025',
            content: '# AI 2025 전망...',
            excerpt: '인공지능 기술의 발전 방향과 주요 트렌드 분석',
            categoryId: categoryMap.get('tech')?.id, // 1 Depth
            authorId: authorId,
            status: 'published' as const,
            tagIds: [tagIds[0]],
        },
        {
            title: '프로그래밍의 기초',
            slug: 'programming-basics',
            content: '# 프로그래밍이란...',
            excerpt: '코딩을 처음 시작하는 사람들을 위한 가이드',
            categoryId: categoryMap.get('programming')?.id, // 2 Depth
            authorId: authorId,
            status: 'published' as const,
            tagIds: [],
        },
        {
            title: '웹 개발 로드맵 2025',
            slug: 'web-roadmap-2025',
            content: '# 웹 개발 로드맵...',
            excerpt: '프론트엔드부터 백엔드까지',
            categoryId: categoryMap.get('web')?.id, // 3 Depth
            authorId: authorId,
            status: 'published' as const,
            tagIds: [],
        },
        {
            title: '모던 프레임워크 비교',
            slug: 'framework-comparison',
            content: '# Vue vs React...',
            excerpt: '어떤 프레임워크를 선택해야 할까?',
            categoryId: categoryMap.get('framework')?.id, // 4 Depth
            authorId: authorId,
            status: 'published' as const,
            tagIds: [],
        },
        {
            title: 'Nuxt 3 완벽 가이드',
            slug: 'nuxt-3-complete-guide',
            content: '# Nuxt 3 Start...',
            excerpt: '풀스택 프레임워크 Nuxt 3 마스터하기',
            categoryId: categoryMap.get('nuxt')?.id, // 5 Depth!
            authorId: authorId,
            status: 'published' as const,
            tagIds: [tagIds[0]],
        },
    ];

    for (const article of articleData) {
        if (!article.categoryId) continue; // 카테고리 ID 없으면 스킵

        const existing = await db.query.articles.findFirst({
            where: eq(articles.slug, article.slug),
        });

        if (existing) continue;

        const { tagIds: articleTagIds, ...articleWithoutTags } = article;
        // @ts-ignore
        const [inserted] = await db
            .insert(articles)
            .values({ ...articleWithoutTags, publishedAt: new Date() })
            .$returningId();

        if (articleTagIds && articleTagIds.length > 0) {
            await db.insert(articleTags).values(
                articleTagIds.map((tagId) => ({
                    articleId: inserted.id,
                    tagId: tagId,
                }))
            );
        }
        console.log(`  ✅ Depth 테스트용 기사: "${article.title}"`);
    }
}

// ========== 6. 뉴스레터 구독자 생성 ==========
async function seedSubscribers() {
    console.log('📧 뉴스레터 구독자 데이터 삽입 중...');

    const subscribers = Array.from({ length: 20 }).map((_, i) => ({
        email: `subscriber${i + 1}@example.com`,
        isActive: Math.random() > 0.2, // 80% active
    }));

    let count = 0;
    for (const sub of subscribers) {
        const existing = await db.query.newsletterSubscribers.findFirst({
            where: eq(newsletterSubscribers.email, sub.email),
        });

        if (existing) continue;

        await db.insert(newsletterSubscribers).values(sub);
        count++;
    }
    console.log(`  ✅ 구독자 ${count}명 생성 완료`);
}

// ========== 메인 함수 ==========
async function main() {
    console.log('\n🌱 Seed 데이터 삽입 시작...\n');

    try {
        // 1. 사용자(Admin) 생성
        const adminId = await seedUsers();

        // 1-1. 소셜 사용자 생성
        await seedSocialUsers();

        // 2. 카테고리 생성
        const categoryMap = await seedCategories();

        // 3. 태그 생성
        const tagIds = await seedTags();

        // 4. 정적 페이지 생성
        await seedPages();

        // 4-1. 사이트 설정 생성
        await seedSiteSettings();

        // 5. 기사 생성
        await seedArticles(adminId, categoryMap, tagIds);

        // 6. 뉴스레터 구독자 생성
        await seedSubscribers();

        console.log('\n✅ Seed 데이터 삽입 완료!\n');
        console.log('📊 요약:');
        console.log('  - 관리자 계정: 1개');
        console.log('  - 카테고리: 2개');
        console.log('  - 태그: 3개');
        console.log('  - 정적 페이지: 2개');
        console.log('  - 기사: 1개');
        console.log('\n🔐 로그인 정보:');
        console.log('  이메일: admin@example.com');
        console.log('  비밀번호: admin123!\n');
    } catch (error) {
        console.error('❌ 에러 발생:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

// 실행// 실행
main();
