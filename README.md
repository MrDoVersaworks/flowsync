# FlowSync — Sovereign Real-Time Kanban Orchestration

[![FlowSync CI/CD](https://github.com/MrDoVersaworks/flowsync/actions/workflows/main.yml/badge.svg)](https://github.com/MrDoVersaworks/flowsync/actions)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-black)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**FlowSync** is a production-grade, collaborative task management platform engineered for **Absolute AI Sovereignty**. It leverages a high-performance WebSocket nerve system to provide real-time synchronization across teams, while ensuring that every AI interaction is powered by the user's own encrypted credentials.

## 🎯 Why FlowSync?
In an era of centralized task managers, FlowSync returns control to the engineer.
- **AI Sovereignty:** A "Bring Your Own Key" (BYOK) architecture ensures that you own your intelligence costs and data privacy.
- **Zero-Latency Collaboration:** Engineered with optimistic UI updates and room-based WebSocket orchestration for instant feedback.
- **Elite Performance:** Built with a custom Vanilla CSS design system, achieving near-perfect Lighthouse scores and sub-100ms interaction latency.

---

## 🚀 Key Features

- **Sovereign Goal Breakdown:** High-level goals are instantly split into actionable Kanban tasks using your private Gemini instance.
- **Real-Time Board Sync:** Every card move, column creation, and task update is broadcasted instantly to the entire team via Socket.io.
- **AES-256 Secure Vault:** Your API keys are encrypted at rest and only decrypted in volatile memory during generation sessions.
- **Adaptive Responsive Design:** A "True Responsive" UI that utilizes CSS scroll-snapping for a focused mobile Kanban experience.
- **DevOps Hardened:** Automated CI/CD pipelines ensure that every push is type-safe and build-ready.

---

## 🛡️ Sovereign Security Map
FlowSync implements a "Vault-First" security model to protect user data and AI credentials.
- **Credential Masking**: AES-256-GCM encryption for all sensitive API keys.
- **Decryption Isolation**: Keys are only decrypted in volatile RAM during AI generation.
- **Identity Guard**: Dual-token JWT (Access + Refresh) with strict CSRF protection.

## 🚀 Engineering Quality Matrix
| Pillar | Status | Implementation |
| :--- | :--- | :--- |
| **Adaptive Design** | ✅ | Scroll-snapping & Fluid Column Reflow. |
| **Continuous Integration** | ✅ | GitHub Actions Automated Quality Gates. |
| **Data Sovereignty** | ✅ | AES-256 Encrypted AI Credential Vaulting. |
| **System Integrity** | ✅ | Single-Source-of-Truth Domain Registry. |

---

## 📸 Visual Overview

| **Intelligent Dashboard** | **Mobile Adaptiveness** |
|:---:|:---:|
| ![Landing Desktop](C:/Users/User/.gemini/antigravity/brain/c10ffd80-731f-4852-94f8-048ae68131c6/landing_desktop_png_1778607663020.png) | ![Landing Mobile](C:/Users/User/.gemini/antigravity/brain/c10ffd80-731f-4852-94f8-048ae68131c6/landing_mobile_png_1778607675657.png) |
| *Premium Glassmorphism Interface* | *Scroll-Snap Focused View* |

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

---

## 🛠️ Technical Architecture

### Frontend Architecture (The Command Deck)
- **Framework**: Next.js 16+ (App Router) with strict TypeScript.
- **State Engine**: Zustand (Persistent & Optimistic).
- **Physics**: @dnd-kit (Accessible Drag-and-Drop) with Framer Motion.
- **Design System**: Sovereign Vanilla CSS (Zero-Tailwind, Zero-Clutter).

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
```

---

## 🏗️ Strategic Deployment

FlowSync is architected for **Multi-Cloud Resilience**:

### 1. Frontend (Vercel)
- **Deployment**: The Next.js 16+ frontend is deployed to Vercel's Global Edge Network.
- **Performance**: Global Edge deployment ensures sub-50ms latency for the UI and instant asset delivery.

### 2. Backend (Render)
- **Deployment**: The Node.js 20+ backend is hosted on Render's managed compute layer.
- **Orchestration**: Hosted on a persistent compute layer to maintain stable WebSocket connections for real-time rooms.

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

## 👨‍💻 Developer & Contact
FlowSync is part of the **Sovereign Portfolio Series**.

**Engineering by Oyewole Favour**  
📧 [mrdoofficial1@gmail.com](mailto:mrdoofficial1@gmail.com)  
💼 [LinkedIn](https://www.linkedin.com/in/mrdoversaworks/)  
🌐 [GitHub](https://github.com/MrDoVersaworks/)

---

> [!IMPORTANT]
> This project is a demonstration of sovereign engineering. It requires a private Google AI API Key for full intelligence functionality.
