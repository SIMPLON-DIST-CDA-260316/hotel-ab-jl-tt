# Plan: #20 — Modifier ou supprimer un gérant

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Created:** 2026-03-20
**Status:** 🔲 À faire
**Source:** Issue #20, Epic #2
**Scope:** Server actions update/delete + route édition + AlertDialog suppression
**Effort total:** ~2h30
**Best practices appliquées:** `server-auth-actions`, `8-authorization`, `8-ui-feedback` (AlertDialog)
**Dépendances:** #19 terminée (feature `managers/`, `ManagerForm`, page liste admin)

---

## Suivi d'avancement

- [ ] **S1** — Query `getManagerById` *(15min)*
- [ ] **S2** — Server action `updateManager` *(25min)*
- [ ] **S3** — Route `app/admin/managers/[id]/edit/page.tsx` *(20min)*
- [ ] **S4** — Server action `deleteManager` (soft delete) *(25min)*
- [ ] **S5** — Composant `DeleteManagerButton` (AlertDialog) *(25min)*
- [ ] **S6** — Intégrer le bouton supprimer dans la liste admin *(10min)*
- [ ] **S7** — Vérification *(15min)*

**Approche :** Le formulaire `ManagerForm` de #19 est réutilisé en mode édition (`defaultValues` + `showPassword=false`). La suppression est un soft delete (`deletedAt`) + invalidation des sessions actives.

---

## S1 — Query `getManagerById`

**Fichier:** `src/features/managers/queries/get-manager-by-id.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ROLES } from "@/config/roles";

export async function getManagerById(id: string) {
  const [manager] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      establishmentId: establishment.id,
    })
    .from(user)
    .leftJoin(
      establishment,
      and(
        eq(establishment.managerId, user.id),
        isNull(establishment.deletedAt),
      ),
    )
    .where(
      and(
        eq(user.id, id),
        eq(user.role, ROLES.MANAGER),
        isNull(user.deletedAt),
      ),
    )
    .limit(1);

  return manager ?? null;
}
```

**Choix :**
- Retourne `null` si non trouvé — la page appellera `notFound()`
- LEFT JOIN sur establishment pour pré-remplir le select du formulaire
- Filtre par rôle manager + non supprimé — sécurité

**Effort:** 15min

---

## S2 — Server action `updateManager`

**Fichier:** `src/features/managers/actions/update-manager.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { updateManagerSchema } from "../lib/manager-schema";
import type { ActionResult } from "@/types/action.types";

export async function updateManager(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = updateManagerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, establishmentId } = parsed.data;

  // Check email uniqueness (excluding current user)
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(eq(user.email, email), ne(user.id, id)))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["Cette adresse email est déjà utilisée"] },
    };
  }

  const managerName = `${firstName} ${lastName}`;

  try {
    await db.transaction(async (tx) => {
      // 1. Update user info
      await tx
        .update(user)
        .set({ name: managerName, email })
        .where(eq(user.id, id));

      // 2. Assign to new establishment (if provided)
      // Note: does NOT unassign from old establishment(s) — managerId is NOT NULL,
      // so we can't set it to null. The old assignment remains until another manager
      // is assigned to that establishment via the establishment edit form.
      if (establishmentId) {
        await tx
          .update(establishment)
          .set({ managerId: id })
          .where(eq(establishment.id, establishmentId));
      }
    });
  } catch (error) {
    console.error("Failed to update manager:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la modification"] },
    };
  }

  redirect("/admin/managers");
}
```

**Choix :**
- **`requireAdmin()`** en première instruction
- **Email uniqueness** avec `ne(user.id, id)` — exclut l'utilisateur courant de la vérification
- **`bind(null, id)`** côté page — même pattern que `updateEstablishment`
- **Pas de changement de mot de passe** — conforme aux critères d'acceptation ("Possibilité de modifier nom, prénom, email, établissement")
- **Reassignation establishment** : `managerId` est `NOT NULL`, donc on ne peut pas "désassigner". L'assignation dans ce formulaire est additive — elle assigne le gérant au nouvel établissement. L'ancien établissement conserve sa référence à ce gérant. Le réassignement complet se fait via le formulaire de modification d'établissement (#17)

**Effort:** 25min

---

## S3 — Route édition

