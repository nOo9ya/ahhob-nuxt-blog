/**
 * SendGrid 이메일 발송 제공자 구현
 *
 * 기능: SendGrid API를 사용하여 이메일을 발송합니다.
 * 경로: server/utils/email/providers/sendgrid.ts
 * 권한: 서버 내부 전용
 *
 * 데이터 흐름:
 * EmailService -> SendGridProvider -> SendGrid API
 */
import sgMail from '@sendgrid/mail';
import type { EmailProvider } from '../types';

export class SendGridProvider implements EmailProvider {
    private fromEmail: string;

    constructor(apiKey: string, fromEmail: string) {
        sgMail.setApiKey(apiKey);
        this.fromEmail = fromEmail;
    }

    async send(to: string[], subject: string, html: string): Promise<boolean> {
        try {
            // SendGrid는 다중 수신자를 위해 'to' 배열을 지원하지만,
            // 개인화 설정이 없다면 수신자끼리 이메일이 노출될 수 있으므로 주의가 필요합니다.
            // 뉴스레터 특성상 서로의 이메일이 보이면 안되므로 'isMultiple' 옵션을 사용하거나 개별 발송해야 합니다.
            
            // 안전하게 개별 발송 메시지 객체 생성 (isMultiple: true 사용 시 수신자 숨김 처리됨)
            const msg = {
                to: to, // 배열 전달. SendGrid가 다중 수신자 처리 (개인화 설정 시 서로 안 보임)
                // 뉴스레터의 경우 'from'을 사용하고 개인화(personalizations)를 쓰는 것이 좋지만,
                // MVP 구현에서는 'isMultiple: true' 옵션을 사용하여 수신자 숨김 처리를 합니다.
                from: this.fromEmail,
                subject: subject,
                html: html,
                isMultiple: true // 이 플래그가 있어야 수신자가 서로를 볼 수 없음
            };

            await sgMail.send(msg);
            return true;
        } catch (error) {
            console.error('SendGrid Exception:', error);
            if ((error as any).response) {
                console.error((error as any).response.body);
            }
            return false;
        }
    }
}
