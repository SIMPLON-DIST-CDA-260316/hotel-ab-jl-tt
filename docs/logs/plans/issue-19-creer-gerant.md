# Plan: #19 — Créer un compte gérant et l'assigner à un établissement

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Created:** 2026-03-20
**Status:** 🔲 À faire
**Source:** Issue #19, Epic #2
**Scope:** Infra partagée + feature `managers/` + formulaire création + page liste admin
**Effort total:** ~4h
**Best practices appliquées:** `server-auth-actions`, `8-authorization`, `8-error-handling`
**Dépendances:** Auth (#10) terminée, establishments feature terminée

---

## Suivi d'avancement

- [ ] **S0** — Infra partagée : promouvoir `ActionResult`, extraire `hashPassword` *(20min)*
- [ ] **S1** — Installer shadcn/ui `select` *(5min)*
- [ ] **S2** — Schéma Zod `managerSchema` *(15min)*
- [ ] **S3** — Query `getManagers` (liste avec établissement) *(20min)*
- [ ] **S4** — Query `getEstablishmentsForSelect` (dropdown) *(10min)*
- [ ] **S5** — Server action `createManager` *(30min)*
- [ ] **S6** — Composant `ManagerForm` (réutilisable pour #20) *(40min)*
- [ ] **S7** — Route `app/admin/managers/page.tsx` (liste admin) *(25min)*
- [ ] **S8** — Route `app/admin/managers/new/page.tsx` (création) *(15min)*
- [ ] **S9** — Vérification *(15min)*

**Approche :** La création de compte utilise le même pattern que `scripts/seed-admin.ts` (insertion directe `user` + `account` en transaction avec hash scrypt compatible Better Auth). Le formulaire est conçu réutilisable pour l'édition (#20).

---

## S0 — Infra partagée

### S0a — Promouvoir `ActionResult` vers shared

**Fichier:** `src/types/action.types.ts` (CRÉER)

Le type `ActionResult` est dupliqué entre features. Le promouvoir au shared layer.

```typescript
export type ActionErrors = Partial<Record<string, string[]>> & {
  _form?: string[];
};

export type ActionResult = {
  success: false;
  errors: ActionErrors;
};
```

**Fichier:** `src/features/establishments/types/action.types.ts` (MODIFIER)

Remplacer le contenu par un re-export :

```typescript
export type { ActionErrors, ActionResult } from "@/types/action.types";
```

> Note: normalement on interdit les barrel files, mais ici c'est un re-export temporaire pour ne pas casser les imports existants dans establishments. On peut le supprimer plus tard.

### S0b — Extraire `hashPassword` vers shared

**Fichier:** `src/lib/hash-password.ts` (CRÉER)

Extraction depuis `scripts/seed-admin.ts` — même logique, réutilisable par la server action.

```typescript
import { scryptSync, randomBytes } from "crypto";

// Must match Better Auth's internal hash format: hex(salt):hex(key)
// Parameters: N=16384, r=16, p=1, keylen=64  (see better-auth/src/utils/hash.ts)
const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}
```

**Fichier:** `scripts/seed-admin.ts` (MODIFIER)

Remplacer la fonction locale par l'import :

```typescript
import { hashPassword } from "@/lib/hash-password";
```

Et supprimer la fonction `hashPassword` inline.

**Effort:** 20min

---

## S1 — Installer shadcn/ui `select`

```bash
bunx shadcn@latest add select
```

Nécessaire pour le dropdown de sélection d'établissement dans le formulaire.

**Effort:** 5min

---

## S2 — Schéma Zod `managerSchema`

**Fichier:** `src/features/managers/lib/manager-schema.ts` (CRÉER)

```typescript
import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

export const createManagerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z.email("Email invalide"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial",
    ),
  establishmentId: z.string().min(1, "L'établissement est obligatoire"),
});

export type CreateManagerFormData = z.infer<typeof createManagerSchema>;

export const updateManagerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est obligatoire").max(100),
  lastName: z.string().min(1, "Le nom est obligatoire").max(100),
  email: z.email("Email invalide"),
  establishmentId: z.string().optional().or(z.literal("")),
});

export type UpdateManagerFormData = z.infer<typeof updateManagerSchema>;
```

**Choix :**
- Deux schémas séparés : `createManagerSchema` (avec password) et `updateManagerSchema` (sans password) — l'édition ne permet pas de changer le mot de passe (critère d'acceptation #20)
- `PASSWORD_REGEX` dupliqué depuis `auth-schemas.ts` — les features ne peuvent pas s'importer entre elles (règle architecture). 2 occurrences ne justifient pas une extraction shared
- `firstName` + `lastName` séparés — concat en `name` côté server action (même pattern que `register.ts`)
- `establishmentId` optionnel en update — le gérant peut ne pas être assigné à un établissement

**Effort:** 15min

---

## S3 — Query `getManagers`

**Fichier:** `src/features/managers/queries/get-managers.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { user, establishment } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { ROLES } from "@/config/roles";

export async function getManagers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      establishmentName: establishment.name,
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
        eq(user.role, ROLES.MANAGER),
        isNull(user.deletedAt),
      ),
    );
}
```

**Choix :**
- `LEFT JOIN` sur establishment — un gérant peut ne pas encore être assigné
- Filtre `deletedAt IS NULL` sur les deux tables — soft delete
- Retourne `establishmentName` pour l'affichage dans la liste sans requête supplémentaire
- Un gérant peut gérer plusieurs établissements (MCD 0:N). Ce query retournera une ligne par établissement. Pour la v1, on n'affiche que le premier. **TODO** : si un gérant a plusieurs établissements, il faudra grouper.

**Note :** Le MCD autorise 0:N (un manager peut gérer N establishments). La query retournera une ligne par établissement. Pour éviter les doublons dans la liste, on groupe par manager côté JS dans la page. Alternative future : utiliser `string_agg` côté SQL.

**Effort:** 20min

---

## S4 — Query `getEstablishmentsForSelect`

**Fichier:** `src/features/managers/queries/get-establishments-for-select.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { establishment } from "@/lib/db/schema";
import { isNull } from "drizzle-orm";

export async function getEstablishmentsForSelect() {
  return db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
    })
    .from(establishment)
    .where(isNull(establishment.deletedAt));
}
```

**Choix :**
- Retourne tous les établissements actifs — pas de filtre "sans gérant" car un gérant peut être reassigné à un établissement déjà géré (le MCD le permet)
- Minimaliste : id, name, city suffisent pour un `<Select>`
- Placée dans `features/managers/` (pas `features/establishments/`) car c'est un besoin spécifique au formulaire manager. Si d'autres features en ont besoin, promouvoir

**Effort:** 10min

---

## S5 — Server action `createManager`

**Fichier:** `src/features/managers/actions/create-manager.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { user, account, establishment } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";
import { hashPassword } from "@/lib/hash-password";
import { createManagerSchema } from "../lib/manager-schema";
import type { ActionResult } from "@/types/action.types";

export async function createManager(
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    establishmentId: formData.get("establishmentId"),
  };

  const parsed = createManagerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, password, establishmentId } = parsed.data;

  // Check email uniqueness
  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (existingUser) {
    return {
      success: false,
      errors: { email: ["Cette adresse email est déjà utilisée"] },
    };
  }

  const userId = crypto.randomUUID();
  const now = new Date();
  const managerName = `${firstName} ${lastName}`;

  try {
    await db.transaction(async (tx) => {
      // 1. Create user with manager role
      await tx.insert(user).values({
        id: userId,
        name: managerName,
        email,
        emailVerified: true,
        role: "manager",
        createdAt: now,
        updatedAt: now,
      });

      // 2. Create credential account (Better Auth format)
      await tx.insert(account).values({
        id: crypto.randomUUID(),
        accountId: email,
        providerId: "credential",
        userId,
        password: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      });

      // 3. Assign to establishment
      if (establishmentId) {
        await tx
          .update(establishment)
          .set({ managerId: userId })
          .where(eq(establishment.id, establishmentId));
      }
    });
  } catch (error) {
    console.error("Failed to create manager:", error);
    return {
      success: false,
      errors: { _form: ["Une erreur est survenue lors de la création"] },
    };
  }

  redirect("/admin/managers");
}
```

**Choix :**
- **`requireAdmin()`** en première instruction — directive `8-authorization`
- **Transaction** — cohérence : si l'insertion account échoue, le user est rollbacké
- **Pattern seed-admin** — insertion `user` + `account` avec hash scrypt, même format que Better Auth
- **`emailVerified: true`** — le compte est créé par l'admin, pas besoin de vérification
- **`accountId: email`** — convention Better Auth pour le provider `credential`
- **Assignation establishment** — update `managerId` dans la même transaction. Si l'établissement avait un ancien gérant, il est remplacé
- **Email uniqueness check** — avant la transaction pour un message d'erreur clair

**Effort:** 30min

---

## S6 — Composant `ManagerForm`

**Fichier:** `src/features/managers/components/ManagerForm.tsx` (CRÉER)

```typescript
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActionResult } from "@/types/action.types";

type FormState = ActionResult | null;

type EstablishmentOption = {
  id: string;
  name: string;
  city: string;
};

type ManagerFormProps = {
  action: (formData: FormData) => Promise<FormState>;
  establishments: EstablishmentOption[];
  defaultValues?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    establishmentId?: string;
  };
  showPassword?: boolean;
  submitLabel?: string;
};

export function ManagerForm({
  action,
  establishments,
  defaultValues,
  showPassword = true,
  submitLabel = "Créer",
}: ManagerFormProps) {
  const [state, formAction, isPending] = useActionState(
    (_prev: FormState, formData: FormData) => action(formData),
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {defaultValues ? "Modifier le gérant" : "Nouveau gérant"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                defaultValue={defaultValues?.firstName ?? ""}
                aria-describedby={
                  state?.errors?.firstName ? "firstName-error" : undefined
                }
                required
              />
              {state?.errors?.firstName && (
                <p id="firstName-error" className="text-sm text-destructive">
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                defaultValue={defaultValues?.lastName ?? ""}
                aria-describedby={
                  state?.errors?.lastName ? "lastName-error" : undefined
                }
                required
              />
              {state?.errors?.lastName && (
                <p id="lastName-error" className="text-sm text-destructive">
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaultValues?.email ?? ""}
              aria-describedby={
                state?.errors?.email ? "email-error" : undefined
              }
              required
            />
            {state?.errors?.email && (
              <p id="email-error" className="text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {showPassword && (
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                aria-describedby={
                  state?.errors?.password ? "password-error" : undefined
                }
                required
              />
              {state?.errors?.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Min. 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="establishmentId">Établissement</Label>
            <Select
              name="establishmentId"
              defaultValue={defaultValues?.establishmentId ?? ""}
            >
              <SelectTrigger id="establishmentId">
                <SelectValue placeholder="Sélectionner un établissement" />
              </SelectTrigger>
              <SelectContent>
                {!showPassword && (
                  <SelectItem value="">Aucun</SelectItem>
                )}
                {establishments.map((est) => (
                  <SelectItem key={est.id} value={est.id}>
                    {est.name} — {est.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.establishmentId && (
              <p className="text-sm text-destructive">
                {state.errors.establishmentId[0]}
              </p>
            )}
          </div>

          {state?.errors?._form && (
            <p role="alert" className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

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
- **Réutilisable** — `showPassword` pour masquer le champ en mode édition (#20), `defaultValues` pour pré-remplir
- **`showPassword` est un flag parameter** — normalement interdit par les conventions clean code, mais ici c'est un paramètre de rendu (pas de logique métier). L'alternative (2 composants séparés) dupliquerait 90% du code. Acceptable.
- **`Select` shadcn/ui** — Radix gère l'accessibilité clavier (arrow keys, search)
- **`name="establishmentId"`** — inclus dans le FormData nativement par le `<Select>` Radix
- **Pas de `required` sur le Select** — le Zod schema gère la validation obligatoire côté serveur. La raison : `<Select>` Radix ne supporte pas l'attribut `required` nativement
- **`autoComplete`** sur les champs identité — directive accessibilité

**Effort:** 40min

---

## S7 — Route liste admin

**Fichier:** `app/admin/managers/page.tsx` (CRÉER)

```typescript
import Link from "next/link";
import { getManagers } from "@/features/managers/queries/get-managers";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminManagersPage() {
  const managers = await getManagers();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des gérants</h1>
        <Button asChild>
          <Link href="/admin/managers/new">Ajouter</Link>
        </Button>
      </div>

      {managers.length === 0 ? (
        <p className="text-muted-foreground">Aucun gérant.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Établissement</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager) => (
              <TableRow key={manager.id}>
                <TableCell className="font-medium">{manager.name}</TableCell>
                <TableCell>{manager.email}</TableCell>
                <TableCell>
                  {manager.establishmentName ?? (
                    <span className="text-muted-foreground">Non assigné</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/managers/${manager.id}/edit`}>
                        Modifier
                      </Link>
                    </Button>
                    {/* DeleteManagerButton ajouté dans #20 */}
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
- Même structure que `AdminEstablishmentsPage` — cohérence admin
- Affiche l'établissement assigné — info clé pour l'admin
- Bouton supprimer sera ajouté dans le plan #20
- Server Component — lecture seule

**Effort:** 25min

---

## S8 — Route création

**Fichier:** `app/admin/managers/new/page.tsx` (CRÉER)

```typescript
import { ManagerForm } from "@/features/managers/components/ManagerForm";
import { createManager } from "@/features/managers/actions/create-manager";
import { getEstablishmentsForSelect } from "@/features/managers/queries/get-establishments-for-select";

export default async function NewManagerPage() {
  const establishments = await getEstablishmentsForSelect();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <ManagerForm
        action={createManager}
        establishments={establishments}
        submitLabel="Créer le gérant"
      />
    </main>
  );
}
```

**Effort:** 15min

---

## S9 — Vérification

### Checklist

- [ ] `/admin/managers` affiche la liste (vide si aucun gérant en base)
- [ ] `/admin/managers/new` affiche le formulaire avec dropdown établissements
- [ ] Soumettre avec champs obligatoires vides → erreurs de validation
- [ ] Mot de passe faible → erreur regex affichée
- [ ] Email déjà existant → erreur "Cette adresse email est déjà utilisée"
- [ ] Formulaire valide → gérant créé, redirection vers la liste
- [ ] Le gérant apparaît dans la liste avec son établissement assigné
- [ ] Le gérant peut se connecter via `/sign-in` avec ses identifiants
- [ ] Le bouton est disabled pendant la soumission (pending state)
- [ ] `bun run lint` passe
- [ ] `bun run build` passe

**Effort:** 15min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S0 | Infra partagée (ActionResult, hashPassword) | 20min |
| 2 | S1 | Installer shadcn/ui `select` | 5min |
| 3 | S2 | Schéma Zod manager | 15min |
| 4 | S3 | Query `getManagers` | 20min |
| 4 | S4 | Query `getEstablishmentsForSelect` | 10min |
| 5 | S5 | Server action `createManager` | 30min |
| 6 | S6 | Composant `ManagerForm` | 40min |
| 7 | S7 | Route `/admin/managers` (liste) | 25min |
| 8 | S8 | Route `/admin/managers/new` (création) | 15min |
| 9 | S9 | Vérification | 15min |
| — | — | **Commit** : `feat(managers): implement create manager form and admin listing (#19)` | — |

---

## Hors scope

| Sujet | Issue |
|-------|-------|
| Modifier/supprimer un gérant | #20 (plan séparé) |
| Navigation admin (sidebar/header) | Design Agathe |

---

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`
