# Plan: #5 #24 #25 #6 #26 #27 — Réservations (créer, consulter, annuler)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Created:** 2026-03-25
**Status:** ✅ Implémenté
**Source:** Issues #5 (Epic), #24, #25, #6 (Epic), #26, #27
**Scope:** Feature bookings complète — vérification dispo, création pending, checkout simulé, liste client, annulation
**Effort total:** ~6h
**Best practices appliquées:** `server-auth-actions`, `server-serialization`, `availability-check`, `price-snapshot`, `pending-expiry`
**Dépendances:** Auth fonctionnelle (Better Auth), schéma DB booking en place, features establishments/suites existantes, `src/types/action.types.ts` promu depuis la branche `feature/manage-managers` (à merger ou cherry-pick avant)

**Goal:** Permettre aux clients de vérifier la disponibilité d'une suite, créer une réservation (pending → confirmed via paiement simulé), consulter leurs réservations et les annuler.

**Architecture:** Feature `src/features/bookings/` auto-contenue avec queries (disponibilité, liste), actions (créer, confirmer, annuler), composants (formulaire, checkout, liste, carte). Les pages `app/` orchestrent. La vérification de disponibilité est une query serveur réutilisée par le formulaire et la server action.

**Tech Stack:** Next.js App Router, Drizzle ORM, Zod, shadcn/ui, Better Auth (guards)

---

## Décisions d'implémentation

