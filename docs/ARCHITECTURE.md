# Architecture technique — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand
> **Créé le :** 2026-03-16
> **Dernière mise à jour :** 2026-03-18

## 1. Vue d'ensemble

```
┌─────────────┐     ┌──────────────────────────────┐     ┌─────────────┐
│   Client    │────▶│     Next.js App Router        │────▶│ PostgreSQL  │
│ (Navigateur)│◀────│  (Server Components + Actions)│◀────│  (Drizzle)  │
└─────────────┘     └──────────────────────────────┘     └─────────────┘
```

**Pattern architectural :** Feature-based avec React Server Components (RSC)

- **Organisation** : feature-based — chaque domaine métier est un module auto-contenu dans `src/features/{domain}/` (components, actions, queries, types)
- **Flux d'import** : unidirectionnel — `shared` est importable par tous, `features/` importe depuis `shared` uniquement (jamais entre features), `app/` importe depuis `shared` et `features/` (enforced par eslint-plugin-boundaries)
- **Routing** : fichier (`app/` directory) — compose les features en pages
- **Rendu** : Server Components par défaut, Client Components pour l'interactivité
- **Mutations** : Server Actions (`"use server"`) colocalisées dans `src/features/{domain}/actions/`
- **Data fetching** : queries colocalisées dans `src/features/{domain}/queries/`, appelées depuis les Server Components
- **Shared layer** : `src/components/`, `src/lib/`, `src/hooks/` — importable par tous

Référence : [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)

## 2. Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework | Next.js (App Router) | SSR/RSC natif, routing fichier, Server Actions intégrées |
| Langage | TypeScript | Typage strict, DX, écosystème React |
| Runtime | Bun | Performances, compatibilité Node.js, package manager intégré |
| UI | React 19 + Tailwind CSS 4 | Composants serveur/client, utility-first CSS |
| Composants UI | shadcn/ui (Radix) | Accessibilité ARIA native, personnalisable |
| Base de données | PostgreSQL 16 | SGBD relationnel robuste, jsonb, contraintes avancées |
| ORM | Drizzle ORM | Type-safe, SQL-like, zero runtime overhead |
| Authentification | Better Auth | Sessions, rôles, route handler `/api/auth/[...all]` |
| Conteneurisation | Docker + Docker Compose | Environnement reproductible (dev et prod) |

## 3. Modèle de données

Le modèle de données complet (dictionnaire de données, MCD, MLD, MPD, règles de gestion) est documenté dans [`docs/design/merise.md`](design/merise.md).

L'implémentation physique est dans `src/lib/db/schema.ts` (Drizzle ORM).

## 4. Architecture des routes

> **Next.js App Router** : chaque route correspond à un fichier `page.tsx` (routing fichier).
> Les mutations passent par des **Server Actions** (`"use server"`) colocalisées dans `src/features/{domain}/actions/`,
> pas par des routes HTTP. Les seules routes API sont celles de Better Auth.

### 4.1 Accueil

| Page | Fichier |
|------|---------|
| `/` | `app/page.tsx` |

### 4.2 Establishments

| Page | Fichier | Description |
|------|---------|-------------|
| `/establishments` | `app/establishments/page.tsx` | Liste publique des établissements |
| `/establishments/[id]` | `app/establishments/[id]/page.tsx` | Détail d'un établissement et ses suites |
| `/admin/establishments` | `app/admin/establishments/page.tsx` | Gestion admin — liste |
| `/admin/establishments/new` | `app/admin/establishments/new/page.tsx` | Gestion admin — création |
| `/admin/establishments/[id]/edit` | `app/admin/establishments/[id]/edit/page.tsx` | Gestion admin — modification |

| Server Action | Description |
|---------------|-------------|
| `createEstablishment` | Créer un établissement |
| `updateEstablishment` | Modifier un établissement |
| `deleteEstablishment` | Supprimer un établissement (soft delete) |

### 4.3 Suites

| Page | Fichier | Description |
|------|---------|-------------|
| `/suites/[id]` | `app/suites/[id]/page.tsx` | Détail public d'une suite (galerie, prix) |
| `/manager/suites` | `app/manager/suites/page.tsx` | Gestion gérant — liste |
| `/manager/suites/new` | `app/manager/suites/new/page.tsx` | Gestion gérant — création |
| `/manager/suites/[id]/edit` | `app/manager/suites/[id]/edit/page.tsx` | Gestion gérant — modification |

