# Architecture Feature-Based pour Next.js App Router

> **Auteur :** Julien Lemarchand
> **Créé le :** 2026-03-17
> **Dernière mise à jour :** 2026-03-17
> **Destinataire :** Thélio
> **Projet :** Hôtel Clair de Lune

---

## Contexte

Le projet utilise actuellement une structure Next.js App Router classique avec une couche MVC (cf. `docs/research/mvc-nextjs-architecture.md`). Ce document propose d'adopter une **architecture feature-based** inspirée de [Bulletproof React](https://github.com/alan2207/bulletproof-react) pour organiser le code métier de manière scalable et maintenable.

L'objectif est de **coloquer** tout ce qui concerne un domaine métier (composants, hooks, actions, types) dans un même dossier `feature/`, tout en gardant une couche partagée réutilisable.

---

## Principes fondamentaux

### 1. Séparation en couches

L'application se découpe en **trois couches** avec un flux d'import unidirectionnel :

```
shared (components, lib, hooks, types)
    ↓
features (modules métier auto-contenus)
    ↓
app (routes Next.js — composent les features)
```

### 2. Pas d'import croisé entre features

Une feature **ne doit jamais importer depuis une autre feature**. Si deux features doivent interagir, c'est la couche `app/` (les pages/layouts Next.js) qui orchestre la composition.

```
features/auth/   ←✗→   features/bookings/    # INTERDIT
```

### 3. Colocation

Tout ce qui concerne un domaine métier vit dans son dossier feature. On ne disperse pas les composants d'un côté, les hooks d'un autre, les types ailleurs. Chaque feature est un **module autonome**.

---

## Structure proposée pour le projet

```
hotel-clair-de-lune/
├── app/                          # Couche APP — routes Next.js
│   ├── layout.tsx                # Layout racine
│   ├── page.tsx                  # Page d'accueil
│   ├── (auth)/                   # Groupe de routes auth
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── rooms/
│   │   ├── page.tsx              # Liste des chambres
│   │   └── [id]/page.tsx         # Détail chambre
│   ├── bookings/
│   │   ├── page.tsx              # Mes réservations
│   │   └── [id]/page.tsx         # Détail réservation
│   └── admin/
│       ├── layout.tsx            # Layout admin protégé
│       ├── rooms/page.tsx        # Gestion des chambres
│       └── bookings/page.tsx     # Gestion des réservations
│
├── src/
│   ├── components/               # SHARED — UI réutilisable
│   │   ├── ui/                   # Composants génériques (Button, Input, Card...)
│   │   ├── layout/               # Header, Footer, Sidebar, PageLayout
│   │   └── form/                 # Composants de formulaire partagés
│   │
│   ├── lib/                      # SHARED — Utilitaires et config
│   │   ├── db.ts                 # Client Drizzle
│   │   ├── auth.ts               # Config Better Auth
│   │   ├── utils.ts              # Fonctions utilitaires
│   │   └── constants.ts          # Constantes globales
│   │
│   ├── hooks/                    # SHARED — Hooks réutilisables
│   │   └── use-mobile.ts
│   │
│   ├── types/                    # SHARED — Types globaux
│   │   └── domain.types.ts       # Types partagés entre features
│   │
│   └── features/                 # FEATURES — Modules métier
│       ├── auth/
│       │   ├── components/
│       │   │   ├── LoginForm.tsx
│       │   │   └── RegisterForm.tsx
│       │   ├── actions/          # Server Actions
│       │   │   ├── login.ts
│       │   │   └── register.ts
│       │   └── queries/          # Fonctions de requête serveur
│       │       └── get-session.ts
│       │
│       ├── rooms/
│       │   ├── components/
│       │   │   ├── RoomCard.tsx
│       │   │   ├── RoomList.tsx
│       │   │   ├── RoomFilters.tsx
│       │   │   └── RoomDetail.tsx
│       │   ├── actions/
│       │   │   ├── create-room.ts
│       │   │   ├── update-room.ts
│       │   │   └── delete-room.ts
│       │   ├── queries/
│       │   │   ├── get-rooms.ts
│       │   │   └── get-room-by-id.ts
│       │   └── types/
│       │       └── room.types.ts
│       │
│       └── bookings/
│           ├── components/
│           │   ├── BookingForm.tsx
│           │   ├── BookingCard.tsx
│           │   ├── BookingList.tsx
│           │   └── BookingCalendar.tsx
│           ├── actions/
│           │   ├── create-booking.ts
│           │   ├── cancel-booking.ts
│           │   └── confirm-booking.ts
│           ├── queries/
│           │   ├── get-bookings.ts
│           │   ├── get-booking-by-id.ts
│           │   └── get-available-rooms.ts
│           ├── lib/
│           │   ├── booking-validation.ts
│           │   └── date-helpers.ts
│           └── types/
│               └── booking.types.ts
│
├── db/
│   └── schema.ts                 # Schema Drizzle (source de vérité)
│
└── public/
```

