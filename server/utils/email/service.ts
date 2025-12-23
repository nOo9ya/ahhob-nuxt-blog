/**
 * 이메일 발송 서비스 (Email Service)
 *
 * 기능: 사이트 설정에 따라 이메일 제공자를 선택하고 뉴스레터를 발송합니다.
 * 경로: server/utils/email/service.ts
 * 권한: 서버 내부 전용
 *
 * 데이터 흐름:
 * 1. 사이트 설정 조회 (제공자 선택)
 * 2. 활성 구독자 목록 조회
 * 3. 이메일 내용 생성
 * 4. 배치 단위로 이메일 발송 (Provider 사용)
 */
import type { EmailProvider } from './types';
import { ResendProvider } from './providers/resend';
import { SendGridProvider } from './providers/sendgrid';
import { getSiteSettings } from '../settings';
import { getDB } from '../../database';
import { newsletterSubscribers } from '../../database/schema';
import { eq } from 'drizzle-orm';

class EmailService {
    private getProvider(settings: any): EmailProvider | null {
        const config = settings.newsletter || {};
        
        if (!config.enabled) {
            return null;
        }

        const fromEmail = process.env.NUXT_NEWSLETTER_FROM_EMAIL;
        if (!fromEmail) {
            console.warn('NUXT_NEWSLETTER_FROM_EMAIL is not set');
            return null;
        }

        if (config.provider === 'resend' && process.env.NUXT_RESEND_API_KEY) {
            return new ResendProvider(process.env.NUXT_RESEND_API_KEY, fromEmail);
        }

        if (config.provider === 'sendgrid' && process.env.NUXT_SENDGRID_API_KEY) {
            return new SendGridProvider(process.env.NUXT_SENDGRID_API_KEY, fromEmail);
        }

        return null;
    }

    /**
     * 새 기사 알림 뉴스레터 발송
     */
    async notifyNewArticle(article: { title: string; slug: string; excerpt?: string | null }) {
        const settings = await getSiteSettings();
        const provider = this.getProvider(settings);

        if (!provider) {
            console.log('Newsletter is disabled or provider not configured');
            return;
        }

        // 1. 활성 구독자 조회
        const db = await getDB();
        const subscribers = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.isActive, true));

        if (subscribers.length === 0) {
            console.log('No active subscribers to notify');
            return;
        }

        const emails = subscribers.map(s => s.email);

        // 2. 이메일 본문 생성
        // TODO: 템플릿 엔진 사용 고려 (현재는 간단한 HTML)
        const link = `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articles/${article.slug}`;
        const subject = `[새 글] ${article.title}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>새로운 글이 게시되었습니다</h1>
                <h2>${article.title}</h2>
                <p>${article.excerpt || '내용을 확인해보세요.'}</p>
                <div style="margin: 20px 0;">
                    <a href="${link}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        글 읽으러 가기
                    </a>
                </div>
                <hr />
                <p style="font-size: 12px; color: #666;">
                    본 메일은 뉴스레터 구독자에게 발송됩니다.
                </p>
            </div>
        `;

        // 3. 발송 (배치 처리 고려: 이메일 서비스마다 한 번에 보낼 수 있는 제한이 있음)
        // MVP: Resend/SendGrid의 다중 수신자 기능 사용 (단, 수신자 수 제한 주의)
        // 수신자가 많을 경우 청크(chunk) 단위로 나누어 발송해야 함.
        const chunkSize = 50;
        for (let i = 0; i < emails.length; i += chunkSize) {
            const batch = emails.slice(i, i + chunkSize);
            console.log(`구독자 ${batch.length}명에게 뉴스레터 발송 중...`);
            await provider.send(batch, subject, html);
        }
    }
}

export const emailService = new EmailService();
