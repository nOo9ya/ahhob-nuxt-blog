/**
 * 문자열 처리 유틸리티
 */

// HTML 태그 제거 및 길이 제한 (요약문 생성용)
export const truncateText = (text: string, maxLength: number = 100): string => {
    if (!text) return '';
    
    // HTML 태그 제거
    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
    
    if (cleanText.length <= maxLength) {
        return cleanText;
    }
    
    return cleanText.substring(0, maxLength) + '...';
};

// 숫자 포맷팅 (1,000 단위 콤마)
export const formatNumber = (num: number): string => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('ko-KR').format(num);
};

// 파일명에서 확장자 추출
export const getExtension = (filename: string): string => {
    if (!filename) return '';
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};
