import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * SOVEREIGN RECORDING ENGINE (FLOWSYNC - FULL LIFECYCLE)
 */

// Manual Backend .env Retrieval (Frictionless & Secure)
const getBackendKey = () => {
    try {
        const envPath = path.resolve(__dirname, '../../../backend/.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const match = content.match(/GEMINI_API_KEY=["']?([^"'\n]+)["']?/);
            return match ? match[1] : null;
        }
    } catch (e) { return null; }
    return null;
};

const SYSTEM_API_KEY = process.env.GEMINI_API_KEY || getBackendKey() || 'sk-SOVEREIGN-DEMO-KEY';

const autoScroll = async (page: any, name: string) => {
    console.log(`[SOVEREIGN] ${name}: Scrolling to demonstrate adaptive UI...`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await page.waitForTimeout(10000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
};

const horizontalScroll = async (page: any, name: string) => {
    console.log(`[SOVEREIGN] ${name}: Scrolling right (3:00) to showcase Kanban columns...`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
        const board = document.querySelector('.custom-scrollbar') || document.querySelector('.overflow-x-auto');
        if (board) {
            board.scrollTo({ left: board.scrollWidth, behavior: 'smooth' });
        }
    });
    await page.waitForTimeout(5000);
    await page.evaluate(() => {
        const board = document.querySelector('.custom-scrollbar') || document.querySelector('.overflow-x-auto');
        if (board) {
            board.scrollTo({ left: 0, behavior: 'smooth' });
        }
    });
    await page.waitForTimeout(2000);
};

test.describe.configure({ mode: 'serial' });

const viewports = [
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Tablet', width: 1024, height: 768 },
  { name: 'Mobile', width: 390, height: 844 }
];

for (const vp of viewports) {
  test(`Full Lifecycle Demo - ${vp.name}`, async ({ }) => {
    test.setTimeout(300000); // 5 minutes timeout for the deliberate pace
    const browser = await chromium.launch({ 
      headless: false,
      channel: 'chrome'
    });
    
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    const page = await context.newPage();
    const timestamp = Date.now();
    const email = `demo_${timestamp}_${vp.name.toLowerCase()}@flowsync.test`;
    const password = 'password123';
    let inviteCode = '';

    try {
      // --- STEP 1: THE LANDING PAGE ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 1: Landing Page ---`);
      await page.goto('http://localhost:3000');
      await expect(page.getByText(/Synchronize/i)).toBeVisible();
      
      // Scroll down, wait 5 seconds, scroll back up
      await autoScroll(page, vp.name);
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 1 DONE ---`);


      // --- STEP 2: REGISTRATION ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 2: Registration ---`);
      await page.goto('http://localhost:3000/register');
      await page.waitForTimeout(2000);
      await page.locator('#full-name').fill(`Client Observer (${vp.name})`);
      await page.locator('#email-address').fill(email);
      await page.locator('#password').fill(password);
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Create Account/i }).click();
      await page.waitForTimeout(3000);

      // Register auto-logs in and pushes to /workspaces on success.
      // If the backend is slow/cold-starting it may fail — handle both paths.
      const currentUrl = page.url();
      if (currentUrl.includes('/register') || currentUrl.includes('/login')) {
        console.log(`[SOVEREIGN] ${vp.name}: Registration redirected, attempting direct login fallback...`);
        await page.goto('http://localhost:3000/login');
        await page.waitForTimeout(2000);
        await page.locator('#login-email').fill(email);
        await page.locator('#login-password').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForTimeout(4000);
      }
      
      // Wait for workspace page to load
      await page.waitForURL('**/workspaces', { timeout: 20000 });
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 2 DONE ---`);


      // --- STEP 3: SETTINGS & BYOK ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 3: Settings & BYOK ---`);
      const menuBtn = page.locator('button[class*="md:hidden"]').first();
      if (await menuBtn.isVisible()) { await menuBtn.click(); await page.waitForTimeout(1000); }
      await page.getByRole('link', { name: /Settings/i }).first().click();
      await page.waitForTimeout(3000);
      
      console.log(`[SOVEREIGN] ${vp.name}: Scrolling down to configuration...`);
      await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
      await page.waitForTimeout(3000);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
      await page.waitForTimeout(2000);

      // Mode switch theme
      const themeButton = page.locator('button', { hasText: /Mode/i }).first();
      if (await themeButton.isVisible()) {
        await themeButton.click();
        await page.waitForTimeout(2000);
        await themeButton.click();
      }
      await page.waitForTimeout(2000);

      console.log(`[SOVEREIGN] ${vp.name}: Anchoring AI Credentials...`);
      const modelInput = page.locator('input[placeholder="gemini-1.5-flash"]').first();
      if (await modelInput.isVisible()) {
        await modelInput.click();
        await modelInput.press('Control+A');
        await modelInput.press('Backspace');
        await modelInput.fill('gemini-2.5-flash');
        await page.waitForTimeout(1000);
      }
      await page.locator('input[type="password"]').first().fill(SYSTEM_API_KEY);
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Save Configuration/i }).first().click();
      await page.waitForTimeout(4000);
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 3 DONE ---`);


      // --- STEP 4: WORKSPACE INCEPTION ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 4: Workspace Inception ---`);
      if (await menuBtn.isVisible()) { await menuBtn.click(); await page.waitForTimeout(1000); }
      await page.locator('a[href="/workspaces"]').first().click();
      await page.waitForTimeout(3000);
      
      console.log(`[SOVEREIGN] ${vp.name}: Creating Workspace "Sovereign Architecture"...`);
      const orchestrateInput = page.locator('input[placeholder="Orchestrate New..."]');
      await orchestrateInput.waitFor({ state: 'visible', timeout: 15000 });
      await orchestrateInput.fill('Sovereign Architecture');
      await page.waitForTimeout(1000);
      await page.locator('form:has(input[placeholder="Orchestrate New..."]) button[type="submit"]').first().click();
      await page.waitForTimeout(5000);
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 4 DONE ---`);


      // --- STEP 5: WORKSPACE ENTRY ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 5: Workspace Entry ---`);
      const ownerWorkspaceCard = page.getByText('Sovereign Architecture').first();
      await ownerWorkspaceCard.waitFor({ state: 'visible', timeout: 20000 });
      await ownerWorkspaceCard.click();
      await page.waitForTimeout(3000);
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 5 DONE ---`);


      // --- STEP 6: COLUMN & TASK ORCHESTRATION ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 6: Column & Task Orchestration ---`);
      console.log(`[SOVEREIGN] ${vp.name}: Creating column "Strategic Objectives" manually...`);
      await page.getByRole('button', { name: /Add Infrastructure Column/i }).click();
      await page.waitForTimeout(1500);
      const columnInput = page.locator('input[placeholder*="Tactical Backlog"]');
      await columnInput.waitFor({ state: 'visible' });
      await columnInput.fill('Strategic Objectives');
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /Confirm Inception/i }).click();
      await page.waitForTimeout(3000);

      console.log(`[SOVEREIGN] ${vp.name}: Manually creating one task card...`);
      const addFirstTaskBtn = page.locator('button:has-text("Incept Task")').first();
      await addFirstTaskBtn.waitFor({ state: 'visible', timeout: 10000 });
      await addFirstTaskBtn.click();
      await page.waitForTimeout(2000);

      const taskTitleInput = page.locator('input[placeholder*="Implement Sovereign Middleware"]');
      await taskTitleInput.waitFor({ state: 'visible', timeout: 5000 });
      await taskTitleInput.fill('AES-256 Vault Architecture Design');
      await page.waitForTimeout(1000);

      const taskDescTextarea = page.locator('textarea[placeholder="Technical details..."]');
      await taskDescTextarea.waitFor({ state: 'visible', timeout: 5000 });
      await taskDescTextarea.fill('Sovereign encryption pipeline architecture, establishing private key generation logic and secure BYOK decryption gates.');
      await page.waitForTimeout(1000);

      const taskPrioritySelect = page.locator('select:has(option[value="urgent"])');
      await taskPrioritySelect.waitFor({ state: 'visible', timeout: 5000 });
      await taskPrioritySelect.selectOption('high');
      await page.waitForTimeout(1000);

      await page.getByRole('button', { name: /Confirm Inception/i }).click();
      await page.waitForTimeout(3000);

      console.log(`[SOVEREIGN] ${vp.name}: Opening task card for Comment and AI Enrichment...`);
      const firstTaskCard = page.locator('.glass-card.cursor-pointer').first();
      await firstTaskCard.waitFor({ state: 'visible', timeout: 10000 });
      await firstTaskCard.click();
      await page.waitForTimeout(3000);

      console.log(`[SOVEREIGN] ${vp.name}: Sending collaborative comment...`);
      const commentInput = page.locator('input[placeholder="Add a technical note..."]');
      await commentInput.waitFor({ state: 'visible', timeout: 5000 });
      await commentInput.fill('Hi Collaborator, welcome to the sanctuary. Secure AES-256 vault plan initiated.');
      await page.waitForTimeout(1000);
      await page.locator('form:has(input[placeholder*="Add a technical note"]) button[type="submit"]').first().click();
      await page.waitForTimeout(3000);      
      console.log(`[SOVEREIGN] ${vp.name}: Enriching task description with AI...`);
      const enrichBtn = page.getByRole('button', { name: /Enrich with AI/i }).first();
      if (await enrichBtn.isVisible()) {
          await enrichBtn.click();
          console.log(`[SOVEREIGN] ${vp.name}: Waiting for LLM inference (Task Enrichment)...`);
          await expect(enrichBtn).toBeEnabled({ timeout: 60000 });
      }
      
      const saveBtn = page.getByRole('button', { name: /Save Changes/i }).first();
      await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
      await saveBtn.click();
      await page.waitForTimeout(3000);
      // Modal auto-closes on successful save, so we do NOT click the X button here.

      console.log(`[SOVEREIGN] ${vp.name}: Triggering Targeted AI Inception to broaden the column...`);
      page.once('dialog', async dialog => {
          await dialog.accept('Setup Kubernetes ingress controller');
      });
      const targetedAIBtn = page.locator('button[title="Targeted AI Inception"]').first();
      await targetedAIBtn.waitFor({ state: 'visible', timeout: 10000 });
      await targetedAIBtn.click();
      console.log(`[SOVEREIGN] ${vp.name}: Waiting for LLM inference (Targeted Inception)...`);
      await page.getByText('Targeted Inception Complete').waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(3000); 

      console.log(`[SOVEREIGN] ${vp.name}: Triggering General AI Inception for second column...`);
      const goalInput = page.locator('input[placeholder="Orchestrate Technical Goal..."]');
      await goalInput.waitFor({ state: 'visible', timeout: 5000 });
      await goalInput.fill('Deploy a high-availability Redis cluster for session synchronization');
      await page.waitForTimeout(1000);
      const inceptBtn = page.getByRole('button', { name: 'Incept', exact: true }).first();
      await inceptBtn.click();
      console.log(`[SOVEREIGN] ${vp.name}: Waiting for LLM inference (General Inception)...`);
      await expect(inceptBtn).toBeEnabled({ timeout: 60000 });
      await page.waitForTimeout(3000); 
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 6 DONE ---`);


      // --- STEP 7: SEARCH & DRAG DROP ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 7: Search & Drag Drop ---`);
      const generalSearch = page.locator('input[placeholder="Search sanctuary missions..."]');
      await generalSearch.waitFor({ state: 'visible', timeout: 5000 });
      await generalSearch.fill('AES-256');
      await page.waitForTimeout(3000);
      await generalSearch.fill('');
      await page.waitForTimeout(2000);

      const columnSearch = page.locator('input[placeholder="Search tasks in column..."]').first();
      await columnSearch.waitFor({ state: 'visible', timeout: 5000 });
      await columnSearch.fill('AES-256');
      await page.waitForTimeout(3000);
      await columnSearch.fill('');
      await page.waitForTimeout(2000);

      console.log(`[SOVEREIGN] ${vp.name}: Testing Drag-and-Drop functionality...`);
      const sourceCard = page.locator('.glass-card.cursor-pointer').first();
      await sourceCard.waitFor({ state: 'visible', timeout: 5000 });
      const boundingBox = await sourceCard.boundingBox();
      if (boundingBox) {
          await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
          await page.mouse.down();
          await page.waitForTimeout(500);
          await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2 + 100, { steps: 10 });
          await page.waitForTimeout(500);
          await page.mouse.up();
          await page.waitForTimeout(2000);
      }
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 7 DONE ---`);


      // --- STEP 8: COLLABORATIVE INVITE ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 8: Collaborative Invite ---`);
      const inviteBtn = page.locator('button:has-text("Invite")').first();
      if (await inviteBtn.isVisible()) {
          await inviteBtn.click();
          await page.waitForTimeout(2000);
          const codeSpan = page.locator('span.font-mono').first();
          if (await codeSpan.isVisible()) {
              inviteCode = (await codeSpan.innerText()).trim();
              console.log(`[SOVEREIGN] ${vp.name}: Captured Invite Code: ${inviteCode}`);
          }
          const modalCopyBtn = page.locator('div.group:has(span.font-mono) button').first();
          if (await modalCopyBtn.isVisible()) {
              await modalCopyBtn.click();
              await page.waitForTimeout(1000);
          }
          const modalCloseBtn = page.locator('button:has(.lucide-x)').first();
          if (await modalCloseBtn.isVisible()) {
              await modalCloseBtn.click();
          } else {
              await page.keyboard.press('Escape');
          }
          await page.waitForTimeout(2000);
      }
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 8 DONE ---`);


      // --- STEP 9: OWNER LOGOUT ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 9: Owner Logout ---`);
      if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(1000);
      }
      const ownerLogoutBtn = page.locator('button:has(.lucide-log-out), button[title="Logout"]').first();
      if (await ownerLogoutBtn.isVisible()) {
          await ownerLogoutBtn.click();
      } else {
          await page.goto('http://localhost:3000/login'); 
      }
      await page.waitForTimeout(3000);
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 9 DONE ---`);


      // --- STEP 10: COLLABORATOR JOIN FLOW ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 10: Collaborator Join Flow ---`);
      const collabEmail = `collab_${timestamp}_${vp.name.toLowerCase()}@flowsync.test`;
      if (inviteCode && inviteCode !== '------') {
          await page.goto('http://localhost:3000/register');
          await page.waitForTimeout(2000);
          await page.locator('#full-name').fill(`Collaborator (${vp.name})`);
          await page.locator('#email-address').fill(collabEmail);
          await page.locator('#password').fill(password);
          await page.waitForTimeout(1000);
          await page.getByRole('button', { name: /Create Account/i }).click();
          await page.waitForTimeout(3000);

          const collabCurrentUrl = page.url();
          if (collabCurrentUrl.includes('/register') || collabCurrentUrl.includes('/login')) {
            console.log(`[SOVEREIGN] ${vp.name}: Collaborator login fallback...`);
            await page.goto('http://localhost:3000/login');
            await page.waitForTimeout(2000);
            await page.locator('#login-email').fill(collabEmail);
            await page.locator('#login-password').fill(password);
            await page.getByRole('button', { name: /Sign In/i }).click();
            await page.waitForTimeout(4000);
          }
          await page.waitForURL('**/workspaces', { timeout: 20000 });

          console.log(`[SOVEREIGN] ${vp.name}: Collaborator Joining Workspace with Code ${inviteCode}...`);
          const joinInput = page.locator('input[placeholder="Join Code (8 chars)"]');
          if (await joinInput.isVisible()) {
              await joinInput.fill(inviteCode);
              await page.waitForTimeout(1000);
              const joinSubmitBtn = page.locator('form:has(input[placeholder="Join Code (8 chars)"]) button[type="submit"]').first();
              if (await joinSubmitBtn.isVisible()) {
                  await joinSubmitBtn.click();
              } else {
                  await joinInput.press('Enter');
              }
              await page.waitForTimeout(4000);
          }

          console.log(`[SOVEREIGN] ${vp.name}: Collaborator Accessing Board...`);
          const boardCard = page.getByText('Sovereign Architecture').first();
          await boardCard.waitFor({ state: 'visible', timeout: 15000 });
          await boardCard.click();
          await page.waitForTimeout(3000);
          await autoScroll(page, vp.name);

          // Card still exists because Deletion Demos moved to Step 12
          console.log(`[SOVEREIGN] ${vp.name}: Collaborator reading Owner comment note...`);
          const collabTaskCard = page.locator('.glass-card.cursor-pointer').first();
          if (await collabTaskCard.isVisible()) {
              await collabTaskCard.click();
              
              // Dynamically wait for the specific message to fetch from the database
              console.log(`[SOVEREIGN] ${vp.name}: Waiting for unread message to sync...`);
              await page.getByText(/Hi Collaborator, welcome to the sanctuary/i).waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
              await page.waitForTimeout(5000);
              
              const modalClose = page.locator('button:has(.lucide-x)').last();
              if (await modalClose.isVisible()) {
                  await modalClose.click();
              } else {
                  await page.keyboard.press('Escape');
              }
              await page.waitForTimeout(2000);
          }
      }
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 10 DONE ---`);


      // --- STEP 11: COLLABORATOR EXIT ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 11: Collaborator Exit ---`);
      if (inviteCode && inviteCode !== '------') {
          if (await menuBtn.isVisible()) {
              await menuBtn.click();
              await page.waitForTimeout(1000);
          }
          const collabLogoutBtn = page.locator('button:has(.lucide-log-out), button[title="Logout"]').first();
          if (await collabLogoutBtn.isVisible()) {
              await collabLogoutBtn.click();
          } else {
              await page.goto('http://localhost:3000/login');
          }
          await page.waitForTimeout(3000);
      }
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 11 DONE ---`);


      // --- STEP 12: OWNER GOVERNANCE ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 12: Owner Governance ---`);
      await page.goto('http://localhost:3000/login'); 
      await page.waitForTimeout(3000);
      await page.locator('#login-email').fill(email);
      await page.locator('#login-password').fill(password);
      await page.getByRole('button', { name: /Sign In/i }).click();
      await page.waitForURL('**/workspaces', { timeout: 20000 });

      console.log(`[SOVEREIGN] ${vp.name}: Entering workspace for governance...`);
      const ownerWorkspaceCard2 = page.getByText('Sovereign Architecture').first();
      await ownerWorkspaceCard2.waitFor({ state: 'visible', timeout: 15000 });
      await ownerWorkspaceCard2.click();
      await page.waitForTimeout(3000);

      const boardSettingsBtn = page.locator('button:has(.lucide-settings)').first();
      if (await boardSettingsBtn.isVisible()) {
          await boardSettingsBtn.click();
          await page.waitForTimeout(2000);

          // Change collaborator role
          const roleSelect = page.locator('.fixed.inset-0 select').first();
          if (await roleSelect.isVisible()) {
              console.log(`[SOVEREIGN] ${vp.name}: Changing Collaborator's Role to Viewer...`);
              await roleSelect.selectOption('viewer');
              await page.waitForTimeout(3000);
          }

          // Delete collaborator
          console.log(`[SOVEREIGN] ${vp.name}: Deleting Collaborator...`);
          page.once('dialog', async dialog => {
              await dialog.accept();
          });
          const memberTrashBtn = page.locator('.fixed.inset-0 button:has(.lucide-trash-2)').first();
          if (await memberTrashBtn.isVisible()) {
              await memberTrashBtn.click();
              await page.waitForTimeout(3000);
          }

          // Close Settings Modal to reveal the board for task deletion demos
          console.log(`[SOVEREIGN] ${vp.name}: Closing Workspace Settings...`);
          const settingsClose = page.locator('.fixed.inset-0 button:has(.lucide-x)').first();
          if (await settingsClose.isVisible()) {
              await settingsClose.click();
          } else {
              await page.keyboard.press('Escape');
          }
          await page.waitForTimeout(2000);
      }

      // --- DELETION DEMOS ---
      console.log(`[SOVEREIGN] ${vp.name}: Demo — Purge Comment Feed...`);
      const cardForPurgeFeed = page.locator('.glass-card.cursor-pointer').first();
      if (await cardForPurgeFeed.isVisible()) {
          await cardForPurgeFeed.click();
          
          console.log(`[SOVEREIGN] ${vp.name}: Waiting for message feed to sync before purging...`);
          await page.getByText(/Hi Collaborator, welcome to the sanctuary/i).waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
          await page.waitForTimeout(2000);
          
          const purgeFeedBtn = page.locator('button:has-text("Purge Feed")').first();
          if (await purgeFeedBtn.isVisible()) {
              page.once('dialog', async dialog => dialog.accept());
              await purgeFeedBtn.click();
              
              console.log(`[SOVEREIGN] ${vp.name}: Waiting for deletion validation...`);
              await page.getByText('Feed Purged').waitFor({ state: 'visible', timeout: 60000 }).catch(() => {});
              await page.waitForTimeout(2000);
          }
          
          console.log(`[SOVEREIGN] ${vp.name}: Demo — Purge Task (via modal)...`);
          const purgeTaskModalBtn = page.locator('button:has-text("Purge Task")').first();
          if (await purgeTaskModalBtn.isVisible()) {
              page.once('dialog', async dialog => dialog.accept());
              await purgeTaskModalBtn.click();
              await page.waitForTimeout(2000);
          } else {
              const modalCloseBtn = page.locator('button:has(.lucide-x)').last();
              if (await modalCloseBtn.isVisible()) {
                  await modalCloseBtn.click();
              } else {
                  await page.keyboard.press('Escape');
              }
              await page.waitForTimeout(1000);
          }
      }

      console.log(`[SOVEREIGN] ${vp.name}: Demo — Quick-delete Task (card-level trash)...`);
      const cardToQuickDelete = page.locator('.glass-card.cursor-pointer').first();
      if (await cardToQuickDelete.isVisible()) {
          await cardToQuickDelete.hover();
          await page.waitForTimeout(500);
          const quickTrashBtn = page.locator('button[title="Purge Task"], button:has(.lucide-trash-2)').first();
          if (await quickTrashBtn.isVisible()) {
              page.once('dialog', async dialog => dialog.accept());
              await quickTrashBtn.click();
              await page.waitForTimeout(2000);
          }
      }

      console.log(`[SOVEREIGN] ${vp.name}: Demo — Purge Column...`);
      const columnDeleteBtn = page.locator('button[title="Purge Column"]').last();
      if (await columnDeleteBtn.isVisible()) {
          page.once('dialog', async dialog => dialog.accept());
          await columnDeleteBtn.click();
          await page.waitForTimeout(2000);
      }

      // Re-open Settings to Purge Workspace
      console.log(`[SOVEREIGN] ${vp.name}: Re-opening Workspace Settings to Purge Workspace...`);
      const boardSettingsBtn2 = page.locator('button:has(.lucide-settings)').first();
      if (await boardSettingsBtn2.isVisible()) {
          await boardSettingsBtn2.click();
          await page.waitForTimeout(2000);

          console.log(`[SOVEREIGN] ${vp.name}: Purging Shared Workspace...`);
          const modalPasswordInput = page.locator('input[placeholder="••••••••"]').first();
          if (await modalPasswordInput.isVisible()) {
              await modalPasswordInput.fill(password);
              await page.waitForTimeout(1000);
              await page.locator('button:has-text("Purge Workspace")').first().click();
              await page.waitForTimeout(4000);
          }
      }
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 12 DONE ---`);


      // --- STEP 13: FINAL CLEANUP ---
      console.log(`[SOVEREIGN] ${vp.name}: --- STARTING STEP 13: Final Cleanup ---`);
      console.log(`[SOVEREIGN] ${vp.name}: Exploring Sovereign Guides...`);
      await page.goto('http://localhost:3000/guide/orchestrate');
      await page.waitForTimeout(2000);
      await autoScroll(page, vp.name);

      await page.goto('http://localhost:3000/guide/collaborate');
      await page.waitForTimeout(2000);
      await autoScroll(page, vp.name);

      console.log(`[SOVEREIGN] ${vp.name}: Navigating to settings for Final Profile Purge...`);
      await page.goto('http://localhost:3000/settings');
      await page.waitForTimeout(3000);

      console.log(`[SOVEREIGN] ${vp.name}: Purging Gemini API Key...`);
      page.once('dialog', async dialog => {
          await dialog.accept();
      });
      const purgeApiKeyBtn = page.locator('button:has-text("Purge")').first();
      if (await purgeApiKeyBtn.isVisible()) {
          await purgeApiKeyBtn.click();
          await page.waitForTimeout(3000);
      }

      console.log(`[SOVEREIGN] ${vp.name}: Initiating Sovereign Purge...`);
      const purgeTrigger = page.locator('button', { hasText: /Initiate Sovereign Purge/i }).first();
      if (await purgeTrigger.isVisible()) {
          await purgeTrigger.click();
          await page.waitForTimeout(2000);
          await page.locator('input[placeholder*="confirm"]').fill(password);
          await page.waitForTimeout(1000);
          await page.getByRole('button', { name: /Confirm Purge/i }).click();
      }
      
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log(`[SOVEREIGN] ${vp.name}: --- STEP 13 DONE ---`);
      
      console.log(`[SOVEREIGN] ${vp.name}: Demo Lifecycle Complete.`);
      await page.waitForTimeout(4000);

    } catch (error) {
      console.error(`[ERR_SOVEREIGN] ${vp.name}: Demo interrupted:`, error);
      throw error;
    } finally {
      await browser.close();
    }
  });
}
