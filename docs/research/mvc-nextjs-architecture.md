# Architecture MVC avec Next.js, Drizzle ORM, SQLite, Tailwind CSS & Better Auth

## Vue d'ensemble

Ce document décrit comment structurer une application Next.js (App Router) en suivant une approche **MVC claire et maintenable**, en utilisant :

- **Next.js 14+** — Framework full-stack React (App Router)
- **Drizzle ORM** — Couche d'accès aux données type-safe
- **SQLite** — Base de données embarquée (idéale pour démarrer)
- **Tailwind CSS** — Styling utilitaire
- **Better Auth** — Authentification moderne et flexible

---

## Les trois couches MVC mappées sur Next.js

| Couche MVC   | Rôle                                 | Équivalent Next.js / stack          |
|--------------|--------------------------------------|-------------------------------------|
| **Model**    | Données, schéma, accès BDD           | Drizzle ORM + SQLite                |
| **View**     | Interface utilisateur                | React Server/Client Components + Tailwind CSS |
| **Controller** | Logique métier, orchestration      | Server Actions + Route Handlers     |

---

## Structure de projet recommandée

```
my-app/
├── app/                          # App Router Next.js
│   ├── (auth)/                   # Route group : pages d'authentification
│   │   ├── login/
│   │   │   └── page.tsx          # VIEW — page de connexion
│   │   └── register/
│   │       └── page.tsx          # VIEW — page d'inscription
│   ├── (dashboard)/              # Route group : espace protégé
│   │   ├── layout.tsx            # Layout avec vérification de session
│   │   └── dashboard/
│   │       └── page.tsx          # VIEW — tableau de bord
│   ├── api/                      # Route Handlers (CONTROLLER côté API)
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      # Handler Better Auth
│   └── layout.tsx                # Layout racine
│
├── components/                   # VIEW — composants réutilisables
│   ├── ui/                       # Composants atomiques (boutons, inputs...)
│   └── features/                 # Composants par domaine métier
│
├── server/                       # Logique serveur (CONTROLLER + MODEL)
│   ├── actions/                  # CONTROLLER — Server Actions
│   │   ├── auth.actions.ts
│   │   └── user.actions.ts
│   ├── services/                 # CONTROLLER — Logique métier pure
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   └── db/                       # MODEL — Drizzle ORM
│       ├── index.ts              # Connexion SQLite
│       ├── schema.ts             # Définition des tables
│       └── migrations/           # Fichiers de migration Drizzle
│
├── lib/                          # Utilitaires partagés
│   ├── auth.ts                   # Configuration Better Auth
│   └── validators/               # Schémas de validation (Zod)
│       └── user.schema.ts
│
├── types/                        # Types TypeScript globaux
│   └── index.ts
│
├── drizzle.config.ts             # Configuration Drizzle Kit
└── middleware.ts                 # Protection des routes (Better Auth)
```

---

## MODEL — Drizzle ORM + SQLite

### Configuration de la connexion (`server/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');

export const db = drizzle(sqlite, { schema });
```

### Définition du schéma (`server/db/schema.ts`)

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Table users — gérée en partie par Better Auth
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Table sessions — gérée par Better Auth
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Exemple : table métier personnalisée
export const posts = sqliteTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  content: text('content'),
  authorId: text('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date()),
});
```

### Configuration Drizzle Kit (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
});
```

**Commandes utiles :**

```bash
# Générer une migration
npx drizzle-kit generate

# Appliquer les migrations
npx drizzle-kit migrate

# Ouvrir Drizzle Studio (UI de gestion)
npx drizzle-kit studio
```

---

## CONTROLLER — Services & Server Actions

### Principe de séparation

- **Services** → logique métier pure, testable, sans dépendance à Next.js
- **Server Actions** → pont entre le client React et les services, valident les entrées

### Service utilisateur (`server/services/user.service.ts`)

```typescript
import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export const userService = {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  },

  async findAll() {
    return db.select().from(users);
  },

  async updateProfile(id: string, data: { name?: string; image?: string }) {
    return db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
  },
};
```

### Server Action utilisateur (`server/actions/user.actions.ts`)

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { userService } from '@/server/services/user.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(50),
});

export async function updateProfileAction(formData: FormData) {
  // 1. Vérification de la session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Non authentifié');

  // 2. Validation des données
  const parsed = updateProfileSchema.safeParse({
    name: formData.get('name'),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // 3. Appel au service
  await userService.updateProfile(session.user.id, parsed.data);

  // 4. Revalidation du cache
  revalidatePath('/dashboard');
  return { success: true };
}
```

