# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an immersive landing page for the Clair de Lune hotel chain with hero search card, establishment carousel, highlights, testimonials, contact CTA, and footer.

**Architecture:** Feature-based — landing-specific components in `src/features/landing/`, shared Footer in `src/components/layout/`. Server Components by default, Client Component only for the hero search card (interactivity). Data fetched via enriched establishment query with min suite price.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4, shadcn/ui Card/Button/Badge, lucide-react icons, next/image, Drizzle ORM.

**Spec:** `docs/superpowers/specs/2026-03-26-landing-page-design.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/features/landing/components/HeroSection.tsx` | Server — hero layout, background image, branding text |
| Create | `src/features/landing/components/HeroSearchCard.tsx` | Client — glassmorphism card, search form, redirect to `/suites` |
| Create | `src/features/landing/components/EstablishmentCarousel.tsx` | Server — horizontal scroll, fetches establishments with min price |
| Create | `src/features/landing/components/EstablishmentCarouselCard.tsx` | Server — compact card for carousel (image, name, city, suites count, min price) |
| Create | `src/features/landing/components/HighlightsSection.tsx` | Server — 3 highlight cards |
| Create | `src/features/landing/components/TestimonialsSection.tsx` | Server — 3 static Google Reviews cards |
| Create | `src/features/landing/components/ContactCta.tsx` | Server — dark banner with contact button |
| Create | `src/features/landing/lib/landing-content.ts` | Static content constants (highlights, testimonials) |
| Create | `src/features/landing/queries/get-establishments-with-min-price.ts` | Query — establishments + MIN(suite.price) + suite count |
| Create | `src/components/layout/Footer.tsx` | Server — shared footer, 3 columns + copyright |
| Create | `app/inquiries/new/page.tsx` | Placeholder page for contact form route |
| Modify | `app/page.tsx` | Rewrite — compose all landing sections |
| Modify | `app/layout.tsx` | Add Footer below `{children}` |

---

## Task 1: Static content constants

**Files:**
- Create: `src/features/landing/lib/landing-content.ts`

- [ ] **Step 1: Create the content file**

```typescript
import { Trees, CalendarCheck, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Testimonial {
  rating: number;
  quote: string;
  author: string;
  establishment: string;
}

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: Trees,
    title: "Cadre naturel unique",
    description:
      "Forêts, vallées et rivières — chaque établissement offre un écrin de nature préservée.",
  },
  {
    icon: CalendarCheck,
    title: "Réservation directe",
    description:
      "Sans intermédiaire, au meilleur prix. Votre séjour en quelques clics.",
  },
  {
    icon: Heart,
    title: "Service personnalisé",
    description:
      "Des gérants passionnés, à votre écoute pour un séjour sur mesure.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    rating: 5,
    quote:
      "Un cadre exceptionnel, le silence de la forêt et un accueil chaleureux. On reviendra !",
    author: "Marie L.",
    establishment: "Le Moulin du Vallon",
  },
  {
    rating: 5,
    quote:
      "La vue depuis notre suite était à couper le souffle. Personnel aux petits soins.",
    author: "Thomas D.",
    establishment: "La Ferme des Crêtes",
  },
  {
    rating: 4,
    quote:
      "Parfait pour se ressourcer. Les enfants ont adoré les balades autour du domaine.",
    author: "Sophie & Marc B.",
    establishment: "Le Domaine des Pins",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/features/landing/lib/landing-content.ts
git commit -m "feat(landing): add static content constants for highlights and testimonials"
```

---

## Task 2: Establishments query with min price

**Files:**
- Create: `src/features/landing/queries/get-establishments-with-min-price.ts`
**Context:**
- Existing query `src/features/establishments/queries/get-establishments.ts` returns `{ id, name, city, address, description, image }` with soft-delete filter
- We need the same + `minPrice` (MIN of suite.price) + `suiteCount` (COUNT of suites)
- DB schema: `establishment` table, `suite` table with `establishmentId` FK, `price` is `numeric(10,2)` returned as string
- DB connection: `import { db } from "@/lib/db"`
- Schema imports: `import { establishment, suite } from "@/lib/db/schema"`

- [ ] **Step 1: Write the query**

