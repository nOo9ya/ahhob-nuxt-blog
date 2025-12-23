import path from 'path';
import { readdir, copyFile, mkdir, rm } from 'fs/promises';

/**
 * server/utils/moveImages.ts
 * temp 폴더의 이미지를 최종 경로로 이동하는 유틸리티
 *
 * 데이터 흐름:
 * 1. HTML content와 thumbnail에서 temp 경로 추출
 * 2. contentType에 따라 최종 경로 결정
 *    - article: uploads/articles/{category_path}/{slug}/
 *    - page: uploads/pages/{slug}/
 * 3. temp 폴더의 파일들을 최종 경로로 복사
 * 4. HTML content와 thumbnail 경로를 최종 경로로 변경
 * 5. temp 폴더 삭제
 */

interface MoveImagesOptions {
    content: string; // HTML content
    thumbnail: string | null;
    contentType: 'article' | 'page';
    categoryPath?: string; // article only
    slug: string;
    userId: number; // 사용자 ID (temp 폴더 삭제용)
}

interface MoveImagesResult {
    content: string; // 이미지 경로가 변경된 HTML
    thumbnail: string | null;
}

/**
 * 디렉토리 생성 헬퍼 (ensureDir)
 */
async function ensureDir(dirPath: string) {
    try {
        await mkdir(dirPath, { recursive: true });
    } catch (error) {
        if ((error as any).code !== 'EEXIST') throw error;
    }
}

/**
 * temp 폴더의 이미지를 최종 경로로 이동
 *
 * @param options MoveImagesOptions 객체
 * @returns MoveImagesResult (변경된 content와 thumbnail 경로)
 */
export async function moveImagesToFinal(
    options: MoveImagesOptions
): Promise<MoveImagesResult> {
    const { content, thumbnail, contentType, categoryPath, slug, userId } = options;

    // 1. 최종 경로 결정
    let finalPath: string;
    if (contentType === 'article') {
        if (!categoryPath) {
            throw new Error('categoryPath is required for article type');
        }
        finalPath = `uploads/articles/${categoryPath}/${slug}`;
    } else {
        finalPath = `uploads/pages/${slug}`;
    }

    const finalDir = path.join(process.cwd(), 'public', finalPath);
    await ensureDir(finalDir);

    // 2. content와 thumbnail에서 temp 경로 추출
    const tempPaths = new Set<string>();

    // thumbnail에서 temp 경로 추출
    if (thumbnail && thumbnail.includes('/uploads/temp/')) {
        tempPaths.add(thumbnail);
    }

    // content에서 img src의 temp 경로 추출
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    let match;
    while ((match = imgRegex.exec(content)) !== null) {
        const src = match[1];
        if (src.includes('/uploads/temp/')) {
            tempPaths.add(src);
        }
    }

    // 3. temp 파일들을 최종 경로로 복사
    const pathMapping = new Map<string, string>(); // temp 경로 -> 최종 경로
    const tempUserDir = path.join(process.cwd(), 'public', 'uploads', 'temp', userId.toString());

    for (const tempPath of tempPaths) {
        // tempPath 예: /uploads/temp/{userId}/{filename}
        const tempPathParts = tempPath.split('/uploads/temp/');
        if (tempPathParts.length < 2) continue;

        const [, tempRelativePath] = tempPathParts;
        const pathParts = tempRelativePath.split('/');

        // userId를 제외한 나머지 경로 (파일명)
        const filename = pathParts.slice(1).join('/');
        if (!filename) continue;

        // temp 파일 경로
        const sourcePath = path.join(tempUserDir, filename);

        try {
            // 파일을 최종 경로로 복사
            const destPath = path.join(finalDir, filename);
            await copyFile(sourcePath, destPath);

            // 경로 매핑 저장
            const finalUrl = `/${finalPath}/${filename}`;
            pathMapping.set(tempPath, finalUrl);
        } catch (error) {
            console.error(`Failed to copy file from ${sourcePath}:`, error);
        }
    }

    // 4. 모든 파일 복사 완료 후 userId의 temp 폴더 전체 삭제
    try {
        await rm(tempUserDir, { recursive: true, force: true });
    } catch (error) {
        console.error(`Failed to delete temp folder for user ${userId}:`, error);
    }

    // 5. content와 thumbnail 경로 변경
    let updatedContent = content;
    let updatedThumbnail = thumbnail;

    for (const [tempPath, finalUrl] of pathMapping) {
        updatedContent = updatedContent.replace(new RegExp(tempPath, 'g'), finalUrl);

        if (updatedThumbnail === tempPath) {
            updatedThumbnail = finalUrl;
        }
    }

    return {
        content: updatedContent,
        thumbnail: updatedThumbnail,
    };
}
