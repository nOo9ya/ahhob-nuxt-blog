/**
 * 파일 기능: 사이트 설정 업데이트 API
 * 위치: server/api/admin/settings.put.ts
 * 권한: 관리자 전용
 * 
 * 데이터 흐름:
 * 1. 관리자 권한 확인
 * 2. 요청 body에서 설정 값 추출
 * 3. site_settings 테이블 업데이트
 */

import { updateSiteSettings } from '~/server/utils/settings';

export default defineEventHandler(async (event) => {
    // 관리자 권한 확인
    await requireAdmin(event);

    const body = await readBody(event);
    
    // 유틸리티 함수를 사용하여 모든 설정 일괄 업데이트
    // body는 이미 snake_case로 오고 있음 (Frontend에서 그렇게 보냄)
    await updateSiteSettings(body);

    return {
        success: true,
        message: '설정이 저장되었습니다.',
    };
});
