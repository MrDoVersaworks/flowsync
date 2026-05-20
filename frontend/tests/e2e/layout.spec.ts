import { test, expect } from '@playwright/test';

test.describe('Adaptive Layout Integrity', () => {
  test('landing page should be accessible and responsive', async ({ page }) => {
    // Navigate
    await page.goto('/');
    
    // Verify title
    await expect(page).toHaveTitle(/FlowSync/);
    
    // Verify hero text visibility
    const heroTitle = page.getByRole('heading', { name: /Synchronize Your Reality/i });
    await expect(heroTitle).toBeVisible();
    
    // Verify CTA button
    const getStartedBtn = page.locator('a:has-text("Initialize Infrastructure")');
    await expect(getStartedBtn).toBeVisible();
  });

  test('authentication flow screens should be correctly structured', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Verify login form presence
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    
    // Verify responsive reflow (Login box should be centered)
    const loginBox = page.locator('.glass-card');
    await expect(loginBox).toBeVisible();
  });
});
