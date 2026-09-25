# FlowSync Forensic Remediation Record

## Baseline / branch state
- Repository: MrDoVersaworks/FlowSync
- Audit branch: audit-remediation
- Baseline SHA: 91d931f5f7cc30436a4b0cee293859f59e9d34e3
- main and audit-remediation both pointed at the baseline SHA before remediation work.
- The remediation was developed on audit-remediation; Pull Request #1 was subsequently merged into main at b891055d03300f1c7def14b6afb1bc50de143412.

## Governing audit
The portfolio audit snapshot at public-systems/flowsync/ORIGINAL_AUDIT.md contains 34 findings: 12 P0 and 22 P1. The audit explicitly requires tracing adjacent code and proving both remediation and preservation.

## Historical reconstruction so far
1. Initial release: 5f55455c50b161ce6d355e5614a7511695df4b48.
2. Realtime/presence functionality was developed early, including explicit leave_workspace and userId-based presence deduplication.
3. c0cd3d91d4843b9ffc697f5b7a4e21b0e95abefd ("Unified hierarchical permission system and TypeScript logic audit") changed viewer UI behavior and role presentation, but current backend authorization still only checks membership for Kanban mutations. Therefore historical intent was stronger than the current enforcement contract.
4. 4b0ebe8255c2d57fd0ba0aa96d53fdff9006b985 added a process-local caching layer and AI gatekeeper infrastructure. Current cache code keys authenticated responses from req.user.id even though the JWT contract uses req.user.userId; this is a concrete historical integration mismatch and explains FS-001.
5. 4979a325f332010d15b3a4c56fa67798eb374db3 introduced Pusher as a serverless realtime fallback. The implementation currently subscribes to raw workspace identifiers and the server-side helper triggers those channels without a private-channel authorization boundary. This explains why realtime cannot simply be deleted: it serves deployment architecture, but its trust boundary must be repaired.
6. e9c5f1699e08ce1c6ce57e60cb98ca3499e5ca47 added a migration runner that expects ./drizzle, while the repository snapshot has no migration directory. Migration behavior must therefore be reconstructed from schema/history rather than treating the runner as proof that migrations exist.
7. 91d931f5f7cc30436a4b0cee293859f59e9d34e3 only removed production-grade claims from documentation. It did not perform the audit remediation.

## Current architecture / contract map
### Authentication
- Express routes under /api/auth.
- Bearer JWTs are the current API authentication mechanism.
- JWT payload is { userId, email }.
- Current login/register return accessToken and refreshToken in JSON.
- No refresh endpoint exists.
- Frontend persists both tokens through Zustand persist.
- API interceptor logs out on every 401.
- Admin authorization currently derives privilege from JWT email matching ADMIN_EMAIL.

### Authorization
- Workspace APIs require authentication.
- Workspace membership is checked in workspace detail and Kanban services.
- Current Kanban mutation authorization is membership-only; viewer is therefore not a server-side read-only capability.
- Owner operations read the workspace row and compare owner_id, but do not protect the owner membership row or validate roles at the API boundary.
- Role is stored as an unconstrained varchar despite UI/schema comments describing admin/member/viewer.

### Realtime
- Socket.IO is initialized in backend/src/index.ts.
- Current socket connection has no authentication middleware.
- JOIN_WORKSPACE trusts client-supplied workspaceId and user object.
- Presence is process-local.
- Pusher was added later for serverless deployments, but current channels are not private/membership-authorized.

### Persistence
- Drizzle/Postgres schema in backend/src/db/schema.ts.
- workspace_members has no composite primary/unique constraint.
- workspace creation is two separate writes.
- AI breakdown creates a suggested column before inserting generated tasks.
- migrate.ts expects ./drizzle.

### Configuration / delivery
- Backend validates required DATABASE_URL/JWT_SECRET/AES_KEY.
- Frontend API URL silently defaults to localhost.
- CI performs type checks only and uses npm install.
- Frontend declares Next ^15 with eslint-config-next 16.2.6; this must be tested/aligned rather than blindly upgraded.

