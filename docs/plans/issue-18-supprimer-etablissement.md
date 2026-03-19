# Plan: #18 — Supprimer un établissement

**Created:** 2026-03-18
**Status:** ✅ Terminé
**Source:** Issue #18, Epic #1
**Scope:** Server action soft delete + AlertDialog + vérification réservations
**Effort total:** ~2h
**Best practices appliquées:** `server-auth-actions`, directive `8-ui-feedback` (AlertDialog pour actions destructives)
**Dépendances:** #16 terminée (page admin liste)

---

## Suivi d'avancement

- [x] **S0** — Installer shadcn/ui `alert-dialog` *(5min)*
- [x] **S1** — Query `hasActiveBookings` *(15min)*
- [x] **S2** — Server action `deleteEstablishment` *(25min)*
- [x] **S3** — Composant `DeleteEstablishmentButton` (AlertDialog) *(30min)*
- [x] **S4** — Intégrer le bouton dans la page admin liste *(15min)*
- [x] **S5** — Vérification *(15min)*

**Approche :** AlertDialog (modale) directement sur la page admin liste — conforme à la directive `8-ui-feedback.md` pour les actions destructives. Pas de page `/supprimer` dédiée.

---

## S0 — Installer shadcn/ui

```bash
bunx shadcn@latest add alert-dialog
```

**Effort:** 5min

---

## S1 — Query `hasActiveBookings`

**Fichier:** `src/features/etablissements/queries/has-active-bookings.ts` (CRÉER)

Vérifie si un établissement a des réservations futures (critère d'acceptation : suppression empêchée ou signalée).

```typescript
import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema";
import { eq, and, gte, ne } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function hasActiveBookings(establishmentId: string): Promise<boolean> {
  const result = await db
    .select({ count: sql<string>`count(*)::int` })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .where(
      and(
        eq(suite.establishmentId, establishmentId),
        gte(booking.checkOut, sql`CURRENT_DATE`),
        ne(booking.status, "cancelled"),
      )
    );

  return Number(result[0]?.count ?? 0) > 0;
}
```

**Choix :**
- Jointure `booking → suite → establishment` — les réservations sont liées aux suites, pas directement aux établissements
- `CURRENT_DATE` côté SQL — évite les problèmes de timezone (le serveur Node peut être en UTC différent de la DB)
- `count(*)::int` — PostgreSQL retourne `bigint` (string) pour `count(*)`, le cast `::int` + `Number()` garantit un nombre
- Exclut les réservations annulées
- Retourne un boolean — l'AlertDialog n'a pas besoin du détail

**Effort:** 15min

---

## S2 — Server action `deleteEtablissement`

**Fichier:** `src/features/etablissements/actions/delete-etablissement.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hasActiveBookings } from "../queries/has-active-bookings";

export async function deleteEtablissement(id: string) {
  // TODO: vérifier rôle admin (auth #10)

  const hasBookings = await hasActiveBookings(id);

  if (hasBookings) {
    return {
      success: false as const,
      error: "Impossible de supprimer : des réservations futures existent pour cet établissement.",
    };
  }

  // Soft delete
  await db
    .update(establishment)
    .set({ deletedAt: new Date() })
    .where(eq(establishment.id, id));

  revalidatePath("/admin/etablissements");
  return { success: true as const };
}
```

**Choix :**
- **Soft delete** — on set `deletedAt` plutôt que de supprimer le row. Les queries #13/#14 filtrent déjà `deletedAt IS NULL`
- **`revalidatePath` au lieu de `redirect`** — l'AlertDialog reste sur la même page, on revalide la liste pour que l'élément disparaisse
- **Retourne `{ success: true }`** — le composant client ferme l'AlertDialog sur succès
- Pas de cascade — les suites et données restent en base (archivage)

**Effort:** 25min

---

## S3 — Composant `DeleteEtablissementButton`

**Fichier:** `src/features/etablissements/components/DeleteEtablissementButton.tsx` (CRÉER)

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEtablissement } from "../actions/delete-etablissement";

