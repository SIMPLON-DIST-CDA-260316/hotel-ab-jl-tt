---
paths:
  - "src/**"
---

Layers (flat, no `shared/` wrapper):
- `src/components/` — shared UI (ui/, layout/, form/)
- `src/hooks/` — shared hooks
- `src/lib/` — shared libraries (api/, query/, config, utils)
- `src/stores/` — app-wide state only (UI preferences)
- `src/types/` — shared types (OpenAPI)
- `src/config/` — app configuration
- `src/features/{domain}/` — self-contained business modules
- `src/routes/` — app layer, composes features into pages

Dependency rules:
- Shared code (components, hooks, lib, stores, types) can be used by anyone
- `features/` can import from shared, never from other features
- `routes/` (app layer) can import from shared AND features
- Layout components must be dumb (receive feature data via props from routes)
- Cross-feature data flows through `routes/`

Feature folder (reproduces global structure):
- `features/{domain}/components/` — feature-scoped UI
- `features/{domain}/hooks/` — feature-scoped hooks
- `features/{domain}/` — store, types, utils at root
- Only include subfolders that exist (no empty scaffolding)

State placement:
- Feature store co-located in `features/{domain}/`
- `src/stores/` only for truly app-wide state (UI prefs, not auth)

Imports:
- No barrel files (`index.ts` re-exports) — Vite perf in dev
- Import directly from source: `from './form/FormInput'` not `from './form'`
- Exception: `@/components/ui/*` (shadcn, single-export, negligible cost)

Reference: [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