## Contract-resolution principles for remediation
1. Authenticate once, derive identity server-side, and never accept client identity as authority.
2. Resolve workspace capability from server-side membership + role at the route/service boundary.
3. Keep DTOs explicit and consistent; do not expose raw DB rows when the client contract is different.
4. Treat persistence and realtime as separate concerns: commit first, then broadcast.
5. Security/correctness must not depend on process-local caches or rate limits in distributed deployment.
6. Preserve existing realtime, workspace, review, AI and deployment use cases unless the audit proves they are unsafe; repair their boundaries rather than deleting functionality by default.
7. Every material change must have a targeted regression proof and a preservation proof.

## Work status
This document records the pre-fix reconstruction. Code remediation follows in separate commits on audit-remediation only.


## Remediation batch 1 — implemented on audit-remediation
### Authentication / session
- Refresh credentials are no longer returned to the browser as JSON or persisted by Zustand.
- Refresh tokens are random opaque values stored only as SHA-256 hashes in refresh_sessions.
- Refresh rotation is single-use: the database update that revokes the old token is the concurrency gate.
- Access tokens remain short-lived JWTs; the frontend keeps the access token in memory and refreshes through an httpOnly cookie.
- Login/register/refresh/logout contracts were aligned.
- Production frontend builds now fail closed if NEXT_PUBLIC_API_URL is absent.
- Global admin authorization now derives from ADMIN_USER_ID, never from a mutable email claim.

### Workspace authorization
- Centralized capability resolution now distinguishes owner/admin/member/viewer.
- Kanban mutations require mutation capability; viewers are read-only at the service boundary.
- Comment creation/deletion/purge follows workspace capabilities.
- Owner-only role changes/removal and workspace deletion are enforced server-side.
- Owner cannot be removed or demoted.
- Workspace membership now has a composite primary key.
- Workspace creation is transactional and invite codes use cryptographic randomness.
- Invite attempts use a database-backed rate limiter.

### Realtime
- Socket.IO now authenticates the JWT before accepting connections.
- Socket workspace joins derive user identity from the authenticated socket and verify membership server-side.
- Client-supplied user identity is no longer trusted.
- Socket authentication honors the existing JWT blocklist.
- Pusher workspace channels are private and have an authenticated membership-checking authorization endpoint.
- HTTP and Socket.IO CORS now use the same normalized origin list.
- Rejoining a socket cleans the previous workspace presence entry.

### Persistence / contracts
- A deterministic Drizzle baseline and security migration were added because migrate.ts previously referenced a missing ./drizzle directory.
- Migration adds membership uniqueness, role/priority/rating checks, refresh sessions, review moderation state, case-normalized email uniqueness, and shared rate-limit buckets.
- Existing case-insensitive duplicate emails deliberately fail the migration rather than silently merging accounts.
- AI output is parsed through a strict Zod schema and the generated column/tasks are committed in one database transaction before realtime notification.
- Admin inbox DTOs now match the frontend contract and support the frontend's PATCH /admin/inbox/:id operation.
- Public reviews are backend-moderated; localStorage is no longer an authoritative publication source.
- Contact screening/trust fields are server-owned; visitor-supplied Gemini keys and screening claims were removed.
- Contact notification HTML is escaped before email delivery.
- Error responses now expose correlation IDs and do not expose internal error messages for 5xx responses.
- Malformed UUID route parameters are rejected at the route boundary.

## Testing / verification evidence
- Repository history and current source were inspected before code changes.
- Main now contains the merged remediation at b891055d03300f1c7def14b6afb1bc50de143412; the pre-remediation baseline remains 91d931f5f7cc30436a4b0cee293859f59e9d34e3.
- audit-remediation contains post-merge documentation commits and therefore appears ahead/diverged from main; those documentation changes are being brought to main separately.
- GitHub Actions workflow was strengthened to run migrations, backend typecheck/build, and frontend lint/typecheck/build, but no workflow run was created for this branch in the connected GitHub environment.
- Vercel produced READY deployments for intermediate audit-remediation commits (including 556fb5909203990fb87fb87db4d821f24f7203d9). Later deployment attempts were queued/cancelled due Vercel build/deployment rate limits. Therefore a clean build of the final SHA has NOT been claimed.
- No database-backed integration environment was available in this session for executing the migration and authorization tests directly.
- Pre-production remediation work is complete; production deployment and the post-production verification below remain separate evidence gates.

