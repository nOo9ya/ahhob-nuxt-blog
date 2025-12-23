import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * HTML 본문에서 이미지 소스(URL) 목록을 추출합니다.
 * 정규식을 사용하여 <img src="..."> 패턴을 찾습니다.
 */
export const extractImageUrls = (html: string | null): string[] => {
    if (!html) return [];
    
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        if (match[1]) {
            urls.push(match[1]);
        }
    }

    return urls;
};

/**
 * 로컬 업로드 경로(/uploads/...)인 이미지들을 파일 시스템에서 삭제합니다.
 * 외부 URL이나 다른 경로는 무시합니다.
 */
export const deleteUnusedImages = async (imageUrls: string[]) => {
    const publicDir = process.cwd() + '/public';
    
    for (const url of imageUrls) {
        // 로컬 업로드 이미지인지 확인 (예: /uploads/...)
        if (url.startsWith('/uploads/') || url.startsWith('/images/')) {
            try {
                // URL 디코딩 (한글 파일명 등)
                const decodedPath = decodeURIComponent(url);
                const filePath = join(publicDir, decodedPath);
                
                // 파일 존재 여부 확인 후 삭제
                await fs.unlink(filePath);
                console.log(`[ImageGC] Deleted unused image: ${filePath}`);
            } catch (error: any) {
                // 파일이 없거나 삭제 실패 시 로그만 남기고 무시 (트랜잭션 롤백 방지)
                console.warn(`[ImageGC] Failed to delete image: ${url}`, error.message);
            }
        }
    }
};