type DeleteEtablissementButtonProps = {
  id: string;
  name: string;
};

export function DeleteEtablissementButton({
  id,
  name,
}: DeleteEtablissementButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEtablissement(id);
      if (!result.success) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {name} ?</AlertDialogTitle>
          <AlertDialogDescription>
            L'établissement et ses suites ne seront plus visibles sur le site.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Choix :**
- **AlertDialog** — conforme à la directive `8-ui-feedback.md` pour les actions destructives
- **`useTransition`** — gère le pending state sans bloquer l'UI. Plus adapté qu'`useActionState` ici car on ne passe pas par un `<form>`
- **`server-serialization`** — seuls `id` et `name` sont passés au client (2 strings)
- **Fermeture auto** — l'AlertDialog se ferme sur succès via `setOpen(false)`
- **Erreur inline** — si réservations futures, le message s'affiche dans l'AlertDialog sans le fermer

**Effort:** 30min

---

## S4 — Intégrer dans la page admin liste

**Fichier:** `app/admin/etablissements/page.tsx` (MODIFIER — créé par #16)

Ajouter le bouton supprimer dans chaque row du `Table` :

```typescript
// Ajouter l'import
import { DeleteEtablissementButton } from "@/features/etablissements/components/DeleteEtablissementButton";

// Dans le TableCell Actions, ajouter après le bouton Modifier :
<DeleteEtablissementButton
  id={etablissement.id}
  name={etablissement.name}
/>
```

**Note :** La page admin passe de Server Component pur à un mix : la page reste un RSC, mais le `DeleteEtablissementButton` est un Client Component (nécessaire pour l'AlertDialog). C'est le pattern standard — un island d'interactivité dans un RSC.

**Effort:** 15min

---

## S5 — Vérification

### Checklist

- [ ] Le bouton "Supprimer" apparaît dans chaque row du tableau admin
- [ ] Cliquer "Supprimer" → AlertDialog s'ouvre avec le nom de l'établissement
- [ ] Cliquer "Annuler" → AlertDialog se ferme, rien ne change
- [ ] Cliquer "Supprimer" (sans réservations futures) → établissement soft-deleted, AlertDialog se ferme, la liste se met à jour
- [ ] L'établissement supprimé n'apparaît plus dans la liste publique (#13) ni la liste admin
- [ ] Cliquer "Supprimer" (avec réservations futures) → message d'erreur dans l'AlertDialog, pas de suppression
- [ ] Le bouton est disabled pendant la suppression (pending state)
- [ ] `bun run lint` passe
- [ ] `bun run build` passe

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S0 | Installer shadcn/ui (alert-dialog) | 5min |
| 2 | S1 | Créer `hasActiveBookings` | 15min |
| 3 | S2 | Créer la server action `deleteEtablissement` | 25min |
| 4 | S3 | Créer `DeleteEtablissementButton` (AlertDialog) | 30min |
| 5 | S4 | Intégrer dans la page admin | 15min |
| 6 | S5 | Vérification checklist | 15min |
| — | — | **Commit** : `feat(etablissements): implement delete with booking check (#18)` | — |

---

## Note technique : soft delete

La suppression est un soft delete (`deletedAt = now()`). Toutes les queries de lecture filtrent déjà `isNull(deletedAt)` depuis #13 et #14. L'établissement et ses suites restent en base pour :
- L'historique des réservations passées
- Une éventuelle restauration
- L'intégrité des données (FK constraints)

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`

[2026-03-19] S1-S4 — Nommage anglais (`deleteEstablishment`, `DeleteEstablishmentButton`, `has-active-bookings.ts`) au lieu du français prévu dans le plan (`deleteEtablissement`, `DeleteEtablissementButton`). **Raison :** le codebase utilise la convention anglaise (`src/features/establishments/`) depuis le fix cf61360.
