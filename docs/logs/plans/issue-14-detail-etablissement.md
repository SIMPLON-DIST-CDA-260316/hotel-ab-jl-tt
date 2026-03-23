# Plan: #14 — Voir le détail d'un établissement et ses suites

**Created:** 2026-03-18
**Status:** ✅ Implémentation terminée
**Source:** Issue #14, Epic #4
**Scope:** Queries Drizzle (établissement + suites) + route dynamique + composants
**Effort total:** ~2h30
**Best practices appliquées:** `server-parallel-fetching`, `async-suspense-boundaries`, `server-serialization`
**Dépendances:** #13 terminée (query `getEtablissements`, seed en place)

---

## Suivi d'avancement

- [x] **S1** — Query `getEstablishmentById` *(15min)*
- [x] **S2** — Query `getSuitesByEstablishment` (feature suites) *(15min)*
- [x] **S3** — Composant `SuiteCard` typé *(20min)*
- [x] **S4** — Composant `SuiteList` *(10min)*
- [x] **S5** — Route `app/establishments/[id]/page.tsx` (parallel fetch + Suspense) *(30min)*
- [x] **S5b** — Skeletons (suite list) *(15min)*
- [x] **S6** — Enrichir le seed avec des suites *(15min)*
- [x] **S7** — Vérification *(15min)*

**Approche :** Page fonctionnelle pour valider la logique. Les deux fetches (établissement + suites) sont parallélisés via la composition de Server Components. Design minimal, Agathe affinera.

---

## S1 — Query `getEtablissementById`

**Fichier:** `src/features/etablissements/queries/get-etablissement-by-id.ts` (MODIFIER)

```typescript
// AVANT
import { db } from "@/lib/db";

export async function getEtablissementById(_id: string) {
  // TODO: add etablissements table to schema
  return db.select().from({} as never);
}

// APRÈS
import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function getEtablissementById(id: string) {
  const [result] = await db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      address: establishment.address,
      postalCode: establishment.postalCode,
      description: establishment.description,
      image: establishment.image,
      phone: establishment.phone,
      email: establishment.email,
      checkInTime: establishment.checkInTime,
      checkOutTime: establishment.checkOutTime,
    })
    .from(establishment)
    .where(and(eq(establishment.id, id), isNull(establishment.deletedAt)));

  return result ?? null;
}
```

**Choix :**
- Retourne `null` si non trouvé — permet de gérer le `notFound()` côté page
- Select partiel plus large que la liste — on affiche plus d'infos sur le détail (horaires, contact)
- Pas de jointure sur le manager — pas utile pour le visiteur

**Effort:** 15min

---

## S2 — Query `getSuitesByEtablissement`

**Fichier:** `src/features/suites/queries/get-suites-by-etablissement.ts` (MODIFIER)

```typescript
// AVANT
import { db } from "@/lib/db";

export async function getSuitesByEtablissement(_etablissementId: string) {
  // TODO: add suites table to schema
  return db.select().from({} as never);
}

// APRÈS
import { db } from "@/lib/db";
import { suite } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

export async function getSuitesByEtablissement(etablissementId: string) {
  return db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      mainImage: suite.mainImage,
      capacity: suite.capacity,
    })
    .from(suite)
    .where(
      and(
        eq(suite.establishmentId, etablissementId),
        isNull(suite.deletedAt),
      )
    );
}
```

