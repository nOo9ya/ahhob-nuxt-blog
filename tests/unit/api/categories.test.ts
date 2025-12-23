import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 카테고리(Categories) API 단위 테스트
 * Path: tests/unit/api/categories.test.ts
 *
 * 테스트 시나리오:
 * 1. 카테고리 목록 조회 (GET /api/categories)
 *    - [성공] 모든 카테고리 목록 반환
 *
 * 2. 카테고리 생성 (POST /api/categories)
 *    - [성공] 관리자(Admin) 권한으로 유효한 Slug와 함께 요청 시 생성 성공
 *    - [실패] 일반 사용자(User) 등 관리자가 아닌 경우 403 Forbidden
 *    - [실패] Slug 중복 검증 실패 시 409 Conflict 에러 반환
 *
 * 3. 카테고리 수정 (PUT /api/categories/:id)
 *    - [성공] 관리자(Admin) 권한으로 카테고리 수정 성공
 *
 * 4. 카테고리 삭제 (DELETE /api/categories/:id)
 *    - [성공] 관리자(Admin) 권한으로 카테고리 삭제 성공
 *
 * Mocking 전략:
 * - `validateSlugAvailability`: Slug 중복 여부 제어
 * - `getUserSession`: 사용자 역할을 변경하여 권한 체크 테스트
 * - `useSafeQuery`: DB 쿼리 에러 핸들링 모킹
 * - `drizzle-orm`: `select`, `from`, `orderBy`, `update`, `delete` 등 쿼리 빌더 메서드 모킹
 */

// 1. Global Mocks (전역 헬퍼 모킹)
const mockReadBody = vi.fn();
const mockCreateError = vi.fn((err) => err);
const mockDefineEventHandler = vi.fn((handler) => handler);

vi.stubGlobal('readBody', mockReadBody);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);

// 2. Module Mocks (외부 모듈 모킹)
const mockGetUserSession = vi.fn();
const mockValidateSlug = vi.fn();
const mockUseSafeQuery = vi.fn((fn) => fn()); // 콜백 즉시 실행 모킹
const mockGetDB = vi.fn();

// 세션 모킹
vi.mock('~/server/utils/session', () => ({
    getUserSession: mockGetUserSession,
}));

// DB 쿼리 실행 모킹
vi.mock('~/server/utils/db', () => ({
    useSafeQuery: mockUseSafeQuery,
}));

// Slug 검증기 모킹
vi.mock('~/server/utils/slugValidator', () => ({
    validateSlugAvailability: mockValidateSlug,
}));

// DB 연결 및 스키마 모킹
vi.mock('~/server/database', () => ({
    getDB: mockGetDB,
    categories: { id: 'id', slug: 'slug', parentId: 'parentId', path: 'path' }, // 스키마 필드 모킹
}));

// Drizzle ORM Mock
vi.mock('drizzle-orm', async () => {
    const actual = await vi.importActual('drizzle-orm');
    return {
        ...actual,
        eq: vi.fn(),
        like: vi.fn(),
        sql: vi.fn((strings, ...values) => 'mock_sql'), // Simple mock for sql template tag
    };
});

// 3. Dynamic Import (핸들러 동적 가져오기)
const { default: createCategoryHandler } =
    await import('~/server/api/categories/index.post.ts');
const { default: getCategoriesHandler } =
    await import('~/server/api/categories/index.get.ts');
const { default: updateCategoryHandler } =
    await import('~/server/api/categories/[id]/index.put.ts');
const { default: deleteCategoryHandler } =
    await import('~/server/api/categories/[id]/index.delete.ts');

