/**
 * 세션 디버그 API (Session Debug API)
 *
 * 경로: GET /api/tests/session-debug
 * 권한: 없음 (개발/디버깅 전용)
 *
 * 기능: 현재 세션의 내용을 출력하여 세션 필드 확인
 *
 * 데이터 흐름:
 * 1. getUserSession으로 현재 세션 조회
 * 2. 세션 데이터 및 필드 존재 여부 반환
 */

import { getUserSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
    // 현재 세션 조회
    const session = await getUserSession(event);

    // 세션 필드 존재 여부 확인
    const hasId = session && 'id' in session;
    const hasUserId = session && 'userId' in session;

    return {
        session,
        fieldCheck: {
            hasId,
            hasUserId,
            idValue: hasId ? (session as any).id : undefined,
            userIdValue: hasUserId ? session.userId : undefined,
        },
    };
});
