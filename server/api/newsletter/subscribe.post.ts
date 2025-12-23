import { defineEventHandler, readBody, createError } from 'h3';
import { eq } from 'drizzle-orm';
import { newsletterSubscribers } from '../../database/schema';
import { getDB } from '../../database';
import { isValidEmail } from '#shared/utils/validation';

/**
 * 뉴스레터 구독 API
 * POST /api/newsletter/subscribe
 * 접근 권한: 모두 (Public)
 *
 * 데이터 흐름:
 * 1. 클라이언트로부터 이메일 주소 수신
 * 2. 이메일 유효성 검사 (형식 확인)
 * 3. DB 중복 확인
 * 4. 신규 구독자 DB 저장
 * 5. 성공 응답 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 요청 데이터 파싱
    const body = await readBody(event);
    const { email } = body;

    // 2. 이메일 필수 확인
    if (!email) {
        throw createError({
            statusCode: 400,
            message: '이메일 주소를 입력해주세요.',
        });
    }

    // 3. 이메일 형식 검증
    if (!isValidEmail(email)) {
        throw createError({
            statusCode: 400,
            message: '유효한 이메일 주소를 입력해주세요.',
        });
    }

    try {
        const db = await getDB();

        // 중복 이메일 확인
        const [existingSubscriber] = await db
            .select({
                id: newsletterSubscribers.id,
                isActive: newsletterSubscribers.isActive,
            })
            .from(newsletterSubscribers)
            .where(eq(newsletterSubscribers.email, email))
            .limit(1);

        if (existingSubscriber) {
            // 이미 존재하지만 비활성 상태라면 활성화
            if (!existingSubscriber.isActive) {
                // 비활성 구독자 다시 활성화 (UPDATE)
                await db
                    .update(newsletterSubscribers)
                    .set({ isActive: true })
                    .where(eq(newsletterSubscribers.id, existingSubscriber.id));

                return {
                    success: true,
                    message: '다시 구독해주셔서 감사합니다!',
                };
            }

            return {
                success: true,
                message: '이미 구독 중인 이메일입니다.',
            };
        }

        // 신규 구독자 저장 (INSERT)
        await db.insert(newsletterSubscribers).values({
            email,
            isActive: true,
        });

        return {
            success: true,
            message: '뉴스레터 구독이 완료되었습니다!',
        };
    } catch (error) {
        console.error('Newsletter Subscription Error:', error);
        throw createError({
            statusCode: 500,
            message: '구독 처리 중 오류가 발생했습니다.',
        });
    }
});
