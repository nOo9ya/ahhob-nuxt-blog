/**
 * 기능: 슬러그 생성 및 기본 유효성 검사 (서버/클라이언트 공통)
 * 경로: shared/utils/slug.ts
 */

// 슬러그 형식: 영문 소문자, 숫자, 한글, 하이픈, @ 허용
export const SLUG_REGEX = /^[a-z0-9가-힣@]+(?:-[a-z0-9가-힣@]+)*$/;

/**
 * 문자열을 URL 슬러그로 변환합니다.
 * - 소문자 변환
 * - 한글, 영문, 숫자, @ 제외한 특수문자 제거
 * - 공백을 하이픈으로 변경
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-@]/g, '') // 특수문자 제거 (한글, @ 허용)
        .trim()
        .replace(/\s+/g, '-');
}
