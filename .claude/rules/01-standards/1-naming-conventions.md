---
globs: src/**/*.{ts,tsx}
---

General:
- Use descriptive names
- Reveal intent in all names
- No single-letter names (except loops)
- No abbreviations except common ones
- Use consistent terminology

Functions and Methods:
- Use verbs for actions
- Use nouns for value-returning
- Prefix booleans with `is`, `has`, `should`

Variables and Properties:
- Use plural for arrays/collections

Constants:
- Use UPPER_SNAKE_CASE
- Scope constants appropriately
- Group related constants in enum or object

Classes and Interfaces:
- PascalCase for names, nouns or noun phrases

Types and Enums:
- Types: `PascalCase` (e.g., `ApiResponse`)
- Type files: `kebab-case.types.ts`

Functions:
- Use camelCase for names

Array Method Callbacks:
- No single-letter params (`(p)`, `(t)` — forbidden)
- Use singular form of collection name (`tasks.filter((task) => ...)`)
- Destructure when callback accesses only 1-2 properties
- Keep full parameter when object is passed as a whole or is a primitive

File Naming:
- Components: `PascalCase.tsx`
- Hooks: `use-kebab-case.ts`
- Actions/Queries: `kebab-case.ts`
- Utils: `kebab-case.ts`
- Types: `kebab-case.types.ts`
