import { getDB } from '../../database';
import { categories } from '../../database/schema';
import { eq, sql, like } from 'drizzle-orm';

/**
 * 카테고리 일괄 재정렬 (트랜잭션)
 *
 * payload: Array<{ id: number, parentId: number|null, order: number }>
 */
export default defineEventHandler(async (event) => {
    const db = await getDB();
    const body = await readBody(event);
    const updates = body as Array<{ id: number; parentId: number | null; order: number }>;

    if (!Array.isArray(updates) || updates.length === 0) {
        return { success: false, message: 'No updates provided' };
    }

    try {
        await db.transaction(async (tx) => {
            // 1. 기본 정보(parentId, order) 업데이트
            for (const item of updates) {
                await tx
                    .update(categories)
                    .set({
                        parentId: item.parentId,
                        order: item.order,
                    })
                    .where(eq(categories.id, item.id));
            }

            // 2. Path 재계산 (모든 수정된 카테고리와 그 자손들에 대해)
            // 주의: Path 계산은 부모의 Path가 확정된 후에 수행되어야 정확함.
            // 전체 트리를 다시 순회하며 Path를 업데이트하는 것이 가장 안전하지만,
            // 성능을 위해 변경된 항목에 대해서만 처리할 수도 있음.
            // 여기서는 MVP로 "전체 카테고리 트리를 메모리에서 재구성하여 Path를 계산하고 일괄 업데이트"하는 방식을 택함.
            // (데이터 양이 많지 않으므로 가능)

            const allCats = await tx.select().from(categories);
            const catMap = new Map(allCats.map((c) => [c.id, c]));

            // Path 재귀 계산 함수
            const calculatePath = (catId: number): string => {
                const cat = catMap.get(catId);
                if (!cat) return '';

                if (cat.parentId) {
                    const parentPath = calculatePath(cat.parentId);
                    return parentPath ? `${parentPath}/${cat.slug}` : cat.slug;
                }
                return cat.slug;
            };

            // 변경된 후의 Path를 계산하여 DB 업데이트
            for (const cat of allCats) {
                const newPath = calculatePath(cat.id);
                if (cat.path !== newPath) {
                    await tx
                        .update(categories)
                        .set({ path: newPath })
                        .where(eq(categories.id, cat.id));
                }
            }
        });

        return { success: true };
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            message: e.message || 'Failed to reorder categories',
        });
    }
});
