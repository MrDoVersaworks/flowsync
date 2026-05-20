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

  test('should complete the exhaustive technical lifecycle', async ({ page }) => {
    // 1. Landing & Initial Impression
    await page.goto('/');
    await expect(page).toHaveTitle(/FlowSync/);
    await expect(page.getByRole('heading', { name: /Synchronize Your Reality/i })).toBeVisible();

    // 2. Registration (Random Identity Inception)
    await page.goto('/register');
    await page.getByLabel(/Full Name/i).fill(testUser.name);
    await page.getByLabel(/Email Address/i).fill(testUser.email);
    await page.getByLabel(/Password/i).fill(testUser.password);
    const registerPromise = page.waitForResponse(resp => resp.url().includes('/auth/register'));
    await page.getByRole('button', { name: /Create Account/i }).click();
    await registerPromise;

    // 3. Theme Orchestration (Light/Dark Toggle)
    // Handle Mobile Navigation if needed
    const mobileMenuBtn = page.locator('button.md\\:hidden');
    const isMobile = await mobileMenuBtn.isVisible();
    
    if (isMobile) {
      await mobileMenuBtn.click();
      await page.getByRole('link', { name: /Settings/i }).click();
    } else {
      await page.goto('/settings');
    }

    await expect(page.getByText(/Dark Mode/i)).toBeVisible();
    await page.getByRole('button', { name: /Dark Mode/i }).click();
    await expect(page.getByText(/Light Mode/i)).toBeVisible();
    await page.getByRole('button', { name: /Light Mode/i }).click(); // Back to premium dark
    await expect(page.getByText(/Dark Mode/i)).toBeVisible();

    // 4. Workspace Architecture
    if (isMobile) {
      await mobileMenuBtn.click();
      await page.getByRole('link', { name: /Boards/i }).click();
    } else {
      await page.goto('/workspaces');
    }
    await expect(page.getByText(/The Void is Waiting/i)).toBeVisible();
    await page.getByPlaceholder(/Orchestrate New.../i).fill(testUser.workspaceName);
    await page.locator('form').first().locator('button').click();
    await expect(page.getByText(testUser.workspaceName)).toBeVisible();
    await page.getByText(testUser.workspaceName).click();

    // 5. Board Orchestration & AI Inception
    // Add Manual Infrastructure
    await page.getByRole('button', { name: "Add Infrastructure", exact: true }).click();
    await page.getByPlaceholder(/e.g., Tactical Backlog/i).fill('Core Infrastructure');
    await page.getByRole('button', { name: /Confirm Inception/i }).click();
    await expect(page.getByText('Core Infrastructure')).toBeVisible();

    // Trigger AI Goal Inception
    const goalInput = page.getByPlaceholder(/Orchestrate Technical Goal.../i);
    await goalInput.fill('Deploy a high-availability Redis cluster for session synchronization');
    await page.getByRole('button', { name: 'Incept', exact: true }).click();
    
    // Wait for AI to orchestrate the new column and tasks
    await page.waitForTimeout(5000); 
    await expect(page.getByText(/Redis Cluster/i).or(page.getByText(/Session Sync/i))).toBeVisible({ timeout: 20000 });

    // 6. Task Reconciliation & Collaborative Note
    const firstTask = page.locator('.task-card').first();
    await firstTask.click();
    
    // Enrich with AI
    await page.getByRole('button', { name: /Enrich with AI/i }).click();
    await page.waitForTimeout(3000); // AI generation time
    
    // Add Collaborative reconciliation note
    await page.getByPlaceholder(/Add a technical note.../i).fill('Primary node topology verified. Ready for deployment sync.');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Primary node topology verified/i)).toBeVisible();
    await page.getByRole('button', { name: /Close/i }).or(page.locator('button:has(svg.lucide-x)')).first().click();

    // 7. Sovereign Purge (Verification of Data Sovereignty)
    if (isMobile) {
      await mobileMenuBtn.click();
      await page.getByRole('link', { name: /Settings/i }).click();
    } else {
      await page.goto('/settings');
    }
    await page.getByRole('button', { name: /Initiate Sovereign Purge/i }).click();
    await page.getByPlaceholder(/Enter your password to confirm/i).fill(testUser.password);
    await page.getByRole('button', { name: /Confirm Purge/i }).click();

    // Final Redirection
    await expect(page).toHaveURL(/\/login/);
  });
});