1. **Flow en 2 étapes** — Vérifier dispo → "Réserver" crée un booking `pending` avec `expiresAt` (now + 15min) → redirect vers `/bookings/[id]/checkout` → "Payer" passe le statut à `confirmed`.
2. **Un seul pending par utilisateur** — Créer un nouveau pending annule automatiquement le précédent. Empêche un client de bloquer plusieurs suites simultanément.
3. **Expiration au runtime** — Pas de cron. Les queries de dispo filtrent : un booking `pending` dont `expiresAt < now()` est traité comme inexistant (suite disponible). Pas de statut `expired` séparé.
4. **Paiement simulé** — Pas de collecte d'infos bancaires. Bouton "Payer avec vos informations bancaires" qui confirme directement. Comportement minimaliste réaliste.
5. **Snapshot prix** — `pricePerNight` copié depuis `suite.price` au moment de la création du pending.
6. **Référence unique** — Format `CDL-YYYY-XXXX` généré côté serveur (compteur séquentiel par année).
7. **`guestCount` requis** — Champ dans le formulaire (contrainte du schéma DB, absent des critères d'acceptation mais nécessaire).
8. **Options (bookingOption) hors scope** — Aucune issue ne les mentionne. `totalPrice` = `nbNuits × pricePerNight`.
9. **Annulation** — Seulement depuis `confirmed`, uniquement si `checkIn` dans plus de 3 jours.
10. **Redirect vers auth** — Si non connecté, redirect vers `/sign-in?callbackUrl=...`.
11. **`requireSession()` (pas `requireClient()`)** — Tout utilisateur connecté peut réserver, y compris gérant/admin. Le merise impose un rôle unique par user et un email unique, donc pas de multi-comptes. Restreindre à `requireClient()` bloquerait un gérant/admin sans alternative. Si besoin futur de restreindre, changement d'une ligne.

---

## Modification schéma DB

Le schéma `booking` actuel n'a pas de champ `expiresAt`. Il faut l'ajouter :

```typescript
expiresAt: timestamp("expires_at"), // null pour les bookings confirmed/cancelled/completed
```

Ce champ est nullable : seuls les bookings `pending` ont une valeur. Après confirmation, il reste `null` (ou sa valeur n'est plus consultée).

---

## Condition de disponibilité (réutilisée partout)

Un booking bloque une suite si et seulement si :
```sql
status != 'cancelled'
AND NOT (status = 'pending' AND expires_at < now())
AND check_in < :newCheckOut
AND check_out > :newCheckIn
```

Cette condition est centralisée dans une fonction utilitaire pour éviter la duplication.

---

## Suivi d'avancement

- [x] **S1** — Ajout `expiresAt` au schéma DB + push *(10min)*
- [x] **S2** — Types + schéma Zod + utilitaire dispo SQL + constantes *(25min)*
- [x] **S3** — Query `checkSuiteAvailability` *(15min)*
- [x] **S4** — Query `getSuiteWithEstablishment` *(15min)*
- [x] **S5** — Utilitaire `generateBookingReference` *(15min)*
- [x] **S6** — Server action `createPendingBooking` *(30min)*
- [x] **S7** — Composant `BookingForm` (dispo + réservation) *(40min)*
- [x] **S8** — API route GET `/api/bookings/availability` *(10min)*
- [x] **S9** — Route `/suites/[id]/book` *(15min)*
- [x] **S10** — Server action `confirmBooking` (paiement simulé) *(20min)*
- [x] **S11a** — Query `getBookingForCheckout` *(10min)*
- [x] **S11b** — Composant `CheckoutCard` + route `/bookings/[id]/checkout` *(30min)*
- [x] **S12** — Query `getClientBookings` *(15min)*
- [x] **S13** — Server action `cancelBooking` *(20min)*
- [x] **S14** — Composants `BookingCard` + `CancelBookingButton` *(30min)*
- [x] **S15** — Route `/bookings` (liste client) *(15min)*
- [x] **S16** — Vérification *(20min)*

---

## S1 — Ajout `expiresAt` au schéma DB

**Fichier:** `src/lib/db/schema/domain.ts` (MODIFIER — table `booking`)

Ajouter le champ `expiresAt` après `cancelledAt` :

```typescript
expiresAt: timestamp("expires_at"),
```

Puis appliquer :

```bash
bun run db:push
```

**Choix :**
- Nullable — seuls les bookings `pending` utilisent ce champ
- Pas de migration Drizzle (on utilise `db:push` en dev)

**Effort:** 10min

---

## S2 — Types + schéma Zod + utilitaire dispo SQL

**Fichier:** `src/features/bookings/lib/booking-schema.ts` (CRÉER)

```typescript
import { z } from "zod";

export const bookingSchema = z
  .object({
    suiteId: z.string().min(1, "La suite est obligatoire"),
    checkIn: z.coerce.date({
      required_error: "La date d'arrivée est obligatoire",
    }),
    checkOut: z.coerce.date({
      required_error: "La date de départ est obligatoire",
    }),
    guestCount: z.coerce
      .number({ required_error: "Le nombre de voyageurs est obligatoire" })
      .int()
      .min(1, "Au moins 1 voyageur"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "La date de départ doit être postérieure à la date d'arrivée",
    path: ["checkOut"],
  })
  .refine((data) => data.checkIn >= new Date(new Date().toDateString()), {
    message: "La date d'arrivée ne peut pas être dans le passé",
    path: ["checkIn"],
  });

export type BookingFormData = z.infer<typeof bookingSchema>;
```

**Fichier:** `src/features/bookings/types/booking.types.ts` (CRÉER)

```typescript
import type { ActionErrors } from "@/types/action.types";

export type BookingActionResult =
  | { success: true; bookingId: string; bookingReference: string }
  | { success: false; errors: ActionErrors };

export type AvailabilityResult = {
  available: boolean;
  nightCount: number;
  pricePerNight: number;
  totalPrice: number;
};
```

**Fichier:** `src/features/bookings/lib/booking-constants.ts` (CRÉER)

```typescript
/** Durée de validité d'un booking pending avant expiration */
export const PENDING_EXPIRY_MINUTES = 15;

/** Nombre de jours minimum avant check-in pour pouvoir annuler */
export const CANCELLATION_DELAY_DAYS = 3;
```

**Fichier:** `src/features/bookings/lib/availability-filter.ts` (CRÉER)

Condition SQL centralisée pour déterminer si un booking bloque une suite :

```typescript
import { and, eq, ne, lt, gt, sql, not } from "drizzle-orm";
import { booking } from "@/lib/db/schema/domain";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

/**
 * Returns a SQL condition matching bookings that actively block a suite
 * for the given date range. Excludes cancelled bookings and expired pendings.
 */
export function activeBookingOverlap(
  suiteId: string,
  checkIn: Date,
  checkOut: Date,
) {
  return and(
    eq(booking.suiteId, suiteId),
    ne(booking.status, BOOKING_STATUSES.CANCELLED),
    not(
      and(
        eq(booking.status, BOOKING_STATUSES.PENDING),
        lt(booking.expiresAt, sql`now()`),
      ),
    ),
    lt(booking.checkIn, checkOut),
    gt(booking.checkOut, checkIn),
  );
}
```

**Choix :**
- Condition centralisée — utilisée dans `checkSuiteAvailability`, `createPendingBooking`, `confirmBooking`
- `not(pending AND expired)` — un pending expiré ne bloque pas la suite
- `ne(cancelled)` — les annulées ne bloquent jamais
- `BookingActionResult` inclut `bookingId` pour le redirect vers checkout

**Effort:** 25min

---

## S3 — Query `checkSuiteAvailability`

**Fichier:** `src/features/bookings/queries/check-suite-availability.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { booking, suite } from "@/lib/db/schema/domain";
import { and, eq, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { activeBookingOverlap } from "../lib/availability-filter";
import type { AvailabilityResult } from "../types/booking.types";

export async function checkSuiteAvailability(
  suiteId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<AvailabilityResult | null> {
  const [foundSuite] = await db
    .select({ price: suite.price })
    .from(suite)
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  if (!foundSuite) return null;

  const [overlap] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(activeBookingOverlap(suiteId, checkIn, checkOut));

  const nightCount = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  const pricePerNight = Number(foundSuite.price);
  const totalPrice = nightCount * pricePerNight;
  const isAvailable = overlap.count === 0;

  return {
    available: isAvailable,
    nightCount,
    pricePerNight,
    totalPrice,
  };
}
```

**Effort:** 15min

---

## S4 — Query `getSuiteWithEstablishment`

**Fichier:** `src/features/bookings/queries/get-suite-with-establishment.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { suite, establishment } from "@/lib/db/schema/domain";
import { eq, and, isNull } from "drizzle-orm";

export async function getSuiteWithEstablishment(suiteId: string) {
  const [foundSuite] = await db
    .select({
      id: suite.id,
      title: suite.title,
      price: suite.price,
      capacity: suite.capacity,
      mainImage: suite.mainImage,
      establishment: {
        id: establishment.id,
        name: establishment.name,
        city: establishment.city,
      },
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(eq(suite.id, suiteId), isNull(suite.deletedAt)));

  return foundSuite ?? null;
}
```

**Effort:** 15min

---

## S5 — Utilitaire `generateBookingReference`

**Fichier:** `src/features/bookings/lib/generate-booking-reference.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { sql } from "drizzle-orm";

const MAX_REFERENCE_RETRIES = 3;

export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CDL-${year}-`;

  for (let attempt = 0; attempt < MAX_REFERENCE_RETRIES; attempt++) {
    const [result] = await db
      .select({
        lastRef: sql<string>`max(${booking.reference})`,
      })
      .from(booking)
      .where(sql`${booking.reference} LIKE ${prefix + "%"}`);

    const lastNumber = result?.lastRef
      ? parseInt(result.lastRef.replace(prefix, ""), 10)
      : 0;

    const nextNumber = String(lastNumber + 1 + attempt).padStart(4, "0");

    return `${prefix}${nextNumber}`;
  }

  throw new Error("Failed to generate unique booking reference after retries");
}
```

**Choix :**
- Retry loop pour gérer les accès concurrents sur `max(reference)`
- L'offset `+ attempt` augmente le numéro à chaque tentative en cas de collision
- La contrainte `UNIQUE` sur `reference` en DB est le filet de sécurité final
- En pratique, la collision est rare (le retry ne sera quasi jamais utilisé)

**Effort:** 15min

---

## S6 — Server action `createPendingBooking`

**Fichier:** `src/features/bookings/actions/create-pending-booking.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { suite } from "@/lib/db/schema/domain";
import { eq, and, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth-guards";
import { bookingSchema } from "../lib/booking-schema";
import { generateBookingReference } from "../lib/generate-booking-reference";
import { activeBookingOverlap } from "../lib/availability-filter";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { PENDING_EXPIRY_MINUTES } from "../lib/booking-constants";
import type { BookingActionResult } from "../types/booking.types";

export async function createPendingBooking(
  formData: FormData,
): Promise<BookingActionResult> {
  const session = await requireSession();

  const raw = {
    suiteId: formData.get("suiteId"),
    checkIn: formData.get("checkIn"),
    checkOut: formData.get("checkOut"),
    guestCount: formData.get("guestCount"),
  };

  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { suiteId, checkIn, checkOut, guestCount } = parsed.data;

  // Fetch suite for price snapshot + capacity check
  const [foundSuite] = await db
    .select({ price: suite.price, capacity: suite.capacity })
    .from(suite)
    .where(eq(suite.id, suiteId));

  if (!foundSuite) {
    return { success: false, errors: { _form: ["Suite introuvable"] } };
  }

  if (guestCount > foundSuite.capacity) {
    return {
      success: false,
      errors: {
        guestCount: [`Capacité maximale : ${foundSuite.capacity} voyageurs`],
      },
    };
  }

  // Cancel any existing pending booking for this user
  await db
    .update(booking)
    .set({
      status: BOOKING_STATUSES.CANCELLED,
      cancelledAt: new Date(),
    })
    .where(
      and(
        eq(booking.clientId, session.user.id),
        eq(booking.status, BOOKING_STATUSES.PENDING),
      ),
    );

  // Re-check availability (race condition protection)
  const [overlap] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(activeBookingOverlap(suiteId, checkIn, checkOut));

  if (overlap.count > 0) {
    return {
      success: false,
      errors: {
        _form: ["Cette suite n'est plus disponible sur les dates choisies"],
      },
    };
  }

  const nightCount = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );
  const pricePerNight = Number(foundSuite.price);
  const totalPrice = nightCount * pricePerNight;

  const reference = await generateBookingReference();

  const expiresAt = new Date(
    Date.now() + PENDING_EXPIRY_MINUTES * 60 * 1000,
  );

  const [createdBooking] = await db
    .insert(booking)
    .values({
      reference,
      checkIn,
      checkOut,
      guestCount,
      pricePerNight: foundSuite.price,
      totalPrice: totalPrice.toFixed(2),
      status: BOOKING_STATUSES.PENDING,
      clientId: session.user.id,
      suiteId,
      expiresAt,
    })
    .returning({ id: booking.id });

  return {
    success: true,
    bookingId: createdBooking.id,
    bookingReference: reference,
  };
}
```

**Choix :**
- `requireSession()` en première instruction — tout utilisateur connecté peut réserver
- Annule automatiquement tout pending existant du même utilisateur avant d'en créer un nouveau → un seul pending par client
- Double vérification de dispo côté serveur (race condition)
- `expiresAt` = now + 15 min
- `PENDING_EXPIRY_MINUTES` = constante nommée
- Retourne `bookingId` pour le redirect vers checkout
- Snapshot du prix dans `pricePerNight` et calcul de `totalPrice`

**Effort:** 30min

---

## S7 — Composant `BookingForm`

**Fichier:** `src/features/bookings/components/BookingForm.tsx` (CRÉER)

Ce composant gère la vérification de disponibilité et la création du pending.

```typescript
"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPendingBooking } from "../actions/create-pending-booking";
import type { BookingActionResult } from "../types/booking.types";
import type { AvailabilityResult } from "../types/booking.types";

type BookingFormProps = {
  suiteId: string;
  suiteTitle: string;
  establishmentName: string;
  pricePerNight: number;
  capacity: number;
};

export function BookingForm({
  suiteId,
  suiteTitle,
  establishmentName,
  pricePerNight,
  capacity,
}: BookingFormProps) {
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  const [state, formAction, isPending] = useActionState(
    async (
      _prev: BookingActionResult | null,
      formData: FormData,
    ): Promise<BookingActionResult | null> => {
      formData.set("suiteId", suiteId);
      const result = await createPendingBooking(formData);
      if (result.success) {
        router.push(`/bookings/${result.bookingId}/checkout`);
        return null;
      }
      return result;
    },
    null,
  );

  async function handleCheckAvailability(formData: FormData) {
    setIsChecking(true);
    try {
      const checkIn = formData.get("checkIn") as string;
      const checkOut = formData.get("checkOut") as string;

      if (!checkIn || !checkOut) {
        setAvailability(null);
        return;
      }

      const response = await fetch(
        `/api/bookings/availability?suiteId=${suiteId}&checkIn=${checkIn}&checkOut=${checkOut}`,
      );
      const result: AvailabilityResult = await response.json();
      setAvailability(result);
    } finally {
      setIsChecking(false);
    }
  }

  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réserver {suiteTitle}</CardTitle>
        <CardDescription>
          {establishmentName} —{" "}
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
          }).format(pricePerNight)}{" "}
          / nuit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <input type="hidden" name="suiteId" value={suiteId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkIn">Date d'arrivée *</Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                min={todayISO}
                required
                onChange={() => setAvailability(null)}
                aria-describedby={
                  state?.success === false && state.errors?.checkIn
                    ? "checkIn-error"
                    : undefined
                }
              />
              {state?.success === false && state.errors?.checkIn && (
                <p id="checkIn-error" className="text-sm text-destructive">
                  {state.errors.checkIn[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="checkOut">Date de départ *</Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                min={todayISO}
                required
                onChange={() => setAvailability(null)}
                aria-describedby={
                  state?.success === false && state.errors?.checkOut
                    ? "checkOut-error"
                    : undefined
                }
              />
              {state?.success === false && state.errors?.checkOut && (
                <p id="checkOut-error" className="text-sm text-destructive">
                  {state.errors.checkOut[0]}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="guestCount">Nombre de voyageurs *</Label>
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              max={capacity}
              defaultValue={1}
              required
              aria-describedby={
                state?.success === false && state.errors?.guestCount
                  ? "guestCount-error"
                  : undefined
              }
            />
            <p className="text-sm text-muted-foreground">
              Capacité maximale : {capacity}
            </p>
            {state?.success === false && state.errors?.guestCount && (
              <p id="guestCount-error" className="text-sm text-destructive">
                {state.errors.guestCount[0]}
              </p>
            )}
          </div>

          {state?.success === false && state.errors?._form && (
            <p className="text-sm text-destructive">
              {state.errors._form[0]}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="outline"
              disabled={isChecking}
              formAction={handleCheckAvailability}
            >
              {isChecking ? "Vérification..." : "Vérifier la disponibilité"}
            </Button>

            {availability?.available && (
              <Button type="submit" disabled={isPending} formAction={formAction}>
                {isPending ? "Réservation..." : "Réserver"}
              </Button>
            )}
          </div>

          {availability && (
            <div
              className={`rounded-lg border p-4 ${availability.available ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}`}
            >
              {availability.available ? (
                <>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Suite disponible !
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {availability.nightCount} nuit(s) ×{" "}
                    {new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                    }).format(availability.pricePerNight)}{" "}
                    ={" "}
                    <strong>
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(availability.totalPrice)}
                    </strong>
                  </p>
                </>
              ) : (
                <p className="font-medium text-red-800 dark:text-red-200">
                  Suite non disponible sur ces dates.
                </p>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
```

**Choix :**
- Deux boutons dans un seul formulaire avec `formAction` distinct
- "Vérifier" → fetch API (lecture, pas de mutation)
- "Réserver" → server action `createPendingBooking` → redirect vers checkout
- Le bouton "Réserver" n'apparaît que si la dispo est confirmée
- `router.push` après succès — navigation vers checkout sans rechargement complet
- Dark mode supporté sur les indicateurs de dispo

**Effort:** 40min

---

## S8 — API route GET `/api/bookings/availability`

**Fichier:** `app/api/bookings/availability/route.ts` (CRÉER)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkSuiteAvailability } from "@/features/bookings/queries/check-suite-availability";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const suiteId = searchParams.get("suiteId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!suiteId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 },
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  }

  if (checkOutDate <= checkInDate) {
    return NextResponse.json(
      { error: "La date de départ doit être postérieure à la date d'arrivée" },
      { status: 400 },
    );
  }

  const today = new Date(new Date().toDateString());
  if (checkInDate < today) {
    return NextResponse.json(
      { error: "La date d'arrivée ne peut pas être dans le passé" },
      { status: 400 },
    );
  }

  const result = await checkSuiteAvailability(
    suiteId,
    checkInDate,
    checkOutDate,
  );

  if (!result) {
    return NextResponse.json({ error: "Suite introuvable" }, { status: 404 });
  }

  return NextResponse.json(result);
}
```

**Choix :**
- API route (pas server action) — lecture côté client sans mutation
- Pas de guard auth — la vérification de dispo est publique

**Effort:** 10min

---

## S9 — Route `/suites/[id]/book`

**Fichier:** `app/suites/[id]/book/page.tsx` (CRÉER)

```typescript
import { notFound, redirect } from "next/navigation";
import { getSuiteWithEstablishment } from "@/features/bookings/queries/get-suite-with-establishment";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type BookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?callbackUrl=/suites/${id}/book`);
  }

  const suiteData = await getSuiteWithEstablishment(id);

  if (!suiteData) {
    notFound();
  }

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <BookingForm
        suiteId={suiteData.id}
        suiteTitle={suiteData.title}
        establishmentName={suiteData.establishment.name}
        pricePerNight={Number(suiteData.price)}
        capacity={suiteData.capacity}
      />
    </main>
  );
}
```

**Choix :**
- Redirect vers sign-in avec `callbackUrl` si non connecté — ramène au flow après login
- `notFound()` si la suite n'existe pas
- `Number(suiteData.price)` — conversion `numeric` Drizzle

**Effort:** 15min

---

**Commit :** `feat(bookings): implement availability check and pending booking creation (#24 #25)`

---

## S10 — Server action `confirmBooking`

**Fichier:** `src/features/bookings/actions/confirm-booking.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { eq, and, sql } from "drizzle-orm";
import { requireSession } from "@/lib/auth-guards";
import { activeBookingOverlap } from "../lib/availability-filter";
import { BOOKING_STATUSES } from "@/config/booking-statuses";

import type { ActionErrors } from "@/types/action.types";

type ConfirmResult =
  | { success: true }
  | { success: false; errors: ActionErrors };

export async function confirmBooking(
  bookingId: string,
): Promise<ConfirmResult> {
  const session = await requireSession();

  const [foundBooking] = await db
    .select({
      id: booking.id,
      clientId: booking.clientId,
      status: booking.status,
      expiresAt: booking.expiresAt,
      suiteId: booking.suiteId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    })
    .from(booking)
    .where(eq(booking.id, bookingId));

  if (!foundBooking) {
    return { success: false, errors: { _form: ["Réservation introuvable"] } };
  }

  if (foundBooking.clientId !== session.user.id) {
    return { success: false, errors: { _form: ["Accès non autorisé"] } };
  }

  if (foundBooking.status !== BOOKING_STATUSES.PENDING) {
    return { success: false, errors: { _form: ["Cette réservation n'est plus en attente de paiement"] } };
  }

  // Check if pending has expired
  if (foundBooking.expiresAt && foundBooking.expiresAt < new Date()) {
    return {
      success: false,
      errors: { _form: ["Le délai de réservation a expiré. Veuillez recommencer."] },
    };
  }

  // Final availability check (another booking may have been confirmed in the meantime)
  const [overlap] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(booking)
    .where(
      and(
        activeBookingOverlap(
          foundBooking.suiteId,
          foundBooking.checkIn,
          foundBooking.checkOut,
        ),
        // Exclude current booking from overlap check
        sql`${booking.id} != ${bookingId}`,
      ),
    );

  if (overlap.count > 0) {
    // Cancel this pending since suite is no longer available
    await db
      .update(booking)
      .set({
        status: BOOKING_STATUSES.CANCELLED,
        cancelledAt: new Date(),
      })
      .where(eq(booking.id, bookingId));

    return {
      success: false,
      errors: { _form: ["La suite n'est plus disponible sur ces dates. Votre réservation a été annulée."] },
    };
  }

  // Confirm the booking
  await db
    .update(booking)
    .set({
      status: BOOKING_STATUSES.CONFIRMED,
      expiresAt: null,
    })
    .where(eq(booking.id, bookingId));

  return { success: true };
}
```

**Choix :**
- Vérifie ownership, statut pending, non-expiré
- Re-check de dispo final — protection race condition (un autre client peut avoir confirmé entre-temps)
- Si conflit → annule le pending et retourne une erreur claire
- `expiresAt` mis à `null` après confirmation — plus pertinent
- Pas de redirect — le composant gère la navigation

**Effort:** 20min

---

## S11a — Query `getBookingForCheckout`

**Fichier:** `src/features/bookings/queries/get-booking-for-checkout.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";
import { eq } from "drizzle-orm";

export async function getBookingForCheckout(bookingId: string) {
  const [bookingData] = await db
    .select({
      id: booking.id,
      reference: booking.reference,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      pricePerNight: booking.pricePerNight,
      totalPrice: booking.totalPrice,
      status: booking.status,
      clientId: booking.clientId,
      expiresAt: booking.expiresAt,
      suite: {
        title: suite.title,
      },
      establishment: {
        name: establishment.name,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(eq(booking.id, bookingId));

  return bookingData ?? null;
}
```

**Effort:** 10min

---

## S11b — Composant `CheckoutCard` + route checkout

**Fichier:** `src/features/bookings/components/CheckoutCard.tsx` (CRÉER)

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { confirmBooking } from "../actions/confirm-booking";

type CheckoutCardProps = {
  bookingId: string;
  reference: string;
  suiteTitle: string;
  establishmentName: string;
  checkIn: string;
  checkOut: string;
  nightCount: number;
  pricePerNight: number;
  totalPrice: number;
  guestCount: number;
  expiresAt: string;
};

export function CheckoutCard({
  bookingId,
  reference,
  suiteTitle,
  establishmentName,
  checkIn,
  checkOut,
  nightCount,
  pricePerNight,
  totalPrice,
  guestCount,
  expiresAt,
}: CheckoutCardProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const expiryDate = new Date(expiresAt);

    function updateCountdown() {
      const remaining = Math.max(
        0,
        Math.floor((expiryDate.getTime() - Date.now()) / 1000),
      );
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  async function handleConfirm() {
    setIsPending(true);
    setError(null);
    const result = await confirmBooking(bookingId);
    if (result.success) {
      router.push("/bookings");
    } else {
      setError(result.errors._form?.[0] ?? "Erreur lors du paiement");
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finaliser votre réservation</CardTitle>
        <CardDescription>Réf. {reference}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p>
            <strong>Établissement :</strong> {establishmentName}
          </p>
          <p>
            <strong>Suite :</strong> {suiteTitle}
          </p>
          <p>
            <strong>Du</strong> {dateFormatter.format(new Date(checkIn))}{" "}
            <strong>au</strong> {dateFormatter.format(new Date(checkOut))}
          </p>
          <p>
            <strong>Voyageurs :</strong> {guestCount}
          </p>
          <p>
            {nightCount} nuit(s) × {currencyFormatter.format(pricePerNight)}
          </p>
          <p className="text-lg font-semibold">
            Total : {currencyFormatter.format(totalPrice)}
          </p>
        </div>

        {!isExpired && (
          <p className="text-sm text-muted-foreground">
            Temps restant : {minutes}:{String(seconds).padStart(2, "0")}
          </p>
        )}

        {isExpired && (
          <p className="text-sm text-destructive">
            Le délai de réservation a expiré. Veuillez recommencer.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleConfirm}
          disabled={isPending || isExpired}
          className="w-full"
        >
          {isPending
            ? "Traitement en cours..."
            : "Payer avec vos informations bancaires"}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

**Fichier:** `app/bookings/[id]/checkout/page.tsx` (CRÉER)

```typescript
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { getBookingForCheckout } from "@/features/bookings/queries/get-booking-for-checkout";
import { CheckoutCard } from "@/features/bookings/components/CheckoutCard";

type CheckoutPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/sign-in?callbackUrl=/bookings/${id}/checkout`);
  }

  const bookingData = await getBookingForCheckout(id);

  if (!bookingData || bookingData.clientId !== session.user.id) {
    notFound();
  }

  // If already confirmed, redirect to bookings list
  if (bookingData.status !== BOOKING_STATUSES.PENDING) {
    redirect("/bookings");
  }

  const nightCount = Math.ceil(
    (new Date(bookingData.checkOut).getTime() -
      new Date(bookingData.checkIn).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <main id="main-content" className="container mx-auto max-w-2xl px-4 py-8">
      <CheckoutCard
        bookingId={bookingData.id}
        reference={bookingData.reference}
        suiteTitle={bookingData.suite.title}
        establishmentName={bookingData.establishment.name}
        checkIn={bookingData.checkIn.toISOString()}
        checkOut={bookingData.checkOut.toISOString()}
        nightCount={nightCount}
        pricePerNight={Number(bookingData.pricePerNight)}
        totalPrice={Number(bookingData.totalPrice)}
        guestCount={bookingData.guestCount}
        expiresAt={bookingData.expiresAt?.toISOString() ?? ""}
      />
    </main>
  );
}
```

**Choix :**
- Countdown en temps réel — `useEffect` + `setInterval` chaque seconde
- Bouton désactivé si expiré ou en cours de traitement
- Libellé "Payer avec vos informations bancaires" — simule un paiement sans collecte de données
- Redirect vers `/bookings` après confirmation réussie
- Page serveur vérifie ownership et statut `pending` — redirect si déjà confirmé
- Récapitulatif complet : établissement, suite, dates, voyageurs, prix détaillé, total

**Effort:** 30min

---

**Commit :** `feat(bookings): implement simulated checkout flow (#25)`

---

## S12 — Query `getClientBookings`

**Fichier:** `src/features/bookings/queries/get-client-bookings.ts` (CRÉER)

```typescript
import { db } from "@/lib/db";
import { booking, suite, establishment } from "@/lib/db/schema/domain";
import { eq, desc } from "drizzle-orm";

export async function getClientBookings(clientId: string) {
  return db
    .select({
      id: booking.id,
      reference: booking.reference,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guestCount: booking.guestCount,
      pricePerNight: booking.pricePerNight,
      totalPrice: booking.totalPrice,
      status: booking.status,
      expiresAt: booking.expiresAt,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      suite: {
        title: suite.title,
        mainImage: suite.mainImage,
      },
      establishment: {
        name: establishment.name,
        city: establishment.city,
      },
    })
    .from(booking)
    .innerJoin(suite, eq(booking.suiteId, suite.id))
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(eq(booking.clientId, clientId))
    .orderBy(desc(booking.checkIn));
}

export type ClientBooking = Awaited<
  ReturnType<typeof getClientBookings>
>[number];
```

**Choix :**
- Join sur suite + establishment pour afficher les infos dans la liste
- Tri par check-in descendant (récentes en premier)
- Type `ClientBooking` dérivé du retour — pas de type manuel
- Inclut `expiresAt` pour pouvoir identifier les pending expirés côté UI
- Toutes les réservations retournées (en cours, passées, annulées, pending)

**Effort:** 15min

---

## S13 — Server action `cancelBooking`

**Fichier:** `src/features/bookings/actions/cancel-booking.ts` (CRÉER)

```typescript
"use server";

import { db } from "@/lib/db";
import { booking } from "@/lib/db/schema/domain";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-guards";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { CANCELLATION_DELAY_DAYS } from "../lib/booking-constants";
import type { ActionErrors } from "@/types/action.types";

type CancelBookingResult =
  | { success: true }
  | { success: false; errors: ActionErrors };

export async function cancelBooking(
  bookingId: string,
): Promise<CancelBookingResult> {
  const session = await requireSession();

  const [foundBooking] = await db
    .select({
      id: booking.id,
      clientId: booking.clientId,
      status: booking.status,
      checkIn: booking.checkIn,
    })
    .from(booking)
    .where(eq(booking.id, bookingId));

  if (!foundBooking) {
    return { success: false, errors: { _form: ["Réservation introuvable"] } };
  }

  if (foundBooking.clientId !== session.user.id) {
    return {
      success: false,
      errors: {
        _form: ["Vous ne pouvez annuler que vos propres réservations"],
      },
    };
  }

  if (foundBooking.status !== BOOKING_STATUSES.CONFIRMED) {
    return {
      success: false,
      errors: {
        _form: ["Seule une réservation confirmée peut être annulée"],
      },
    };
  }

  const now = new Date();
  const checkInDate = new Date(foundBooking.checkIn);
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilCheckIn <= CANCELLATION_DELAY_DAYS) {
    return {
      success: false,
      errors: {
        _form: [
          `L'annulation n'est possible que ${CANCELLATION_DELAY_DAYS} jours avant la date d'arrivée`,
        ],
      },
    };
  }

  await db
    .update(booking)
    .set({
      status: BOOKING_STATUSES.CANCELLED,
      cancelledAt: new Date(),
    })
    .where(eq(booking.id, bookingId));

  revalidatePath("/bookings");

  return { success: true };
}
```

**Effort:** 20min

---

## S14 — Composants `BookingCard` + `CancelBookingButton`

**Fichier:** `src/features/bookings/components/CancelBookingButton.tsx` (CRÉER)

```typescript
"use client";

import { useState } from "react";
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
import { cancelBooking } from "../actions/cancel-booking";

type CancelBookingButtonProps = {
  bookingId: string;
};

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleCancel() {
    setIsPending(true);
    setError(null);
    const result = await cancelBooking(bookingId);
    if (!result.success) {
      setError(result.errors._form?.[0] ?? "Erreur lors de l'annulation");
    }
    setIsPending(false);
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPending}>
            {isPending ? "Annulation..." : "Annuler la réservation"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La suite sera remise en
              disponibilité pour les dates concernées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              Confirmer l'annulation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </>
  );
}
```

**Fichier:** `src/features/bookings/components/BookingCard.tsx` (CRÉER)

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CancelBookingButton } from "./CancelBookingButton";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { CANCELLATION_DELAY_DAYS } from "../lib/booking-constants";
import type { ClientBooking } from "../queries/get-client-bookings";

const STATUS_LABELS: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]: "En attente",
  [BOOKING_STATUSES.CONFIRMED]: "Confirmée",
  [BOOKING_STATUSES.CANCELLED]: "Annulée",
  [BOOKING_STATUSES.COMPLETED]: "Terminée",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [BOOKING_STATUSES.PENDING]: "outline",
  [BOOKING_STATUSES.CONFIRMED]: "default",
  [BOOKING_STATUSES.CANCELLED]: "destructive",
  [BOOKING_STATUSES.COMPLETED]: "secondary",
};

type BookingCardProps = {
  booking: ClientBooking;
};

export function BookingCard({ booking: bookingData }: BookingCardProps) {
  const checkInDate = new Date(bookingData.checkIn);
  const now = new Date();
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isCancellable =
    bookingData.status === BOOKING_STATUSES.CONFIRMED &&
    daysUntilCheckIn > CANCELLATION_DELAY_DAYS;

  // Pending expired = treat as expired visually
  const isPendingExpired =
    bookingData.status === BOOKING_STATUSES.PENDING &&
    bookingData.expiresAt &&
    new Date(bookingData.expiresAt) < now;

  const displayStatus = isPendingExpired ? "Expirée" : STATUS_LABELS[bookingData.status];
  const displayVariant = isPendingExpired ? "destructive" as const : STATUS_VARIANTS[bookingData.status];

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currencyFormatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {bookingData.suite.title}
            </CardTitle>
            <CardDescription>
              {bookingData.establishment.name} —{" "}
              {bookingData.establishment.city}
            </CardDescription>
          </div>
          <Badge variant={displayVariant}>{displayStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          Du {dateFormatter.format(checkInDate)} au{" "}
          {dateFormatter.format(new Date(bookingData.checkOut))}
        </p>
        <p className="text-sm">
          {currencyFormatter.format(Number(bookingData.totalPrice))} (
          {currencyFormatter.format(Number(bookingData.pricePerNight))}/nuit)
        </p>
        <p className="text-sm text-muted-foreground">
          Réf. {bookingData.reference}
        </p>
        {isCancellable && <CancelBookingButton bookingId={bookingData.id} />}
      </CardContent>
    </Card>
  );
}
```

**Choix :**
- `AlertDialog` pour la confirmation d'annulation (convention du projet pour les actions destructives)
- `Badge` avec variantes selon le statut
- Pending expirés affichés comme "Expirée" visuellement (destructive badge)
- Bouton annulation visible uniquement si `confirmed` + > 3 jours avant check-in
- `CANCELLATION_DELAY_DAYS` dupliqué intentionnellement (calcul UI vs validation serveur)
- `Intl.DateTimeFormat` + `Intl.NumberFormat` pour le formatage français

**Effort:** 30min

---

## S15 — Route `/bookings`

**Fichier:** `app/bookings/page.tsx` (CRÉER)

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getClientBookings } from "@/features/bookings/queries/get-client-bookings";
import { BookingCard } from "@/features/bookings/components/BookingCard";

export default async function BookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/bookings");
  }

  const clientBookings = await getClientBookings(session.user.id);

  return (
    <main id="main-content" className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mes réservations</h1>

      {clientBookings.length === 0 ? (
        <p className="text-muted-foreground">
          Vous n'avez aucune réservation.
        </p>
      ) : (
        <div className="space-y-4">
          {clientBookings.map((clientBooking) => (
            <BookingCard key={clientBooking.id} booking={clientBooking} />
          ))}
        </div>
      )}
    </main>
  );
}
```

**Effort:** 15min

---

**Commit :** `feat(bookings): implement booking list and cancellation (#26 #27)`

---

## S16 — Vérification

### Checklist

**Issue #24 — Vérifier la disponibilité :**
- [ ] Le client peut choisir une date de début et une date de fin
- [ ] La date de fin est postérieure à la date de début
- [ ] Les dates passées ne sont pas sélectionnables
- [ ] Le système vérifie la disponibilité (pas de chevauchement)
- [ ] Message clair indiquant si la suite est disponible ou non
- [ ] Si disponible, le prix total est affiché (nb nuits × prix/nuit)

**Issue #25 — Créer une réservation :**
- [ ] Le client doit être connecté pour finaliser
- [ ] Si non connecté, redirect vers connexion puis retour au flow
- [ ] Booking créé en `pending` avec expiration 15 min
- [ ] Un seul pending par client (le précédent est annulé)
- [ ] Page checkout avec récapitulatif (établissement, suite, dates, prix total, voyageurs)
- [ ] Bouton "Payer avec vos informations bancaires" confirme la réservation
- [ ] Countdown visible — bouton désactivé si expiré
- [ ] Pas de double réservation sur dates chevauchantes
- [ ] Référence unique générée (CDL-YYYY-XXXX)
- [ ] Après paiement, redirect vers `/bookings`

**Issue #26 — Consulter mes réservations :**
- [ ] Liste des réservations en cours et passées
- [ ] Chaque réservation affiche : établissement, suite, dates, prix total, statut
- [ ] Pending expirés affichés comme "Expirée"
- [ ] Accessible uniquement au client connecté

**Issue #27 — Annuler une réservation :**
- [ ] Annulation possible si date de début dans plus de 3 jours
- [ ] Bouton masqué si délai non respecté
- [ ] Message de confirmation (AlertDialog) avant annulation
- [ ] Après annulation, statut passe à annulée
- [ ] La suite redevient disponible (query de dispo exclut les cancelled)

**Vérifications techniques :**
- [ ] `bun run lint` passe
- [ ] `bun run build` passe
- [ ] `bun run test` passe (tests existants non cassés)

**Effort:** 20min

---

## Plan d'exécution

| Ordre | Réf | Action | Effort |
|-------|-----|--------|--------|
| 1 | S1 | Ajout `expiresAt` au schéma + db:push | 10min |
| 2 | S2 | Types + Zod + utilitaire dispo SQL + constantes | 25min |
| 3 | S3 | Query `checkSuiteAvailability` | 15min |
| 4 | S4 | Query `getSuiteWithEstablishment` | 15min |
| 5 | S5 | Utilitaire `generateBookingReference` | 15min |
| 6 | S6 | Server action `createPendingBooking` | 30min |
| 7 | S7 | Composant `BookingForm` | 40min |
| 8 | S8 | API route dispo | 10min |
| 9 | S9 | Route `/suites/[id]/book` | 15min |
| — | — | **Commit** : `feat(bookings): implement availability check and pending booking (#24 #25)` | — |
| 10 | S10 | Server action `confirmBooking` | 20min |
| 11a | S11a | Query `getBookingForCheckout` | 10min |
| 11b | S11b | Composant `CheckoutCard` + route checkout | 30min |
| — | — | **Commit** : `feat(bookings): implement simulated checkout flow (#25)` | — |
| 12 | S12 | Query `getClientBookings` | 15min |
| 13 | S13 | Server action `cancelBooking` | 20min |
| 14 | S14 | Composants `BookingCard` + `CancelBookingButton` | 30min |
| 15 | S15 | Route `/bookings` | 15min |
| — | — | **Commit** : `feat(bookings): implement booking list and cancellation (#26 #27)` | — |
| 16 | S16 | Vérification checklist | 20min |

---

## Fichiers créés/modifiés

| Action | Chemin |
|--------|--------|
| MODIFIER | `src/lib/db/schema/domain.ts` (ajout `expiresAt`) |
| CRÉER | `src/features/bookings/lib/booking-schema.ts` |
| CRÉER | `src/features/bookings/lib/booking-constants.ts` |
| CRÉER | `src/features/bookings/lib/availability-filter.ts` |
| CRÉER | `src/features/bookings/lib/generate-booking-reference.ts` |
| CRÉER | `src/features/bookings/types/booking.types.ts` |
| CRÉER | `src/features/bookings/queries/check-suite-availability.ts` |
| CRÉER | `src/features/bookings/queries/get-suite-with-establishment.ts` |
| CRÉER | `src/features/bookings/queries/get-booking-for-checkout.ts` |
| CRÉER | `src/features/bookings/queries/get-client-bookings.ts` |
| CRÉER | `src/features/bookings/actions/create-pending-booking.ts` |
| CRÉER | `src/features/bookings/actions/confirm-booking.ts` |
| CRÉER | `src/features/bookings/actions/cancel-booking.ts` |
| CRÉER | `src/features/bookings/components/BookingForm.tsx` |
| CRÉER | `src/features/bookings/components/CheckoutCard.tsx` |
| CRÉER | `src/features/bookings/components/BookingCard.tsx` |
| CRÉER | `src/features/bookings/components/CancelBookingButton.tsx` |
| CRÉER | `app/api/bookings/availability/route.ts` |
| CRÉER | `app/suites/[id]/book/page.tsx` |
| CRÉER | `app/bookings/[id]/checkout/page.tsx` |
| CRÉER | `app/bookings/page.tsx` |

---

## Hors scope

| Sujet | Raison |
|-------|--------|
| Options de réservation (bookingOption) | Aucune issue ne les mentionne |
| Vrai paiement (Stripe, etc.) | Simulé uniquement |
| Statut `completed` (post-séjour) | Pas d'issue, flow manuel ou cron futur |
| Admin view des réservations | Pas d'issue pour ça |
| Reviews post-séjour | Feature séparée |
| Nettoyage des pending expirés | Filtrage au runtime suffit |

---

## Divergences avec le merise

- **`expiresAt` ajouté au schéma** — Le MLD officiel ne mentionne pas ce champ. Ajouté pour gérer l'expiration des pending sans cron. Le merise (règle 6) prévoit un "timeout" mais via un nettoyage par cron — l'approche runtime est fonctionnellement équivalente et plus simple.

## Journal d'implémentation

> Traçabilité des divergences entre le plan et l'implémentation réelle.
> Format : `[date] Étape — Description de la divergence. **Raison :** justification.`

- [2026-03-25] S0 — Création de `src/types/action.types.ts` (shared `ActionErrors`). Le plan mentionne une promotion depuis `feature/manage-managers` — ce type n'existait pas en shared. **Raison :** dépendance manquante, créé directement.
- [2026-03-25] S0 — Installation du composant shadcn `Badge` (absent du projet). **Raison :** utilisé par `BookingCard` pour les badges de statut.
- [2026-03-25] S1 — `db:push` non exécuté (pas de connexion DB dans le worktree). **Raison :** à exécuter après merge sur la branche principale.
- [2026-03-25] S2 — Zod v4 : `required_error` remplacé par `error` dans `bookingSchema`. **Raison :** le projet utilise Zod v4 (^4.3.6) qui a changé l'API.
- [2026-03-25] S11b/S14 — Narrowing TypeScript : `if (!result.success)` remplacé par `if (result.success === false)` dans `CheckoutCard` et `CancelBookingButton`. **Raison :** le discriminated union ne se narrow pas correctement avec `!result.success` dans la version TS du projet.
- [2026-03-25] Hors-plan — Fix `app/db-viewer/page.tsx` : import `@/lib/db/schema` → `@/lib/db/schema/auth`. **Raison :** bug pre-existant post-refactor schema split, bloquait le build.
- [2026-03-25] Code review — S5 : `generateBookingReference` refactorisé — la boucle de retry était du dead code (return systématique à la 1ère itération). Remplacé par un check d'existence avant de retourner le candidat. Magic strings extraites en constantes.
- [2026-03-25] Code review — S10 : `confirmBooking` wrappé dans `db.transaction()` pour protéger contre TOCTOU race condition entre le SELECT overlap et le UPDATE status.
- [2026-03-25] Code review — S7 : `BookingForm.handleCheckAvailability` vérifie `response.ok` avant de parser le JSON.
- [2026-03-25] Code review — S6 : `createPendingBooking` filtre les suites soft-deleted avec `isNull(suite.deletedAt)`.
- [2026-03-25] Code review — Availability filter : ajout `isNotNull(booking.expiresAt)` pour gérer le cas NULL dans la condition d'expiration.
