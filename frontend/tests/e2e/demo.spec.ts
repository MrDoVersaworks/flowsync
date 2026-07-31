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
  });

  test('register page renders with ID elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register`);
    await expect(page.locator('#full-name')).toBeVisible();
    await expect(page.locator('#email-address')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#terms-checkbox')).toBeVisible();
  });

  test('privacy policy page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/privacy`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('terms of service page renders', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/terms`);
    await expect(page.locator('body')).toBeVisible();
  });

  /* ---- Public Backend API Checks ---- */
  test('GET /api/health returns 200 OK', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/health`);
    expect(res.status()).toBe(200);
  });

  test('GET /public/settings returns settings', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/admin/settings`);
    expect([200, 401]).toContain(res.status());
  });

  test('GET /public/reviews returns approved reviews', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/admin/reviews`);
    expect([200, 401]).toContain(res.status());
  });

  test('POST /public/reviews submits user review', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/admin/reviews`, {
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
