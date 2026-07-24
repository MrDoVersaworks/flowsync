import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('FlowSync Settings & System Management', () => {
  test('settings page and system admin inspection', async ({ page }) => {
    test.setTimeout(60000);
    const screenshotDir = path.resolve(__dirname, '../../public/screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    // 1. Settings View
    await page.goto('http://localhost:3000/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'settings.png') });

    // 2. Admin Inbox View
    await page.goto('http://localhost:3000/admin/inbox', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, 'admin_inbox.png') });
  });
});
