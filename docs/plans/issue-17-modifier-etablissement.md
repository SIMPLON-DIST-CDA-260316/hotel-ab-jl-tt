# Plan: #17 — Modifier un établissement

**Created:** 2026-03-18
**Status:** 📋 Plan opérationnel — prêt pour exécution
**Source:** Issue #17, Epic #1
**Scope:** Server action update + route admin avec formulaire pré-rempli
**Effort total:** ~1h30
**Best practices appliquées:** `server-auth-actions`, `server-serialization`
**Dépendances:** #16 terminée (formulaire `EtablissementForm`, schéma Zod, page admin)

---

## Suivi d'avancement

- [ ] **S1** — Server action `updateEtablissement` *(20min)*
- [ ] **S2** — Route `app/admin/etablissements/[id]/modifier/page.tsx` *(25min)*
- [ ] **S3** — Vérification *(15min)*

**Approche :** Le formulaire `EtablissementForm` créé en #16 est réutilisé en mode édition via `defaultValues`. Seuls la server action et la route sont à créer.

---

## S1 — Server action `updateEtablissement`

**Fichier:** `src/features/etablissements/actions/update-etablissement.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { etablissementSchema } from "../lib/etablissement-schema";

export async function updateEtablissement(id: string, formData: FormData) {
  // TODO: vérifier rôle admin (auth #10)

  const raw = Object.fromEntries(formData);
  const parsed = etablissementSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  await db
    .update(establishment)
    .set({
      ...parsed.data,
      description: parsed.data.description || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    })
    .where(eq(establishment.id, id));

  redirect("/admin/etablissements");
}
```

**Choix :**
- Même validation Zod que la création — critère d'acceptation "mêmes validations"
- `id` passé en paramètre (pas dans le FormData) — bindé via `.bind(null, id)` côté page
- Le `updatedAt` est géré automatiquement par `$onUpdate` dans le schéma Drizzle

**Effort:** 20min

---

## S2 — Route modification

**Fichier:** `app/admin/etablissements/[id]/modifier/page.tsx` (CRÉER)

```typescript
import { notFound } from "next/navigation";
import { getEtablissementById } from "@/features/etablissements/queries/get-etablissement-by-id";
import { EtablissementForm } from "@/features/etablissements/components/EtablissementForm";
import { updateEtablissement } from "@/features/etablissements/actions/update-etablissement";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ModifierEtablissementPage({ params }: Props) {
  // TODO: vérifier rôle admin
  const { id } = await params;
  const etablissement = await getEtablissementById(id);

  if (!etablissement) {
    notFound();
  }

  const updateAction = updateEtablissement.bind(null, id);

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <EtablissementForm
        action={updateAction}
        defaultValues={{
          name: etablissement.name,
          city: etablissement.city,
          address: etablissement.address,
          postalCode: etablissement.postalCode,
          description: etablissement.description ?? "",
          phone: etablissement.phone ?? "",
          email: etablissement.email ?? "",
          checkInTime: etablissement.checkInTime,
          checkOutTime: etablissement.checkOutTime,
        }}
        submitLabel="Enregistrer les modifications"
      />
    </main>
  );
}
```

**Choix :**
- **`bind(null, id)`** — encapsule l'ID dans l'action, le formulaire n'a pas besoin de le connaître
- **Mapping `null → ""`** — `getEtablissementById` retourne `string | null` pour les champs optionnels, mais `defaultValue` sur un `<input>` attend `string`. Le mapping explicite évite un type mismatch TypeScript
- `notFound()` — 404 si l'ID n'existe pas
- Réutilise `getEtablissementById` de #14

**Effort:** 25min

---

## S3 — Vérification

### Checklist

- [ ] `/admin/etablissements/[id]/modifier` affiche le formulaire pré-rempli
- [ ] Tous les champs sont bien remplis avec les données existantes
- [ ] Vider un champ obligatoire → erreur de validation
- [ ] Soumettre les modifications → données mises à jour en base
- [ ] Redirection vers la liste admin après succès
- [ ] Les modifications sont visibles sur la page publique (#13) et détail (#14)
- [ ] `/admin/etablissements/[id-inexistant]/modifier` → 404
- [ ] `bun run lint` passe
- [ ] `bun run build` passe

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Créer la server action `updateEtablissement` | 20min |
| 2 | S2 | Créer la route `/admin/etablissements/[id]/modifier` | 25min |
| 3 | S3 | Vérification checklist | 15min |
| — | — | **Commit** : `feat(etablissements): implement edit form (#17)` | — |

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`

_(aucune entrée pour le moment)_
