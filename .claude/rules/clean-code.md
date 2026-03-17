---
globs: src/**/*.{ts,tsx}
---

Code Quality:
- Comment WHY, never WHAT
- Self-documenting code first, comments for intent/rationale
- No commented-out code
- Use strict types only
- Use explicit constants, never magic numbers
- Name constants by purpose, not by value (e.g. `DEFAULT_STALE_TIME` not `STALE_TIME_5MIN`)
- Avoid double negatives
- Use long, readable variable names
- Write the simplest code possible
- Prefer duplication over the wrong abstraction — DRY only when the pattern is proven (3+ occurrences)

Length Limits:
- Max 30 lines per function (relaxed for async Server Components with co-located data fetching)
- Max 5 params per function
- Max 300 lines per file

Responsibilities:
- One responsibility per file

Functions:
- No flag parameters

Errors:
- Fail fast
- Throw validation errors early
- Use custom domain errors
