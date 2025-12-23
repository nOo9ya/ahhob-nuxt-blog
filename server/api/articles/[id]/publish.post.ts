import { getUserSession } from '~/server/utils/session';
import { articles } from '~/server/database/schema';
import { eq } from 'drizzle-orm';
import { useSafeQuery } from '~/server/utils/db';
import { getDB } from '~/server/database';
import { emailService } from '~/server/utils/email/service';

/**
 * 기사 발행 API
 * POST /api/articles/:id/publish
 *
 * 권한: 작성자 본인 또는 관리자(Admin)
 *
 * 데이터 흐름:
 * 1. 인증 확인 (세션)
 * 2. ID 파라미터 검증
 * 3. 기사 존재 및 권한 확인 (작성자 or 관리자)
 * 4. 이미 발행된 기사인지 확인
 * 5. 기사 상태를 'published'로 업데이트
 * 6. 뉴스레터 발송 트리거 (비동기)
 * 7. 발행된 기사 정보 반환
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

    // 2. ID 파라미터 확인
    const id = Number(getRouterParam(event, 'id'));

    if (!id) {
        throw createError({
            statusCode: 400,
            message: '잘못된 요청입니다.',
        });
    }

    const db = await getDB();

    // 3. 기사 존재 여부 및 권한 확인
    const [article] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    if (!article) {
        throw createError({
            statusCode: 404,
            message: '기사를 찾을 수 없습니다.',
        });
    }

    if (article.adminId !== user.userId && user.role !== 'admin') {
        throw createError({
            statusCode: 403,
            message: '발행 권한이 없습니다.',
        });
    }

    // 4. 이미 발행된 기사인지 확인
    if (article.status === 'published') {
        throw createError({
            statusCode: 400,
            message: '이미 발행된 기사입니다.',
        });
    }

    // 5. DB 업데이트 - status를 'published'로 변경하고 publishedAt 설정
    // useSafeQuery를 사용하여 에러 처리 자동화
    const publishedAt = new Date();
    await useSafeQuery(
        async () => {
            const db = await getDB();
            return await db
                .update(articles)
                .set({
                    status: 'published',
                    publishedAt: publishedAt,
                    updatedAt: new Date(),
                })
                .where(eq(articles.id, id));
        },
        {
            errorMessage: '기사 발행 중 오류가 발생했습니다.',
        }
    );

    // 6. 발행된 기사 정보 조회 및 반환
    const [publishedArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);

    // 4. 뉴스레터 발송 트리거 (비동기)
    event.waitUntil(
        emailService.notifyNewArticle({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
        })
    );

    return {
        success: true,
        message: '기사가 발행되었습니다.',
        article: publishedArticle,
    };
});
