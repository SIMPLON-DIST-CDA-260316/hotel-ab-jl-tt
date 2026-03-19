---
globs: "**/*.{ts,tsx,mjs}"
---

# Language Convention

Code is in English, user-facing content is in French.

English (mandatory):
- Variable, function, type, and file names
- Code comments (including TODO)
- Console.log messages and error codes
- Git commit messages
- Route paths and URL segments (`/sign-in` not `/connexion`)
- Seed data identifiers (email, technical names)

French (mandatory):
- UI labels, button text, form placeholders, error messages shown to users
- Page titles and headings visible in the browser
- Alt text and ARIA labels (user-facing)

Grey zone:
- Seed data display names (e.g. hotel names, descriptions) → French (domain content)
- Documentation in `docs/` → French (audience is the team/school)
