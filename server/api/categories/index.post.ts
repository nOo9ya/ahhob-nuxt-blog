import { getDB } from '../../database';
import { getUserSession } from '../../utils/session';
import { categories } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '../../utils/db';
import { validateSlugAvailability } from '~/server/utils/slugValidator';

export default defineEventHandler(async (event) => {
    // 1. 인증 확인
    // 세션에서 사용자 정보 가져오기
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: '로그인이 필요합니다.',
        });
    }

    // 2. Admin 권한 체크
    if (user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '관리자 권한이 필요합니다.',
        });
    }

    // 3. Request Body 읽기
    const body = await readBody(event);
    const {
        name,
        slug,
        description,
        metaTitle,
        metaDescription,
        ogImage,
        // GEO (Generative Engine Optimization)
        summary,
        keyTakeaways,
    } = body;

    // 4. Validation - 필수 필드 확인
    if (!name || !slug) {
        throw createError({
            statusCode: 400,
            message: 'name과 slug는 필수 항목입니다.',
        });
    }

    const db = await getDB();

    // 5. Slug 유효성 및 중복 검사
    const validation = await validateSlugAvailability(slug, 'category');

    if (!validation.isValid) {
        throw createError({
            statusCode: 409,
            message: validation.message,
        });
    }

    // 6. DB INSERT - 새 카테고리 생성
    const [newCategory] = await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .insert(categories)
                .values({
                    name,
                    slug,
                    description,
                    // JSON 컬럼 매핑 (SEO/Social/GEO)
                    seoMeta: {
                        title: metaTitle || name,
                        description: metaDescription || description,
                    },
                    socialMeta: {
                        ogTitle: metaTitle || name,
                        ogDescription: metaDescription || description,
                        ogImage: ogImage,
                    },
                    geoMeta: {
                        summary: summary || description, // AI 요약용
                        keyTakeaways: keyTakeaways || [], // 핵심 포인트
                    },
                })
                .$returningId(); // { id: number }
        },
        {
            errorMessage: '카테고리 생성 중 오류가 발생했습니다.',
        }
    );

    if (!newCategory) {
        throw createError({
            statusCode: 500,
            message: '카테고리 생성에 실패했습니다.',
        });
    }

    // 7. 생성된 카테고리 조회 및 반환
    const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, newCategory.id))
        .limit(1);

    return {
        success: true,
        message: '카테고리가 생성되었습니다.',
        category: category,
    };
});
