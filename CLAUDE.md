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

Flux d'import unidirectionnel : `shared → features → app`

```
app/                        # Couche APP — routes Next.js (App Router)
src/
  components/
    ui/                     # shadcn/ui (pas de barrel index.ts)
    layout/                 # Header, Footer, etc. (dumb, props only)
    form/                   # Composants de formulaire partagés
  hooks/                    # Hooks partagés
  lib/
    db/
      index.ts              # Connexion Drizzle (drizzle-orm/bun-sql)
      schema.ts             # Schéma des tables
    auth.ts                 # Instance Better Auth exportée
    utils.ts                # cn() pour shadcn
  stores/                   # État app-wide uniquement (préférences UI)
  types/                    # Types partagés
  config/                   # Configuration applicative
  features/
    auth/
      components/           # LoginForm, RegisterForm
      actions/              # login.ts, register.ts
    etablissements/
      components/           # EtablissementCard, EtablissementList
      queries/              # get-etablissements.ts, get-etablissement-by-id.ts
    suites/
      components/           # SuiteCard, SuiteDetail
      queries/              # get-suite-by-id.ts, get-suites-by-etablissement.ts
    reservations/
      components/           # ReservationForm, ReservationList
      queries/              # get-reservations.ts, get-available-suites.ts
      actions/              # create-reservation.ts, cancel-reservation.ts
docs/                       # Cahier des charges, user stories, architecture
components.json             # Configuration shadcn/ui
```

**Règles de dépendance (enforced par eslint-plugin-boundaries) :**
- `shared` (components, hooks, lib, stores, types, config) : importable par tous
- `features/*` : importe depuis shared uniquement, jamais depuis d'autres features
- `app/` : importe depuis shared ET features
- Pas de barrel files (`index.ts`) sauf `@/components/ui/*` (shadcn)
- Alias `@/*` → `./src/*`

**Anatomie d'une feature** (créer uniquement les sous-dossiers nécessaires) :

| Dossier | Rôle |
|---------|------|
| `components/` | Composants React du domaine |
| `actions/` | Server Actions (mutations, `"use server"`) |
| `queries/` | Fonctions de lecture serveur (appelées dans Server Components) |
| `hooks/` | Hooks client spécifiques |
| `lib/` | Logique métier pure (pas de React) |
| `types/` | Types TypeScript spécifiques |

Le schéma `src/lib/db/schema.ts` contient les tables Better Auth. Les tables métier (etablissements, suites, reservations) sont à créer.

L'instance `auth` de `src/lib/auth.ts` est le point d'entrée Better Auth. Les route handlers doivent être exposés via `app/api/auth/[...all]/route.ts`.

## Contexte produit

Application de gestion pour l'hôtel **Clair de Lune**. Quatre rôles : visiteur, client, gérant, administrateur.

Routes prévues (voir `docs/ARCHITECTURE.md`) :
- Publiques : `/`, `/etablissements`, `/etablissements/[id]`, `/suites/[id]`, `/contact/[id]`
- Auth : `/inscription`, `/connexion`
- Client : `/reservations`
- Admin : `/admin/etablissements`, `/admin/gerants`
- Gérant : `/gerant/suites`

Les user stories détaillées avec critères d'acceptation sont dans `docs/user-stories.md`.
