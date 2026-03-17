---
globs: src/**/*.tsx
---

Component Structure:
- Functional components only
- Props interface named `{ComponentName}Props`
- No default exports — named exports only
- Keep components light and small
- One component per file (except tiny private components)
- Return `null` if mandatory props are missing

Separation:
- Split into sub-components by responsibility
- Move shared components outside the parent folder
- Smart/dumb pattern: smart handles data/logic, dumb displays only
- Server Components by default — add `"use client"` only for interactivity (state, events, hooks)

State:
- Server is the source of truth (Server Components + Server Actions)
- `src/stores/` only for truly app-wide UI state (preferences)
- Avoid prop drilling — use context or stores for deep trees

Hooks:
- Custom hooks prefix: `use*`
- Extract complex logic to custom hooks
- Follow Rules of Hooks (no conditionals, loops)

Performance:
- `React.memo()` for expensive components
- `useMemo` / `useCallback` for expensive computations / stable callbacks

Error Boundaries:
- Wrap routes in `error.tsx` (Next.js App Router convention)
- Use for unexpected JS crashes only
- Do not use error boundaries for expected validation errors

Style and Accessibility:
- Mobile-first
- Prefer `@/components/ui` (shadcn/Radix) — ARIA and keyboard nav included
- Use semantic HTML elements
- Do not add ARIA attributes that Radix already handles
