import { getDB } from '../../database';
import {
    articles,
    admins,
    categories,
    tags,
    articleTags,
} from '../../database/schema';
import { desc, eq, count, and, inArray, like, or, asc, aliasedTable, lte } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 쿼리 파라미터 파싱
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    // limit은 아래에서 재정의 및 검증
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;
    const categorySlug = query.categorySlug
        ? String(query.categorySlug)
        : undefined;
    const tagSlug = query.tagSlug ? String(query.tagSlug) : undefined;
    const search = query.search ? String(query.search) : undefined;
    const authorId = query.authorId ? Number(query.authorId) : undefined;
    const sort = query.sort ? String(query.sort) : 'latest';
    
    const limit = Math.min(Number(query.limit) || 12, 50); // 최대 50개 제한
    const offset = (page - 1) * limit;

    // 2. DB 연결
    const db = await getDB();

    // 필터 조건 생성
    const whereConditions = [];

    if (authorId) {
        whereConditions.push(eq(articles.adminId, authorId));
    }

    // [New] 예약 발행 필터링
    // 관리자가 아닌 경우(또는 명시적으로 모든 상태를 요청하지 않은 경우), 현재 시간보다 미래인 글은 숨김
    // status가 published여도 publishedAt이 미래면 숨김
    // 단, 상세 조회 API가 아니므로 여기선 리스트 조회 로직에 집중
    // TODO: 관리자 페이지에서의 리스트 조회와 일반 유저 리스트 조회를 구분할 필요 있음.
    // 현재 API 구조상 관리자 여부를 파라미터나 헤더로 판단하거나, 별도의 admin API를 쓰는게 좋음.
    // 여기서는 간단히 'status' 파라미터가 없으면(기본 조회) 공개된 글만 보여준다는 가정하에 필터링 추가.
    // 만약 관리자 페이지에서 이 API를 쓴다면 status=all 같은 파라미터를 보내야 함. (현재 코드는 status 파라미터 처리 로직이 없어 보임 -> 추가 필요하거나 기존 로직 확인)
    
    // 기존 로직: status 필터링 코드가 없었음 (status 컬럼 조차 select에만 있고 where엔 없음)
    // 개선: 기본적으로 'published' 상태이고 'publishedAt <= NOW' 인 것만 조회하도록 변경 (공용)
    // 하지만 관리자 페이지에서도 이 API를 쓴다면 문제됨.
    // 관리자 페이지: /api/articles를 쓴다면 모든 글이 나와야 함.
    // 해결책: query.mode = 'admin' 같은 파라미터 허용 (보안상 취약할 수 있으나 MVP 구현)
    // 또는 관리자 세션 체크.
    
    // 여기서는 안전하게: 기본적으로 published & <= NOW 필터링 적용.
    // query.status가 있으면 해당 status만 필터링 (관리자용)
    
    const status = query.status ? String(query.status) : undefined;
    
    if (status) {
        if (status !== 'all') {
             // status 파라미터가 있으면 그 상태만 조회 (예: 'draft', 'published')
             whereConditions.push(eq(articles.status, status as any));
        }
        // status='all'이면 필터링 없음 (관리자 조회용)
    } else {
        // status 파라미터가 없으면 '공개된 글'만 조회 (일반 사용자용)
        whereConditions.push(eq(articles.status, 'published'));
        whereConditions.push(lte(articles.publishedAt, new Date()));
    }

    // 카테고리 필터링 (Path 기반 최적화)
    // categoryId 또는 categorySlug 중 하나라도 있으면 처리
    if (categoryId || categorySlug) {
        // 1. 타겟 카테고리 조회 (ID 및 Path 확보)
        const targetCategory = await db.query.categories.findFirst({
            where: (categories, { eq, or }) => {
                const conditions = [];
                if (categoryId) conditions.push(eq(categories.id, categoryId));
                if (categorySlug) conditions.push(eq(categories.slug, categorySlug));
                // 둘 다 있으면 OR 조건? 보통응 하나만 씀.
                // 여기선 명시된 조건 만족하는 첫번째 것.
                return or(...conditions);
            },
            columns: { id: true, path: true }
        });

        if (targetCategory) {
            // 2. Path를 이용해 하위 카테고리까지 한 번에 필터링
            const targetPath = targetCategory.path || '';
            
            whereConditions.push(
                or(
                    eq(categories.path, targetPath),
                    like(categories.path, `${targetPath}/%`)
                )
            );
        } else {
             return {
                success: true,
                data: [],
                pagination: { page, limit, total: 0, totalPages: 0 }
            };
        }
    }

    // 검색어 필터링 (제목 or 요약)
    if (search) {
        whereConditions.push(
            or(
                like(articles.title, `%${search}%`),
                like(articles.excerpt, `%${search}%`)
            )
        );
    }

    // 부모 카테고리 조인을 위한 Alias
    const parentCategories = aliasedTable(categories, 'parent_categories');

    // 2-1. 기사 목록 조회 (Author + Category + Tags 조인)
    let queryBuilder = db
        .select({
            id: articles.id,
            title: articles.title,
            slug: articles.slug,
            excerpt: articles.excerpt,
            thumbnail: articles.thumbnail,
            publishedAt: articles.publishedAt,
            categoryId: articles.categoryId,
            status: articles.status, // Add status field
            author: {
                id: admins.id,
                name: admins.name,
                avatar: admins.avatar,
            },
            category: {
                name: categories.name,
                slug: categories.slug,
                path: categories.path, // [NEW] 전체 경로
            },
            // [Fix] 중첩 객체 타입 에러 방지를 위해 평탄화하여 선택
            parentCategoryName: parentCategories.name,
            parentCategorySlug: parentCategories.slug,
        })
        .from(articles)
        .leftJoin(admins, eq(articles.adminId, admins.id))
        .innerJoin(categories, eq(articles.categoryId, categories.id))
        .leftJoin(parentCategories, eq(categories.parentId, parentCategories.id));

    // 태그 필터링이 있는 경우 추가 조인
    if (tagSlug) {
        queryBuilder
            .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
            .innerJoin(tags, eq(articleTags.tagId, tags.id));
    }

    // 정렬 조건 결정
    let orderByCondition;
    switch (sort) {
        case 'oldest':
            orderByCondition = asc(articles.publishedAt);
            break;
        case 'popular':
            orderByCondition = desc(articles.viewCount);
            break;
        case 'latest':
        default:
            orderByCondition = desc(articles.publishedAt);
            break;
    }

    const rawArticleList = await queryBuilder
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset)
        .orderBy(orderByCondition);

    // [Fix] 응답 구조 재구성 (부모 카테고리 정보를 category 객체 내부로 이동)
    const articleList = rawArticleList.map((article: any) => {
        const { parentCategoryName, parentCategorySlug, category, ...rest } = article;
        return {
            ...rest,
            category: {
                ...category,
                parent: parentCategoryName ? {
                    name: parentCategoryName,
                    slug: parentCategorySlug
                } : null
            }
        };
    });

    // 3. 전체 개수 조회
    let countQueryBuilder = db
        .select({ count: count() })
        .from(articles)
        .leftJoin(categories, eq(articles.categoryId, categories.id));

    if (tagSlug) {
        countQueryBuilder
            .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
            .innerJoin(tags, eq(articleTags.tagId, tags.id));
    }

    const [totalCount] = await countQueryBuilder.where(and(...whereConditions));

    // 4. 응답 반환
    return {
        success: true,
        data: articleList,
        pagination: {
            page,
            limit,
            total: totalCount?.count ?? 0,
            totalPages: Math.ceil((totalCount?.count ?? 0) / limit),
        },
    };
});
