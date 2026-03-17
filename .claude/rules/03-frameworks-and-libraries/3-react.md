---
globs: src/**/*.tsx
---

Component Structure:
- Functional components only
- Props interface named `{ComponentName}Props`
- Named exports only — except Next.js conventions (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`) which require `export default`
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
- Don't memoize by default — only when profiling shows a real problem
- `React.memo()` only for components with expensive render and frequent parent re-renders
- `useMemo` only for genuinely costly computations — never for simple primitives or expressions
- `useCallback` only when passing callbacks to memoized children or as effect dependencies
- Prefer extracting a sub-component over wrapping in `React.memo()`

Error Boundaries:
- Wrap routes in `error.tsx` (Next.js App Router convention)
- Use for unexpected JS crashes only
- Do not use error boundaries for expected validation errors

Style and Accessibility:
- Mobile-first
- Prefer `@/components/ui` (shadcn/Radix) — ARIA and keyboard nav included
- Use semantic HTML elements
- Do not add ARIA attributes that Radix already handles
