# FlowSync — Sovereign Real-Time Kanban Orchestration <!-- CI_TRIGGER_INIT -->

[![FlowSync CI/CD](https://github.com/MrDoVersaworks/flowsync/actions/workflows/main.yml/badge.svg)](https://github.com/MrDoVersaworks/flowsync/actions)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-black)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FlowSync** is a production-grade, collaborative task management platform engineered for **Absolute AI Sovereignty**. It leverages a high-performance WebSocket nerve system to provide near-real-time synchronization across teams, while ensuring that every AI interaction is powered by the user's own encrypted credentials.

## 🎯 Why FlowSync?
In an era of centralized task managers, FlowSync returns control to the engineer.
- **AI Sovereignty:** A "Bring Your Own Key" (BYOK) architecture ensures that you own your intelligence costs and data privacy.
- **High-Performance Collaboration:** Engineered with optimistic UI updates and room-based WebSocket orchestration for responsive feedback.
- **Elite Performance:** Built with a Tailwind-native architecture, optimized for high-performance and Lighthouse excellence.

## 👥 Targeted Population
FlowSync is engineered for specific high-performance cohorts who demand speed, transparency, and data sovereignty:
- **Agile Engineering Teams**: High-velocity teams who need high-performance synchronization during technical sprints.
- **AI-First Product Managers**: Leaders who want to bridge the gap between high-level project vision and actionable task flows using private AI orchestration.
- **Sovereign Developers**: Privacy-conscious engineers who refuse to store sensitive project data or API credentials in centralized, multi-tenant SaaS platforms.

---

## 🚀 Key Features

- **Sovereign Goal Inception:** High-level goals are decomposed into actionable Kanban tasks using your private AI configuration.
- **Context-Aware Enrichment:** Auto-generate technical breakdowns for existing tasks, grounded in both the task title and the column's specific goal.
- **Full-Field Manual Inception:** Manually incept tasks with a title, technical description, and priority — all fields are persisted to the database on creation.
- **Collaborative Reconciliation:** Task-anchored chat feed for real-time technical discussion and decision persistence, with a Purge Feed cleanup gate.
- **Intelligent Notifications:** Reactive unread tracking engine with global dashboard alerts and mobile-optimized beacons.
- **Real-Time Board Sync:** Every card move, column creation, and task update is broadcasted in near-real-time via Socket.io.
- **Atomic Permissions:** Granular Role-Based Access Control (RBAC) ensuring technical authority is strictly managed (Owner, Contributor, Viewer).
- **AES-256 Secure Vault:** Your API keys are encrypted at rest and only decrypted in volatile memory during generation sessions.
- **Multi-Layer Deletion:** Destroy task comments (Purge Feed), individual tasks (modal or quick-trash), and entire columns — each action protected by a confirmation gate.
- **Adaptive Responsive Design:** A "True Responsive" UI with mobile-first delete actions and scroll-snapping for focused Kanban orchestration.

---

## 🧪 Evaluation: The Full Lifecycle Demo

For senior-level evaluation, I have engineered an **Indestructible E2E Showcase** using Playwright. This is not a simple unit test; it is a full-scale demonstration of the platform's stability, real-time synchronization, and AI orchestration depth.

### What it demonstrates:
- **Zero-Friction Auth:** Automated registration and session persistence.
- **Full-Field Task Inception:** Creates manual tasks with title, description, and priority — all fields saved to the database and reflected in the Technical Breakdown modal.
- **AI Orchestration:** Securely anchoring API credentials and performing AI-driven task breakdown (both targeted column-level and general board-level).
- **Deep Feature Interaction:** Collaborative technical reconciliation (chat), AI Enrichment, and a complete deletion feature showcase (Feed Purge, Task Purge, Card Quick-Delete, Column Purge).
- **Real-Time Kanban:** Automated column inception, DnD reordering (safety-gated for 2+ cards), and task management.
- **Collaborator Lifecycle:** Full invite, join, read, and exit cycle with unread beacon verification.
- **Governance:** Role elevation, member removal, and workspace destruction.
- **Security Audit:** A final, complete identity purge to ensure total data erasure.

### Run the Showcase:
To witness the platform demonstrate itself across Desktop, Tablet, and Mobile views, run the following:

```bash
# Ensure servers are running (npm run dev)
cd frontend
npx playwright test tests/e2e/recording.spec.ts --project=chromium --workers=1 --headed
```
*Note: The script is intentionally slowed down (deliberate execution) to allow for visual inspection of real-time transitions and AI logic.*

📖 **[E2E Recording Walkthrough](./frontend/tests/e2e/recording_walkthrough.md):** Read the comprehensive, human-readable breakdown of all 17 stages of the automated demo sequence.

---

## 🛡️ Sovereign Security Map
FlowSync implements a "Vault-First" security model to protect user data and AI credentials.
- **Credential Masking**: AES-256-GCM encryption for all sensitive API keys.
- **Decryption Isolation**: Keys are only decrypted in-memory during generation sessions.
- **Authority Guard**: Multi-tier RBAC hierarchy (Owner, Contributor, Viewer) enforced at the API layer.

## 🚀 Engineering Quality Matrix
| Pillar | Status | Implementation |
| :--- | :--- | :--- |
| **Adaptive Design** | ✅ | Scroll-snapping & Fluid Column Reflow. |
| **Collaborative Chat** | ✅ | Task-anchored technical reconciliation feed. |
| **Atomic Permissions** | ✅ | Tiered RBAC authority (Owner/Contributor/Viewer). |
| **Data Sovereignty** | ✅ | AES-256 Encrypted AI Credential Vaulting. |
| **Intelligence Recon**| ✅ | Reactive unread signaling & beacons. |
| **System Integrity** | ✅ | 100% Type-Safe Architecture (noEmit Passing). |

---

## 🎬 Sovereign Inception: Full System Walkthrough
 
[![FlowSync Full Demo](https://github.com/MrDoVersaworks/flowsync/blob/main/videos/full_walkthrough.mp4)](https://github.com/MrDoVersaworks/flowsync/blob/main/videos/full_walkthrough.mp4)
 
*A continuous technical walkthrough of the FlowSync ecosystem: From the Landing Hero and Secure Auth to Real-Time Infrastructure Orchestration and Context-Aware AI Enrichment.*

---

## 🧩 The Engineering Challenge

### 1. The Real-Time Race Condition
**Challenge:** In a collaborative board, two users moving the same task simultaneously can lead to database desynchronization and "UI Flickering."
**Solution:** Implemented **Optimistic State Locking**. The frontend updates the UI instantly while the backend processes the move within a database transaction. If a conflict occurs, the system uses "Last-Write-Wins" logic and broadcasts the correction to all clients.

### 2. The Sovereign Key Vault
**Challenge:** Storing third-party API keys is a major security liability. Plain-text exposure during a database breach would be catastrophic.
**Solution:** Engineered a **Stateless Decryption Pipe**. Using Node.js `crypto` (AES-256-GCM), keys are ciphertext the moment they leave the user's browser. They are only decrypted in-memory during the ephemeral window of the Gemini API call.

### 3. Adaptive Model Injection
**Challenge:** Users want to switch between Gemini models (Pro, Flash, Ultra) without backend reconfiguration.
**Solution:** Developed a **Dynamic AI Context Injector**. The system retrieves the user's encrypted model preference and injects it into the generative session at runtime, ensuring the platform is future-proof against new model releases.

### 4. The Intelligence Recon Loop
**Challenge:** In high-concurrency environments, unread alerts often "phantom" or persist even after being read due to micro-temporal drift between the app and database.
**Solution:** Engineered a **Temporal Reconciliation Engine**. Using a 100ms reconciliation buffer in the Drizzle subqueries, the system deterministically filters out sender-originated throughput (`ne(userId)`) and ensures that unread counts are only incremented for genuine peer-to-peer intelligence.

### 5. The Hydration Shield
**Challenge:** Real-time applications often crash during the "Hydration Cycle" (the microsecond window between page load and WebSocket connection) when attempting to render arrays that haven't arrived yet.
**Solution:** Developed a **Deterministic Hydration Shield**. By centralizing computations behind `Array.isArray()` safety gates, the interface gracefully degrades to a "0 state" rather than throwing fatal TypeErrors, ensuring a 100% stable initialization sequence.

---

## 🛠️ Technical Architecture

### Frontend Architecture (The Command Deck)
- **Framework**: Next.js 16+ (App Router) with strict TypeScript.
- **State Engine**: Zustand (Persistent & Optimistic).
- **Physics**: @dnd-kit (Accessible Drag-and-Drop) with Framer Motion.
- **Design System**: Sovereign Tailwind-Native Design System (Zero-Clutter, Ultra-Fast).

### Backend Infrastructure (The Citadel)
- **Runtime**: Node.js 20+ & Express (ESM Architecture).
- **Data Layer**: Drizzle ORM with Neon Serverless PostgreSQL (16+).
- **Orchestration**: Socket.io (Room-based Room Isolation).
- **Resilience**: Global Error Handler & Centralized Constant Registry.

---

## 🛡️ Engineering Principles

### 1. Responsive Adaptation & Fluidity
FlowSync implements a sophisticated adaptive layout engine. Instead of simply shrinking containers, the UI intelligently restructures on mobile devices—using horizontal scroll-snapping to transform complex boards into focused, reachable views.

### 2. Standardized Configuration Management
The system maintains a rigorous single source of truth for all domain constants, error codes, and real-time events. This eliminates "magic strings" across the monorepo and ensures absolute synchronization between the client and the server.

### 3. QA Automation (The Sovereign Matrix)
Every core flow—from Authentication to Adaptive Layout transitions—is protected by an exhaustive **Playwright E2E Suite**. We validate the platform across a matrix of devices and themes to ensure absolute technical integrity.

*   **Multi-Viewport Matrix:** Automated testing across Desktop (PC), Mobile (Pixel 5), and Tablet (iPad Mini).
*   **Visual Continuity:** Verifies theme-switching (Dark/Light) logic and responsive reflow in real-time.

```bash
# IMPORTANT: Ensure the Backend Server is running before executing E2E tests
cd backend && npm run dev

# Run the Exhaustive Recording Matrix (All viewports + Headed for Capture)
cd frontend
npx playwright test --project=chromium --project=mobile-chrome --project=tablet-safari --headed
```

### 4. Sovereign Command Modals
Legacy browser `prompt()` dialogs have been purged in favor of state-driven **Sovereign Command Modals**. This ensures absolute testability via Playwright and maintains the premium glass-morphism aesthetic across all viewport contexts (Rule U1).

---

## 🚀 Evaluating the Platform (Quick-Start for Clients)

FlowSync is designed for high-transparency evaluation. Clients and stakeholders can choose their preferred depth of review:

### 1. The Frictionless Demo (Zero Configuration)
The platform is currently in **Frictionless Client Demo Mode**. Email verification has been intentionally bypassed to allow you to experience the full AI pipeline in under 60 seconds.
- **Access:** Visit the **Registration Page**.
- **Credentials:** Use any dummy email (e.g., `client@demo.test`) to instantly access the dashboard.
- **Privacy:** All demo accounts are eligible for the **Sovereign Purge** (Account Deletion), which mathematically erases all your metadata and project data from the server.

### 2. The Automated E2E Demonstration (Watch it in Action)
If you wish to see the system test itself across every feature (Registration, AI Configuration, Kanban Orchestration, Purge), you can run our professional Playwright suite.

**Detailed Step-by-Step Execution:**
1. **Prepare Environment:** Ensure your `.env` file contains a valid `NEXT_PUBLIC_GEMINI_API_KEY`.
2. **Start Services:** Open two terminals and run `npm run dev` in both the `backend` and `frontend` directories.
3. **Execute the Suite:** Open a third terminal in the `frontend` directory and run:
   ```bash
   npx playwright test tests/e2e/recording.spec.ts --project=chromium --workers=1 --headed
   ```
4. **The "Sequential Lifecycle":**
   - **Desktop Perspective:** The browser opens and registers a demo account.
   - **Manual Pause:** The script pauses for 30 seconds at each stage to allow you to initiate a screen recorder (like *Cursorful*).
   - **Exhaustive Testing:** The robot physically configures the AI security vault, incepts a technical goal into the Kanban board, and cleans up.

### 3. The Technical Walkthrough (Video)
View the [Full System Recording](https://github.com/MrDoVersaworks/flowsync/blob/main/videos/full_walkthrough.mp4) for a narrated deep-dive into the architectural decisions and security layers.

---

## 🏗️ Strategic Deployment (Vercel Monorepo Architecture)

FlowSync is architected as a **Unified Monorepo** designed for **Single-Cloud Performance** on Vercel:

### 1. Unified Vercel Inception
- **Deployment**: Both the Next.js frontend and Node.js backend are deployed as distinct projects within a single Vercel team.
- **Frontend Config**: Root Directory set to `frontend`. Deployed as a high-performance Next.js application at the Edge.
- **Backend Config**: Root Directory set to `backend`. Deployed as a Serverless API hub, ensuring sub-millisecond cold starts and absolute scalability.
- **Synchronization**: The frontend and backend communicate over Vercel's private network, minimizing latency and maximizing intelligence throughput.

### 2. Database (Neon)
- **Engine**: Serverless PostgreSQL (v16+) with the `pgvector` extension for future-proof intelligence scaling.
- **Integrity**: Persistent, serverless data persistence with point-in-time recovery for absolute data integrity.

---

## 🚦 Getting Started

### Installation

1. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Configure .env (DATABASE_URL, JWT_SECRET, AES_KEY)
   npx drizzle-kit push
   npm run dev
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   # Configure .env (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL)
   npm run dev
   ```

---

## 👨‍💻 Sovereign Engineering & Support

FlowSync is part of a high-innovation portfolio series.

**Architected by Oyewole Favour**  
📧 [mrdoofficial1@gmail.com](mailto:mrdoofficial1@gmail.com)  
💼 [LinkedIn](https://www.linkedin.com/in/mrdoversaworks/)  
🌐 [GitHub](https://github.com/MrDoVersaworks/)

---

> [!IMPORTANT]
> This project is a demonstration of sovereign engineering. It requires a private Google AI API Key for full intelligence functionality.
