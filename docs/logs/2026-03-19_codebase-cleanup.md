# Codebase Cleanup — 2026-03-19

Audit clean code complet orienté conventions de nommage, lisibilité et normalisation linguistique.

Branche : `review/codebase-cleanup`

## 1. Conventions de nommage

### Callbacks single-letter corrigés

Les paramètres single-letter dans les `.map()` ont été remplacés par des noms descriptifs (règle : *"No single-letter params in array callbacks"*).

| Fichier | Avant | Après |
|---|---|---|
| `DataTable.tsx` | `(col)` | `(column)` |
| `SchemaTable.tsx` | `(col)` | `(column)` |
| `ReservationList.tsx` | `(r, i)` | `(reservation, index)` |
| `db-viewer/page.tsx` | `(t)` x2 | `(tableEntry)`, `(tableView)` |

### Constante UPPER_SNAKE_CASE

| Fichier | Avant | Après |
|---|---|---|
| `TypeBadge.tsx` | `const colors` | `const TYPE_COLORS` |

### Props interfaces nommées

6 composants utilisaient des props inline au lieu d'interfaces nommées `{ComponentName}Props` :

- `DataTable` → `DataTableProps`
- `SchemaTable` → `SchemaTableProps`
- `TypeBadge` → `TypeBadgeProps`
- `ReservationList` → `ReservationListProps`
- `ReservationForm` → `ReservationFormProps`
- `SuiteDetail` → `SuiteDetailProps`

## 2. Suppression de `any`

`extract-columns.ts` contenait 7 occurrences de `any` (paramètre + `as any` casts).

- `table: any` → `table: Table` (import Drizzle)
- `(col as any).xxx` x5 → `(column as Column).xxx` avec types Drizzle

## 3. Variables sémantiques

### Variables génériques renommées

Les variables `result` / `results` ont été remplacées par des noms porteurs de sens, en particulier quand le scope d'utilisation dépasse 5 lignes.

| Fichier | Avant | Après | Raison |
|---|---|---|---|
| `db-viewer/page.tsx` | `results` / `(result)` | `tableViews` / `(tableView)` | Scope 27 lignes, accès `.title`, `.columns`, `.rows` |
| `has-active-bookings.ts` | `result` | `activeBookingCount` | Scope 12 lignes, chaîne `[0]?.count` |
| `get-establishment-by-id.ts` | `[result]` | `[foundEstablishment]` | Scope 17 lignes, retour d'un établissement |
| `delete-establishment.ts` | `result` | `softDeleteResult` | Scope 5 lignes, vérifie `.rowCount` |

### Conditions extraites en variables nommées

Conditions opaques extraites pour améliorer la lisibilité.

| Fichier | Avant | Après |
|---|---|---|
| `has-active-bookings.ts` | `return (activeBookingCount[0]?.count ?? 0) > 0` | `const hasAtLeastOne = ...` |
| `delete-establishment.ts` | `if (softDeleteResult.rowCount === 0)` | `const isEstablishmentNotFound = ...` |

## 4. Normalisation des routes (FR → EN)

Les routes d'URL ont été normalisées en anglais. Le contenu UI visible reste en français.

| Avant | Après | Fichiers impactés |
|---|---|---|
| `app/connexion/` | `app/sign-in/` | dossier renommé |
| `app/inscription/` | `app/sign-up/` | dossier renommé |
| `/reservations` (proxy) | `/bookings` (proxy) | `proxy.ts`, 2 actions |
| `/gerant` (proxy) | `/manager` (proxy) | `proxy.ts` |

Liens mis à jour dans : `proxy.ts`, `Header.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`, `unauthorized.tsx`, `cancel-reservation.ts`, `create-reservation.ts`.

## 5. Normalisation linguistique (code applicatif → anglais)

### Commentaires traduits

Tous les commentaires de code (TODO, section headers, notes) ont été traduits en anglais.

- `// TODO: vérifier rôle admin` → `// TODO: check admin role`
- `// Booking future — bloque la suppression...` → `// Future booking — blocks deletion...`
- `// Relations (pour le query builder Drizzle)` → `// Relations (for Drizzle query builder)`
- `// Establishment ↔ Option (N:N avec prix et inclusion)` → `// ... (N:N with price and inclusion)`
- Etc.

### Console.log et seed data traduits

| Fichier | Avant | Après |
|---|---|---|
| `seed.ts` | `"Seed terminé : ... établissements ..."` | `"Seed complete: ... establishments ..."` |
| `seed.ts` | `name: "Gérant Test"` | `name: "Manager Test"` |
| `seed.ts` | `email: "gerant@clairdelune.test"` | `email: "manager@clairdelune.test"` |

## 6. Port de `requireAdmin()` depuis main

Les 3 server actions admin (`create`, `update`, `delete`) avaient un `// TODO: check admin role` alors que le guard `requireAdmin()` existait et était déjà branché sur `main`.

- Import de `requireAdmin` ajouté dans les 3 actions
- `await requireAdmin()` appelé en première instruction
- TODOs obsolètes supprimés dans les 3 pages admin (la protection route est assurée par le proxy)

## 7. Extraction des magic strings en constantes nommées

3 fichiers de constantes créés pour éliminer les strings littérales répétées encodant de la logique métier. Les routes ne sont pas concernées (protégées par `typedRoutes`, voir §9).

### Constantes créées

