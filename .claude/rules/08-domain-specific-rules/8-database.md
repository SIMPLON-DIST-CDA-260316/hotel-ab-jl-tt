---
globs: src/lib/db/**
---

# Base de données

- **SGBD :** PostgreSQL 16 (Docker `postgres:16-alpine`)
- **ORM :** Drizzle ORM (`drizzle-orm/pg-core`)
- **Connexion :** `src/lib/db/index.ts` via `DATABASE_URL`

## Schéma

`src/lib/db/schema.ts` contient les tables Better Auth (`user`, `session`, `account`, `verification`).
Les tables métier (establishment, suite, booking, etc.) sont à créer dans ce même fichier.

La table `user` de Better Auth est enrichie avec `role` et `deleted_at`.

## Better Auth

L'instance `auth` de `src/lib/auth.ts` est le point d'entrée Better Auth.
Les route handlers sont exposés via `app/api/auth/[...all]/route.ts`.

## Drizzle `numeric` → `string`

Les colonnes `numeric()` (price, totalPrice, area, etc.) sont retournées comme `string` par le driver `pg`.
- Toujours parser avec `Number()` avant toute arithmétique ou comparaison
- Ne jamais comparer directement des valeurs `numeric` avec `>`, `<`, `===` sans conversion
- Côté affichage, formater via `Intl.NumberFormat` après conversion

## Référence

Le modèle de données complet (MCD, MLD, règles de gestion) est documenté dans `docs/design/merise.md`.
