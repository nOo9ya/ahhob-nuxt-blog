/**
 * Relations 디버그 API (Relations Debug API)
 *
 * 경로: GET /api/tests/relations-debug
 * 권한: 없음 (개발/디버깅 전용)
 *
 * 기능: Drizzle ORM의 db.query API가 정상 작동하는지 테스트
 *
 * 데이터 흐름:
 * 1. getDB로 데이터베이스 인스턴스 획득
 * 2. db.query.users.findMany() 호출 (Relations 필요)
 * 3. db.query.admins.findMany() 호출 (Relations 필요)
 * 4. 결과 반환 또는 에러 메시지 반환
 */

import { getDB } from '../../database';

export default defineEventHandler(async (event) => {
    try {
        const db = await getDB();

        // db.query API 테스트 (Relations가 복구되어야 작동)
        const users = await db.query.users.findMany({ limit: 5 });
        const admins = await db.query.admins.findMany({ limit: 5 });

        return {
            success: true,
            message: 'db.query API 정상 작동',
            data: {
                usersCount: users.length,
                adminsCount: admins.length,
                sampleUser: users[0] || null,
                sampleAdmin: admins[0] || null,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: 'db.query API 오류',
            error: error.message,
            stack: error.stack,
        };
    }
});
