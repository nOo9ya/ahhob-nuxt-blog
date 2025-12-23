/**
 * 파일 기능: 검색엔진 소유자 확인 메타 태그 업데이트 (관리자 전용)
 * 위치: server/api/admin/settings/seo.put.ts
 * 권한: 관리자만 접근 가능
 *
 * 데이터 흐름:
 * 1. 관리자가 PUT /api/admin/settings/seo 요청 (body: { naver?, google?, bing? })
 * 2. 세션 확인 (requireAdmin)
 * 3. 입력값 검증
 * 4. DB에 upsert (있으면 업데이트, 없으면 삽입)
 * 5. 성공 응답 반환
 */

import { getDB } from '~/server/database';
import { siteSettings } from '~/server/database/schema';

interface SeoUpdateRequest {
    naver?: string;
    google?: string;
    bing?: string;
}

/**
 * 검색엔진 소유자 확인 코드 업데이트 (관리자)
 * PUT /api/admin/settings/seo
 */
export default defineEventHandler(async (event) => {
    // 관리자 권한 확인
    await requireAdmin(event);

    try {
        // 요청 body 파싱
        const body = await readBody<SeoUpdateRequest>(event);

        // 입력값 검증
        if (!body || typeof body !== 'object') {
            throw createError({
                statusCode: 400,
                message: 'Invalid request body',
            });
        }

        const db = await getDB();
        const operations: Promise<any>[] = [];

        // 네이버 verification code 업데이트
        if (body.naver !== undefined) {
            const value = body.naver.trim();
            operations.push(
                db
                    .insert(siteSettings)
                    .values({
                        key: 'naver_verification',
                        value,
                        description: '네이버 서치어드바이저 소유자 확인 코드',
                        type: 'string',
                    })
                    .onDuplicateKeyUpdate({
                        set: {
                            value,
                            updatedAt: new Date(),
                        },
                    })
            );
        }

        // 구글 verification code 업데이트
        if (body.google !== undefined) {
            const value = body.google.trim();
            operations.push(
                db
                    .insert(siteSettings)
                    .values({
                        key: 'google_verification',
                        value,
                        description: 'Google Search Console 소유자 확인 코드',
                        type: 'string',
                    })
                    .onDuplicateKeyUpdate({
                        set: {
                            value,
                            updatedAt: new Date(),
                        },
                    })
            );
        }

        // 빙 verification code 업데이트
        if (body.bing !== undefined) {
            const value = body.bing.trim();
            operations.push(
                db
                    .insert(siteSettings)
                    .values({
                        key: 'bing_verification',
                        value,
                        description: 'Bing Webmaster Tools 소유자 확인 코드',
                        type: 'string',
                    })
                    .onDuplicateKeyUpdate({
                        set: {
                            value,
                            updatedAt: new Date(),
                        },
                    })
            );
        }

        // DB 업데이트 실행
        if (operations.length > 0) {
            await Promise.all(operations);
        }

        return {
            success: true,
            message: 'SEO verification codes updated successfully',
        };
    } catch (error: any) {
        console.error('[Admin SEO Settings] Failed to update verification codes:', error);

        // 이미 createError로 생성된 에러는 그대로 throw
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to update SEO settings',
        });
    }
});