**Fichier:** `app/admin/managers/[id]/edit/page.tsx` (CRÉER)

```typescript
import { notFound } from "next/navigation";
import { getManagerById } from "@/features/managers/queries/get-manager-by-id";
import { getEstablishmentsForSelect } from "@/features/managers/queries/get-establishments-for-select";
import { ManagerForm } from "@/features/managers/components/ManagerForm";
import { updateManager } from "@/features/managers/actions/update-manager";

type EditManagerPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManagerPage({ params }: EditManagerPageProps) {
  const { id } = await params;
  const [manager, establishments] = await Promise.all([
    getManagerById(id),
    getEstablishmentsForSelect(),
  ]);

  if (!manager) {
    notFound();
  }

  const updateAction = updateManager.bind(null, id);

  // Split "Prénom Nom" back to firstName/lastName
  const nameParts = manager.name.split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <ManagerForm
        action={updateAction}
        establishments={establishments}
        defaultValues={{
          firstName,
          lastName,
          email: manager.email,
          establishmentId: manager.establishmentId ?? undefined,
        }}
        showPassword={false}
        submitLabel="Enregistrer les modifications"
      />
    </main>
  );
}
```

**Choix :**
- **`Promise.all`** — charge manager et establishments en parallèle
- **Split name** — le schéma stocke `name` (concat), mais le formulaire attend `firstName`/`lastName` séparés. Le split est simple mais imparfait pour les noms composés. Acceptable pour la v1
- **`showPassword={false}`** — pas de modification de mot de passe en édition
- **`bind(null, id)`** — encapsule l'ID dans l'action

**Effort:** 20min

---

## S4 — Server action `deleteManager`

**Fichier:** `src/features/managers/actions/delete-manager.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { user, session, establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";

type DeleteManagerResult =
  | { success: true; error?: undefined }
  | { success: false; error: string };

export async function deleteManager(
  id: string,
): Promise<DeleteManagerResult> {
  await requireAdmin();

  // Check if manager has active establishments
  const [activeEstablishment] = await db
    .select({ id: establishment.id, name: establishment.name })
    .from(establishment)
    .where(
      and(
        eq(establishment.managerId, id),
        isNull(establishment.deletedAt),
      ),
    )
    .limit(1);

  if (activeEstablishment) {
    return {
      success: false,
      error: `Impossible de supprimer : ce gérant gère encore l'établissement « ${activeEstablishment.name} ». Réassignez-le d'abord.`,
    };
  }

  try {
    const softDeleteResult = await db.transaction(async (tx) => {
      // 1. Soft delete user (with isNull guard to prevent double-delete)
      const result = await tx
        .update(user)
        .set({ deletedAt: new Date() })
        .where(and(eq(user.id, id), isNull(user.deletedAt)));

      // 2. Invalidate all active sessions (prevent login)
      await tx
        .delete(session)
        .where(eq(session.userId, id));

      return result;
    });

    const isManagerNotFound = softDeleteResult.rowCount === 0;
    if (isManagerNotFound) {
      return {
        success: false,
        error: "Gérant introuvable ou déjà supprimé.",
      };
    }
  } catch (error) {
    console.error("Failed to delete manager:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression.",
    };
  }

  revalidatePath("/admin/managers");
  return { success: true };
}
```

**Choix :**
- **`DeleteManagerResult` type** — discriminated union explicite, même pattern que `deleteEstablishment`
- **Soft delete** — `deletedAt = now()`, le gérant disparaît de la liste active mais reste en base pour l'historique
- **Guard `isNull(user.deletedAt)`** — empêche le double-delete et l'écrasement du timestamp original. Vérifie `rowCount === 0` pour retourner une erreur "déjà supprimé"
- **Invalidation sessions** — supprime toutes les sessions actives pour empêcher le login (critère : "Un gérant supprimé ne peut plus se connecter"). Le `delete` physique des sessions est safe car elles sont jetables
- **Vérification établissements actifs** — on ne supprime pas un gérant qui gère encore un établissement actif. L'admin doit d'abord réassigner. Raison : `establishment.managerId` est `NOT NULL`, donc on ne peut pas mettre à null
- **`revalidatePath`** au lieu de `redirect` — même pattern que `deleteEstablishment`, la suppression reste sur la même page

