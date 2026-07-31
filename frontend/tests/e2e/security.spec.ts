import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

test.describe('FlowSync — Security & Isolation Guards (SIL Rules)', () => {
  /* ---- User Scoping & Tenant Isolation (SIL-3) ---- */
  test('GET /workspaces rejects unauthenticated access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/workspaces`);
    expect(res.status()).toBe(401);
  });

  test('GET /kanban/:workspaceId rejects unauthorized access', async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/api/kanban/ws_unauthorized_99`);
    expect(res.status()).toBe(401);
  });

  test('POST /ai/breakdown rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/ai/breakdown`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test('POST /ai/enrich-task rejects unauthenticated request', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/ai/enrich-task`, { data: {} });
    expect(res.status()).toBe(401);
  });

  test('DELETE /auth/profile rejects unauthenticated account deletion', async ({ request }) => {
    const res = await request.delete(`${BACKEND_URL}/api/auth/profile`);
    expect(res.status()).toBe(401);
  });

  /* ---- Error Formatting (SIL-23) ---- */
  test('error messages end with a period and sentence casing', async ({ request }) => {
    const res = await request.post(`${BACKEND_URL}/api/workspaces/join`, {
      data: { joinCode: 'SHORT' },
    });
    if (res.status() === 400 || res.status() === 401) {
      const body = await res.json();
      if (body.error?.message) {
        expect(body.error.message).toMatch(/^[A-Z].*\.$/);
      }
    }
  });

  /* ---- CORS Security Boundaries (SIL-26) ---- */
  test('CORS does not return wildcard * for workspace routes', async ({ request }) => {
    const res = await request.fetch(`${BACKEND_URL}/api/workspaces`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://attacker.com' },
    });
    const allowOrigin = res.headers()['access-control-allow-origin'];
    expect(allowOrigin).not.toBe('*');
  });
});
