import { defineEventHandler, setResponseHeaders } from 'h3';

/**
 * CORS 미들웨어
 * server/middleware/cors.ts
 *
 * 기능:
 * - Cross-Origin Resource Sharing (CORS) 정책을 설정합니다.
 * - 다른 도메인(예: 개발 중인 프론트엔드 서버, 모바일 앱 등)에서 API에 접근할 수 있도록 허용합니다.
 * - OPTIONS 메서드(Preflight 요청)에 대해 적절한 응답을 반환합니다.
 */
export default defineEventHandler((event) => {
    // --------------------------------------------------------------------------
    // [실무 예제 1: 특정 도메인만 허용 (Production)]
    // 보안을 위해 신뢰할 수 있는 도메인 리스트를 관리하고, 해당 출처만 허용합니다.
    /*
    const allowedOrigins = ['https://my-domain.com', 'https://admin.my-domain.com'];
    const origin = event.node.req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
        setResponseHeader(event, 'Access-Control-Allow-Origin', origin);
        setResponseHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        setResponseHeader(event, 'Access-Control-Allow-Credentials', 'true');
    }
    */

    // --------------------------------------------------------------------------
    // [실무 예제 2: Docker + Nginx 리버스 프록시 환경]
    // Nginx가 SSL 종료 및 정적 파일 서빙을 담당하고, API 요청만 Node(3000)로 프록시하는 경우.
    // 시나리오: Nginx(Port 80/443) -> Node Container(Port 3000)
    //
    // Case A: 프론트엔드와 백엔드가 같은 도메인 (Same Origin)
    // - 예: https://example.com (프론트) -> https://example.com/api (백엔드)
    // - 이 경우 CORS 설정이 전혀 필요 없습니다 (브라우저가 Same Origin으로 인식).
    //
    // Case B: 프론트엔드와 백엔드가 다른 도메인 또는 개발 환경 (Cross Origin)
    // - 예: Localhost 개발 시 (Frontend:3000, Backend:8080)
    // - 아래와 같이 개발 편의를 위해 모든 Origin을 허용하거나, 특정 IP 대역만 허용합니다.

    // [배포 시 주의사항]
    // 1. 'Access-Control-Allow-Origin': '*'는 프로덕션에서 보안 위험이 있습니다.
    // 2. 인증 쿠키를 사용하려면 'Credentials': 'true'가 필수이며, 이 경우 '*' 사용이 불가능합니다.
    // 3. Nginx 레벨에서 CORS 헤더를 추가하는 경우, Node 앱에서는 중복 추가하지 않도록 주의해야 합니다.
    // --------------------------------------------------------------------------

    // 현재 설정: 개발 편의를 위한 와일드카드 허용 (보일러플레이트 기본값)
    setResponseHeaders(event, {
        'Access-Control-Allow-Origin': '*', // 배포 시 구체적인 도메인으로 변경 권장
        'Access-Control-Allow-Methods':
            'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
    });

    // 2. Preflight 요청(OPTIONS) 처리
    // 브라우저가 실제 요청을 보내기 전에 안전한지 확인하는 단계입니다.
    if (event.method === 'OPTIONS') {
        event.node.res.statusCode = 204; // No Content
        event.node.res.statusMessage = 'No Content';
        return 'OK';
    }
});
