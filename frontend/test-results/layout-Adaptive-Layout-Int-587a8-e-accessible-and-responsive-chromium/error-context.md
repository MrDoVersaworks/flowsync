# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: layout.spec.ts >> Adaptive Layout Integrity >> landing page should be accessible and responsive
- Location: tests\e2e\layout.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Master Your Workflow/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Master Your Workflow/i })

```

```yaml
- main:
  - heading "MrDoVersa" [level=1]
  - paragraph: Login to sync your reality
  - textbox "Email Address"
  - textbox "Password"
  - button "Login"
  - button "Don't have an account? Sign up"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Adaptive Layout Integrity', () => {
  4  |   test('landing page should be accessible and responsive', async ({ page }) => {
  5  |     // Navigate to landing page
  6  |     await page.goto('/');
  7  |     
  8  |     // Verify title
  9  |     await expect(page).toHaveTitle(/FlowSync/);
  10 |     
  11 |     // Verify hero text visibility
  12 |     const heroTitle = page.getByRole('heading', { name: /Master Your Workflow/i });
> 13 |     await expect(heroTitle).toBeVisible();
     |                             ^ Error: expect(locator).toBeVisible() failed
  14 |     
  15 |     // Verify CTA button
  16 |     const getStartedBtn = page.getByRole('button', { name: /Get Started/i });
  17 |     await expect(getStartedBtn).toBeVisible();
  18 |   });
  19 | 
  20 |   test('authentication flow screens should be correctly structured', async ({ page }) => {
  21 |     // Navigate to login
  22 |     await page.goto('/login');
  23 |     
  24 |     // Verify login form presence
  25 |     await expect(page.locator('form')).toBeVisible();
  26 |     await expect(page.getByPlaceholder(/Email/i)).toBeVisible();
  27 |     await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
  28 |     
  29 |     // Verify responsive reflow (Login box should be centered)
  30 |     const loginBox = page.locator('.glass-card');
  31 |     await expect(loginBox).toBeVisible();
  32 |   });
  33 | });
  34 | 
```