---
globs: "{src,app}/**/*.tsx"
---

# UI Feedback

Prefer local feedback over global notifications.

Component Selection:
- **Button action** → inline loading/success/error states on the button
- **Visible result** (item disappears, list updates) → no feedback needed, result IS confirmation
- **Background task completes** → use `toast()` only when user navigated away
- **Undo needed** → use `toast()` with action button
- **System error** → use `toast.error()`
- **Destructive action** → use `AlertDialog` for confirmation first
- **Empty state / section warning** → use `Alert` component inline

Toast (restricted usage):
- Only for: background tasks after navigation, actions requiring undo, system errors
- Never use `toast.success()` when result is visible — redundant
- Never use `window.confirm()` — use `AlertDialog`
- Never toast in loops — causes stack pile-up

AlertDialog (destructive confirmation):
- Use shadcn `AlertDialog` for irreversible actions (delete, cancel booking)
- Always state what will be lost in the description
