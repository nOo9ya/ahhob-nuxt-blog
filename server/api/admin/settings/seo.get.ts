/**
 * 파일 기능: 검색엔진 소유자 확인 메타 태그 조회 (관리자 전용)
 * 위치: server/api/admin/settings/seo.get.ts
 * 권한: 관리자만 접근 가능
 *
 * 데이터 흐름:
 * 1. 관리자가 GET /api/admin/settings/seo 요청
 * 2. 세션 확인 (requireAdmin)
 * 3. DB에서 검색엔진 verification code 조회
 * 4. { naver, google, bing } 형태로 반환
 */

import { getDB } from '~/server/database';
import { siteSettings } from '~/server/database/schema';
import { eq } from 'drizzle-orm';

/**
 * 검색엔진 소유자 확인 코드 조회 (관리자)
 * GET /api/admin/settings/seo
 */
export default defineEventHandler(async (event) => {
    // 관리자 권한 확인
    await requireAdmin(event);

    try {
        const db = await getDB();

        // DB에서 검색엔진 verification code 조회
        const naverSetting = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, 'naver_verification'))
            .limit(1);

        const googleSetting = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, 'google_verification'))
            .limit(1);

        const bingSetting = await db
            .select()
            .from(siteSettings)
            .where(eq(siteSettings.key, 'bing_verification'))
            .limit(1);

        // 응답 데이터 구성
        return {
            success: true,
            data: {
                naver: naverSetting[0]?.value || '',
                google: googleSetting[0]?.value || '',
                bing: bingSetting[0]?.value || '',
            },
        };
    } catch (error) {
        console.error('[Admin SEO Settings] Failed to fetch verification codes:', error);

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch SEO settings',
        });
    }
});
