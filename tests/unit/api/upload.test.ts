import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 파일 업로드 API 단위 테스트
 * Path: tests/unit/api/upload.test.ts
 *
 * 테스트 시나리오:
 * 1. [실패] 비로그인 사용자 접근 시 401 에러 반환
 * 2. [실패] 권한 부족(User/Viewer) 사용자 접근 시 403 에러 반환
 * 3. [성공] 관리자(Admin) 또는 작가(Writer) 접근 시 파일 업로드 처리 위임 및 성공 결과 반환
 *
 * Mocking 전략:
 * - `getUserSession`: 사용자 인증 및 권한 상태 제어
 * - `uploadFile`: 실제 파일 시스템 조작 없이 성공적인 업로드 결과(메타데이터) 반환 시뮬레이션
 */

// 1. Global Mocks (전역 헬퍼 모킹)
const mockCreateError = vi.fn((err: any) => err);
const mockDefineEventHandler = vi.fn((handler: any) => handler);

vi.stubGlobal('createError', mockCreateError);
vi.stubGlobal('defineEventHandler', mockDefineEventHandler);

// 2. Module Mocks (외부 모듈 모킹)
const mockGetUserSession = vi.fn();
const mockUploadFile = vi.fn();

// 세션 관리 유틸리티 모킹
vi.mock('~/server/utils/session', () => ({
    getUserSession: mockGetUserSession,
}));

// 파일 업로드 처리 유틸리티 모킹 (핵심 로직 분리됨)
vi.mock('~/server/utils/fileUpload', () => ({
    uploadFile: mockUploadFile,
}));

// 3. Dynamic Import (핸들러 동적 가져오기)
const { default: uploadHandler } = await import(
    '~/server/api/upload/index.post.ts'
);

describe('Upload API', () => {
    // 매 테스트마다 Mock 상태 초기화
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/upload', () => {
        it('should throw 401 if user is not logged in (비로그인 사용자 차단)', async () => {
            // [Arrange] 세션 없음 설정
            mockGetUserSession.mockResolvedValue(null);

            // [Act & Assert] 401 Unauthorized 에러 발생 검증
            await expect(uploadHandler({} as any)).rejects.toMatchObject({
                statusCode: 401,
                message: 'Unauthorized',
            });
        });

        it('should throw 403 if user role is not admin or writer (권한 부족 사용자 차단)', async () => {
            // [Arrange] 'viewer' 권한을 가진 사용자 설정 (업로드 권한 없음)
            mockGetUserSession.mockResolvedValue({ role: 'viewer' });

            // [Act & Assert] 403 Forbidden 에러 발생 검증
            await expect(uploadHandler({} as any)).rejects.toMatchObject({
                statusCode: 403,
                message: 'Forbidden',
            });
        });

        it('should call uploadFile and return results if authorized (권한 보유 시 업로드 성공)', async () => {
            // [Arrange] 'admin' 권한 사용자 및 유틸리티 반환값 설정
            const mockUser = { role: 'admin' };
            const mockResults = [
                {
                    filename: 'test.webp',
                    url: '/uploads/test.webp',
                    size: 1024,
                },
            ];

            mockGetUserSession.mockResolvedValue(mockUser); // 관리자 세션
            mockUploadFile.mockResolvedValue(mockResults); // 파일 업로드 성공 가정

            // [Act] 핸들러 실행
            const result = await uploadHandler({} as any);

            // [Assert] 호출 여부 및 결과 구조 검증
            expect(mockGetUserSession).toHaveBeenCalled(); // 세션 체크 실행 확인
            expect(mockUploadFile).toHaveBeenCalled(); // uploadFile 유틸 호출 확인
            expect(result).toEqual({
                success: true,
                files: mockResults, // 반환된 파일 목록 일치 확인
                count: 1,
            });
        });
    });
});