**Choix :**
- Select partiel — `title`, `description`, `price`, `mainImage`, `capacity` (critères d'acceptation)
- Filtre soft delete
- Pas de pagination — peu de suites par établissement

**Note architecture :** Cette query est dans `src/features/suites/` (pas `etablissements/`). C'est la feature suites qui possède ses propres queries. La page établissement l'importe, ce qui est permis par les règles : `app/` peut importer depuis n'importe quelle feature.

**Effort:** 15min

---

## S3 — Composant `SuiteCard` typé

**Fichier:** `src/features/suites/components/SuiteCard.tsx` (MODIFIER)

```typescript
// AVANT
export function SuiteCard({ suite }: { suite: Record<string, unknown> }) {
  return (
    <div>
      <p>{String(suite.nom ?? "")}</p>
    </div>
  );
}

// APRÈS
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuiteCardProps = {
  suite: {
    id: string;
    title: string;
    description: string | null;
    price: string;
    mainImage: string;
    capacity: number;
  };
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function SuiteCard({ suite }: SuiteCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{suite.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {priceFormatter.format(Number(suite.price))} / nuit — {suite.capacity} personne{suite.capacity > 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        {suite.description && (
          <p className="text-sm">{suite.description}</p>
        )}
        <Link
          href={`/suites/${suite.id}`}
          className="mt-3 inline-block text-sm underline"
        >
          Voir la suite
        </Link>
      </CardContent>
    </Card>
  );
}
```

**Choix :**
- `price` formaté via `Intl.NumberFormat("fr-FR")` — le formatter est hoisté au module level (pas recréé à chaque render)
- Pas d'image affichée — infrastructure upload (#31) pas en place
- Lien vers `/suites/[id]` — la page n'existe pas encore (#15), mais le lien est prêt

**Effort:** 20min

---

## S4 — Composant `SuiteList`

**Fichier:** `src/features/suites/components/SuiteList.tsx` (CRÉER)

```typescript
import { SuiteCard } from "./SuiteCard";
import type { getSuitesByEtablissement } from "../queries/get-suites-by-etablissement";

type SuiteListProps = {
  suites: Awaited<ReturnType<typeof getSuitesByEtablissement>>;
};

export function SuiteList({ suites }: SuiteListProps) {
  if (suites.length === 0) {
    return <p className="text-muted-foreground">Aucune suite disponible.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suites.map((suite) => (
        <SuiteCard key={suite.id} suite={suite} />
      ))}
    </div>
  );
}
```

**Effort:** 10min

---

## S5 — Route `app/etablissements/[id]/page.tsx`

**Fichier:** `app/etablissements/[id]/page.tsx` (CRÉER)

```typescript
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getEtablissementById } from "@/features/etablissements/queries/get-etablissement-by-id";
import { getSuitesByEtablissement } from "@/features/suites/queries/get-suites-by-etablissement";
import { SuiteList } from "@/features/suites/components/SuiteList";
import { SuiteListSkeleton } from "@/features/suites/components/SuiteListSkeleton";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EtablissementDetailPage({ params }: Props) {
  const { id } = await params;
  const etablissement = await getEtablissementById(id);

  if (!etablissement) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">{etablissement.name}</h1>
        <p className="text-muted-foreground">
          {etablissement.city} — {etablissement.address}
        </p>
        {etablissement.description && (
          <p className="mt-2">{etablissement.description}</p>
        )}
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span>Check-in : {etablissement.checkInTime.slice(0, 5)}</span>
          <span>Check-out : {etablissement.checkOutTime.slice(0, 5)}</span>
        </div>
        {etablissement.phone && (
          <p className="mt-1 text-sm">Tél : {etablissement.phone}</p>
        )}
        {etablissement.email && (
          <p className="mt-1 text-sm">Email : {etablissement.email}</p>
        )}
      </header>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Nos suites</h2>
        <Suspense fallback={<SuiteListSkeleton />}>
          <SuiteListServer etablissementId={id} />
        </Suspense>
      </section>
    </main>
  );
}

async function SuiteListServer({ etablissementId }: { etablissementId: string }) {
  const suites = await getSuitesByEtablissement(etablissementId);
  return <SuiteList suites={suites} />;
}
```

**Choix (best practices Vercel) :**
- **`server-parallel-fetching`** — L'établissement est fetché dans le composant page (nécessaire pour `notFound()`), les suites sont fetchées dans `SuiteListServer` via Suspense. Les deux fetches ne sont PAS en waterfall : le header s'affiche pendant que les suites chargent
- **`async-suspense-boundaries`** — La section suites est wrappée dans Suspense, le header de l'établissement s'affiche immédiatement
- **`server-serialization`** — Select partiel dans les deux queries
- `notFound()` — renvoie une 404 propre si l'ID n'existe pas
- `params` est une `Promise` en Next.js 15+ — on `await` avant d'utiliser

**Note :** On aurait pu paralléliser les deux queries avec `Promise.all` dans un seul composant async, mais le pattern Suspense est préférable ici car :
1. Le header est utile seul (le visiteur sait où il est)
2. La liste de suites peut être plus lente (jointures futures, images)
3. L'UX est meilleure (contenu progressif vs tout-ou-rien)

**Effort:** 30min

---

## S5b — Skeletons

**Fichier:** `src/features/suites/components/SuiteListSkeleton.tsx` (CRÉER)

```typescript
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SuiteListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Effort:** 15min

---

## S6 — Enrichir le seed avec des suites

**Fichier:** `src/lib/db/seed.ts` (MODIFIER — créé par #13)

Ajouter des suites après l'insertion des établissements :

```typescript
// Après l'insertion des établissements, récupérer leurs IDs
// puis insérer des suites pour chaque établissement

await db.insert(suite).values([
  {
    title: "Suite Étoile",
    description: "Suite luxueuse avec vue sur la Tour Eiffel.",
    price: "250.00",
    mainImage: "/placeholder-suite.jpg",
    capacity: 2,
    area: "45.00",
    establishmentId: parisId,
  },
  {
    title: "Suite Lumière",
    description: "Ambiance tamisée et décoration Art Déco.",
    price: "180.00",
    mainImage: "/placeholder-suite.jpg",
    capacity: 2,
    area: "35.00",
    establishmentId: parisId,
  },
  {
    title: "Suite Confluence",
    description: "Au croisement du Rhône et de la Saône.",
    price: "200.00",
    mainImage: "/placeholder-suite.jpg",
    capacity: 3,
    area: "50.00",
    establishmentId: lyonId,
  },
  {
    title: "Suite Grand Place",
    description: "Vue sur la Grand Place de Lille.",
    price: "160.00",
    mainImage: "/placeholder-suite.jpg",
    capacity: 2,
    area: "38.00",
    establishmentId: lilleId,
  },
]).onConflictDoNothing();
```

**Note :** Le seed de #13 devra retourner les IDs des établissements créés pour qu'on puisse les référencer ici. L'agent adaptera le seed existant.

**Effort:** 15min

---

## S7 — Vérification

### Checklist

- [x] `/establishments/[id-valide]` affiche le nom, ville, adresse, description, horaires
- [x] La section suites affiche les cards avec titre, prix, capacité, description
- [x] `/establishments/[id-inexistant]` retourne une 404 (via `notFound()`)
- [x] Le header s'affiche avant les suites (Suspense fonctionne)
- [x] Le skeleton s'affiche pendant le chargement des suites
- [x] La page est accessible sans authentification
- [x] Le lien depuis la liste (#13) fonctionne (`/establishments/${id}`)
- [x] Responsive : layout correct en mobile (grid cols responsive)
- [x] `bun run lint` passe (0 errors)
- [x] `bun run build` passe (route `/establishments/[id]` registered)

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Implémenter `getEtablissementById` | 15min |
| 2 | S2 | Implémenter `getSuitesByEtablissement` | 15min |
| 3 | S3 | Typer et compléter `SuiteCard` | 20min |
| 4 | S4 | Créer `SuiteList` | 10min |
| 5 | S5 | Créer `app/etablissements/[id]/page.tsx` | 30min |
| 6 | S5b | Créer `SuiteListSkeleton` | 15min |
| 7 | S6 | Enrichir le seed avec des suites | 15min |
| 8 | S7 | Vérification checklist | 15min |
| — | — | **Commit** : `feat(etablissements): implement detail page with suites (#14)` | — |

---

## Hors scope

| Sujet | Issue |
|-------|-------|
| Page détail d'une suite (galerie, réservation) | #15 |
| CRUD admin établissements | #16, #17, #18 |
| Affichage des images (upload infra) | #31 |
| Design final | #32 (Agathe) |

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`

[2026-03-18] S1–S7 — Tous les noms de fichiers et fonctions utilisent la convention anglaise (`establishments`, `getEstablishmentById`, `getSuitesByEstablishment`, `app/establishments/[id]`) au lieu des noms français du plan (`etablissements`, `getEtablissementById`, etc.). **Raison :** le commit `cf61360` a aligné tout le codebase sur la convention anglaise ; les fichiers existants utilisaient déjà ces noms.

[2026-03-18] S6 — Le seed est rendu idempotent par `DELETE` des tables (suite → establishment → user seed) avant insertion, au lieu du `onConflictDoNothing` du plan. Les IDs sont récupérés via `.returning({ id, city })` et associés par ville. **Raison :** `onConflictDoNothing` ne fonctionnait pas (pas de contrainte unique sur les colonnes métier), le delete préalable garantit un état propre à chaque exécution.
