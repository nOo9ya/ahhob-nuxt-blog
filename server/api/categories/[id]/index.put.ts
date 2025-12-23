import { getUserSession } from '../../../utils/session';
import { categories } from '../../../database/schema';
import { eq, sql, like } from 'drizzle-orm';
import { useSafeQuery } from '../../../utils/db';
import { getDB } from '../../../database';
import { validateSlugAvailability } from '../../../utils/slugValidator';

/**
 * 카테고리 수정 API
 * PUT /api/categories/:id
 *
 * 권한: admin
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. Admin 권한 확인
 * 3. Route Parameter에서 ID 추출 및 검증
 * 4. Request Body 읽기 및 필수 필드 검증
 * 5. 기존 카테고리 존재 확인
 * 6. Slug 중복 확인 (Validator 사용)
 * 7. 순환 참조 및 Parent 유효성 검사
 * 8. DB UPDATE (Category & Children's Path)
 * 9. 수정된 카테고리 조회 및 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 확인
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

    // 3. Route Parameter에서 ID 추출
    const id = Number(event.context.params?.id);

    // 4. ID Validation
    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: '유효하지 않은 카테고리 ID입니다.',
        });
    }

    // 5. Request Body 읽기
    const body = await readBody(event);
    const {
        name,
        slug,
        description,
        parentId, // [NEW] 부모 카테고리 ID
        metaTitle,
        metaDescription,
        ogImage,
        summary,
        keyTakeaways,
    } = body;

    // 6. Validation - 필수 필드 확인
    if (!name || !slug) {
        throw createError({
            statusCode: 400,
            message: 'name과 slug는 필수 항목입니다.',
        });
    }

    // [NEW] 자기 자신을 부모로 설정 불가
    if (parentId && parentId === id) {
        throw createError({
            statusCode: 400,
            message: '자기 자신을 상위 카테고리로 지정할 수 없습니다.',
        });
    }

    const db = await getDB();

    // 7. 기존 카테고리 존재 확인 (현재 상태 조회)
    const [existingCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

    if (!existingCategory) {
        throw createError({
            statusCode: 404,
            message: '수정할 카테고리를 찾을 수 없습니다.',
        });
    }

    // 8. [NEW] 부모 카테고리 유효성 및 순환 참조(Cycle) 검사
    // parentId가 변경된 경우에만 검사
    if (parentId && parentId !== existingCategory.parentId) {
        // 8-1. 부모 카테고리 존재 확인
        const [parentCategory] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, parentId))
            .limit(1);

        if (!parentCategory) {
            throw createError({
                statusCode: 400,
                message: '지정된 상위 카테고리가 존재하지 않습니다.',
            });
        }

        // 8-2. 순환 참조 검사 (Cycle Detection)
        // 새로운 부모(parentId)의 조상 중에 현재 카테고리(id)가 있는지 확인해야 함
        
        let currentAncestorId: number | null = parentId;
        const checkedIds = new Set<number>();
        
        while (currentAncestorId !== null) {
            // 안전장치: 무한 루프 방지 (이미 체크한 ID면 종료)
            if (checkedIds.has(currentAncestorId)) break;
            checkedIds.add(currentAncestorId);

            if (currentAncestorId === id) {
                throw createError({
                    statusCode: 400,
                    message: '순환 참조가 발생하여 이동할 수 없습니다. (상위 카테고리가 하위 카테고리에 포함될 수 없습니다.)',
                });
            }

            // 상위 부모 조회
            const [ancestor]: { parentId: number | null }[] = await db
                .select({ parentId: categories.parentId })
                .from(categories)
                .where(eq(categories.id, currentAncestorId))
                .limit(1);
            
            currentAncestorId = ancestor ? ancestor.parentId : null;
        }
    }

    // 9. Slug 유효성 및 중복 검사 (Validator 사용)
    const validation = await validateSlugAvailability(slug, 'category', id);

    if (!validation.isValid) {
        throw createError({
            statusCode: 409,
            message: validation.message,
        });
    }

    // 10. DB UPDATE
    await useSafeQuery(
        async () => {
            const db = await getDB();
            
            // [NEW] Path 재계산 로직
            // 부모가 변경되거나 슬러그가 변경되면 path를 다시 계산해야 함.
            
            let newPath = slug;
            const newParentId = parentId === undefined ? existingCategory.parentId : parentId;

            if (newParentId) {
                const [parent] = await db
                    .select({ path: categories.path, slug: categories.slug })
                    .from(categories)
                    .where(eq(categories.id, newParentId))
                    .limit(1);
                
                if (parent) {
                    const parentPath = parent.path || parent.slug;
                    newPath = `${parentPath}/${slug}`;
                }
            }

            // 업데이트 데이터 구성
            const updateData: any = {
                name,
                slug,
                description,
                parentId: newParentId, 
                path: newPath, // [NEW] Path 업데이트
                // JSON 컬럼 매핑
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
                    summary: summary || description,
                    keyTakeaways: keyTakeaways || [],
                },
            };

            await db
                .update(categories)
                .set(updateData)
                .where(eq(categories.id, id));

            // [NEW] 하위 카테고리들의 Path 일괄 업데이트
            // 기존 Path가 존재하고, Path가 변경된 경우에만 실행
            const oldPath = existingCategory.path;
            
            if (oldPath && newPath && oldPath !== newPath) {
                // 예: oldPath = 'A/B' -> newPath = 'X/B'
                // 자식 'A/B/C' -> 'X/B/C'
                // 로직: REPLACE(path, oldPath, newPath)는 위험할 수 있으므로
                // CONCAT(newPath, SUBSTRING(path, LENGTH(oldPath) + 1)) 사용
                
                await db
                    .update(categories)
                    .set({
                        path: sql`CONCAT(${newPath}, SUBSTRING(${categories.path}, ${oldPath.length + 1}))`
                    })
                    .where(like(categories.path, `${oldPath}/%`));
            }
        },
        {
            errorMessage: '카테고리 수정 중 오류가 발생했습니다.',
        }
    );

    // 11. 수정된 카테고리 조회 및 반환
    const [updatedCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, id))
        .limit(1);

    return {
        success: true,
        message: '카테고리가 수정되었습니다.',
        category: updatedCategory,
    };
});
