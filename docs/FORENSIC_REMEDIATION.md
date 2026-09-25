# FlowSync Forensic Remediation Record

## Baseline / branch state
- Repository: MrDoVersaworks/FlowSync
- Audit branch: audit-remediation
- Baseline SHA: 91d931f5f7cc30436a4b0cee293859f59e9d34e3
- main and audit-remediation both pointed at the baseline SHA before remediation work.
- Main must not be modified.

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
