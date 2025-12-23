import { newsletterSubscribers } from '~/server/database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    // 1. 관리자 권한 체크
    requireAdmin(event);

    // 2. ID 파라미터 파싱
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID',
        });
    }

    // 3. 삭제 실행
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, Number(id)));

    // 4. 성공 응답
    return {
        success: true,
        message: '구독자가 삭제되었습니다.',
    };
});
