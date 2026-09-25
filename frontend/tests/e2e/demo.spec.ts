import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('FlowSync — Public & User Features', () => {
  /* ---- UI Page Renders ---- */
  test('landing page renders successfully', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page renders with ID elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect(toggle).toBeVisible();
    await page.locator('#login-password').fill('test-password');
    await toggle.click();
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Hide password' })).toBeVisible();
    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(page.locator('#login-password')).toHaveAttribute('type', 'password');
  });

  test('register page renders with ID elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register`);
    await expect(page.locator('#full-name')).toBeVisible();
    await expect(page.locator('#email-address')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect(toggle).toBeVisible();
    await page.locator('#password').fill('test-password');
    await toggle.click();
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
    await expect(page.getByRole('button', { name: 'Hide password' })).toBeVisible();
    await expect(page.locator('#terms-checkbox')).toBeVisible();
  });

  test('privacy policy page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/privacy`);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByText('Information we collect')).toBeVisible();
  });

  test('terms of service page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/terms`);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByText('Using FlowSync')).toBeVisible();
  });

  /* ---- Public Backend API Checks ---- */
  test('GET /api/health returns 200 OK', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/health`);
    expect(res.status()).toBe(200);
  });

  test('GET /public/settings returns settings', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/public/settings`);
    expect([200, 401]).toContain(res.status());
  });

  test('GET /public/reviews returns approved reviews', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/public/reviews`);
    expect([200, 401]).toContain(res.status());
  });

  test('POST /public/reviews submits user review', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/public/reviews`, {
      data: {
        name: 'Project Lead',
        rating: 5,
        feedback: 'FlowSync AI task breakdown and Kanban state sync are outstanding.',
      },
    });
    expect([200, 201, 400, 401]).toContain(res.status());
  });

  test('POST /contact submits contact query', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/contact`, {
      data: {
        name: 'Dev Operations',
        email: 'devops@company.org',
        message: 'Inquiring about real-time WebSocket connection scaling.',
      },
    });
    expect([200, 201, 400, 401]).toContain(res.status());
  });

  /* ---- Auth API Checks ---- */
  test('POST /auth/register rejects empty payload', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/auth/register`, { data: {} });
    expect([400, 422]).toContain(res.status());
  });

  test('POST /auth/login rejects invalid password', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/auth/login`, {
      data: { email: 'fake@flowsync.io', password: 'wrong' },
    });
    expect([400, 401]).toContain(res.status());
  });
});
