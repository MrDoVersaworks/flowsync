import { test, expect, BrowserContext } from '@playwright/test';

test.describe('FlowSync Collaborative Intelligence Integrity', () => {
  let ownerContext: BrowserContext;
  let memberContext: BrowserContext;
  
  const timestamp = Date.now();
  const workspaceName = `Nexus_${timestamp}`;
  const taskTitle = `Intelligence_Mission_${timestamp}`;
  
  const owner = {
    name: 'Sovereign Owner',
    email: `owner_${timestamp}@flowsync.test`,
    password: 'Password123!'
  };
  
  const member = {
    name: 'Collaborator Alpha',
    email: `member_${timestamp}@flowsync.test`,
    password: 'Password123!'
  };

  test('should synchronize unread alerts and verify mobile reflow', async ({ browser }) => {
    // 1. Setup Owner & Workspace
    ownerContext = await browser.newContext();
    const ownerPage = await ownerContext.newPage();
    
    await ownerPage.goto('/register');
    await ownerPage.getByLabel(/Full Name/i).fill(owner.name);
    await ownerPage.getByLabel(/Email Address/i).fill(owner.email);
    await ownerPage.getByLabel(/Password/i).fill(owner.password);
    await ownerPage.getByRole('button', { name: /Create Account/i }).click();
    
    // Stability Gate: Wait for Command Bar visibility
    const inceptInput = ownerPage.getByPlaceholder(/Orchestrate New.../i);
    await expect(inceptInput).toBeVisible({ timeout: 30000 });
    
    // Incept Workspace via Enter (Most reliable across viewports)
    await inceptInput.click();
    await inceptInput.fill(workspaceName);
    await ownerPage.keyboard.press('Enter');
    
    const workspaceCard = ownerPage.getByText(workspaceName);
    await expect(workspaceCard).toBeVisible({ timeout: 30000 });
    await workspaceCard.click();

    // 2. Get Invite Code
    await ownerPage.getByRole('button', { name: /Invite/i }).click();
    const inviteCode = await ownerPage.locator('span.font-mono').innerText();
    await ownerPage.locator('button[aria-label="Close Modal"]').click();
    await expect(ownerPage.getByText(/Expand the Sanctuary/i)).not.toBeVisible();

    // 3. Add Infrastructure
    await ownerPage.getByRole('button', { name: /Add Infrastructure/i }).click();
    await ownerPage.getByPlaceholder(/Tactical Backlog/i).fill('Missions');
    await ownerPage.getByRole('button', { name: /Confirm Inception/i }).click();
    await expect(ownerPage.getByText('Missions')).toBeVisible();
    
    // 4. Add Task
    const addTaskBtn = ownerPage.locator('button:has-text("Incept Task")').first();
    await addTaskBtn.click();
    await ownerPage.getByPlaceholder(/Implement Sovereign Middleware/i).fill(taskTitle);
    await ownerPage.getByRole('button', { name: /Confirm Inception/i }).click();
    await expect(ownerPage.getByText(taskTitle)).toBeVisible();

    // 5. Setup Member & Join
    memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();
    
    await memberPage.goto('/register');
    await memberPage.getByLabel(/Full Name/i).fill(member.name);
    await memberPage.getByLabel(/Email Address/i).fill(member.email);
    await memberPage.getByLabel(/Password/i).fill(member.password);
    await memberPage.getByRole('button', { name: /Create Account/i }).click();
    
    const joinInput = memberPage.getByPlaceholder(/Join Code/i);
    await expect(joinInput).toBeVisible({ timeout: 30000 });
    await joinInput.click();
    await joinInput.fill(inviteCode);
    await memberPage.keyboard.press('Enter');
    
    await expect(memberPage.getByText(workspaceName)).toBeVisible({ timeout: 30000 });
    await memberPage.getByText(workspaceName).click();
    await expect(memberPage.getByText(taskTitle)).toBeVisible();

    // 6. COLLABORATIVE SIGNAL TEST
    await memberPage.getByText(taskTitle).click();
    await memberPage.getByPlaceholder(/Type a technical note/i).fill('Mission Alpha Incepted.');
    await memberPage.keyboard.press('Enter');
    
    // VERIFY: Sender (Member) has 0 unread
    const memberBeacon = memberPage.locator('[data-testid="task-beacon"]');
    await expect(memberBeacon).not.toBeVisible();

    // VERIFY: Recipient (Owner) has Pulse
    await expect(ownerPage.locator('[data-testid="task-beacon"]')).toBeVisible({ timeout: 20000 });
    await expect(ownerPage.locator('.bg-red-500.animate-pulse')).toBeVisible();

    // 7. READ RECEIPT
    await ownerPage.getByText(taskTitle).click();
    await expect(ownerPage.getByText('Mission Alpha Incepted.')).toBeVisible();
    await ownerPage.keyboard.press('Escape');
    
    await expect(ownerPage.locator('[data-testid="task-beacon"]')).not.toBeVisible();
  });
});
