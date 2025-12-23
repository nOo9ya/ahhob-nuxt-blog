import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import * as bcrypt from 'bcrypt';

// 1. 모킹 설정 (반드시 import보다 먼저 실행되어야 함)
vi.mock('~/server/database', () => ({
  getDB: vi.fn(),
}));

vi.mock('~/server/utils/session', () => ({
  getUserSession: vi.fn(),
  setUserSession: vi.fn(),
  clearUserSession: vi.fn(),
  requireAuth: vi.fn(),
  requireAdmin: vi.fn(),
}));

// Nuxt/Nitro 글로벌 모킹, h3 모듈 모킹
vi.mock('h3', async () => {
    const actual = await vi.importActual('h3');
    return {
        ...actual,
        readBody: vi.fn(),
        createError: vi.fn((err) => err),
    };
});

vi.stubGlobal('defineEventHandler', (handler: any) => handler);
// vi.stubGlobal('readBody', vi.fn()); // h3 모킹으로 대체: 로컬 테스트에서는 import { readBody } 사용
vi.stubGlobal('createError', (err: any) => err); // me.get.ts 등에서 글로벌 사용하므로 필요

// 핸들러 변수 선언
let loginHandler: any;
let logoutHandler: any;
let meHandler: any;

// 모킹된 함수 가져오기
import { getDB } from '~/server/database';
import { setUserSession, clearUserSession, getUserSession } from '~/server/utils/session';
import { readBody } from 'h3';

/**
 * 인증 API 단위 테스트
 * Path: tests/unit/api/auth.test.ts
 *
 * 테스트 시나리오:
 * A. 로그인 (POST /api/auth/login)
 *    1. [실패] 이메일/비밀번호 누락 -> 400 Bad Request
 *    2. [실패] 사용자 없음 -> 401 Unauthorized
 *    3. [실패] 비밀번호 불일치 (bcrypt 비교) -> 401 Unauthorized
 *    4. [성공] 유효한 자격증명 -> 세션 생성 및 사용자 정보 반환 (비밀번호 제외)
 *
 * B. 로그아웃 (POST /api/auth/logout)
 *    1. [성공] 세션 제거 함수 호출 및 성공 응답
 *
 * C. 내 정보 조회 (GET /api/auth/me)
 *    1. [실패] 세션 없음 -> 401 Unauthorized
 *    2. [성공] 세션 유효 -> DB에서 최신 사용자 정보 조회 및 반환
 */
describe('Auth API Unit Tests', () => {
  let mockDb: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // 핸들러 동적 임포트 (Global Stub 적용 후)
    if (!loginHandler) {
        loginHandler = (await import('~/server/api/auth/login.post')).default;
        logoutHandler = (await import('~/server/api/auth/logout.post')).default;
        meHandler = (await import('~/server/api/auth/me.get')).default;
    }

    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };
    (getDB as any).mockResolvedValue(mockDb);
  });

  describe('POST /api/auth/login', () => {
    it('[Arrange] 이메일 또는 비밀번호가 없으면 [Act] 400 에러를 던져야 한다', async () => {
      (readBody as any).mockResolvedValue({}); // global.readBody 대신 import된 readBody 사용

      const event = {} as H3Event;

      try {
        await loginHandler(event);
      } catch (e: any) {
        expect(e.statusCode).toBe(400);
        expect(e.message).toContain('입력되지');
      }
    });

    it('[Arrange] 존재하지 않는 사용자라면 [Act] 401 에러를 던져야 한다', async () => {
      (readBody as any).mockResolvedValue({
        email: 'test@test.com',
        password: 'password',
      });
      // DB 조회 결과 없음
      mockDb.limit.mockResolvedValue([]); 

      const event = {} as H3Event;

      try {
        await loginHandler(event);
      } catch (e: any) {
        expect(e.statusCode).toBe(401);
        expect(e.message).toContain('올바르지 않습니다');
      }
    });

    it('[Arrange] 비밀번호가 일치하지 않으면 [Act] 401 에러를 던져야 한다', async () => {
       (readBody as any).mockResolvedValue({
         email: 'test@example.com',
         password: 'wrong_password',
       });
       
       const mockUser = {
         id: 1,
         email: 'test@example.com',
         passwordHash: await bcrypt.hash('password', 10),
         name: 'Test',
         role: 'user',
       };

       mockDb.limit.mockResolvedValue([mockUser]);

       const event = {} as H3Event;
       try {
         await loginHandler(event);
       } catch (e: any) {
         expect(e.statusCode).toBe(401);
       }
    });

    it('[Arrange] 인증 성공 시 [Act] 세션을 설정하고 유저 정보를 반환해야 한다 (Assert)', async () => {
        (readBody as any).mockResolvedValue({
            email: 'admin@test.com',
            password: 'password',
        });
        const mockUser = {
            id: 1,
            email: 'admin@test.com',
            passwordHash: await bcrypt.hash('password', 10),
            role: 'admin',
            name: 'Admin'
        };
        mockDb.limit.mockResolvedValue([mockUser]);

        const event = {} as H3Event;
        const result = await loginHandler(event);

        // Assert
        expect(setUserSession).toHaveBeenCalledWith(event, expect.objectContaining({
            email: 'admin@test.com',
            role: 'admin'
        }));
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        // 비밀번호는 반환되면 안됨
        expect((result.user as any).passwordHash).toBeUndefined();
    });
  });

  describe('POST /api/auth/logout', () => {
      it('[Act] 호출 시 [Assert] 세션을 제거해야 한다', async () => {
          const event = {} as H3Event;
          const result = await logoutHandler(event);

          expect(clearUserSession).toHaveBeenCalledWith(event);
          expect(result.success).toBe(true);
      });
  });

  describe('GET /api/auth/me', () => {
      it('[Arrange] 세션이 없으면 [Act] 401 에러를 던져야 한다', async () => {
          (getUserSession as any).mockResolvedValue(null);
          
          const event = {} as H3Event;
          try {
              await meHandler(event);
          } catch(e: any) {
              expect(e.statusCode).toBe(401);
          }
      });

      it('[Arrange] 세션이 있고 유저가 존재하면 [Act] 유저 정보를 반환해야 한다', async () => {
          (getUserSession as any).mockResolvedValue({ id: 1, role: 'admin' });
          
          const mockUser = {
              id: 1,
              email: 'admin@test.com',
              role: 'admin',
              name: 'Admin',
          };
          // DB에서 id로 조회
          mockDb.limit.mockResolvedValue([mockUser]);

          const event = {} as H3Event;
          const result = await meHandler(event);

          expect(result.user).toBeDefined();
          expect(result.user.email).toBe('admin@test.com');
          // 비밀번호 제외 확인
          expect(result.user.passwordHash).toBeUndefined();
      });
  });
});