## Known remaining / intentionally unverified areas
- Socket.IO process-local presence remains a single-instance fallback. Pusher production presence needs a dedicated presence-channel path if multi-instance presence is required independently of Pusher event delivery.
- General non-security load limiting remains process-local; security/cost-critical auth, AI, invite and contact limits use the database-backed limiter.
- Access-token revocation is bounded by access-token lifetime; refresh-session revocation is durable. A durable access-token denylist would require adding a server-side token/session identifier contract.
- CI workflow has been strengthened but is not yet evidenced by a completed run in this environment.
- Final Vercel deployment is not yet evidenced as READY.


## Final verification pass — 2026-09-25

The remediation branch was tested again after the final code/test changes.

- GitHub Actions run **#111** for the remediation branch completed successfully for backend and frontend:
  - PostgreSQL-backed migration
  - backend TypeScript type-check
  - backend build
  - frontend lint
  - frontend TypeScript type-check
  - frontend build
- The same CI run executed the Playwright E2E suite against a fresh PostgreSQL 16 database. **30 tests passed in 27.1s.**
- The E2E run explicitly exercises public pages, health/public API behavior, authentication validation, unauthenticated protected routes, Pusher authorization boundary behavior, and other security-isolation checks.
- The migration runner now verifies required security/application tables after migration rather than silently succeeding with an incomplete schema.
- The Playwright configuration was updated so its backend test server performs an idempotent migration before startup.
- Pusher remains the production realtime mechanism. `backend/src/routes/realtime.routes.ts` still exposes authenticated private workspace-channel authorization and enforces workspace membership before signing a channel.
- Socket.IO remains present in the backend as a separate realtime mechanism; it was not substituted for Pusher or removed.
- The final Vercel preview visible during this verification was a READY deployment for `audit-remediation` at an earlier remediation SHA. Vercel had not yet exposed a READY deployment for the final verification SHA when this record was written. Therefore this CI result proves the source/build/E2E state, but it does not claim a final-commit Vercel runtime deployment.
- The `main` branch was not modified by the remediation work before the merge decision.

### Final proof model

For each remediation area, acceptance required both:
1. the documented audit/security behavior is enforced; and
2. the original functional path remains represented by build, integration, or E2E coverage.

This record intentionally does not claim that every possible production scenario has been exhaustively simulated. It records the strongest automated evidence available in the repository/CI environment and keeps deployment-specific verification distinct from source-level verification.

## Final post-production verification — REQUIRED AFTER PRODUCTION DEPLOYMENT

**Status: NOT COMPLETE UNTIL THE REAL PRODUCTION ENVIRONMENT HAS BEEN TESTED.**

This is separate evidence from CI, local testing, preview deployments, and pre-production E2E. Do not mark it complete merely because GitHub Actions is green. No application behavior should be changed as part of this documentation/verification task.

For every area below, record the date/time, deployed commit SHA, Vercel deployment ID/URL, exact test performed, result, and limitation/unverified item.

### 1. Production deployment and infrastructure
- Confirm the production deployment is the intended commit/artifact and is READY.
- Confirm frontend/backend production configuration and endpoints are correct.
- Confirm Pusher remains configured as the production realtime mechanism.
- Confirm there is no unintended infrastructure/configuration drift.
- Result: UNVERIFIED — production verification pending.

### 2. Production database/schema and migrations
- Run the committed migration runner against the actual production database.
- Confirm committed migrations are recorded in schema_migrations.
- Confirm required tables, constraints, indexes, refresh-session and rate-limit structures exist.
- Confirm the migration is idempotent.
- Inspect existing data for unintended transformation, especially email normalization/duplicate handling.
- Result: UNVERIFIED — production database migration pending.
- Limitation: CI used a fresh PostgreSQL database and does not prove compatibility with the live dataset.

### 3. Persistence and data integrity
- Exercise representative create/update/delete flows with controlled test data.
- Verify membership uniqueness, task/column relationships, comments, reviews, sessions, and rate-limit state.
- Verify transactional AI task creation leaves no partial state after a safely induced failure.
- Verify existing production data remains readable and intact.
- Result: UNVERIFIED — production data-integrity testing pending.

