/**
 * 날짜 포맷팅 유틸리티
 */

// 상대 시간 표시 (예: "방금 전", "5분 전")
export const timeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return '방금 전';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}분 전`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}시간 전`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays}일 전`;
    }

    return formatDate(date);
};

// 날짜 포맷팅 (YYYY. MM. DD.)
export const formatDate = (date: string | Date, options: Intl.DateTimeFormatOptions = {}): string => {
    if (!date) return '';
    const d = new Date(date);
    
    // 기본 포맷: YYYY. MM. DD.
    if (Object.keys(options).length === 0) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}.`;
    }

    return new Intl.DateTimeFormat('ko-KR', options).format(d);
};
