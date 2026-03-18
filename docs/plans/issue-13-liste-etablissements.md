# Plan: #13 — Voir la liste des établissements

**Created:** 2026-03-18
**Status:** ✅ Implémenté — 2026-03-18
**Source:** Issue #13, Epic #1
**Scope:** Query Drizzle + route Next.js + composants feature
**Effort total:** ~2h
**Best practices appliquées:** `async-suspense-boundaries`, `server-serialization`, `bundle-barrel-imports`

---

## Vue d'ensemble

| Étape | Contenu | Effort | Status |
|-------|---------|--------|--------|
| **S1** | Query Drizzle `getEtablissements` | 15min | ✅ |
| **S2** | Composant `EtablissementCard` typé | 20min | ✅ ~divergence~ |
| **S3** | Composant `EtablissementList` typé | 10min | ✅ |
| **S4** | Route `app/etablissements/page.tsx` (Suspense + Server Component) | 20min | ✅ ~divergence~ |
| **S4b** | Skeleton `EtablissementListSkeleton` | 10min | ✅ ~divergence~ |
| **S5** | Seed de données de test | 30min | ✅ |
| **S6** | Vérification | 15min | ✅ |

**Approche :** Page fonctionnelle pour valider la logique (query, données, routing). Le design sera affiné par Agathe dans un second temps.

---

## S1 — Query Drizzle `getEtablissements`

**Fichier:** `src/features/etablissements/queries/get-etablissements.ts` (MODIFIER)

Le fichier existe déjà avec un placeholder `{} as never`. À remplacer par la vraie query.

```typescript
// AVANT
import { db } from "@/lib/db";

export async function getEtablissements() {
  // TODO: add etablissements table to schema
  return db.select().from({} as never);
}

// APRÈS
import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export async function getEtablissements() {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      address: establishment.address,
      description: establishment.description,
      image: establishment.image,
    })
    .from(establishment)
    .where(isNull(establishment.deletedAt));
}
```

**Choix :**
- `select` partiel — on ne remonte que les champs utiles à la liste (pas `managerId`, `checkInTime`, etc.)
- Filtre `deletedAt IS NULL` — soft delete, on n'affiche que les établissements actifs
- Pas de pagination pour l'instant — le cahier des charges ne mentionne pas de volume important

**Effort:** 15min

---

## S2 — Composant `EtablissementCard` typé

**Fichier:** `src/features/etablissements/components/EtablissementCard.tsx` (MODIFIER)

Remplacer le `Record<string, unknown>` par un type dérivé du schéma. Composant minimal pour valider l'affichage.

```typescript
// AVANT
export function EtablissementCard({ etablissement }: { etablissement: Record<string, unknown> }) {
  return (
    <div>
      <p>{String(etablissement.nom ?? "")}</p>
    </div>
  );
}

// APRÈS
import Link from "next/link";

type EtablissementCardProps = {
  etablissement: {
    id: string;
    name: string;
    city: string;
    address: string;
    description: string | null;
    image: string | null;
  };
};

export function EtablissementCard({ etablissement }: EtablissementCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{etablissement.name}</h3>
      <p className="text-sm text-muted-foreground">
        {etablissement.city} — {etablissement.address}
      </p>
      {etablissement.description && (
        <p className="mt-2 text-sm">{etablissement.description}</p>
      )}
      <Link
        href={`/etablissements/${etablissement.id}`}
        className="mt-3 inline-block text-sm underline"
      >
        Voir détail
      </Link>
    </div>
  );
}
```