### 4. Authentication and session behavior
- Verify controlled-account login/register, access-token authentication, refresh via httpOnly credential, rotation, reuse rejection, logout/revocation, and invalid/expired credential handling.
- Confirm production error responses do not leak internal details.
- Result: UNVERIFIED — production authentication verification pending.

### 5. Authorization/access control
- Verify owner/admin/member/viewer capabilities.
- Verify viewer mutations are rejected and owner-only operations remain owner-only.
- Verify cross-workspace access is rejected.
- Verify admin endpoints reject non-admin identities.
- Verify identity comes from authenticated server-side state.
- Result: UNVERIFIED — production authorization verification pending.

### 6. Security boundaries and adversarial cases
- Verify unauthenticated protected requests, malformed UUID/input boundaries, Pusher private-channel authorization, Socket.IO authentication/join isolation, correlation-ID/error handling, and security/cost-critical rate limits.
- Use only safe, non-destructive production tests.
- Result: UNVERIFIED — production security-boundary verification pending.

### 7. API contracts and client/server integration
- Verify production frontend-to-backend requests, auth refresh/retry, public settings/reviews, workspace/task/comment/review/contact/admin/realtime contracts, and response/error shapes.
- Result: UNVERIFIED — production API integration pending.

### 8. Background jobs, notifications, and scheduled processes
- Verify applicable production email/notification and scheduled/background processes with controlled recipients.
- If a category is not used in production, record N/A — not applicable.
- Result: UNVERIFIED — production operational-process verification pending.

### 9. File/object storage
- Determine whether production uses file/object storage in the remediation scope.
- If applicable, verify authorized access boundaries; otherwise record N/A — not applicable.
- Result: UNVERIFIED — applicability/production verification pending.

### 10. Frontend/browser behavior
- Test the production application in a real browser: authentication bootstrap, protected navigation, workspace/Kanban/comments/member management, reviews/contact, and relevant realtime UI.
- Check browser console/network failures relevant to the remediation.
- Verify Pusher behavior from the production browser.
- Result: UNVERIFIED — production browser verification pending.

### 11. End-to-end/regression behavior
- Run a production-safe E2E/regression subset against the deployed application.
- Include both successful and failure paths and the intended workflows preserved by remediation.
- Result: UNVERIFIED — production E2E/regression verification pending.
- Limitation: The existing 30-test Playwright CI run is pre-production evidence and is not a substitute for this step.

### 12. Original functionality preserved
For each remediation, prove both:
1. the security/correctness boundary is fixed; and
2. the original intended user-facing behavior still works.

At minimum verify authentication/session continuity, workspace membership/roles, Kanban/tasks/comments, realtime collaboration/presence/events, AI task generation, reviews/contact, notifications where applicable, admin functionality, and public pages/API behavior.

- Result: UNVERIFIED — final production preservation evidence pending.

### Production evidence rule
An area may be marked VERIFIED only after recording the exact production test, target/deployment identity, observed result, date/time, and relevant evidence/artifacts, plus any limitation. A green CI run, successful build, preview deployment, or migration against a disposable database is not production verification.

## Production migration execution model

The CI PostgreSQL services are validation databases only. They prove that the committed migration set can build a clean schema and that E2E setup succeeds; they are not the production database.

Production schema changes are executed by the Vercel production build. The frontend build command checks `VERCEL_ENV`; only when it is `production` does it install the committed backend dependencies and run `npm run migrate` against Vercel's production `DATABASE_URL`. Preview/local builds do not run production migrations.

The migration runner remains idempotent through the `schema_migrations` table, applies only committed migration files not already recorded, verifies required tables afterward, and now takes a PostgreSQL advisory lock so concurrent Vercel production builds cannot race the same migration set. A migration failure exits non-zero and therefore prevents that Vercel build from completing.

This deliberately uses a cheap migration-state check on every production build rather than a Git-diff-only trigger. A later deployment must still detect and repair any previously unapplied committed migration even if that deployment contains only application changes.

The production migration path is therefore: **Vercel production build → migration state check → apply pending committed migrations if any → schema verification → Next.js build → deployment**. GitHub Actions remains responsible for disposable-database migration/build/E2E validation and does not receive the production database secret.
