# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes

```bash
bun run dev        # Serveur de développement sur :3000
bun run build      # Build de production
bun run lint       # ESLint
bun run db:push    # Applique le schéma Drizzle à la base SQLite
```

## Stack

- **Next.js 16** (App Router) — routing, server components, server actions
- **React 19** + **Tailwind CSS 4** + **shadcn/ui**
- **Drizzle ORM** + **SQLite** via le driver natif Bun (`drizzle-orm/bun-sql`)
- **Better Auth** pour l'authentification, connecté à Drizzle via `@better-auth/drizzle-adapter`
- **Bun** comme runtime et package manager

## Architecture (feature-based)

```
src/
  app/                    # Routes Next.js (App Router) — couche composition
  components/
    ui/                   # Composants shadcn/ui (pas de barrel index.ts)
    layout/               # Composants de mise en page (dumb, props only)
    form/                 # Composants de formulaire partagés
  hooks/                  # Hooks partagés
  lib/
    db/
      index.ts            # Connexion Drizzle (drizzle-orm/bun-sql)
      schema.ts           # Schéma des tables Better Auth + métier
    auth.ts               # Instance Better Auth exportée
    utils.ts              # Utilitaire cn() pour shadcn
  stores/                 # État app-wide uniquement (préférences UI)
  types/                  # Types partagés (OpenAPI, etc.)
  config/                 # Configuration applicative
  features/{domain}/      # Modules métier auto-suffisants
    components/           # UI spécifique au domaine
    hooks/                # Hooks spécifiques au domaine
docs/                     # Cahier des charges, user stories, architecture
drizzle/                  # Migrations générées par drizzle-kit
components.json           # Configuration shadcn/ui
```

**Règles de dépendance :**
- `components/`, `hooks/`, `lib/`, `stores/`, `types/` sont importables par tous
- `features/*` importe depuis shared, jamais depuis d'autres features
- `app/` (routes) importe depuis shared ET features
- Pas de barrel files (`index.ts`) sauf `@/components/ui/*` (shadcn, coût négligeable)
- Alias `@/*` → `./src/*`

Le schéma `src/lib/db/schema.ts` contient uniquement les tables Better Auth pour le moment. Les tables métier sont à créer.

L'instance `auth` de `src/lib/auth.ts` est le point d'entrée pour tout ce qui touche à l'authentification. Les route handlers Better Auth doivent être exposés via `src/app/api/auth/[...all]/route.ts`.

## Contexte produit

Application de gestion pour l'hôtel **Clair de Lune**. Quatre rôles : visiteur, client, gérant, administrateur.

Routes prévues (voir `docs/ARCHITECTURE.md`) :
- Publiques : `/`, `/etablissements`, `/etablissements/[id]`, `/suites/[id]`, `/contact/[id]`
- Auth : `/inscription`, `/connexion`
- Client : `/reservations`
- Admin : `/admin/etablissements`, `/admin/gerants`
- Gérant : `/gerant/suites`

Les user stories détaillées avec critères d'acceptation sont dans `docs/user-stories.md`.
