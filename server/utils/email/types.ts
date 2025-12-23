/**
 * 이메일 제공자 인터페이스 정의
 *
 * 기능: 다양한 이메일 발송 서비스를 추상화하여 공통 인터페이스를 제공합니다.
 * 경로: server/utils/email/types.ts
 * 권한: 서버 내부 전용
 */
export interface EmailProvider {
    /**
     * 이메일 발송
     * @param to 수신자 이메일 주소 배열
     * @param subject 이메일 제목
     * @param html 이메일 본문 (HTML)
     * @returns 성공 여부
     */
    send(to: string[], subject: string, html: string): Promise<boolean>;
}

export type EmailProviderType = 'resend' | 'sendgrid';
