import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 페이지(Pages) API 단위 테스트
 * Path: tests/unit/api/pages.test.ts
 *
 * 테스트 시나리오:
 * A. 페이지 생성 (POST /api/pages)
 *    1. [성공] 관리자 권한으로 유효한 데이터 전송 시 페이지 생성 및 Slug 검증
 *
 * B. 페이지 수정 (PUT /api/pages/:id)
 *    1. [성공] 기존 페이지 존재 확인 후 업데이트 수행
 *
 * Mocking 전략:
 * - `useSafeQuery`: 단순 쿼리 실행 래퍼 모킹
 * - `getDB`: Drizzle ORM 체이닝(insert/update/select) 모킹
 */

// 1. Global Mocks (전역 헬퍼 모킹)
const mockReadBody = vi.fn();
const mockCreateError = vi.fn((err: any) => err);
const mockDefineEventHandler = vi.fn((handler: any) => handler);
const mockGetRouterParam = vi.fn();

vi.stubGlobal('readBody', mockReadBody);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);
vi.stubGlobal('getRouterParam', mockGetRouterParam); // PUT/DELETE에서 ID 사용 시 필요

// 2. Module Mocks (외부 모듈 모킹)
const mockGetUserSession = vi.fn();
const mockValidateSlug = vi.fn();
const mockUseSafeQuery = vi.fn((fn: any) => fn()); // 쿼리 즉시 실행
const mockGetDB = vi.fn();

vi.mock('~/server/utils/session', () => ({
    getUserSession: mockGetUserSession,
}));

vi.mock('~/server/utils/db', () => ({
    useSafeQuery: mockUseSafeQuery,
}));

vi.mock('~/server/utils/slugValidator', () => ({
    validateSlugAvailability: mockValidateSlug,
    generateSlug: (text: string) => text.toLowerCase().replace(/ /g, '-'),
}));

// DB 스키마 모킹
vi.mock('~/server/database/schema', () => ({
    pages: { id: 'id', slug: 'slug' },
}));

// DB 연결 모킹
vi.mock('~/server/database', () => ({
    getDB: mockGetDB,
}));

// Drizzle 연산자 모킹
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    sql: vi.fn(),
}));

// 3. Dynamic Import (핸들러 동적 가져오기)
const { default: createPageHandler } =
    await import('~/server/api/pages/index.post.ts');
const { default: updatePageHandler } =
    await import('~/server/api/pages/[id]/index.put.ts');

describe('Pages API', () => {
    // 테스트 초기화
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUser = { id: 1, role: 'admin' };
    const mockDbChain = {
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // 기본값: 빈 배열
        $returningId: vi.fn().mockResolvedValue([{ id: 10 }]),
    };

    mockGetDB.mockResolvedValue(mockDbChain);

    describe('POST /api/pages', () => {
        it('should create a page successfully (페이지 생성 성공)', async () => {
            // [Arrange] 관리자 세션 및 요청 바디 설정
            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue({
                title: 'About',
                content: 'Content',
            });
            mockValidateSlug.mockResolvedValue({ isValid: true }); // Slug 정상
            
            // DB: 생성된 페이지 정보를 반환하도록 설정
            mockDbChain.limit.mockResolvedValueOnce([
                { id: 10, title: 'About' },
            ]); 

            // [Act] 핸들러 실행
            const result = await createPageHandler({});

            // [Assert] 결과 검증
            expect(result.success).toBe(true);
            expect(mockDbChain.insert).toHaveBeenCalled(); // insert 호출 확인
        });
    });

    describe('PUT /api/pages/:id', () => {
        it('should update a page successfully (페이지 수정 성공)', async () => {
            // [Arrange]
            const mockEvent = { context: { params: { id: '10' } } }; // URL 파라미터 모킹

            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue({
                title: 'About Updated',
                content: 'New Content',
            });

            // DB 시나리오: 1. 기존 페이지 확인(존재함) -> 2. 업데이트된 페이지 반환
            mockDbChain.limit
                .mockResolvedValueOnce([
                    { id: 10, title: 'Old', slug: 'about' },
                ]) // 기존 페이지 존재
                .mockResolvedValueOnce([{ id: 10, title: 'Updated' }]); // 수정 완료 후 조회 결과

            // [Act]
            const result = await updatePageHandler(mockEvent);

            // [Assert]
            expect(result.success).toBe(true);
            expect(mockDbChain.update).toHaveBeenCalled(); // update 호출 확인
        });
    });
});

