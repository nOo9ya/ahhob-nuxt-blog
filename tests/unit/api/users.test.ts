import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eq } from 'drizzle-orm';

/**
 * 사용자(Users) API 단위 테스트
 * Path: tests/unit/api/users.test.ts
 *
 * 테스트 시나리오:
 * 1. 사용자 생성 (POST /api/users)
 *    - [성공] 관리자(Admin) 권한으로 유효한 정보(이메일, 비밀번호 등) 제출 시 생성 성공
 *    - [실패] 관리자가 아닌 사용자(Editor 등)가 시도할 경우 403 Forbidden
 *
 * Mocking 전략:
 * - `isValidEmail/Password/Role`: 복잡한 정규식 검증은 MockReturnValue로 단순화
 * - `getUserSession`: 권한 체크 테스트
 */

// 1. Global Mocks (전역 헬퍼 모킹)
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    relations: vi.fn(),
}));
const mockReadBody = vi.fn();
const mockCreateError = vi.fn((err: any) => err);
const mockDefineEventHandler = vi.fn((handler: any) => handler);
const mockSetResponseStatus = vi.fn();

vi.stubGlobal('readBody', mockReadBody);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);
vi.stubGlobal('setResponseStatus', mockSetResponseStatus);
vi.stubGlobal('getRouterParam', vi.fn((event) => event.context.params.id));

// 2. Module Mocks (외부 모듈 모킹)
const mockGetUserSession = vi.fn();
const mockUseSafeQuery = vi.fn((fn: any) => fn()); // 쿼리 실행기 모킹
const mockGetDB = vi.fn();
const mockIsValidEmail = vi.fn();
const mockIsValidPassword = vi.fn();
const mockIsValidRole = vi.fn();

// 세션 유틸리티 모킹
vi.mock('~/server/utils/session', () => ({
    getUserSession: mockGetUserSession,
}));

// DB 유틸리티(트랜잭션) 모킹
vi.mock('~/server/utils/db', () => ({
    useSafeQuery: mockUseSafeQuery,
}));

// DB 연결 및 스키마 모킹
vi.mock('~/server/database', () => ({
    getDB: mockGetDB,
    users: { id: 'id', email: 'email' },
}));

// 유효성 검사 유틸리티 모킹 (MockReturnValue로 제어)
vi.mock('~/shared/utils/validation', () => ({
    isValidEmail: mockIsValidEmail,
    isValidPassword: mockIsValidPassword,
    isValidRole: mockIsValidRole,
}));

// 3. Dynamic Import (핸들러 동적 가져오기)
const { default: createUserHandler } =
    await import('~/server/api/users/index.post.ts');
const { default: updateUserHandler } =
    await import('~/server/api/users/[id]/index.put.ts');
const { default: deleteUserHandler } =
    await import('~/server/api/users/[id]/index.delete.ts');

describe('Users API', () => {
    // DB 메서드 체이닝 모킹 (Define first to avoid ReferenceError in beforeEach)
    const mockDbChain = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        $returningId: vi.fn().mockResolvedValue([{ id: 100 }]),
    };

    // 테스트 초기화
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Reset defaults
        mockDbChain.limit.mockReset(); // Reset implementation stack
        mockDbChain.limit.mockResolvedValue([]); 
        
        // Ensure mockGetDB returns this chain
        mockGetDB.mockResolvedValue(mockDbChain);
    });



    describe('POST /api/users', () => {
        it('should create a user successfully (사용자 생성 성공)', async () => {
            // [Arrange] 권한(Admin) 및 요청 데이터 설정
            mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' }); // Admin만 가능
            mockReadBody.mockResolvedValue({
                email: 'user@example.com',
                password: 'StrongPassword1!',
                name: 'User',
                role: 'writer',
            });

            // 유효성 검사 통과 설정
            mockIsValidEmail.mockReturnValue(true);
            mockIsValidPassword.mockReturnValue({ isValid: true });
            mockIsValidRole.mockReturnValue(true);

            // DB 데이터 시나리오
            mockDbChain.limit.mockResolvedValueOnce([]); // 중복 이메일 없음
            mockDbChain.limit.mockResolvedValueOnce([
                { id: 100, email: 'user@example.com' }, // 생성된 사용자 반환
            ]);

            // [Act] 핸들러 실행
            const result = await createUserHandler({});

            // [Assert] 결과 검증
            expect(result.success).toBe(true);
            expect(mockDbChain.insert).toHaveBeenCalled(); // insert 실행 확인
        });

        it('should fail if not admin (권한 부족 시 실패)', async () => {
            // [Arrange] Editor 권한 설정 (생성 불가)
            mockGetUserSession.mockResolvedValue({ id: 2, role: 'editor' });

            // [Act & Assert] 403 Forbidden 에러 검증
            await expect(createUserHandler({})).rejects.toMatchObject({
                statusCode: 403,
            });
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update user role successfully as admin', async () => {
            // [Arrange]
            mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });
            mockReadBody.mockResolvedValue({ role: 'editor' });
            mockIsValidRole.mockReturnValue(true);

            // Mock DB Update
             mockDbChain.limit.mockResolvedValueOnce([{ id: 100, role: 'editor' }]); // Return updated user

             // context.params.id setup requires event context mock, assuming handler handles it via event.context.params
             // We need to inject params into the handler call or mock defineEventHandler context?
             // In defineEventHandler, event is passed.
             // We mocked defineEventHandler to return the handler function directly.
             // So when we call updateUserHandler(event), we need to pass a mock event with context.

             const mockEvent = { context: { params: { id: '100' } } };

            // [Act]
            const result = await updateUserHandler(mockEvent);

            // [Assert]
            expect(result.success).toBe(true);
            expect(mockDbChain.update).toHaveBeenCalled();
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should delete user successfully as admin', async () => {
            // [Arrange]
            mockGetUserSession.mockResolvedValue({ id: 1, role: 'admin' });
            const mockEvent = { context: { params: { id: '100' } } };
            
            // Mock Article Check (Should return empty array)
            mockDbChain.limit.mockResolvedValueOnce([]); // No articles found
            
            // [Act]
            const result = await deleteUserHandler(mockEvent);

            // [Assert]
            expect(result.success).toBe(true);
            expect(mockDbChain.delete).toHaveBeenCalled();
        });
    });
});
