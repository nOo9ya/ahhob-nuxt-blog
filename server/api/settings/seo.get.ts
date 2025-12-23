/**
 * 파일 기능: 검색엔진 소유자 확인 메타 태그 조회 (공개 API)
 * 위치: server/api/settings/seo.get.ts
 * 권한: 모든 사용자 (인증 불필요)
 *
 * 데이터 흐름:
 * 1. 클라이언트에서 GET /api/settings/seo 요청
 * 2. DB에서 검색엔진 verification code 조회
 * 3. { naver, google, bing } 형태로 반환
 * 4. app.vue에서 이 데이터를 사용해 head 메타 태그 삽입
 */

import { getDB } from '~/server/database';
import { siteSettings } from '~/server/database/schema';
import { eq } from 'drizzle-orm';

/**
 * 검색엔진 소유자 확인 코드 조회
 * GET /api/settings/seo
 */
export default defineEventHandler(async (event) => {
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

        // 응답 데이터 구성 (빈 문자열이면 null로 반환)
        const response = {
            naver: naverSetting[0]?.value || null,
            google: googleSetting[0]?.value || null,
            bing: bingSetting[0]?.value || null,
        };

        return response;
    } catch (error) {
        console.error('[SEO Settings] Failed to fetch verification codes:', error);

        // 에러 발생 시 빈 값 반환 (클라이언트 렌더링 차단 방지)
        return {
            naver: null,
            google: null,
            bing: null,
        };
    }
});
