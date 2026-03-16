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
- **React 19** + **Tailwind CSS 4**
- **Drizzle ORM** + **SQLite** via le driver natif Bun (`drizzle-orm/bun-sql`)
- **Better Auth** pour l'authentification, connecté à Drizzle via `@better-auth/drizzle-adapter`
- **Bun** comme runtime et package manager

## Architecture

```
app/          # Routes Next.js (App Router)
db/
  index.ts    # Connexion Drizzle (drizzle-orm/bun-sql)
  schema.ts   # Schéma des tables (user, session, account, verification)
utils/
  auth.ts     # Instance Better Auth exportée
docs/         # Cahier des charges, user stories, architecture
drizzle/      # Migrations générées par drizzle-kit
```

Le schéma `db/schema.ts` contient uniquement les tables Better Auth pour le moment (user, session, account, verification). Les tables métier (établissements, suites, réservations) sont à créer.

L'instance `auth` de `utils/auth.ts` est le point d'entrée pour tout ce qui touche à l'authentification. Les route handlers Better Auth doivent être exposés via `app/api/auth/[...all]/route.ts`.

## Contexte produit

Application de gestion pour l'hôtel **Clair de Lune**. Quatre rôles : visiteur, client, gérant, administrateur.

Routes prévues (voir `docs/ARCHITECTURE.md`) :
- Publiques : `/`, `/etablissements`, `/etablissements/[id]`, `/suites/[id]`, `/contact/[id]`
- Auth : `/inscription`, `/connexion`
- Client : `/reservations`
- Admin : `/admin/etablissements`, `/admin/gerants`
- Gérant : `/gerant/suites`

Les user stories détaillées avec critères d'acceptation sont dans `docs/user-stories.md`.