---

## Authentification — Better Auth

### Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/server/db';
import * as schema from '@/server/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user: schema.users,
      session: schema.sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Ajouter GitHub, Google, etc. si nécessaire
  },
});
```

### Route Handler Better Auth (`app/api/auth/[...all]/route.ts`)

```typescript
import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth);
```

### Protection des routes (`middleware.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const PROTECTED_ROUTES = ['/dashboard', '/profile', '/settings'];

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);
  const isProtected = PROTECTED_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## VIEW — Composants React + Tailwind CSS

### Principe de découpage des composants

- **Server Components** → fetch de données, rendu statique ou dynamique, pas d'interactivité
- **Client Components** (`'use client'`) → formulaires, états locaux, interactions utilisateur

### Exemple : page Dashboard (Server Component)

```tsx
// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { userService } from '@/server/services/user.service';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileCard } from '@/components/features/ProfileCard';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  const user = await userService.findById(session.user.id);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Bonjour, {user?.name} 👋
      </h1>
      <ProfileCard user={user} />
    </main>
  );
}
```

### Exemple : formulaire de mise à jour (Client Component)

```tsx
// components/features/UpdateProfileForm.tsx
'use client';

import { updateProfileAction } from '@/server/actions/user.actions';
import { useTransition } from 'react';

interface Props {
  currentName: string;
}

export function UpdateProfileForm({ currentName }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => updateProfileAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom affiché
        </label>
        <input
          id="name"
          name="name"
          defaultValue={currentName}
          className="w-full rounded-lg border border-gray-300 px-4 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? 'Enregistrement...' : 'Sauvegarder'}
      </button>
    </form>
  );
}
```

---

## Flux de données complet (de bout en bout)

```
Utilisateur
    │
    ▼
[VIEW] page.tsx (Server Component)
    │  — vérifie la session via Better Auth
    │  — appelle le service pour les données initiales
    ▼
[VIEW] ClientComponent.tsx
    │  — affiche le formulaire (Tailwind CSS)
    │  — déclenche une Server Action au submit
    ▼
[CONTROLLER] user.actions.ts (Server Action)
    │  — valide les entrées (Zod)
    │  — vérifie les autorisations
    │  — délègue au service
    ▼
[CONTROLLER] user.service.ts (Service)
    │  — contient la logique métier pure
    │  — appelle le repository Drizzle
    ▼
[MODEL] Drizzle ORM + SQLite
    │  — exécute la requête SQL type-safe
    │  — retourne les données
    ▼
(remonte la chaîne — revalidatePath déclenche un re-render)
```

---

## Installation & démarrage

```bash
# 1. Initialiser le projet
npx create-next-app@latest my-app --typescript --tailwind --app

cd my-app

# 2. Installer les dépendances
npm install drizzle-orm better-sqlite3
npm install better-auth
npm install zod
npm install -D drizzle-kit @types/better-sqlite3

# 3. Générer et appliquer le schéma
npx drizzle-kit generate
npx drizzle-kit migrate

# 4. Lancer le développement
npm run dev
```

---

## Bonnes pratiques

| Règle | Raison |
|---|---|
| Garder les Server Actions **minces** — déléguer aux services | Testabilité et réutilisabilité |
| Ne jamais exposer `db` directement dans les composants | Respecter la séparation des couches |
| Valider **toutes** les entrées avec Zod dans les actions | Sécurité et robustesse |
| Utiliser `revalidatePath` / `revalidateTag` après les mutations | Cohérence des données affichées |
| Préférer les **Server Components** par défaut | Performance et sécurité (données non exposées au client) |
| Migrer vers **PostgreSQL** (Neon, Supabase) quand SQLite devient limitant | Scalabilité en production |

---

## Migration future vers PostgreSQL

Drizzle rend cette transition indolore :

```typescript
// server/db/index.ts — remplacer uniquement cette configuration
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

Le schéma, les services et les actions **ne changent pas**.

---

*Document généré pour le projet — Stack : Next.js 14+ · Drizzle ORM · SQLite → PostgreSQL · Tailwind CSS · Better Auth*
