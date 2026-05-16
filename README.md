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
- **Collaborative Reconciliation:** Task-anchored chat feed for real-time technical discussion and decision persistence.
- **Intelligent Notifications:** Personalized unread tracking engine with global dashboard alerts for collaborative throughput.
- **Sovereign Guide System:** Modular, stage-based technical briefings (Orchestrate, Collaborate, Synchronize) for focused feature mastery.
- **Real-Time Board Sync:** Every card move, column creation, and task update is broadcasted in near-real-time via Socket.io.
- **Atomic Permissions:** Granular Role-Based Access Control (RBAC) ensuring technical authority is strictly managed (Owner, Contributor, Viewer).
- **AES-256 Secure Vault:** Your API keys are encrypted at rest and only decrypted in volatile memory during generation sessions.
- **Adaptive Responsive Design:** A "True Responsive" UI that utilizes CSS scroll-snapping for a focused mobile Kanban experience.

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

## 📸 Visual Overview

| **Intelligent Dashboard** | **Mobile Adaptiveness** |
|:---:|:---:|
| ![Landing Hero](frontend/public/screenshots/landing_hero.png) | ![Mobile View](frontend/public/screenshots/mobile_view.png) |
| *Premium Glassmorphism Interface* | *Scroll-Snap Focused View* |

| **Board Sanctuary** | **Security & Sovereignty** |
|:---:|:---:|
| ![Board Sanctuary](frontend/public/screenshots/board_sanctuary.png) | ![Security Vault](frontend/public/screenshots/security_vault.png) |
| *Real-Time Presence & State Management* | *AES-256-GCM Vault & Total Purge* |

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

### 3. QA Automation (Playwright)
Every core flow—from Authentication to Adaptive Layout transitions—is protected by automated E2E tests.
```bash
# Run the automated QA suite
cd frontend
npx playwright test

# Run the Sovereign Collaborative Integrity suite
npx playwright test tests/e2e/collaboration.spec.ts
```

### 4. Sovereign Command Modals
Legacy browser `prompt()` dialogs have been purged in favor of state-driven **Sovereign Command Modals**. This ensures absolute testability via Playwright and maintains the premium glass-morphism aesthetic across all viewport contexts (Rule U1).

---

## 🏗️ Strategic Deployment (Monorepo Architecture)

FlowSync is architected as a **Monorepo** designed for **Multi-Cloud Resilience**:

### 1. Frontend (Vercel)
- **Deployment**: The Next.js 16+ frontend is deployed to Vercel's Global Edge Network.
- **Monorepo Config**: Root Directory must be set to `frontend` within the Vercel project settings.
- **Performance**: Global Edge deployment ensures sub-50ms latency for the UI and instant asset delivery.

### 2. Backend (Render)
- **Deployment**: The Node.js 20+ backend is hosted on Render's managed compute layer.
- **Monorepo Config**: Root Directory must be set to `backend` within the Render web service settings.
- **Anti-Sleep Heartbeat**: A dedicated `cron-job` pings the `/api/health` endpoint every 12 minutes to prevent the Render instance from spinning down, ensuring 24/7 real-time availability.

### 3. Database (Neon)
- **Engine**: Serverless PostgreSQL (v16+).
- **Integrity**: Serverless PostgreSQL with point-in-time recovery for absolute data integrity.

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