| Fichier | Constantes | Consommateurs |
|---|---|---|
| `src/config/roles.ts` | `ROLES.ADMIN`, `.MANAGER`, `.CLIENT` | auth-guards, proxy, schema, seed, auth, create-establishment |
| `src/config/booking-statuses.ts` | `BOOKING_STATUSES.PENDING`, `.CONFIRMED`, `.CANCELLED`, `.COMPLETED` | schema (default), seed, has-active-bookings |
| `src/features/auth/lib/auth-error-codes.ts` | `AUTH_ERROR_CODES.INVALID_CREDENTIALS`, `.EMAIL_ALREADY_USED`, `.UNKNOWN_ERROR` | login, register, LoginForm, RegisterForm |

### Non modifié (par design)

- Les `pgEnum()` dans `schema.ts` — définitions source de vérité DB
- Les labels UI français dans le JSX — contenu, pas de la logique
- Les strings utilisées une seule fois dans un scope local

## 8. Correction des violations d'architecture feature-based

Trois violations du flux d'import unidirectionnel corrigées.

### `Role` type remonté dans le shared layer

Le type `Role` était défini dans `src/features/auth/types/auth.types.ts` mais consommé par `src/config/roles.ts` et `src/lib/auth-guards.ts` (shared → feature = interdit).

- `Role` extrait dans `src/types/role.types.ts`
- `auth.types.ts` conserve un re-export (`export type { Role } from "@/types/role.types"`) pour ne pas casser les imports internes à la feature

### `auth-guards.ts` remonté dans le shared layer

`auth-guards.ts` était dans `src/features/auth/lib/` mais consommé par les 3 actions de la feature `establishments` (cross-feature import = interdit).

- Déplacé vers `src/lib/auth-guards.ts` — infrastructure partagée, pas logique feature-spécifique
- Toutes ses dépendances sont déjà dans le shared layer (`@/lib/auth`, `@/config/roles`, `@/types/role.types`)

### Vérification post-refactoring

- `src/config/` : 0 import depuis `@/features/`
- `src/lib/` : 0 import depuis `@/features/`
- `src/types/` : 0 import depuis `@/features/`
- `src/features/establishments/` : 0 import depuis `@/features/auth/`

## 9. Typed routes — validation statique des chemins

### Pourquoi

Les routes sont des strings utilisées à travers tout le codebase (`<Link href>`, `redirect()`, `router.push()`, `revalidatePath()`). Plutôt que de les centraliser dans un objet de constantes, Next.js propose `typedRoutes` : les types sont **générés automatiquement** depuis l'arborescence `app/`, et TS valide les string literals à la compilation.

Les constantes `ROLES`, `BOOKING_STATUSES` et `AUTH_ERROR_CODES` n'ont pas d'équivalent — leurs valeurs sont comparées à des strings dynamiques au runtime (session API, form data, queries DB), donc les constantes `as const` restent nécessaires.

### Changements

- `next.config.mjs` : ajout de `experimental: { typedRoutes: true }`
- Les routes restent des string literals dans le code, protégées par le type system
- `login.ts` : `callbackUrl` casté via `as Parameters<typeof redirect>[0]>` (URL dynamique venant de l'utilisateur, non vérifiable statiquement)

### Bug détecté grâce aux typed routes

`SuiteDetail.tsx` contenait un `<Link href={`/suites/${suite.id}`}>` pointant vers une route inexistante (`app/suites/[id]/` n'existait pas). Placeholder créé : `app/suites/[id]/page.tsx`.

## 10. Déplacement de `LogoutButton` et fix ESLint

### Pourquoi

`LogoutButton` était dans `src/features/auth/components/` mais importé par `Header.tsx` (shared layer). Violation boundary : shared → feature.

Le composant ne contient aucune logique spécifique à la feature auth — il appelle `authClient.signOut()` et `router.push("/")`, toutes dépendances shared. Il reste un fichier séparé (pas inliné dans Header) car le Header est un Server Component et le `onClick` nécessite `"use client"`.

### Changements

- `src/features/auth/components/LogoutButton.tsx` → `src/components/layout/LogoutButton.tsx`
- Import mis à jour dans `Header.tsx`
- Fix `eslint --fix` sur `input.tsx` et `label.tsx` (semicolons manquants, composants shadcn)

### Résultat ESLint

0 erreur, 0 warning (hors deprecation `boundaries/element-types` → `boundaries/dependencies`, mise à jour de config à traiter séparément).

## 11. Ajout de `global-error.tsx`

Error boundary de dernier recours pour le root layout. Sans lui, si le root layout crash (ex: `auth.api.getSession()` dans le Header), l'utilisateur voit un écran blanc. Avec lui, un fallback avec bouton "Réessayer" s'affiche.

Note : `next build` échoue sur le prerendering de `/_global-error` avec `InvariantError: Expected workUnitAsyncStorage to have a store`. C'est un **bug Next.js 16.1.6 confirmé** ([#87719](https://github.com/vercel/next.js/issues/87719)), présent avant toutes nos modifications. `next dev`, `tsc --noEmit` et `eslint` fonctionnent normalement.

## Fichiers modifiés (résumé)

- **32 fichiers** modifiés dans `src/`, `app/` et racine
- **7 fichiers** créés (`roles.ts`, `booking-statuses.ts`, `auth-error-codes.ts`, `role.types.ts`, `global-error.tsx`, `suites/[id]/page.tsx`, `sign-in/page.tsx` + `sign-up/page.tsx` renommés)
- **2 fichiers** déplacés (`auth-guards.ts`, `LogoutButton.tsx` : feature → shared)
- **2 dossiers** renommés (`connexion` → `sign-in`, `inscription` → `sign-up`)
- **0 nouvelle dépendance** ajoutée
- `tsc --noEmit` : clean
- ESLint : clean (0 erreur, 0 warning)
- `next build` : compile OK, prerendering bloqué par bug Next.js #87719 (pré-existant)
