
import { newsletterSubscribers } from '~/server/database/schema';
import { getDB } from '~/server/database';
import { getUserSession } from '~/server/utils/session';
import { useSafeQuery } from '~/server/utils/db';
import { eq } from 'drizzle-orm';

/**
 * 구독자 상태 변경 API (구독 중지/재개)
 * PUT /api/newsletter/subscribers/:id
 */
export default defineEventHandler(async (event) => {
    // 1. 권한 체크
    const user = await getUserSession(event);
    if (!user || typeof user.role !== 'string' || !['admin', 'editor', 'writer'].includes(user.role)) {
        throw createError({
            statusCode: 403,
            message: '권한이 없습니다.',
        });
    }

    // 2. ID 파싱
    const id = Number(event.context.params?.id);
    if (!id || isNaN(id)) {
        throw createError({ statusCode: 400, message: '잘못된 ID입니다.' });
    }

    // 3. Body 파싱
    const body = await readBody(event);
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
        throw createError({ statusCode: 400, message: 'isActive 값이 필요합니다.' });
    }

    const db = await getDB();

    // 4. 업데이트 수행
    await useSafeQuery(
        async () => {
            await db
                .update(newsletterSubscribers)
                .set({ isActive })
                .where(eq(newsletterSubscribers.id, id));
        },
        { errorMessage: '구독 상태 변경 중 오류가 발생했습니다.' }
    );

    return { success: true, message: '상태가 변경되었습니다.' };
});