```typescript
import { db } from "@/lib/db";
import { establishment, suite } from "@/lib/db/schema";
import { eq, isNull, min, count } from "drizzle-orm";

export interface EstablishmentWithMinPrice {
  id: string;
  name: string;
  city: string;
  description: string | null;
  image: string | null;
  minPrice: string | null;
  suiteCount: number;
}

export async function getEstablishmentsWithMinPrice(): Promise<
  EstablishmentWithMinPrice[]
> {
  const results = await db
    .select({
      id: establishment.id,
      name: establishment.name,
      city: establishment.city,
      description: establishment.description,
      image: establishment.image,
      minPrice: min(suite.price),
      suiteCount: count(suite.id),
    })
    .from(establishment)
    .leftJoin(
      suite,
      eq(suite.establishmentId, establishment.id)
    )
    .where(isNull(establishment.deletedAt))
    .groupBy(
      establishment.id,
      establishment.name,
      establishment.city,
      establishment.description,
      establishment.image
    )
    .orderBy(establishment.name);

  return results.map((row) => ({
    ...row,
    suiteCount: Number(row.suiteCount),
  }));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/landing/queries/get-establishments-with-min-price.ts
git commit -m "feat(landing): add establishments query with min suite price and count"
```

---

## Task 3: Footer (shared layout component)

**Files:**
- Create: `src/components/layout/Footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create the Footer component**

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-semibold text-white">Hôtels Clair de Lune</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Chaîne hôtelière rurale
              <br />
              Centre de la France
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white">Navigation</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/establishments" className="hover:text-white transition-colors">
                  Nos établissements
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-white transition-colors">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">Contact</h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>contact@clairdelune.fr</li>
              <li>01 23 45 67 89</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Hôtels Clair de Lune — Tous droits
          réservés
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add Footer to root layout**

Modify `app/layout.tsx` — add `import { Footer } from "@/components/layout/Footer"` and render `<Footer />` after `{children}` inside `<body>`, before the closing `</body>` tag.

- [ ] **Step 3: Verify** — run `bun run dev`, check any page shows footer at bottom.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx app/layout.tsx
git commit -m "feat(layout): add shared Footer component to root layout"
```

---

## Task 4: Contact placeholder route

**Files:**
- Create: `app/inquiries/new/page.tsx`

- [ ] **Step 1: Create the placeholder page**

```tsx
export default function InquiryNewPage() {
  return (
    <main id="main-content" className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Formulaire de contact</h1>
        <p className="mt-2 text-muted-foreground">
          Cette page est en cours de construction. Revenez bientôt !
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/inquiries/new/page.tsx
git commit -m "feat(inquiries): add placeholder page for contact form route"
```

---

## Task 5: HeroSection + HeroSearchCard

**Files:**
- Create: `src/features/landing/components/HeroSection.tsx`
- Create: `src/features/landing/components/HeroSearchCard.tsx`

- [ ] **Step 1: Create HeroSearchCard (Client Component)**

This is the glassmorphism card with search form fields. Phase 1 uses native inputs as placeholders until `feat/search-and-filters` is merged.

```tsx
"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function HeroSearchCard() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/suites?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-4 rounded-xl border border-white/20 bg-white/12 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl md:w-72"
    >
      <h2 className="text-sm font-semibold text-white">
        Réservez votre séjour
      </h2>

      <div>
        <Label htmlFor="hero-destination" className="text-xs text-white/70">
          Destination
        </Label>
        <Input
          id="hero-destination"
          placeholder="Région, département..."
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          className="mt-1 border-white/20 bg-white/15 text-white placeholder:text-white/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="hero-check-in" className="text-xs text-white/70">
            Arrivée
          </Label>
          <Input
            id="hero-check-in"
            type="date"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className="mt-1 border-white/20 bg-white/15 text-white"
          />
        </div>
        <div>
          <Label htmlFor="hero-check-out" className="text-xs text-white/70">
            Départ
          </Label>
          <Input
            id="hero-check-out"
            type="date"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className="mt-1 border-white/20 bg-white/15 text-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="hero-guests" className="text-xs text-white/70">
          Voyageurs
        </Label>
        <Input
          id="hero-guests"
          type="number"
          min="1"
          placeholder="Nombre de personnes"
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
          className="mt-1 border-white/20 bg-white/15 text-white placeholder:text-white/50"
        />
      </div>

      <Button type="submit" variant="secondary" className="mt-2 w-full">
        Rechercher
      </Button>
    </form>
  );
}
```

> **Note:** `bg-white/12` may need a Tailwind v4 arbitrary value `bg-[rgba(255,255,255,0.12)]` depending on theme config. Adjust at implementation time.

- [ ] **Step 2: Create HeroSection (Server Component)**