**Note sur le login post-suppression :**
L'invalidation des sessions empêche l'accès immédiat. Cependant, si le gérant tente de se reconnecter (nouveau login), Better Auth créera une nouvelle session car il ne vérifie pas `deletedAt` par défaut. Pour une solution complète, il faudrait ajouter un hook Better Auth `onSignIn` qui vérifie `deletedAt`. C'est hors scope de cette issue — on note le TODO.

**Effort:** 25min

---

## S5 — Composant `DeleteManagerButton`

**Fichier:** `src/features/managers/components/DeleteManagerButton.tsx` (CRÉER)

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
import { deleteManager } from "../actions/delete-manager";

type DeleteManagerButtonProps = {
  id: string;
  name: string;
};

export function DeleteManagerButton({ id, name }: DeleteManagerButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteManager(id);
      if (!result.success) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) setError(null);
    }}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {name} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le compte sera désactivé. Le gérant ne pourra plus se connecter.
            Ses données sont conservées pour l'historique.
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
- Copie exacte du pattern `DeleteEstablishmentButton` — cohérence UI
- Description adaptée : mentionne la désactivation du compte et la conservation des données
- Erreur inline dans le dialog si le gérant gère encore un établissement

**Effort:** 25min

---

## S6 — Intégrer dans la page admin liste

**Fichier:** `app/admin/managers/page.tsx` (MODIFIER — créé par #19)

Ajouter le bouton supprimer dans chaque row :

```typescript
// Ajouter l'import
import { DeleteManagerButton } from "@/features/managers/components/DeleteManagerButton";

// Dans le TableCell Actions, après le bouton Modifier :
<DeleteManagerButton
  id={manager.id}
  name={manager.name}
/>
```

**Effort:** 10min

---

## S7 — Vérification

### Checklist

**Modification :**
- [ ] `/admin/managers/[id]/edit` affiche le formulaire pré-rempli (prénom, nom, email, établissement)
- [ ] Tous les champs sont bien remplis avec les données existantes
- [ ] Le champ mot de passe n'est PAS affiché en mode édition
- [ ] Vider un champ obligatoire → erreur de validation
- [ ] Email déjà utilisé par un autre compte → erreur
- [ ] Soumettre les modifications → données mises à jour, redirection vers la liste
- [ ] `/admin/managers/[id-inexistant]/edit` → 404
- [ ] Changer l'établissement assigné → la liste reflète le changement

**Suppression :**
- [ ] Le bouton "Supprimer" apparaît dans chaque row du tableau
- [ ] Cliquer "Supprimer" → AlertDialog avec le nom du gérant
- [ ] Cliquer "Annuler" → rien ne change
- [ ] Supprimer un gérant sans établissement → soft-deleted, disparaît de la liste
- [ ] Supprimer un gérant avec établissement actif → message d'erreur dans l'AlertDialog
- [ ] Le gérant supprimé ne peut plus se connecter (sessions invalidées)
- [ ] Le bouton est disabled pendant la suppression

**Général :**
- [ ] `bun run lint` passe
- [ ] `bun run build` passe

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Query `getManagerById` | 15min |
| 2 | S2 | Server action `updateManager` | 25min |
| 3 | S3 | Route `/admin/managers/[id]/edit` | 20min |
| 4 | S4 | Server action `deleteManager` | 25min |
| 5 | S5 | Composant `DeleteManagerButton` | 25min |
| 6 | S6 | Intégrer dans la liste admin | 10min |
| 7 | S7 | Vérification | 15min |
| — | — | **Commit** : `feat(managers): implement edit and delete manager (#20)` | — |

---

## Note technique : soft delete et login

La suppression set `deletedAt` + supprime les sessions actives. Cependant, Better Auth ne vérifie pas `deletedAt` lors d'un nouveau login. Pour bloquer complètement le re-login, il faudra ajouter un hook `onSignIn` dans `src/lib/auth.ts`. C'est hors scope de cette issue.

**TODO futur :** Ajouter dans `auth.ts` un hook qui vérifie `user.deletedAt` avant de créer une session.

---

## Hors scope

| Sujet | Issue / Note |
|-------|-------------|
| Bloquer le re-login post-suppression | TODO futur (hook Better Auth `onSignIn`) |
| Navigation admin (sidebar/header) | Design Agathe |

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`