| Server Action | Description |
|---------------|-------------|
| `createSuite` | Créer une suite |
| `updateSuite` | Modifier une suite |
| `deleteSuite` | Supprimer une suite (soft delete) |

### 4.4 Managers

| Page | Fichier | Description |
|------|---------|-------------|
| `/admin/managers` | `app/admin/managers/page.tsx` | Gestion admin — liste |
| `/admin/managers/new` | `app/admin/managers/new/page.tsx` | Gestion admin — création |
| `/admin/managers/[id]/edit` | `app/admin/managers/[id]/edit/page.tsx` | Gestion admin — modification |

| Server Action | Description |
|---------------|-------------|
| `createManager` | Créer un gérant |
| `updateManager` | Modifier un gérant |
| `deleteManager` | Supprimer un gérant (soft delete) |

### 4.5 Bookings

| Page | Fichier | Description |
|------|---------|-------------|
| `/bookings` | `app/bookings/page.tsx` | Mes réservations (espace client) |

| Server Action | Description |
|---------------|-------------|
| `createBooking` | Créer une réservation |
| `cancelBooking` | Annuler une réservation |

### 4.6 Inquiries

| Page | Fichier | Description |
|------|---------|-------------|
| `/inquiries/[id]` | `app/inquiries/[id]/page.tsx` | Formulaire de contact (lié à un établissement) |

| Server Action | Description |
|---------------|-------------|
| `sendInquiry` | Envoyer un message de contact |

### 4.7 Authentification

| Page | Fichier | Description |
|------|---------|-------------|
| `/sign-up` | `app/sign-up/page.tsx` | Formulaire d'inscription client |
| `/sign-in` | `app/sign-in/page.tsx` | Formulaire de connexion |

> L'authentification est gérée par Better Auth via la route API `/api/auth/[...all]`.
> Les pages `sign-up` et `sign-in` utilisent le client Better Auth, pas des Server Actions custom.

### 4.8 Routes API

| Route | Description |
|-------|-------------|
| `/api/auth/[...all]` | Better Auth — sessions, inscription, connexion, déconnexion |

## 5. Sécurité

| Aspect | Mesure |
|--------|--------|
| Mots de passe | Hashage géré par Better Auth (bcrypt) |
| Contrôle d'accès | Rôles : `admin`, `manager`, `client` (colonne `role` sur `user`) |
| Validation | Côté client (formulaires) + côté serveur (Server Actions, Zod) |
| Protection CSRF | Natif via Server Actions (Next.js vérifie l'`Origin` header) |
| Upload d'images | Validation type MIME, taille max, renommage |
| SQL injection | Drizzle ORM — requêtes paramétrées |
| XSS | Échappement automatique par React (JSX) |
| Pages d'erreur | `forbidden.tsx` (403) et `unauthorized.tsx` (401) — fallback pour les accès non autorisés |

## 6. Gestion des images

| Paramètre | Valeur |
|-----------|--------|
| Formats acceptés | _À définir (jpg, png, webp)_ |
| Taille max | _À définir_ |
| Stockage | Phase 1 : fichiers statiques dans `public/` (URLs relatives). Phase 2 : Supabase Storage (buckets) si le temps le permet |
| Redimensionnement | _À définir_ |

## 7. Environnements

| Environnement | Usage |
|---------------|-------|
| **dev** | Développement local (Docker + Bun) |
| **prod** | Vercel (Next.js) + Supabase (PostgreSQL) |

## 8. Décisions à prendre

- [x] ~~Choix du framework~~ → Next.js (App Router)
- [x] ~~Choix de la base de données~~ → PostgreSQL 16
- [x] ~~Choix du framework CSS~~ → Tailwind CSS 4 + shadcn/ui
- [x] ~~Réalisation des diagrammes MERISE~~ → `docs/design/merise.md`
- [x] ~~Stratégie de stockage des images~~ → `public/` puis Supabase Storage si temps
- [x] ~~Stratégie de déploiement~~ → Vercel + Supabase
- [ ] Diagramme de cas d'utilisation UML
