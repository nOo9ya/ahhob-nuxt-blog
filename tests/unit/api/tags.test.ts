import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 태그(Tags) API 단위 테스트
 * Path: tests/unit/api/tags.test.ts
 *
 * 테스트 시나리오:
 * 1. 태그 목록 조회 (GET /api/tags)
 *    - [성공] 저장된 태그 목록 반환 (정렬 및 카운트 포함)
 *
 * 2. 태그 생성 (POST /api/tags)
 *    - [성공] 에디터(Editor) 이상의 권한으로 태그 생성 성공
 *    - [실패] Slug 중복 시 409 Conflict 에러 반환
 * 
 * 3. 태그 삭제 (DELETE /api/tags/:id)
 *    - [성공] 관리자(Admin) 권한으로 태그 삭제 성공
 *
 * Mocking 전략:
 * - `drizzle-orm`: `leftJoin`, `groupBy`, `orderBy`, `delete` 등 복잡한 쿼리 빌더 메서드 모킹
 * - `getUserSession`: 권한 체크(Editor/Admin)
 * - `useSafeQuery`: DB 쿼리 안전 실행 모킹
 */

// 1. Global Mocks (전역 헬퍼 모킹)
const mockReadBody = vi.fn();
const mockCreateError = vi.fn((err: any) => err);
const mockDefineEventHandler = vi.fn((handler: any) => handler);

vi.stubGlobal('readBody', mockReadBody);
vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);

// 2. Module Mocks (외부 모듈 모킹)
const mockGetUserSession = vi.fn();
// useSafeQuery: 단순히 내부 함수를 실행하고 반환하는 가짜 구현
const mockUseSafeQuery = vi.fn((fn: any) => fn());
const mockGetDB = vi.fn();

vi.mock('~/server/utils/session', () => ({
    getUserSession: mockGetUserSession,
}));

vi.mock('~/server/utils/db', () => ({
    useSafeQuery: mockUseSafeQuery,
}));

// DB 연결 및 스키마 모킹
vi.mock('~/server/database', () => ({
    getDB: mockGetDB,
    tags: { id: 'id', slug: 'slug', createdAt: 'createdAt' },
}));

// 1. Drizzle ORM 모킹 (필요한 함수 추가)
vi.mock('drizzle-orm', () => {
  const actual = {
    eq: vi.fn(),
    sql: vi.fn(),
    desc: vi.fn(),
    count: vi.fn(), // count 함수 모킹 추가
    and: vi.fn(),  // 필요 시 추가
    relations: vi.fn(),
  };
  return actual;
});

// 3. Dynamic Import (핸들러 동적 가져오기)
const { default: createTagHandler } =
    await import('~/server/api/tags/index.post.ts');
const { default: getTagsHandler } =
    await import('~/server/api/tags/index.get.ts');
const { default: deleteTagHandler } =
    await import('~/server/api/tags/[id]/index.delete.ts');

describe('Tags API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // DB 메서드 체이닝 모킹
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(), // leftJoin 추가
      groupBy: vi.fn().mockReturnThis(),  // groupBy 추가
      orderBy: vi.fn().mockReturnThis(),  // orderBy 추가
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // Keep resolved value for limit
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      $returningId: vi.fn().mockResolvedValue([{ id: 1 }]), // Keep resolved value for $returningId
    };

    mockGetDB.mockResolvedValue(mockDb);

    describe('GET /api/tags', () => {
        it('should return list of tags (태그 목록 조회 성공)', async () => {
            // [Arrange] DB 조회 결과 모킹 (orderBy 후 반환)
            mockDb.orderBy.mockResolvedValue([{ id: 1, name: 'Tag1' }]);

            // [Act] 핸들러 실행
            const result = await getTagsHandler({});

            // [Assert] 결과 검증
            expect(result.tags).toHaveLength(1);
            expect(mockDb.select).toHaveBeenCalled(); // select 호출 확인
            expect(mockDb.leftJoin).toHaveBeenCalled();
        });
    });

    describe('POST /api/tags', () => {
        it('should create a tag successfully (태그 생성 성공)', async () => {
            // [Arrange] 권한(Editor) 및 요청 데이터 설정
            const mockUser = { id: 1, role: 'editor' }; // 태그는 Editor도 생성 가능
            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue({
                name: 'New Tag',
                slug: 'new-tag',
            });

            // DB 시나리오: 1. 중복 체크(빈 배열) -> 2. 생성 후 조회(새 태그 반환)
            mockDb.limit.mockResolvedValueOnce([]); // 중복 없음
            mockDb.$returningId.mockResolvedValueOnce([{ id: 1 }]);
            mockDb.limit.mockResolvedValueOnce([
                { id: 1, name: 'New Tag' }, // 생성된 태그
            ]);

            // [Act]
            const result = await createTagHandler({});

            // [Assert]
            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled(); // insert 호출 확인
        });

        it('should fail if duplicate slug (Slug 중복 시 실패)', async () => {
            // [Arrange]
            const mockUser = { id: 1, role: 'editor' };
            mockGetUserSession.mockResolvedValue(mockUser);
            mockReadBody.mockResolvedValue({ name: 'Tag', slug: 'duplicate' });

            // DB 시나리오: 중복 체크 시 이미 존재하는 태그 발견
            mockDb.limit.mockResolvedValueOnce([{ id: 99, slug: 'duplicate' }]);

            // [Act & Assert] 409 Conflict 에러 검증
            await expect(createTagHandler({})).rejects.toMatchObject({
                statusCode: 409,
            });
        });
    });

    describe('DELETE /api/tags/:id', () => {
        it('should delete tag (태그 삭제 성공)', async () => {
             // [Arrange] 관리자 권한 및 파라미터 설정
            const mockUser = { id: 1, role: 'admin' }; // Admin required
            const mockParams = { id: '1' };

            mockGetUserSession.mockResolvedValue(mockUser);
            // vi.stubGlobal('getRouterParam', (event, key) => mockParams[key]); // Not used

            // DB 삭제 모킹 (존재 확인 -> 삭제)
            const mockDb = {
                delete: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                from: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: 1 }]), // Exists
            };
            mockGetDB.mockResolvedValue(mockDb);

            // [Act] 핸들러 실행
            const result = await deleteTagHandler({ context: { params: mockParams } });
            
            // [Assert] 성공 확인
            expect(result.success).toBe(true);
            expect(mockDb.delete).toHaveBeenCalled();
        });
    });
});

