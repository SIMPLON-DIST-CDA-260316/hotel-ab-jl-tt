---
globs: src/features/**/actions/*.ts, src/features/**/queries/*.ts
---

# Authorization

Guards are in `src/lib/auth-guards.ts` — shared infrastructure, not feature-specific.

Server Actions and protected queries:
- Call `requireAdmin()`, `requireManager()`, or `requireSession()` as the **first instruction** — before any validation or data access
- Never rely solely on proxy middleware for authorization — middleware is a UX redirect, guards are the security boundary
- Use `requireOwnership(session, ownerId)` when a manager should only act on their own resources

Authorization is NOT authentication:
- `features/auth/` handles authn (login, register, forms)
- `src/lib/auth-guards.ts` handles authz (role checks, ownership)
- Do not mix concerns — a guard function should not import from `features/auth/`