describe('Categories API', () => {
    // 테스트 초기화
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/categories', () => {
        it('should return category list (카테고리 목록 조회)', async () => {
            // [Arrange] DB 목록 조회 결과 모킹
            const mockDb = {
                select: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue([
                    { id: 1, name: 'Cat 1', children: [] }
                ])
            };
            mockGetDB.mockResolvedValue(mockDb);

            // [Act] 핸들러 실행
            const result = await getCategoriesHandler({});
            
            // [Assert] 결과 검증
            expect(result.categories).toHaveLength(1);
            expect(result.categories[0].name).toBe('Cat 1');
        });
    });

    describe('POST /api/categories', () => {
        it('should create a category successfully (카테고리 생성 성공)', async () => {
            // [Arrange] 테스트 데이터 설정
            const mockEvent = {};
            const mockUser = { id: 1, role: 'admin' }; // Admin 권한
            const mockBody = {
                name: 'New Category',
                slug: 'new-category',
                description: 'Desc',
            };

            // Mock 반환값 설정
            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue(mockBody);
            mockValidateSlug.mockResolvedValue({ isValid: true }); // Slug 사용 가능

            // DB 체이닝 Mock
            const mockDb = {
                insert: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                $returningId: vi.fn().mockResolvedValue([{ id: 100 }]),
                select: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi
                    .fn()
                    .mockResolvedValue([{ id: 100, name: 'New Category' }]),
            };
            mockGetDB.mockResolvedValue(mockDb);

            // [Act] 핸들러 실행
            const result = await createCategoryHandler(mockEvent);

            // [Assert] 결과 검증
            expect(result.success).toBe(true);
            expect(result.category).toBeDefined();
            expect(mockValidateSlug).toHaveBeenCalledWith(
                'new-category',
                'category'
            ); // 올바른 타입으로 검증 호출 확인
            expect(mockDb.insert).toHaveBeenCalled();
        });

        it('should fail if user is not admin (권한 부족 시 실패)', async () => {
            // [Arrange] 일반 사용자(User) 설정
            mockGetUserSession.mockResolvedValue({ id: 2, role: 'user' });

            // [Act & Assert] 403 에러 확인
            await expect(createCategoryHandler({})).rejects.toMatchObject({
                statusCode: 403,
            });
        });

        it('should fail on invalid slug (잘못된 슬러그 시 실패)', async () => {
            // [Arrange] Admin이지만 유효하지 않은 Slug 제출
            mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });
            mockReadBody.mockResolvedValue({ name: 'Cat', slug: 'invalid' });
            
            // Slug 검증 실패 설정
            mockValidateSlug.mockResolvedValue({
                isValid: false,
                message: 'Invalid',
            });

            // [Act & Assert] 409 Conflict 에러 확인
            await expect(createCategoryHandler({})).rejects.toMatchObject({
                statusCode: 409,
            });
        });
    });

    describe('PUT /api/categories/:id', () => {
        it('should update category (카테고리 수정 성공)', async () => {
            // [Arrange] 수정 요청 데이터 및 권한 설정
            const mockUser = { id: 1, role: 'admin' };
            const mockBody = { name: 'Updated Cat', slug: 'updated-cat' };
            const mockParams = { id: '1' };

            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue(mockBody);
            vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]);
            mockValidateSlug.mockResolvedValue({ isValid: true });

            // DB 업데이트 모킹 (존재 확인 -> 업데이트)
            const mockDb = {
                update: vi.fn().mockReturnThis(),
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: 1, name: 'Updated Cat' }]), 
            };
            mockGetDB.mockResolvedValue(mockDb);

            // [Act] 핸들러 실행 (Context param 포함)
            const result = await updateCategoryHandler({ context: { params: mockParams } });
            
            // [Assert] 결과 검증
            expect(result.success).toBe(true);
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should fail if parentId is same as id (자기 자신 부모 설정 불가)', async () => {
             const mockParams = { id: '1' };
             mockReadBody.mockResolvedValue({ name: 'Cat', slug: 'cat', parentId: 1 });
             vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]);
             mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });

             await expect(updateCategoryHandler({ context: { params: mockParams } })).rejects.toMatchObject({
                 statusCode: 400,
                 message: expect.stringContaining('자기 자신을 상위 카테고리로'),
             });
        });

        it('should fail if cycle detected (순환 참조 감지)', async () => {
             const mockParams = { id: '1' }; 
             // 시나리오: 1번 카테고리를 2번 밑으로 옮기려는데, 2번의 부모가 1번인 경우 (1 -> 2 -> 1 Cycle)
             mockReadBody.mockResolvedValue({ name: 'Cat 1', slug: 'cat-1', parentId: 2 });
             vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]);
             mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });
             mockValidateSlug.mockResolvedValue({ isValid: true });

             const mockDb = {
                 select: vi.fn().mockReturnThis(), 
                 from: vi.fn().mockReturnThis(),
                 where: vi.fn().mockReturnThis(),
                 limit: vi.fn(),
             };
             mockGetDB.mockResolvedValue(mockDb);

             // 1. 기존 카테고리(1번) 조회 Mock
             mockDb.limit.mockResolvedValueOnce([{ id: 1, parentId: null }]); 
             // 2. 부모 카테고리(2번) 조회 Mock
             mockDb.limit.mockResolvedValueOnce([{ id: 2, parentId: 1 }]); 
             // 3. Cycle Check Loop
             // 2번의 부모 조회 -> 1번 리턴
             mockDb.limit.mockResolvedValueOnce([{ parentId: 1 }]);

             await expect(updateCategoryHandler({ context: { params: mockParams } })).rejects.toMatchObject({
                 statusCode: 400,
                 message: expect.stringContaining('순환 참조가 발생하여'),
             });
        });

        it('should update path recursively when moving (Path 재귀 업데이트)', async () => {
             const mockParams = { id: '2' }; // Move 'B' (id:2) to 'C' (id:3)
             // Before: A(1) -> B(2) -> D(4) (Paths: "a", "a/b", "a/b/d")
             // After: C(3) -> B(2) -> D(4) (Paths: "c", "c/b", "c/b/d")
             
             mockReadBody.mockResolvedValue({ name: 'B', slug: 'b', parentId: 3 });
             vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]);
             mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });
             mockValidateSlug.mockResolvedValue({ isValid: true });

             const mockDb = {
                 select: vi.fn().mockReturnThis(), 
                 from: vi.fn().mockReturnThis(),
                 where: vi.fn().mockReturnThis(),
                 limit: vi.fn(),
                 update: vi.fn().mockReturnThis(),
                 set: vi.fn().mockReturnThis(),
             };
             mockGetDB.mockResolvedValue(mockDb);

             // 1. 기존 카테고리(B) 조회 (Path: "a/b")
             mockDb.limit.mockResolvedValueOnce([{ id: 2, parentId: 1, path: 'a/b', slug: 'b' }]);
             // 2. 새 부모(C) 존재 확인
             mockDb.limit.mockResolvedValueOnce([{ id: 3, parentId: null, path: 'c', slug: 'c' }]);
             // 3. Cycle Check (C의 부모는 null)
             mockDb.limit.mockResolvedValueOnce([{ parentId: null }]); // C의 부모 조회
             
             // 4. Path Calculation (새 부모 C 조회)
             mockDb.limit.mockResolvedValueOnce([{ id: 3, path: 'c', slug: 'c' }]);

             // 5. Update (B update)
             mockDb.limit.mockResolvedValueOnce([{ id: 2 }]); // Return updated

             // Act
             await updateCategoryHandler({ context: { params: mockParams } });

             // Assert
             // Verify main update
             expect(mockDb.update).toHaveBeenCalledTimes(2); // 1. B update, 2. Children update
             const setCalls = mockDb.set.mock.calls;
             
             // First Call: Update B
             expect(setCalls[0][0]).toMatchObject({
                 path: 'c/b',
                 parentId: 3
             });

             // Second Call: Update Children
             // We can't easily check the SQL template tag output perfectly with simple mocks, 
             // but we verify the call happened.
             expect(setCalls[1][0]).toBeDefined();
        });
    });

    describe('DELETE /api/categories/:id', () => {
        it('should delete category (카테고리 삭제 성공)', async () => {
            // [Arrange] 삭제 요청 파라미터 및 권한 설정
            const mockUser = { id: 1, role: 'admin' };
            const mockParams = { id: '1' };

            mockGetUserSession.mockResolvedValue(mockUser);
            // vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]); // Not used
            
            // DB 삭제 모킹 (존재 확인 -> 삭제)
            const mockDb = {
                delete: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            };
            mockGetDB.mockResolvedValue(mockDb);

            // [Act] 핸들러 실행
            const result = await deleteCategoryHandler({ context: { params: mockParams } });
            
            // [Assert] 성공 여부 및 삭제 호출 확인
            expect(result.success).toBe(true);
            expect(mockDb.delete).toHaveBeenCalled();
        });
    });
});

