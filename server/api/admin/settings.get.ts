/**
 * 파일 기능: 사이트 설정 조회 API
 * 위치: server/api/admin/settings.get.ts
 * 권한: 관리자 전용
 * 
 * 데이터 흐름:
 * 1. 관리자 권한 확인
 * 2. site_settings 테이블에서 모든 설정 조회
 * 3. JSON 형식으로 반환
 */

import { eq } from 'drizzle-orm';
import { siteSettings } from '~/server/database/schema';

export default defineEventHandler(async (event) => {
    // 관리자 권한 확인
    await requireAdmin(event);

    // 유틸리티 함수를 통해 설정 조회 (캐싱, 기본값 로직 포함)
    const settings = await getSiteSettings();

    return settings;
});