---

## Anatomie d'une feature

Chaque feature peut contenir les sous-dossiers suivants (uniquement ceux nécessaires) :

| Dossier | Rôle | Exemple |
|---------|------|---------|
| `components/` | Composants React spécifiques au domaine | `RoomCard.tsx`, `BookingForm.tsx` |
| `actions/` | Server Actions Next.js (mutations) | `create-booking.ts` |
| `queries/` | Fonctions de requête serveur (lecture) | `get-rooms.ts` |
| `hooks/` | Hooks client spécifiques | `use-booking-form.ts` |
| `lib/` | Logique métier pure (pas de React) | `booking-validation.ts` |
| `types/` | Types TypeScript spécifiques | `booking.types.ts` |

### Principe : on ne crée un sous-dossier que s'il est nécessaire

Une petite feature comme `auth/` n'a peut-être que `components/` et `actions/`. Pas besoin de créer `lib/` ou `types/` vides.

---

## Flux d'import — Règles strictes

### Ce qui est autorisé

```typescript
// ✅ Une page (app/) importe depuis une feature
import { RoomList } from '@/features/rooms/components/RoomList'
import { getRooms } from '@/features/rooms/queries/get-rooms'

// ✅ Une feature importe depuis shared
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'

// ✅ Une feature importe depuis elle-même
import { RoomCard } from '../components/RoomCard'
import type { Room } from '../types/room.types'
```

### Ce qui est interdit

```typescript
// ❌ Une feature importe depuis une autre feature
import { getSession } from '@/features/auth/queries/get-session'
// → Solution : passer la session en prop depuis la page

// ❌ Une feature importe depuis app/
import { something } from '@/app/rooms/page'

// ❌ Shared importe depuis une feature
import { RoomCard } from '@/features/rooms/components/RoomCard'
```

### Comment gérer les dépendances entre features ?

Si `bookings` a besoin de la session utilisateur (qui vient de `auth`), c'est la **page** qui orchestre :

```tsx
// app/bookings/page.tsx — COUCHE APP
import { getSession } from '@/features/auth/queries/get-session'
import { getBookings } from '@/features/bookings/queries/get-bookings'
import { BookingList } from '@/features/bookings/components/BookingList'

export default async function BookingsPage() {
  const session = await getSession()
  const bookings = await getBookings(session.user.id)

  return <BookingList bookings={bookings} />
}
```

---

## Adaptation aux Server Components (Next.js App Router)

L'architecture feature-based a été popularisée dans des projets Vite/SPA avec React Query côté client. Avec Next.js App Router et les **React Server Components (RSC)**, certains patterns changent :

### Ce qui remplace quoi

| Pattern SPA classique | Équivalent Next.js App Router |
|---|---|
| API client + React Query | Server Components + `queries/` |
| `useMutation` + fetch | Server Actions dans `actions/` |
| État global (Zustand) | Souvent inutile — le serveur est la source de vérité |
| Route guards côté client | `middleware.ts` + vérification dans `layout.tsx` |

### Server Components vs Client Components dans une feature

```
features/rooms/
├── components/
│   ├── RoomList.tsx          # Server Component (async, fetch direct)
│   ├── RoomCard.tsx          # Server Component (présentation)
│   └── RoomFilters.tsx       # Client Component ("use client" — interactif)
```

