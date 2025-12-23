/**
 * Resend 이메일 발송 제공자 구현
 *
 * 기능: Resend API를 사용하여 이메일을 발송합니다.
 * 경로: server/utils/email/providers/resend.ts
 * 권한: 서버 내부 전용
 *
 * 데이터 흐름:
 * EmailService -> ResendProvider -> Resend API
 */
import { Resend } from 'resend';
import type { EmailProvider } from '../types';

export class ResendProvider implements EmailProvider {
    private client: Resend;
    private fromEmail: string;

    constructor(apiKey: string, fromEmail: string) {
        this.client = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    async send(to: string[], subject: string, html: string): Promise<boolean> {
        try {
            // Resend는 무료 플랜에서 단일 수신자 테스트만 가능한 경우가 많으나,
            // 실제 구현에서는 배치 발송을 고려해야 합니다. MVP에서는 to 배열을 지원하므로 이를 활용합니다.
            
            const data = await this.client.emails.send({
                from: this.fromEmail,
                to: to,
                subject: subject,
                html: html,
            });

            if (data.error) {
                console.error('Resend Error:', data.error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Resend Exception:', error);
            return false;
        }
    }
}
