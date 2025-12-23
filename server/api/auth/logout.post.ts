import { clearUserSession } from '../../utils/session';

/**
 * 로그아웃 API
 * POST /api/auth/logout
 *
 * 권한: 없음 (세션이 있든 없든 처리 가능)
 *
 * 데이터 흐름:
 * 1. clearUserSession 호출 (세션 쿠키 삭제)
 * 2. 성공 응답 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 세션 제거 (로그아웃 처리)
    await clearUserSession(event);

    // 2. 성공 응답 반환
    return { success: true };
});
