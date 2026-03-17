---
globs: src/**/*.{tsx,css}
---

# Tailwind CSS v4 + shadcn/ui

Theme — Single Source of Truth:
- All design tokens defined in CSS — no `tailwind.config.js`
- Two-layer architecture: semantic tokens in `:root` (OKLCH) + bridge via `@theme inline`
- Change brand color globally: edit CSS vars in `:root`

shadcn/ui Integration:
- Use shadcn components from `@/components/ui`
- Set `cssVariables: true` in `components.json`
- Use OKLCH for custom brand colors

CSS Variables:
- Prefer CSS variables over utility value literals
- Use `var(--color-red-500)` not `theme(colors.red.500)`

Custom Styles:
- **Utility classes in JSX** — preferred for simple styles
- **`@utility`** — for custom utilities needing variant support (`hover:`, `lg:`, etc.)
- **`@layer components`** — for complex component styles (use CSS vars, not `@apply`)
- **Never `@apply`** in scoped CSS / CSS Modules (loses theme context in v4)

Class Organization (order in JSX):
1. Layout (flex, grid, block)
2. Positioning (absolute, relative)
3. Sizing (w-, h-, max-, min-)
4. Spacing (p-, m-, gap-)
5. Typography (text-, font-)
6. Colors (bg-, text-, border-)
7. Effects (shadow-, opacity-, transition-)

Responsive Design:
- Mobile-first: base styles, then `sm:` `md:` `lg:` `xl:`
- Scope hover: `@media (hover: hover)` — avoid hover for critical functionality

Variants:
- Apply left-to-right: `*:first:pt-0` not `first:*:pt-0`
- Arbitrary CSS vars: `bg-(--brand-color)` not `bg-[--brand-color]`

Removed in v4 (avoid):
- `bg-opacity-50` → `bg-black/50`
- `@tailwind base` → `@import "tailwindcss"`
- `tailwindcss-animate` → `tw-animate-css`
- `theme(colors.x)` → CSS variables
