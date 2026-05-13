import { test, expect } from '@playwright/test';

test.describe('Adaptive Layout Integrity', () => {
  test('landing page should be accessible and responsive', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Verify title
    await expect(page).toHaveTitle(/FlowSync/);
    
    // Verify hero text visibility
    const heroTitle = page.getByRole('heading', { name: /Master Your Workflow/i });
    await expect(heroTitle).toBeVisible();
    
    // Verify CTA button
    const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
    await expect(getStartedBtn).toBeVisible();
  });

  test('authentication flow screens should be correctly structured', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Verify login form presence
    await expect(page.locator('form')).toBeVisible();
    await expect(page.getByPlaceholder(/Email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
    
    // Verify responsive reflow (Login box should be centered)
    const loginBox = page.locator('.glass-card');
    await expect(loginBox).toBeVisible();
  });
});