**Règle simple :** un composant est Server Component par défaut. On ajoute `"use client"` uniquement s'il a besoin d'interactivité (state, event handlers, hooks).

### Server Actions

Les Server Actions remplacent les routes API pour les mutations :

```typescript
// features/bookings/actions/create-booking.ts
"use server"

import { db } from '@/lib/db'
import { bookings } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function createBooking(data: CreateBookingInput) {
  await db.insert(bookings).values(data)
  revalidatePath('/bookings')
}
```

### Queries (lecture serveur)

Les queries sont des fonctions async simples, appelées dans les Server Components :

```typescript
// features/rooms/queries/get-rooms.ts
import { db } from '@/lib/db'
import { rooms } from '@/db/schema'

export async function getRooms() {
  return db.select().from(rooms)
}
```

```tsx
// app/rooms/page.tsx
import { getRooms } from '@/features/rooms/queries/get-rooms'
import { RoomList } from '@/features/rooms/components/RoomList'

export default async function RoomsPage() {
  const rooms = await getRooms()
  return <RoomList rooms={rooms} />
}
```

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Dossiers | kebab-case | `features/bookings/` |
| Composants (fichiers) | PascalCase | `BookingCard.tsx` |
| Actions / Queries | kebab-case | `create-booking.ts`, `get-rooms.ts` |
| Types | kebab-case + suffixe `.types` | `booking.types.ts` |
| Hooks | kebab-case + préfixe `use-` | `use-booking-form.ts` |
| Lib / utils | kebab-case | `date-helpers.ts` |

---

## Configuration recommandée

### Path alias (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

> Note : les fichiers dans `app/` sont importés via des chemins relatifs depuis les pages. Les features et le shared sont importés via `@/`.

### ESLint — Contrôle des imports (optionnel mais recommandé)

Installer `eslint-plugin-boundaries` pour **forcer** les règles d'import :

```bash
bun add -D eslint-plugin-boundaries
```

```javascript
// eslint.config.js (extrait)
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/(components|hooks|lib|types)/*' },
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'app', pattern: 'app/*' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'disallow',
        rules: [
          // shared peut être importé par tout le monde
          { from: ['shared', 'feature', 'app'], allow: ['shared'] },
          // features peuvent être importées par app uniquement
          { from: ['app'], allow: ['feature'] },
          // features ne peuvent PAS importer d'autres features
          { from: ['feature'], disallow: ['feature'] },
        ],
      }],
    },
  },
]
```

---

## Checklist de mise en place

- [ ] Créer la structure `src/` avec `components/`, `lib/`, `hooks/`, `types/`
- [ ] Créer `src/features/` avec les trois features initiales : `auth/`, `rooms/`, `bookings/`
- [ ] Déplacer les composants existants dans la feature appropriée
- [ ] Déplacer `db/` et `utils/auth.ts` dans `src/lib/`
- [ ] Configurer le path alias `@/*` → `./src/*` dans `tsconfig.json`
- [ ] Créer les `queries/` pour chaque feature (lecture DB via Drizzle)
- [ ] Créer les `actions/` pour chaque feature (mutations via Server Actions)
- [ ] Adapter les pages `app/` pour composer les features
- [ ] (Optionnel) Configurer `eslint-plugin-boundaries` pour enforcer les règles d'import

---

## Liens utiles

- **Bulletproof React** — Architecture de référence : [github.com/alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react)
- **Bulletproof React — Next.js App Router** — Implémentation Next.js : [apps/nextjs-app](https://github.com/alan2207/bulletproof-react/tree/master/apps/nextjs-app)
- **Discussion communautaire** : [Discord — Canal architecture](https://discordapp.com/channels/1417152091939672126/1483014649078223002)
- **eslint-plugin-boundaries** — Enforcement des règles d'import : [github.com/javierbrea/eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)
- **Next.js App Router Docs** — Server Components & Server Actions : [nextjs.org/docs/app](https://nextjs.org/docs/app)
