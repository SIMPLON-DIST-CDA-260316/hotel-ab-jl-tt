---
globs: src/**/*.tsx
---

Semantic HTML:
- Never recreate native elements (`<button>`, `<a>`, `<dialog>`) with `<div>`
- Use `<nav>`, `<main>`, `<section>`, `<header>`, `<footer>` appropriately
- Radix/shadcn already handle ARIA — don't duplicate

Skip link:
- First focusable element in root layout
- Hidden visually, visible on focus
- Targets `<main>` via anchor `#main-content`

Forms:
- Add `autocomplete` on identity/address fields
- Link input to error via `aria-describedby`

Touch targets:
- Min 44x44px on isolated interactive elements (icon buttons)
- Pad with `p-2` minimum on icon-only buttons

Visual order:
- Never reorder interactive elements via CSS (`order`, `row-reverse`, `column-reverse`)
- DOM order = focus order = visual order

Keyboard:
- Test Tab flow before any layout PR
- Focus-visible styles required on all interactive elements
- Radix handles focus trap in dialogs — don't override
