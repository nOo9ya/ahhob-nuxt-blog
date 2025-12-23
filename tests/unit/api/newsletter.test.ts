import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 뉴스레터(Newsletter) Admin API 단위 테스트
 * Path: tests/unit/api/newsletter.test.ts
 *
 * 테스트 시나리오:
 * 1. 구독자 목록 조회 (GET /api/newsletter/subscribers)
 *    - [성공] 관리자 권한으로 목록 및 페이지네이션 정보 반환
 *
 * 2. 구독자 삭제 (DELETE /api/newsletter/subscribers/:id)
 *    - [성공] 관리자 권한으로 삭제 성공
 *    - [실패] ID 파라미터 누락 시 400 에러
 *
 * Mocking 전략:
 * - `requireAdmin`: 권한 체크 모킹 (호출 여부만 검증)
 * - `getQuery`: 페이지네이션 파라미터 모킹
 * - `getRouterParam`: 삭제 대상 ID 모킹
 * - `drizzle-orm`: DB 쿼리 체이닝 모킹
 */

// 1. Global Mocks (전역 헬퍼 모킹)
const mockRequireAdmin = vi.fn();
const mockGetQuery = vi.fn();
const mockGetRouterParam = vi.fn();
const mockCreateError = vi.fn((err) => err);
const mockDefineEventHandler = vi.fn((handler) => handler);

vi.stubGlobal('requireAdmin', mockRequireAdmin);
vi.stubGlobal('getQuery', mockGetQuery);
vi.stubGlobal('getRouterParam', mockGetRouterParam);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);

// 2. Module Mocks (외부 모듈 모킹)
// db 객체 전역 모킹 (Auto-import 대응)
const mockDbObject = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
};
vi.stubGlobal('db', mockDbObject);

// Schema 모킹 (이름 주의: newsletterSubscribers)
vi.mock('~/server/database/schema', () => ({
    newsletterSubscribers: { id: 'id', email: 'email', createdAt: 'createdAt' },
}));

// Drizzle ORM Helper 모킹
vi.mock('drizzle-orm', () => ({
    desc: vi.fn(),
    count: vi.fn(),
    eq: vi.fn(),
}));

// 3. Dynamic Import (핸들러 가져오기)
// 주의: 상대 경로가 정확해야 함
const { default: getSubscribersHandler } = await import(
    '~/server/api/newsletter/subscribers/index.get.ts'
);
const { default: deleteSubscriberHandler } = await import(
    '~/server/api/newsletter/subscribers/[id].delete.ts'
);

describe('Newsletter Admin API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/newsletter/subscribers', () => {
        it('should return subscriber list with pagination (목록 조회 성공)', async () => {
            // [Arrange]
            const mockEvent = {};
            // 쿼리 파라미터: 1페이지, 10개
            mockGetQuery.mockReturnValue({ page: '1', limit: '10' });

            const mockCountResult = [{ count: 100 }];
            const mockItems = [
                { id: 1, email: 'test@example.com', isActive: true },
                { id: 2, email: 'test2@example.com', isActive: false },
            ];

            // DB Mocking
            // 1. Count Query & 2. Select Query
            mockDbObject.select.mockImplementation((arg) => {
                 // arg가 있으면 (count 쿼리)
                 if (arg) {
                     return {
                         from: vi.fn().mockResolvedValue(mockCountResult),
                     };
                 }
                 // arg가 없으면 (데이터 조회 쿼리)
                 return {
                     from: vi.fn().mockReturnThis(),
                     orderBy: vi.fn().mockReturnThis(),
                     limit: vi.fn().mockReturnThis(),
                     offset: vi.fn().mockResolvedValue(mockItems),
                 };
            });

            // [Act]
            const result = await getSubscribersHandler(mockEvent);

            // [Assert]
            expect(mockRequireAdmin).toHaveBeenCalledWith(mockEvent); // 권한 체크 확인
            expect(result.subscribers).toEqual(mockItems);
            expect(result.pagination).toMatchObject({
                page: 1,
                limit: 10,
                total: 100,
                totalPages: 10,
            });
        });
    });

    describe('DELETE /api/newsletter/subscribers/:id', () => {
        it('should delete subscriber successfully (삭제 성공)', async () => {
            // [Arrange]
            const mockEvent = {};
            mockGetRouterParam.mockReturnValue('123'); // ID 파라미터

            mockDbObject.delete.mockReturnThis();
            mockDbObject.where.mockResolvedValue(undefined);

            // [Act]
            const result = await deleteSubscriberHandler(mockEvent);

            // [Assert]
            expect(mockRequireAdmin).toHaveBeenCalledWith(mockEvent);
            expect(mockGetRouterParam).toHaveBeenCalledWith(mockEvent, 'id');
            expect(mockDbObject.delete).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should throw error if ID is missing (ID 누락 시 실패)', async () => {
            // [Arrange]
            const mockEvent = {};
            mockGetRouterParam.mockReturnValue(undefined); // ID 없음

            // [Act & Assert]
            await expect(deleteSubscriberHandler(mockEvent)).rejects.toMatchObject({
                statusCode: 400,
                message: 'Invalid ID',
            });
            expect(mockRequireAdmin).toHaveBeenCalled();
        });
    });
});
