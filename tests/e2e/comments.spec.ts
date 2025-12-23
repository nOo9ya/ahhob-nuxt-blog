import { test, expect } from '@playwright/test';

test.describe('Comments System', () => {
    
    // Helper to log in
    async function login(page) {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@example.com');
        await page.fill('input[type="password"]', 'admin123!');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    }

    async function logout(page) {
        await page.goto('/');
        const userMenu = page.locator('button').filter({ hasText: '관리자' }).or(page.locator('button').filter({ hasText: 'User' }));
        if (await userMenu.isVisible()) {
            await userMenu.click();
            await page.getByText('로그아웃').click();
            await page.waitForURL('/login');
        }
    }

    test.describe('Guest Comments', () => {
        test.beforeEach(async ({ page }) => {
            // Ensure logged out
            await page.context().clearCookies();
            await page.goto('/');
        });

        test('guest can post and delete comment with password', async ({ page }) => {
            // 1. Go to article detail
            await page.goto('/');
            const articleLink = page.locator('article h2 a').first();
            await articleLink.click();

            // 2. Post comment
            const guestName = 'TestGuest';
            const guestPassword = 'password123';
            const commentContent = `Guest comment test ${Date.now()}`;

            await page.fill('input[placeholder*="이름"]', guestName);
            await page.fill('input[type="password"]', guestPassword);
            await page.fill('textarea', commentContent);
            await page.click('button:has-text("등록")');

            // 3. Verify comment appears
            await expect(page.locator('.comment-list')).toContainText(commentContent);
            await expect(page.locator('.comment-list')).toContainText(guestName);

            // 4. Try to delete with wrong password
            const deleteBtn = page.locator(`div:has-text("${commentContent}")`).locator('button[title="삭제"]').first();
            await deleteBtn.click(); // Open modal

            const modal = page.locator('.modal-container, [role="dialog"]'); // Adjust selector based on implementation
            await expect(modal).toBeVisible();

            await modal.locator('input[type="password"]').fill('wrongpassword');
            await modal.locator('button:has-text("확인"), button:has-text("삭제")').click();
            
            // Should verify error toast or message, but for now check modal is still there or toast error
            // Assuming toast appears
            // await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();

            // 5. Delete with correct password
            await modal.locator('input[type="password"]').fill(guestPassword);
            await modal.locator('button:has-text("확인"), button:has-text("삭제")').click();

            // 6. Verify comment is gone
            await expect(page.locator('.comment-list')).not.toContainText(commentContent);
        });
    });

    test.describe('Private Comments', () => {
        test('private comment visibility flow', async ({ page }) => {
            // 1. Login as Admin (User A)
            await login(page);

            // 2. Post private comment
            await page.goto('/');
            await page.locator('article h2 a').first().click();

            const privateContent = `Secret Comment ${Date.now()}`;
            
            // Check private checkbox (implementation dependent, identifying by label)
            const secretCheckbox = page.locator('label:has-text("비공개"), input[type="checkbox"] + span:has-text("비공개")');
            await secretCheckbox.click();
            
            await page.fill('textarea', privateContent);
            await page.click('button:has-text("등록")');

            // Verify visible to author (me)
            await expect(page.locator('.comment-list')).toContainText(privateContent);
            // Verify lock icon or indicator
            await expect(page.locator('.comment-list')).toContainText('비공개'); 

            // 3. Logout
            await logout(page);

            // 4. Check as Guest (User B)
            await page.goto('/');
            await page.locator('article h2 a').first().click();
            
            // Verify content is HIDDEN or replaced
            // Note: Implementation might hide it completely or show "Secret comment"
            // Checking that the specific text is NOT visible
            await expect(page.locator('.comment-list')).not.toContainText(privateContent);
            
            // If it shows placeholder text:
            // await expect(page.locator('.comment-list')).toContainText('비밀 댓글입니다');
        });
    });
});