**Choix :**
- Type inline plutôt qu'un fichier `types/` séparé — on a un seul consommateur pour l'instant
- Pas d'image affichée — l'infrastructure upload (#31) n'est pas en place
- Lien vers le détail (#14) préparé mais la page n'existe pas encore
- Classes Tailwind minimales — Agathe affinera le design

**Effort:** 20min

---

## S3 — Composant `EtablissementList` typé

**Fichier:** `src/features/etablissements/components/EtablissementList.tsx` (MODIFIER)

```typescript
// AVANT
import { EtablissementCard } from "./EtablissementCard";

export function EtablissementList({ etablissements }: { etablissements: Record<string, unknown>[] }) {
  return (
    <ul>
      {etablissements.map((e, i) => (
        <li key={i}>
          <EtablissementCard etablissement={e} />
        </li>
      ))}
    </ul>
  );
}

// APRÈS
import { EtablissementCard } from "./EtablissementCard";
import type { getEtablissements } from "../queries/get-etablissements";

type EtablissementListProps = {
  etablissements: Awaited<ReturnType<typeof getEtablissements>>;
};

export function EtablissementList({ etablissements }: EtablissementListProps) {
  if (etablissements.length === 0) {
    return <p className="text-muted-foreground">Aucun établissement disponible.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {etablissements.map((e) => (
        <EtablissementCard key={e.id} etablissement={e} />
      ))}
    </div>
  );
}
```

**Choix :**
- Type dérivé de la query via `Awaited<ReturnType<>>` — couplage fort mais garanti type-safe, si la query change les composants cassent à la compilation
- État vide géré — critère implicite d'une bonne UX
- Grid responsive — layout basique, Agathe ajustera

**Effort:** 10min

---

## S4 — Route `app/etablissements/page.tsx`

**Fichier:** `app/etablissements/page.tsx` (CRÉER)

```typescript
import { Suspense } from "react";
import { getEtablissements } from "@/features/etablissements/queries/get-etablissements";
import { EtablissementList } from "@/features/etablissements/components/EtablissementList";
import { EtablissementListSkeleton } from "@/features/etablissements/components/EtablissementListSkeleton";

export default function EtablissementsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Nos établissements</h1>
      <Suspense fallback={<EtablissementListSkeleton />}>
        <EtablissementListServer />
      </Suspense>
    </main>
  );
}

async function EtablissementListServer() {
  const etablissements = await getEtablissements();
  return <EtablissementList etablissements={etablissements} />;
}
```

**Choix (alignés sur les best practices Vercel) :**
- **`async-suspense-boundaries`** — Le layout (titre, structure) s'affiche immédiatement, la liste stream ensuite. Le `await` est isolé dans `EtablissementListServer`, il ne bloque pas le rendu de la page
- **Server Component** (pas de `"use client"`) — zéro JS envoyé au client pour le fetch
- `EtablissementListServer` est un composant async privé à la page — pas exporté, pas réutilisable, c'est son rôle
- Route plate `/etablissements` — pas de route group `(public)` pour le moment

**Effort:** 20min

---

## S4b — Skeleton `EtablissementListSkeleton`

**Fichier:** `src/features/etablissements/components/EtablissementListSkeleton.tsx` (CRÉER)

Fallback Suspense minimal — même structure grid que `EtablissementList` avec des placeholders animés.

```typescript
export function EtablissementListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 animate-pulse">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
          <div className="mt-3 h-4 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
```

**Choix :**
- 3 cards skeleton — correspond au nombre de seed, évite le layout shift
- `animate-pulse` — feedback visuel natif Tailwind, zéro dépendance
- Même grid que `EtablissementList` — le layout ne bouge pas au chargement

**Effort:** 10min

---

## S5 — Seed de données de test

**Fichier:** `src/lib/db/seed.ts` (CRÉER)

Script exécutable pour insérer des données de test permettant de valider visuellement la page.

```typescript
import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";

async function seed() {
  // 1. Créer un user manager (prérequis FK)
  const [manager] = await db
    .insert(user)
    .values({
      id: "seed-manager-1",
      name: "Gérant Test",
      email: "gerant@clairdelune.test",
      emailVerified: true,
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoNothing()
    .returning();

  const managerId = manager?.id ?? "seed-manager-1";

  // 2. Insérer 3 établissements
  await db
    .insert(establishment)
    .values([
      {
        name: "Clair de Lune — Paris",
        address: "12 rue de Rivoli",
        postalCode: "75001",
        city: "Paris",
        description: "Un havre de paix au cœur de la capitale.",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId,
      },
      {
        name: "Clair de Lune — Lyon",
        address: "45 quai Saint-Antoine",
        postalCode: "69002",
        city: "Lyon",
        description: "Vue imprenable sur la Saône.",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        managerId,
      },
      {
        name: "Clair de Lune — Lille",
        address: "8 place du Général de Gaulle",
        postalCode: "59000",
        city: "Lille",
        description: "Charme et convivialité dans le Vieux-Lille.",
        checkInTime: "15:00",
        checkOutTime: "10:30",
        managerId,
      },
    ])
    .onConflictDoNothing();

  console.log("Seed terminé : 1 manager + 3 établissements");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
```

**Exécution :** `bun run src/lib/db/seed.ts`

**Choix :**
- `onConflictDoNothing` — idempotent, réexécutable sans erreur
- Un seul manager partagé — simplifie le seed, la FK `managerId` est `NOT NULL`
- Données réalistes — villes françaises, descriptions cohérentes avec le thème "Clair de Lune"

**Effort:** 30min

---

## S6 — Vérification

### Checklist

- [x] `bun run db:push` passe sans erreur (schéma déjà en place)
- [x] `bun run src/lib/db/seed.ts` insère les données sans erreur
- [x] `bun run dev` démarre sans erreur
- [x] `/etablissements` affiche les 3 établissements
- [x] Chaque card affiche nom, ville, adresse, description
- [x] Le lien "Voir détail" pointe vers `/etablissements/{id}`
- [x] La page est accessible sans authentification
- [ ] Le rendu est correct en mobile (responsive grid) — **à vérifier manuellement**
- [ ] État vide : supprimer les données → le message "Aucun établissement" s'affiche — **à vérifier manuellement**
- [x] `bun run lint` passe (0 errors, 6 warnings pré-existants)
- [x] `bun run build` passe (pas d'erreur de types)

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Implémenter `getEtablissements` | 15min |
| 2 | S2 | Typer et compléter `EtablissementCard` | 20min |
| 3 | S3 | Typer et compléter `EtablissementList` | 10min |
| 4 | S4 | Créer `app/etablissements/page.tsx` (Suspense + Server Component) | 20min |
| 5 | S4b | Créer `EtablissementListSkeleton` | 10min |
| 6 | S5 | Créer le seed + exécuter | 30min |
| 7 | S6 | Vérification checklist | 15min |
| — | — | **Commit** : `feat(etablissements): implement public listing page (#13)` | — |

---

## Log d'implémentation — 2026-03-18

### Divergences par rapport au plan

| Étape | Divergence | Raison |
|-------|-----------|--------|
| **S2** | `EtablissementCard` utilise `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` (shadcn/ui) au lieu de `<div>` bruts | Convention projet : prioriser les composants shadcn/ui sur le HTML de base |
| **S4** | Ajout de `export const dynamic = "force-dynamic"` sur la page | Next.js tentait un pre-render statique au build — la DB n'est pas disponible à ce moment, provoquant une erreur |
| **S4b** | `EtablissementListSkeleton` utilise `Card` + `Skeleton` (shadcn/ui) au lieu de `<div className="animate-pulse">` | Même raison que S2 — cohérence avec la Card |

### Composants ajoutés

- `shadcn/ui card` — installé via `bunx shadcn@latest add card`
- `shadcn/ui skeleton` — installé via `bunx shadcn@latest add skeleton`
- Fix semicolons appliqué sur les fichiers générés (convention ESLint du projet)

### Vérifications restantes (manuelles)

- [ ] Responsive mobile (grid 1 col → 2 col → 3 col)
- [ ] État vide (supprimer les données, vérifier le message)

---

## Hors scope (traité dans d'autres issues)

| Sujet | Issue |
|-------|-------|
| Page détail établissement | #14 |
| CRUD admin (créer/modifier/supprimer) | #16, #17, #18 |
| Contrôle d'accès par rôle | #30 (Thélio) |
| Infrastructure images | #31 |
| Charte graphique / design final | #32 (Agathe) |
