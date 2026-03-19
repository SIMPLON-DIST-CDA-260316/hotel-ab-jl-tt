# Plan: #16 — Créer un établissement

**Created:** 2026-03-18
**Status:** ✅ Terminé
**Source:** Issue #16, Epic #1
**Scope:** Formulaire + server action + route admin + composants shadcn/ui
**Effort total:** ~3h
**Best practices appliquées:** `server-auth-actions`, `server-serialization`, `bundle-barrel-imports`
**Dépendances:** #13 et #14 terminées (queries, seed, composants de base)

---

## Suivi d'avancement

- [x] **S1** — Installer les composants shadcn/ui nécessaires *(10min)*
- [x] **S2** — Schéma de validation Zod *(15min)*
- [x] **S3** — Server action `createEstablishment` *(20min)*
- [x] **S4** — Composant `EstablishmentForm` (réutilisable pour #17) *(40min)*
- [x] **S5** — Route `app/admin/establishments/new/page.tsx` *(15min)*
- [x] **S6** — Route `app/admin/establishments/page.tsx` (liste admin) *(20min)*
- [x] **S7** — Vérification *(15min)*

**Approche :** Le formulaire est conçu pour être réutilisable en mode édition (#17). Le contrôle d'accès admin est un TODO — Thélio travaille sur l'auth (#10).

---

## S1 — Installer les composants shadcn/ui

```bash
bunx shadcn@latest add input label textarea table
```

Composants nécessaires pour le formulaire et la liste admin. `button`, `card` et `skeleton` sont déjà installés (#13).

**Effort:** 10min

---

## S2 — Schéma de validation Zod

**Fichier:** `src/features/etablissements/lib/etablissement-schema.ts` (CRÉER)

```typescript
import { z } from "zod";

export const etablissementSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire").max(255),
  city: z.string().min(1, "La ville est obligatoire").max(255),
  address: z.string().min(1, "L'adresse est obligatoire").max(500),
  postalCode: z.string().min(1, "Le code postal est obligatoire").max(10),
  description: z.string().max(2000).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.union([z.literal(""), z.string().email("Email invalide")]).optional(),
  checkInTime: z.string().min(1, "L'heure de check-in est obligatoire"),
  checkOutTime: z.string().min(1, "L'heure de check-out est obligatoire"),
});

export type EtablissementFormData = z.infer<typeof etablissementSchema>;
```

**Choix :**
- Zod partagé entre client (validation formulaire) et server action (validation côté serveur)
- Champs obligatoires alignés sur les critères d'acceptation : nom, ville, adresse
- `postalCode`, `checkInTime`, `checkOutTime` aussi obligatoires — contrainte du schéma DB
- `description`, `phone`, `email` optionnels — `.or(z.literal(""))` pour accepter les champs vides du formulaire

**Effort:** 15min

---

## S3 — Server action `createEtablissement`

**Fichier:** `src/features/etablissements/actions/create-etablissement.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { etablissementSchema } from "../lib/etablissement-schema";
import { user } from "@/lib/db/schema";

export async function createEtablissement(formData: FormData) {
  // TODO: vérifier rôle admin (auth #10)

  const raw = Object.fromEntries(formData);
  const parsed = etablissementSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // TODO: managerId dynamique quand l'auth sera en place
  // Récupère le premier manager existant comme fallback temporaire
  const [manager] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, "manager"))
    .limit(1);

  if (!manager) {
    return { success: false as const, errors: { _form: ["Aucun gérant disponible"] } };
  }

  const managerId = manager.id;

  await db.insert(establishment).values({
    ...parsed.data,
    description: parsed.data.description || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    managerId,
  });

  redirect("/admin/etablissements");
}
```

**Choix :**
- **`server-auth-actions`** — TODO pour le contrôle d'accès, marqué clairement
- `FormData` en entrée — compatible avec le progressive enhancement (formulaire fonctionne sans JS)
- Validation Zod côté serveur — ne jamais faire confiance au client
- `redirect` après succès — pattern PRG (Post/Redirect/Get), évite les double-submit
- `managerId` récupéré dynamiquement (premier manager en base) — sera remplacé par l'auth quand disponible. Retourne une erreur si aucun manager n'existe
- Champs optionnels vides → `null` — cohérent avec le schéma DB

**Effort:** 20min

---

## S4 — Composant `EtablissementForm`

**Fichier:** `src/features/etablissements/components/EtablissementForm.tsx` (CRÉER)

```typescript
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FieldErrors = Partial<Record<string, string[]>>;

type FormState = {
  success: false;
  errors: FieldErrors;
} | null;

type EtablissementFormProps = {
  action: (formData: FormData) => Promise<FormState>;
  defaultValues?: {
    name?: string | null;
    city?: string | null;
    address?: string | null;
    postalCode?: string | null;
    description?: string | null;
    phone?: string | null;
    email?: string | null;
    checkInTime?: string | null;
    checkOutTime?: string | null;
  };
  submitLabel?: string;
};

export function EtablissementForm({
  action,
  defaultValues,
  submitLabel = "Créer",
}: EtablissementFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {defaultValues ? "Modifier l'établissement" : "Nouvel établissement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              name="name"
              autoComplete="organization"
              defaultValue={defaultValues?.name ?? ""}
              aria-describedby={state?.errors?.name ? "name-error" : undefined}
              required
            />
            {state?.errors?.name && (
              <p id="name-error" className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              name="address"
              autoComplete="street-address"
              defaultValue={defaultValues?.address ?? ""}
              aria-describedby={state?.errors?.address ? "address-error" : undefined}
              required
            />
            {state?.errors?.address && (
              <p id="address-error" className="text-sm text-destructive">{state.errors.address[0]}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                name="postalCode"
                autoComplete="postal-code"
                defaultValue={defaultValues?.postalCode ?? ""}
                aria-describedby={state?.errors?.postalCode ? "postalCode-error" : undefined}
                required
              />
              {state?.errors?.postalCode && (
                <p id="postalCode-error" className="text-sm text-destructive">{state.errors.postalCode[0]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                autoComplete="address-level2"
                defaultValue={defaultValues?.city ?? ""}
                aria-describedby={state?.errors?.city ? "city-error" : undefined}
                required
              />
              {state?.errors?.city && (
                <p id="city-error" className="text-sm text-destructive">{state.errors.city[0]}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkInTime">Check-in *</Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                defaultValue={defaultValues?.checkInTime ?? "15:00"}
                required
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out *</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                defaultValue={defaultValues?.checkOutTime ?? "11:00"}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "En cours..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Choix :**
- **`"use client"`** — nécessaire pour `useActionState` (interactivité formulaire)
- **Réutilisable** — `defaultValues` optionnel pour le mode édition (#17), `action` injectée en prop
- **`useActionState`** (React 19) — gère le pending state et les erreurs retournées par la server action
- **`defaultValue`** (pas `value`) — formulaire non contrôlé, compatible progressive enhancement
- **Validation HTML native** (`required`, `type="email"`) en première ligne + Zod côté serveur en fallback
- **Pas de state management client** — les erreurs viennent directement du retour de la server action

**Effort:** 40min

---

## S5 — Route création

**Fichier:** `app/admin/etablissements/nouveau/page.tsx` (CRÉER)

```typescript
import { EtablissementForm } from "@/features/etablissements/components/EtablissementForm";
import { createEtablissement } from "@/features/etablissements/actions/create-etablissement";

export default function NouvelEtablissementPage() {
  // TODO: vérifier rôle admin (redirect si non autorisé)

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <EtablissementForm
        action={createEtablissement}
        submitLabel="Créer l'établissement"
      />
    </main>
  );
}
```

**Effort:** 15min

---

## S6 — Route liste admin

**Fichier:** `app/admin/etablissements/page.tsx` (CRÉER)

Page admin listant les établissements avec des liens vers créer/modifier/supprimer. Distincte de la page publique #13 : elle inclut les actions admin.

```typescript
import Link from "next/link";
import { getEtablissements } from "@/features/etablissements/queries/get-etablissements";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminEtablissementsPage() {
  // TODO: vérifier rôle admin

  const etablissements = await getEtablissements();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des établissements</h1>
        <Button asChild>
          <Link href="/admin/etablissements/nouveau">Ajouter</Link>
        </Button>
      </div>

      {etablissements.length === 0 ? (
        <p className="text-muted-foreground">Aucun établissement.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {etablissements.map((etablissement) => (
              <TableRow key={etablissement.id}>
                <TableCell className="font-medium">{etablissement.name}</TableCell>
                <TableCell>{etablissement.city}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/etablissements/${etablissement.id}/modifier`}>
                        Modifier
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
```

**Choix :**
- `Table` shadcn/ui — plus adapté qu'une liste de cards pour une vue admin, scalable avec 20+ entrées
- Réutilise `getEtablissements` de #13 — même query, vue différente
- Le bouton "Supprimer" n'est plus un lien — il sera un `AlertDialog` ajouté dans #18
- Server Component — pas d'interactivité, juste de la lecture + liens

**Effort:** 20min

---

## S7 — Vérification

### Checklist

- [x] `/admin/etablissements` affiche la liste avec boutons Ajouter/Modifier/Supprimer
- [x] `/admin/etablissements/nouveau` affiche le formulaire
- [x] Soumettre avec les champs obligatoires vides → erreurs de validation affichées
- [x] Soumettre un formulaire valide → établissement créé, redirection vers la liste
- [x] Le nouvel établissement apparaît dans la liste admin ET la liste publique (#13)
- [x] Le bouton est disabled pendant la soumission (pending state)
- [x] `bun run lint` passe
- [x] `bun run build` passe

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Installer shadcn/ui (input, label, textarea, card) | 10min |
| 2 | S2 | Créer le schéma Zod | 15min |
| 3 | S3 | Créer la server action `createEtablissement` | 20min |
| 4 | S4 | Créer `EtablissementForm` (réutilisable) | 40min |
| 5 | S5 | Créer la route `/admin/etablissements/nouveau` | 15min |
| 6 | S6 | Créer la route `/admin/etablissements` (liste admin) | 20min |
| 7 | S7 | Vérification checklist | 15min |
| — | — | **Commit** : `feat(etablissements): implement create form and admin listing (#16)` | — |

---

## Hors scope

| Sujet | Issue |
|-------|-------|
| Contrôle d'accès admin | #30 (Thélio) |
| Modifier un établissement | #17 (plan séparé, réutilise le formulaire) |
| Supprimer un établissement | #18 (plan séparé) |

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`

[2026-03-18] Toutes étapes — Nommage adapté du français vers l'anglais : `etablissements` → `establishments`, `EtablissementForm` → `EstablishmentForm`, `createEtablissement` → `createEstablishment`, routes `/admin/etablissements/` → `/admin/establishments/`, `nouveau` → `new`. **Raison :** alignement avec la convention de nommage anglais adoptée dans le commit cf61360.

[2026-03-18] S4 — Ajout de l'affichage des erreurs `_form` (erreur globale du formulaire, ex: "Aucun gérant disponible"). **Raison :** le plan ne prévoyait pas l'affichage de cette erreur côté client alors que la server action peut la retourner.
