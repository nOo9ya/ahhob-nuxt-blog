import { test, expect } from '@playwright/test';

test.describe('Bookmark System', () => {
    
    test.beforeEach(async ({ page, context }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // Clear all cookies to ensure fresh session (세션 필드 변경으로 인한 기존 쿠키 제거)
        await context.clearCookies();

        await login(page);
    });

    async function login(page) {
        // 1. 로그인 페이지로 이동
        await page.goto('/login');

        // 2. Nuxt 로드 대기
        await page.waitForFunction(() => window.__NUXT__);
        await page.waitForTimeout(2000); // Hydration 대기

        // 3. 이메일 입력
        const emailInput = page.locator('input[type="email"]');
        await emailInput.waitFor({ state: 'visible' });
        await emailInput.fill('admin@example.com');
        await emailInput.dispatchEvent('input');

        // 4. 비밀번호 입력
        const passwordInput = page.locator('input[type="password"]');
        await passwordInput.fill('admin123!');
        await passwordInput.dispatchEvent('input');

        // 5. 입력값 검증
        await expect(emailInput).toHaveValue('admin@example.com');
        await expect(passwordInput).toHaveValue('admin123!');

        // 6. 로그인 버튼 클릭
        const submitBtn = page.locator('button[type="submit"]');
        await submitBtn.click();

        // 7. 리다이렉션 대기
        try {
            await page.waitForURL('**/admin', { timeout: 15000 });
            console.log('Login successful, redirected to admin page');
        } catch (e) {
            const errorText = await page.locator('.text-red-500').innerText().catch(() => 'No error message found');
            const currentUrl = page.url();
            console.error(`Login failed. Current URL: ${currentUrl}`);
            console.error(`UI Error: ${errorText}`);

            // 추가 디버깅: 네트워크 응답 확인
            const bodyText = await page.locator('body').innerText().catch(() => '');
            console.error(`Page content: ${bodyText.substring(0, 500)}`);

            throw new Error(`Login redirect failed. URL: ${currentUrl}, Error: ${errorText}`);
        }
    }

    test('can toggle bookmark and see in my page', async ({ page }) => {
        console.log('Starting bookmark toggle test...');

        // 1. 메인 페이지에서 첫 번째 기사로 이동
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const firstArticle = page.locator('article h2 a').first();
        await expect(firstArticle).toBeVisible({ timeout: 10000 });

        const articleTitle = await firstArticle.innerText();
        console.log(`Selected article: ${articleTitle}`);

        await firstArticle.click();
        await page.waitForLoadState('networkidle');

        // 2. 북마크 버튼 찾기 및 초기 상태 확인
        const bookmarkBtn = page.locator('button[aria-label="북마크"]');
        await expect(bookmarkBtn).toBeVisible({ timeout: 10000 });

        // 초기 상태가 활성화되어 있다면 먼저 해제
        const isInitialActive = await bookmarkBtn.evaluate(el =>
            el.classList.contains('text-primary-600') || el.classList.contains('text-blue-600')
        );

        if (isInitialActive) {
            console.log('Bookmark already active, removing first...');
            await bookmarkBtn.click();
            await page.waitForTimeout(1000);
        }

        // 3. 북마크 추가
        console.log('Adding bookmark...');
        await bookmarkBtn.click();

        // 토스트 메시지 확인
        await expect(page.getByText('북마크에 저장되었습니다')).toBeVisible({ timeout: 5000 });
        console.log('Bookmark added successfully');

        // 4. 마이페이지로 이동하여 북마크 확인
        await page.goto('/me');
        await page.waitForLoadState('networkidle');

        const bookmarksTab = page.getByText('내 북마크');
        await expect(bookmarksTab).toBeVisible({ timeout: 5000 });
        await bookmarksTab.click();
        await page.waitForTimeout(1000);

        // 5. 북마크 목록에 기사 존재 확인
        const bookmarkedArticle = page.locator(`text=${articleTitle}`);
        await expect(bookmarkedArticle).toBeVisible({ timeout: 10000 });
        console.log('Article found in bookmarks list');

        // 6. 기사 상세 페이지에서 북마크 해제
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const articleLink = page.getByText(articleTitle);
        await expect(articleLink).toBeVisible({ timeout: 5000 });
        await articleLink.click();
        await page.waitForLoadState('networkidle');

        // 북마크 버튼 다시 찾기
        const bookmarkBtnAgain = page.locator('button[aria-label="북마크"]');
        await expect(bookmarkBtnAgain).toBeVisible({ timeout: 5000 });

        console.log('Removing bookmark...');
        await bookmarkBtnAgain.click();

        // 해제 토스트 메시지 확인
        await expect(page.getByText('북마크가 해제되었습니다')).toBeVisible({ timeout: 5000 });
        console.log('Bookmark removed successfully');

        // 7. 마이페이지에서 북마크 제거 확인
        await page.goto('/me');
        await page.waitForLoadState('networkidle');

        const bookmarksTabAgain = page.getByText('내 북마크');
        await bookmarksTabAgain.click();
        await page.waitForTimeout(1000);

        // 북마크 목록에서 기사가 사라졌는지 확인
        await expect(page.locator(`text=${articleTitle}`)).not.toBeVisible({ timeout: 5000 });
        console.log('Article removed from bookmarks list');

        console.log('Bookmark toggle test completed successfully!');
    });
});
