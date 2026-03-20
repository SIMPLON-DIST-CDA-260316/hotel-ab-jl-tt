---
globs: "{src,app}/**/*.{ts,tsx}"
---

Two-layer strategy:
- Server Action / query errors → handle inline (form errors, toast, redirect)
- Unexpected JS crashes → caught by `error.tsx` (Next.js App Router) — display generic fallback

Server Action errors:
- Never throw raw errors to the client — return structured error objects
- Translate error messages to user language at the component level
- Log raw errors in English with error codes (`console.error`)

Error boundaries (`error.tsx`):
- One per route segment as needed
- Show a generic fallback (never expose raw error details to users)
- Use `reset()` function for retry

Typing:
- Catch errors as `unknown`, narrow with `instanceof` or type guards
- Define custom domain error types per feature when multiple error reasons exist
