import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
    test('homepage has title and articles', async ({ page }) => {
        await page.goto('/');

        // Check title
        await expect(page).toHaveTitle(/블로그/);

        // Check articles are loaded (wait for hydration)
        const articleCards = page.locator('article'); 
        // Or whatever selector matches ArticleCard.vue content. 
        // Checking for a known text from seed data
        await expect(page.getByText('AI의 미래: 2025년 전망')).toBeVisible();
    });

    test('can navigate to detail page', async ({ page }) => {
        await page.goto('/');
        
        // Find the article link that contains the specific text
        const articleLink = page.locator('a').filter({ hasText: 'AI의 미래: 2025년 전망' });
        
        // Check if href is correct
        const href = await articleLink.getAttribute('href');
        console.log('Article Link Href:', href);
        expect(href).toMatch(/.*ai-future-2025/);

        // Click with force to ensure no overlay issues
        await articleLink.click({ force: true });

        // Wait for navigation
        await page.waitForURL(/.*ai-future-2025/);
        
        // Expect detail content
        await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('AI의 미래');
    });
});
