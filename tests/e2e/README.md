# E2E 테스트 실행 가이드

## 사전 준비

### 1. Playwright 설치 (Docker 환경)

```bash
# Nuxt 앱 컨테이너에 Playwright 설치
docker compose exec nuxt-app npm install -D @playwright/test
docker compose exec nuxt-app npx playwright install --with-deps chromium
```

### 2. 테스트 데이터 준비

북마크 테스트를 실행하기 전에 DB에 테스트 데이터가 있어야 합니다:

```bash
# Seed 데이터 삽입 (관리자 계정 포함)
docker compose exec nuxt-app npm run db:seed
```

**테스트 계정**:
- Email: `admin@example.com`
- Password: `admin123!`

---

## 테스트 실행

### 북마크 테스트 실행

```bash
# Docker E2E 컨테이너 사용
docker compose run --rm e2e npx playwright test bookmarks.spec.ts

# 헤드리스 모드 (UI 없음)
docker compose run --rm e2e npx playwright test bookmarks.spec.ts --headed=false

# 디버그 모드
docker compose run --rm e2e npx playwright test bookmarks.spec.ts --debug
```

### 모든 E2E 테스트 실행

```bash
docker compose run --rm e2e npx playwright test
```

---

## 주요 개선 사항 (2025-12-17)

### 1. 세션 쿠키 초기화

세션 인터페이스 변경(`id` → `userId`)으로 인해 기존 쿠키가 문제를 일으킬 수 있어 테스트 시작 전 쿠키를 초기화합니다:

```typescript
test.beforeEach(async ({ page, context }) => {
    // 기존 세션 쿠키 제거
    await context.clearCookies();
    await login(page);
});
```

### 2. 로그인 안정성 개선

- **타임아웃 증가**: 10초 → 15초
- **명시적 대기**: `waitForLoadState('networkidle')` 사용
- **에러 로깅**: 로그인 실패 시 상세 정보 출력

### 3. 북마크 테스트 개선

- **초기 상태 정리**: 북마크가 이미 활성화되어 있으면 먼저 해제
- **명확한 로깅**: 각 단계마다 콘솔 로그 추가
- **안정적 대기**: `waitForLoadState` 및 적절한 타임아웃 설정

---

## 문제 해결 (Troubleshooting)

### 1. "Cannot find package '@playwright/test'" 에러

**원인**: E2E 컨테이너에 Playwright가 설치되지 않음

**해결**:
```bash
# E2E 컨테이너에 직접 들어가서 설치
docker compose run --rm e2e sh
npm install -D @playwright/test
npx playwright install chromium
exit
```

### 2. 로그인 실패 (401 Unauthorized)

**원인**: 관리자 계정이 DB에 없거나 비밀번호 불일치

**해결**:
```bash
# 관리자 계정 생성
docker compose exec nuxt-app npm run db:seed

# 또는 직접 생성
docker compose exec nuxt-app node scripts/create_admin.ts
```

### 3. 북마크 추가/제거 실패

**원인**: 세션 인터페이스 불일치 (`user.id` vs `user.userId`)

**해결**: 이미 수정 완료 (Phase 9)
- 모든 API에서 `user.userId` 사용
- 테스트 시작 시 쿠키 초기화

### 4. 타임아웃 에러

**원인**: 네트워크 지연 또는 Docker 리소스 부족

**해결**:
```typescript
// 타임아웃 증가
await page.waitForURL('**/admin', { timeout: 30000 });

// 또는 Docker 리소스 증가
docker compose down
docker system prune -a
docker compose up -d
```

---

## 테스트 구조

### bookmarks.spec.ts

```
Bookmark System
  ├─ beforeEach: 로그인 및 세션 초기화
  └─ can toggle bookmark and see in my page
      ├─ 1. 메인 페이지에서 기사 선택
      ├─ 2. 북마크 버튼 클릭 (추가)
      ├─ 3. 마이페이지에서 북마크 확인
      ├─ 4. 기사 상세에서 북마크 해제
      └─ 5. 마이페이지에서 제거 확인
```

---

## 참고 자료

- [Playwright 문서](https://playwright.dev/)
- [Nuxt Testing 가이드](https://nuxt.com/docs/getting-started/testing)
- [STEP-028: 세션 인터페이스 통일](../../docs/steps/STEP-028-세션-인터페이스-통일-및-Relations-복구.md)

---

**최종 업데이트**: 2025-12-17
