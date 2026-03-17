---
globs: src/**/*.{ts,tsx}
---

Strict Types:
- Enable `strict` mode
- Never use `any` (use `unknown` only if truly necessary)
- Explicit return types for exported functions
- Type all props interfaces
- Avoid `as` for type conversion
- Use type guards for assertions
- Use generics for reusable functions

Interfaces and Types:
- Use `interface` for extensible objects
- Use `type` for unions and primitives

Nullability:
- Avoid `null` and `undefined` in returns

Enumerations:
- Prefer string literal unions to enums
- Use const enums if needed
- Define enum values explicitly

Utility Types:
- `Partial<T>` — all props optional
- `Required<T>` — all props required
- `Pick<T, K>` — subset of props
- `Omit<T, K>` — exclude props
- `Record<K, V>` — key-value map

`satisfies` operator:
- Prefer `satisfies Type` over `: Type` for config objects and records
- Preserves literal types while validating structure
- Combine with `as const` when both literal values AND structure validation are needed

Exhaustiveness checking:
- Use `switch` + `default` guard on all string literal unions
- `default: throw new Error(\`Unhandled case: ${value satisfies never}\`)`
- Prefer `switch` over if/else chains on unions for exhaustiveness safety

Errors:
- Catch errors as `unknown`

Type Guards:
- Use for runtime type assertions instead of `as`
