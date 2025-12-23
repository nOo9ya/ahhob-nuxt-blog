import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';

// 1. 모듈 모킹
vi.mock('~/server/database', () => ({
  getDB: vi.fn(),
}));

vi.mock('~/server/utils/session', () => ({
  getUserSession: vi.fn(),
}));

// Nuxt/Nitro 글로벌 모킹 (import 전에 선언)
vi.stubGlobal('defineEventHandler', (handler: any) => handler);
vi.stubGlobal('createError', (err: any) => err);

// 핸들러 변수
let statsHandler: any;

// 유틸리티 가져오기
import { getDB } from '~/server/database';
import { getUserSession } from '~/server/utils/session';

/**
 * 통계 API 단위 테스트
 * Path: tests/unit/api/stats.test.ts
 *
 * 테스트 시나리오:
 * 1. [실패] 비로그인 접근 시 401 에러 반환
 * 2. [실패] 관리자가 아닌 사용자(Writer 등) 접근 시 403 에러 반환
 * 3. [성공] 관리자 접근 시 DB에서 각 테이블(users, articles 등)의 카운트를 집계하여 반환
 *
 * Mocking 전략:
 * - `getDB`: Drizzle ORM의 체이닝 메서드(select, from, where)를 모킹하여 호출 여부 검증
 * - `getUserSession`: 사용자 세션 상태(비로그인, 일반, 관리자) 제어
 */
describe('Stats API Unit Tests', () => {
    let mockDb: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        // 동적 임포트
        if (!statsHandler) {
            statsHandler = (await import('~/server/api/stats.get')).default;
        }

        mockDb = {
            select: vi.fn().mockReturnThis(),
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
        };
        (getDB as any).mockResolvedValue(mockDb);
    });

    it('[Arrange] 비로그인 사용자는 [Act] 401 에러를 받아야 한다', async () => {
        (getUserSession as any).mockResolvedValue(null);
        const event = {} as H3Event;

        try {
            await statsHandler(event);
        } catch (e: any) {
            expect(e.statusCode).toBe(401);
        }
    });

    it('[Arrange] 관리자가 아닌 자는 [Act] 403 에러를 받아야 한다', async () => {
        (getUserSession as any).mockResolvedValue({ role: 'writer' });
        const event = {} as H3Event;

        try {
            await statsHandler(event);
        } catch (e: any) {
            expect(e.statusCode).toBe(403);
            expect(e.message).toContain('관리자 권한');
        }
    });

    it('[Arrange] 관리자 요청 시 [Act] 모든 통계 데이터를 집계하여 반환해야 한다 (Assert)', async () => {
        (getUserSession as any).mockResolvedValue({ role: 'admin' });
        
        // 각 카운트 쿼리에 대한 Mock 리턴값 설정
        // stats.get.ts는 Promise.all 로 6개의 쿼리를 실행함.
        // db.select().from().where()... 구조임
        
        // 여기서는 db.select 호출 횟수나 리턴 구조를 단순화해서 모킹
        // Promise.all 내부의 각 쿼리가 resolve되면 최종적으로 배열의 배열 구조로 리턴될 것임 (drizzle select)
        
        // 간단하게 `select`가 호출될 때마다 { count: N } 형태의 배열을 리턴하는 Promise를 반환하도록 설정
        // 하지만 Promise.all이므로 순서대로 매칭하기 어려울 수 있음.
        // 더 정교하게는, from() 호출 시 테이블에 따라 다른 값을 리턴하게 할 수 있음.
        
        // Mock Implementation
        // users -> 10, articles -> 20, published -> 15, draft -> 5, categories -> 5, tags -> 20
        // Mock Implementation
        // 1. Query Chain Mock (DB 쿼리 실행 결과인 Promise)
        // this(체인)를 리턴하다가 await 시(then) 값 반환
        const mockReturnData = [{ count: 10 }];
        const mockQueryChain = {
            from: vi.fn(),
            where: vi.fn(),
            then: (resolve: any) => resolve(mockReturnData),
        } as any;
        
        // 메서드 체이닝 설정
        mockQueryChain.from.mockReturnValue(mockQueryChain);
        mockQueryChain.where.mockReturnValue(mockQueryChain);

        // 2. DB Connection Mock (getDB가 리턴하는 객체)
        // select 호출 시 Query Chain 반환
        mockDb.select.mockReturnValue(mockQueryChain);
        
        // mockDb 자체는 Thenable이 아니어야 함! (await getDB()가 mockDb를 리턴해야 하므로)
        delete mockDb.then; // then 제거

        const event = {} as H3Event;
        const result = await statsHandler(event);

        expect(result.success).toBe(true);
        expect(result.stats).toBeDefined();
        // db.select가 6번 호출되었는지 확인
        expect(mockDb.select).toHaveBeenCalledTimes(6);
    });
});