```tsx
import { HeroSearchCard } from "./HeroSearchCard";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-gray-900">
      {/* Background image — replace with next/image + real photo later */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/images/hero/landscape.jpg')",
        }}
        role="img"
        aria-label="Paysage rural avec forêt et vallée"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:items-center md:gap-12">
        {/* Branding */}
        <div className="flex-1 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Chaîne hôtelière rurale
          </p>
          <h1 className="mt-3 text-4xl font-light leading-tight md:text-5xl">
            Trouver votre séjour
            <br />
            sous les étoiles
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Des maisons de caractère nichées en forêt, en vallée, à deux pas
            d'un village. Loin du bruit, proches de l'essentiel et des étoiles.
          </p>
        </div>

        {/* Search card */}
        <HeroSearchCard />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify** — temporarily render `<HeroSection />` in `app/page.tsx`, run `bun run dev`, check hero displays with glassmorphism card.

- [ ] **Step 4: Commit**

```bash
git add src/features/landing/components/HeroSection.tsx src/features/landing/components/HeroSearchCard.tsx
git commit -m "feat(landing): add HeroSection with glassmorphism search card"
```

---

## Task 6: EstablishmentCarousel

**Files:**
- Create: `src/features/landing/components/EstablishmentCarouselCard.tsx`
- Create: `src/features/landing/components/EstablishmentCarousel.tsx`

- [ ] **Step 1: Create EstablishmentCarouselCard**

```tsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EstablishmentWithMinPrice } from "../queries/get-establishments-with-min-price";

interface EstablishmentCarouselCardProps {
  establishment: EstablishmentWithMinPrice;
}

