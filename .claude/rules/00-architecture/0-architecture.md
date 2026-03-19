---
globs: src/**
---

# Architecture feature-based

Flux d'import unidirectionnel : `shared` est importable par tous, `features/` importe depuis `shared` uniquement (jamais entre features), `app/` importe depuis `shared` et `features/`

## Layers (flat, pas de wrapper `shared/`)

- `src/components/` — UI partagée (ui/, layout/, form/)
- `src/hooks/` — hooks partagés
- `src/lib/` — bibliothèques partagées (db/, auth, utils)
- `src/stores/` — état app-wide uniquement (préférences UI, pas auth)
- `src/types/` — types partagés
- `src/config/` — configuration applicative
- `src/features/{domain}/` — modules métier auto-contenus
- `app/` — couche app, compose les features en pages

## Dependency rules (enforced par eslint-plugin-boundaries)

- Shared (components, hooks, lib, stores, types, config) : importable par tous
- `features/` importe depuis shared, jamais depuis d'autres features
- `app/` importe depuis shared ET features
- Layout components must be dumb (reçoivent les données via props depuis les pages)
- Cross-feature data flows through `app/` (les pages orchestrent)

## Feature folder (reproduit la structure globale)

- `features/{domain}/components/` — UI spécifique au domaine
- `features/{domain}/actions/` — Server Actions (mutations, `"use server"`)
- `features/{domain}/queries/` — fonctions de lecture serveur (Server Components)
- `features/{domain}/hooks/` — hooks client spécifiques
- `features/{domain}/lib/` — logique métier pure (pas de React)
- `features/{domain}/types/` — types TypeScript spécifiques
- Only include subfolders that exist (no empty scaffolding)

## State placement

- Feature store co-located dans `features/{domain}/`
- `src/stores/` uniquement pour l'état truly app-wide (UI prefs, pas auth)

## Imports

- No barrel files (`index.ts` re-exports) — perf en dev
- Import directly from source : `from './form/FormInput'` not `from './form'`
- Exception : `@/components/ui/*` (shadcn, single-export, coût négligeable)
- Alias `@/*` → `./src/*`

Référence : [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
