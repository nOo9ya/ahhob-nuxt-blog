import path from 'path';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { randomUUID } from 'crypto';
import type { H3Event } from 'h3';
import { createError, readMultipartFormData } from 'h3';
// import sharp from 'sharp'; // Dynamic import used instead

/**
 * server/utils/fileUpload.ts
 * 고급 파일 업로드 및 이미지 처리 유틸리티
 */

export interface UploadOptions {
    maxSize?: number; // 기본값 5MB
    allowedTypes?: string[];
    baseDir?: string; // 기본값: public/uploads
    userId?: number; // 사용자 ID (temp 폴더 구분용)
}

export interface ImageVariants {
    original: string;
    thumbnail?: string; // Featured 이미지일 경우 생성
    og?: string;        // Featured 이미지일 경우 생성
}

export interface UploadResult {
    filename: string;
    mimetype: string;
    size: number;
    url: string; // 기본 원본(또는 최적화된) URL
    variants?: ImageVariants;
}

/**
 * 디렉토리 생성 헬퍼 (ensureDir)
 *
 * 기능: 지정된 경로의 디렉토리가 존재하는지 확인하고, 없으면 재귀적으로 생성합니다.
 *
 * 데이터 흐름:
 * 1. mkdir(recursive: true) 호출
 * 2. 이미 존재하는 경우(EEXIST 에러) 무시하고 진행
 *
 * @param dirPath 생성할 디렉토리의 절대 경로
 */
async function ensureDir(dirPath: string) {
    try {
        await mkdir(dirPath, { recursive: true });
    } catch (error) {
        if ((error as any).code !== 'EEXIST') throw error;
    }
}

/**
 * 이미지 처리 및 저장 함수 (processAndSaveImage)
 *
 * 기능: 이미지 데이터를 리사이징, 포맷 변환(WebP)하고 지정된 디렉토리에 저장합니다.
 * Featured 이미지일 경우 썸네일과 OG 이미지도 추가로 생성합니다.
 *
 * 데이터 흐름:
 * 1. Sharp 인스턴스 초기화 (동적 import)
 * 2. 기본 이미지 처리 (WebP 변환, 리사이징)
 * 3. 원본(또는 최적화된) 파일 저장
 * 4. (Featured) 썸네일 생성 및 저장 (600px)
 * 5. (Featured) OG 이미지 생성 및 저장 (1200x630, Center Crop)
 * 6. 결과 경로가 포함된 UploadResult 반환
 *
 * @param fileData 이미지 파일 Buffer
 * @param filename 원본 파일명
 * @param destDir 저장할 디렉토리 절대 경로
 * @param options 최적화 여부(optimize) 및 이미지 타입(type: featured | body)
 */
async function processAndSaveImage(
    fileData: Buffer,
    filename: string,
    destDir: string,
    options: {
        optimize: boolean;
        type: 'featured' | 'body';
    }
): Promise<UploadResult> {
    const ext = path.extname(filename).toLowerCase();
    const basename = path.basename(filename, ext);
    const uuid = randomUUID();
    
    // Dynamic import to avoid bundling issues in Dev
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;

    // 기본 파일명 (확장자는 webp 변환 시 변경될 수 있음)
    const finalExt = options.optimize ? '.webp' : ext;
    const saveFilename = `${uuid}${finalExt}`;
    const publicPath = destDir.replace(path.join(process.cwd(), 'public'), ''); // URL 생성을 위한 상대 경로
    
    const result: UploadResult = {
        filename: saveFilename,
        mimetype: options.optimize ? 'image/webp' : 'image/jpeg', // 간단화
        size: 0,
        url: '',
        variants: { original: '' }
    };

    // Sharp 인스턴스 생성
    let pipeline = sharp(fileData);

    // 1. 기본 저장 (WebP 변환 옵션)
    if (options.optimize) {
        pipeline = pipeline.webp({ quality: 80 });
    }

    // 본문 이미지일 경우, 너무 큰 이미지는 리사이징 (너비 1200px 제한)
    if (options.type === 'body') {
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
    }

    const originalPath = path.join(destDir, saveFilename);
    const info = await pipeline.toFile(originalPath);
    
    result.size = info.size;
    result.url = path.join(publicPath, saveFilename);
    result.variants!.original = result.url;

    // 2. Featured 이미지일 경우 추가 Variant 생성 (Thumbnail, OG)
    if (options.type === 'featured') {
        // Thumbnail (600x?)
        const thumbFilename = `${uuid}_thumb${finalExt}`;
        await sharp(fileData)
            .resize(600, null, { withoutEnlargement: true }) // 가로 600, 세로 비율 유지
            .webp({ quality: 80 })
            .toFile(path.join(destDir, thumbFilename));
        
        result.variants!.thumbnail = path.join(publicPath, thumbFilename);

        // OG Image (1200x630, Center Crop)
        const ogFilename = `${uuid}_og${finalExt}`;
        await sharp(fileData)
            .resize(1200, 630, { fit: 'cover', position: 'center' })
            .webp({ quality: 80 })
            .toFile(path.join(destDir, ogFilename));
            
        result.variants!.og = path.join(publicPath, ogFilename);
    }

    return result;
}

/**
 * 메인 업로드 핸들러 (uploadFile)
 *
 * 기능: Multipart Form 데이터를 파싱하여 파일을 검증하고, temp 디렉토리에 임시 저장합니다.
 * 이후 Article/Page 저장 시 최종 경로로 이동됩니다.
 *
 * 데이터 흐름:
 * 1. Multipart 데이터 파싱 (readMultipartFormData)
 * 2. 메타데이터 추출 (type, optimize)
 * 3. temp 디렉토리 생성 (public/uploads/temp/{userId})
 * 4. 각 파일에 대해 유효성 검사 (크기, 타입)
 * 5. processAndSaveImage 호출하여 이미지 처리 및 저장
 * 6. 처리 결과(UploadResult 배열) 반환
 *
 * @param event H3Event 객체
 * @param options 업로드 옵션 (최대 크기, 허용 타입, 기본 경로, userId)
 */
export async function uploadFile(
    event: H3Event,
    options: UploadOptions = {}
): Promise<UploadResult[]> {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    const baseDir = options.baseDir || 'public/uploads';
    const allowedTypes = options.allowedTypes || [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif'
    ];
    const userId = options.userId;

    if (!userId) {
        throw createError({ statusCode: 400, message: 'userId is required' });
    }

    const formData = await readMultipartFormData(event);
    if (!formData) throw createError({ statusCode: 400, message: 'No data provided' });

    // 메타데이터 파싱
    let type: 'featured' | 'body' = 'body';
    let optimize = true;

    const files = [];

    for (const item of formData) {
        if (item.name === 'type') type = item.data.toString() as 'featured' | 'body';
        else if (item.name === 'optimize') optimize = item.data.toString() === 'true';
        else if (item.filename) files.push(item);
    }

    if (files.length === 0) return [];

    // temp 디렉토리 생성: public/uploads/temp/{userId}
    const targetDir = path.join(process.cwd(), baseDir, 'temp', userId.toString());
    await ensureDir(targetDir);

    const results: UploadResult[] = [];

    for (const file of files) {
        // 유효성 검사
        if (file.data.length > maxSize) {
             throw createError({ statusCode: 400, message: `File too large: ${file.filename}` });
        }
        if (file.type && !allowedTypes.includes(file.type)) {
            throw createError({ statusCode: 400, message: `Invalid file type: ${file.type}` });
        }

        const result = await processAndSaveImage(
            file.data,
            file.filename!,
            targetDir,
            { optimize, type }
        );
        results.push(result);
    }

    return results;
}