export function EstablishmentCarouselCard({
  establishment,
}: EstablishmentCarouselCardProps) {
  const formattedMinPrice = establishment.minPrice
    ? `${Number(establishment.minPrice).toLocaleString("fr-FR")} €`
    : null;

  return (
    <Link
      href={`/establishments/${establishment.id}`}
      className="group block w-64 flex-shrink-0 overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md md:w-72"
    >
      <div className="relative aspect-[16/10] bg-gray-200">
        {establishment.image ? (
          <Image
            src={establishment.image}
            alt={establishment.name}
            fill
            className="object-cover"
            sizes="288px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Photo à venir
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:underline">
            {establishment.name}
          </h3>
          {establishment.suiteCount > 0 && (
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              {establishment.suiteCount}{" "}
              {establishment.suiteCount > 1 ? "suites" : "suite"}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {establishment.city}
        </p>
        {formattedMinPrice && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{formattedMinPrice}</span>
            <span className="text-muted-foreground"> / nuit</span>
          </p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create EstablishmentCarousel**

```tsx
import Link from "next/link";
import { getEstablishmentsWithMinPrice } from "../queries/get-establishments-with-min-price";
import { EstablishmentCarouselCard } from "./EstablishmentCarouselCard";

export async function EstablishmentCarousel() {
  const establishments = await getEstablishmentsWithMinPrice();

  if (establishments.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Nos établissements</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvrez nos maisons à travers la France
            </p>
          </div>
          <Link
            href="/establishments"
            className="text-sm font-medium underline hover:no-underline"
          >
            Voir tous →
          </Link>
        </div>
        <div className="-mx-6 mt-8 flex gap-4 overflow-x-auto px-6 pb-4">
          {establishments.map((establishment) => (
            <EstablishmentCarouselCard
              key={establishment.id}
              establishment={establishment}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify** — temporarily render in `app/page.tsx`, check horizontal scroll and card layout.

- [ ] **Step 4: Commit**

```bash
git add src/features/landing/components/EstablishmentCarouselCard.tsx src/features/landing/components/EstablishmentCarousel.tsx
git commit -m "feat(landing): add establishment horizontal carousel with min price"
```

---

## Task 7: HighlightsSection

**Files:**
- Create: `src/features/landing/components/HighlightsSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { HIGHLIGHTS } from "../lib/landing-content";

export function HighlightsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Pourquoi nous choisir
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                <highlight.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/landing/components/HighlightsSection.tsx
git commit -m "feat(landing): add highlights section with 3 key selling points"
```

---

## Task 8: TestimonialsSection

**Files:**
- Create: `src/features/landing/components/TestimonialsSection.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Star } from "lucide-react";
import { TESTIMONIALS } from "../lib/landing-content";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Ce que disent nos hôtes
        </p>
        <h2 className="mt-2 text-center text-2xl font-semibold">
          Témoignages
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-lg bg-white p-6 shadow-sm"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="mt-4 text-sm italic leading-relaxed text-gray-600">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-4">
                <p className="text-sm font-semibold">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.establishment} · Google Reviews
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/landing/components/TestimonialsSection.tsx
git commit -m "feat(landing): add testimonials section with static Google Reviews"
```

---

## Task 9: ContactCta

**Files:**
- Create: `src/features/landing/components/ContactCta.tsx`

- [ ] **Step 1: Create the component**

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactCta() {
  return (
    <section className="bg-gray-900 py-16 text-center text-white">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-2xl font-light">
          Une question ? Un besoin particulier ?
        </h2>
        <p className="mt-2 text-sm text-white/60">
          Notre équipe vous répond sous 24h
        </p>
        <Button asChild variant="secondary" size="lg" className="mt-6">
          <Link href="/inquiries/new">Contactez-nous</Link>
        </Button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/landing/components/ContactCta.tsx
git commit -m "feat(landing): add contact CTA section"
```

---

## Task 10: Compose the landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite the page**

Replace the entire content of `app/page.tsx` with:

```tsx
import { HeroSection } from "@/features/landing/components/HeroSection";
import { EstablishmentCarousel } from "@/features/landing/components/EstablishmentCarousel";
import { HighlightsSection } from "@/features/landing/components/HighlightsSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { ContactCta } from "@/features/landing/components/ContactCta";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <EstablishmentCarousel />
      <HighlightsSection />
      <TestimonialsSection />
      <ContactCta />
    </main>
  );
}
```

- [ ] **Step 2: Verify** — run `bun run dev`, navigate to `http://localhost:3000`. Check:
  - Hero displays with branding + glassmorphism search card
  - Search form redirects to `/suites?...` with params
  - Establishments carousel scrolls horizontally
  - Highlights show 3 cards with icons
  - Testimonials show 3 review cards with stars
  - CTA links to `/inquiries/new`
  - Footer appears at bottom

- [ ] **Step 3: Check mobile** — resize browser to mobile width, verify:
  - Hero card stacks below branding text
  - Cards in carousel scroll horizontally
  - Highlights and testimonials stack vertically
  - Footer columns stack

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(landing): compose landing page with all sections"
```

---

## Task 11: Hero background image

**Files:**
- Create: `public/images/hero/` directory
- Modify: `src/features/landing/components/HeroSection.tsx` (if switching to next/image)

- [ ] **Step 1: Add a placeholder image**

Place a landscape photo at `public/images/hero/landscape.jpg`. Use a royalty-free rural landscape image (Unsplash or similar). If no image is available, add a CSS gradient fallback in `HeroSection.tsx`:

```tsx
// Replace the background div with a gradient if no image is available:
<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
```

- [ ] **Step 2: Verify** — check the hero renders correctly with the image or gradient.

- [ ] **Step 3: Commit**

```bash
git add public/images/hero/ src/features/landing/components/HeroSection.tsx
git commit -m "feat(landing): add hero background image or gradient fallback"
```

---

## Task 12: Navbar — hide SearchBar on landing (deferred)

> **Note:** The current `Header` component has no `SearchBar`. When `feat/search-and-filters` merges and adds a `SearchBar` to the Header, the landing page must hide it. The spec recommends a `showSearch` prop on Header.
>
> **Action:** After `feat/search-and-filters` is merged, add a `showSearch?: boolean` prop to `Header` (default `true`). In `app/layout.tsx` or `app/page.tsx`, pass `showSearch={false}` for the landing route. This task is **deferred** — skip it if SearchBar doesn't exist yet.

- [ ] **Step 1: Check if SearchBar exists in Header**

If `SearchBar` is not yet in `Header.tsx`, mark this task as N/A and move on.

- [ ] **Step 2: If SearchBar exists** — add `showSearch` prop to Header, conditionally render SearchBar, pass `false` from landing page.

- [ ] **Step 3: Commit if changes were made**

```bash
git add src/components/layout/Header.tsx app/page.tsx
git commit -m "feat(layout): hide SearchBar on landing page via showSearch prop"
```

---

## Task 13: Visual polish and final QA

- [ ] **Step 1: Run lint** — `bun run lint`, fix any issues.

- [ ] **Step 2: Run build** — `bun run build`, ensure no build errors.

- [ ] **Step 3: Full visual QA** — run `bun run dev` and check:
  - Contrast ratio on hero text (white on dark image) — WCAG AA
  - Skip link targets `#main-content`
  - All links work (establishments, sign-in, sign-up, inquiries/new, individual establishment cards)
  - Touch targets ≥ 44px on mobile
  - No horizontal overflow on the page (carousel overflow is contained)
  - Footer renders on all pages (check `/establishments` too)

- [ ] **Step 4: Fix any issues found**

- [ ] **Step 5: Final commit if changes were made**

```bash
git add -A
git commit -m "fix(landing): visual polish and accessibility fixes"
```
