import { test, expect } from '@playwright/test';

test.describe('FlowSync Sovereign Engineering Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'QA Engineer',
    email: `qa_${timestamp}@flowsync.test`,
    password: 'Password123!',
    workspaceName: 'Playwright Sanctuary',
    taskTitle: 'Automated Integrity Check'
  };

  test('should complete the full technical lifecycle', async ({ page }) => {
    // 1. Registration
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill(testUser.name);
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify Redirect to Workspaces
    await expect(page).toHaveURL(/\/workspaces/);
    await expect(page.getByText(/You don't have any workspaces yet/i)).toBeVisible();

    // 2. Create Workspace
    await page.getByRole('button', { name: /Incept Workspace/i }).click();
    await page.getByPlaceholder(/Workspace Name/i).fill(testUser.workspaceName);
    await page.getByRole('button', { name: /Incept/i }).click();

    // Verify Workspace Creation
    await expect(page.getByText(testUser.workspaceName)).toBeVisible();
    await page.getByText(testUser.workspaceName).click();

    // 3. Board Management
    // Add Column
    await page.getByRole('button', { name: /Add Column/i }).click();
    await page.getByPlaceholder(/Column Title/i).fill('To Do');
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText('To Do')).toBeVisible();

    // Add Task
    const addTaskBtn = page.locator('button:has-text("Add Task")').first();
    await addTaskBtn.click();
    await page.getByPlaceholder(/Task Title/i).fill(testUser.taskTitle);
    await page.getByRole('button', { name: /Add Task/i }).click();
    await expect(page.getByText(testUser.taskTitle)).toBeVisible();

    // 4. Presence Check (User should see their own token)
    const presenceBar = page.locator('.flex.items-center.-space-x-2');
    await expect(presenceBar).toBeVisible();
    
    // 5. Settings & Purge
    await page.goto('/settings');
    await expect(page.getByText(testUser.name)).toBeVisible();

    // Verify BYOK (Vault) - Optional but good
    await expect(page.getByText(/AI Sanctuary/i)).toBeVisible();

    // 6. Account Purge (Verification of Data Sovereignty)
    await page.getByRole('button', { name: /Initiate Sovereign Purge/i }).click();
    await page.getByPlaceholder(/Enter your password to confirm/i).fill(testUser.password);
    
    const finalPurgeBtn = page.getByRole('button', { name: /Confirm Purge/i });
    await finalPurgeBtn.click();

    // Verify Redirect to Login after purge
    await expect(page).toHaveURL(/\/login/);
  });
});
