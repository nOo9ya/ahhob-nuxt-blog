import { defineEventHandler } from 'h3';
import { getUserSession } from '../utils/session';

/**
 * 전역 인증 미들웨어
 * server/middleware/auth.ts
 *
 * 기능:
 * 1. 들어오는 모든 요청에 대해 세션을 확인합니다.
 * 2. 세션이 유효한 경우, `event.context.user`에 사용자 정보를 주입합니다.
 * 3. 이후 API 핸들러에서 `event.context.user`를 통해 빠르게 사용자 정보에 접근할 수 있습니다.
 *
 * 참고:
 * - 이 미들웨어는 "인증 강제(Blocking)"를 하지 않습니다.
 * - 인증이 필요한 API는 개별적으로 `requireAuth(event)`를 호출해야 합니다.
 * - 단순히 "로그인된 사용자라면 누구인지"를 파악하는 역할만 수행합니다.
 */
export default defineEventHandler(async (event) => {
    // API 요청이 아닌 경우(예: 정적 자원) 패스할 수도 있으나,
    // Nuxt 서버 라우트는 기본적으로 필요할 수 있으므로 전체 적용.
    // 성능 최적화가 필요하다면 경로 필터링 추가 가능.
    // if (!event.path.startsWith('/api')) return;

    try {
        // server/utils/session.ts의 getUserSession 활용
        const user = await getUserSession(event);

        if (user) {
            // 컨텍스트에 사용자 정보 주입
            event.context.user = user;
        }
    } catch (error) {
        // 세션 복호화 실패 등 에러 발생 시 무시 (비로그인 상태로 간주)
        // 로깅이 필요하다면 여기에 console.error(error) 추가
    }
});
