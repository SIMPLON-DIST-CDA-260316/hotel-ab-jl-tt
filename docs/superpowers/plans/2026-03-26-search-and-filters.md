# Search & Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a suite search page with navbar search bar, filter sidebar, and server-side filtered results grid matching the Figma mockups.

**Architecture:** New `src/features/search/` feature folder with client search components, server queries with Drizzle joins, and a new `/suites` route. The Header is refactored to include a search bar (hidden on admin/manager routes). Filtering is server-side via URL search params validated with Zod.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Drizzle ORM, shadcn/ui (Slider, Calendar, Popover, Checkbox, DropdownMenu, Sheet, Collapsible), Zod, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-26-search-and-filters-design.md` (committed at `e1b1979`)

**DB schema reminders:**
- `establishment`: `name`, `city`, `address`, `postalCode` (no `department` column)
- `suite`: `title` (not `name`), `mainImage` (NOT NULL), `price` (numeric→string), `capacity`, `description`, `area`
- `amenity`: `name`, `slug`, `category`, `scope` (enum: property/room/both), `icon`
- Junction tables: `suiteAmenity`, `establishmentAmenity`

---

## File Structure

```
src/features/search/
├── components/
│   ├── SearchBar.tsx              # Client — desktop search bar (destination, dates, guests)
│   ├── SearchBarMobile.tsx        # Client — compact mobile search summary + modal
│   ├── DestinationInput.tsx       # Client — text input with pin icon
│   ├── DateRangePicker.tsx        # Client — calendar-based date range selector
│   ├── GuestSelector.tsx          # Client — numeric guest selector in popover
│   ├── FilterPanel.tsx            # Client — orchestrates all filter sections
│   ├── FilterSection.tsx          # Client — generic collapsible filter section
│   ├── LocationFilter.tsx         # Client — city checkboxes
│   ├── PriceRangeFilter.tsx       # Client — dual-thumb range slider
│   ├── AccessibilityFilter.tsx    # Client — amenity checkboxes
│   ├── MobileFilterSheet.tsx       # Client — mobile filter Sheet trigger
│   ├── SuiteSearchCard.tsx        # Server — individual suite result card
│   └── SuiteSearchGrid.tsx        # Server — grid layout + result count
├── queries/
│   ├── search-suites.ts           # Server — filtered suite query with Drizzle
│   └── get-filter-options.ts      # Server — dynamic filter values (cities, price range, amenities)
├── lib/
│   └── search-params-schema.ts    # Zod schema for search param validation
└── types/
    └── search.types.ts            # SearchParams, SuiteSearchResult, FilterOptions

src/components/layout/
├── Header.tsx                     # Modify — integrate SearchBar, hide on admin/manager
├── LogoutButton.tsx               # Keep as-is
└── UserMenu.tsx                   # Create — dropdown for authenticated users, icon for guests

app/suites/
├── page.tsx                       # Create — search results page (Server Component)
└── loading.tsx                    # Create — skeleton loading state

app/layout.tsx                     # Modify — minor adjustments if needed
```

---

## Task 0: Install shadcn components

**Files:**
- Modify: `package.json` (new deps added by shadcn CLI)
- Create: `src/components/ui/slider.tsx`
- Create: `src/components/ui/calendar.tsx`
- Create: `src/components/ui/popover.tsx`
- Create: `src/components/ui/checkbox.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/collapsible.tsx`

- [ ] **Step 1: Install all required shadcn components**

```bash
bunx shadcn@latest add slider calendar popover checkbox dropdown-menu sheet collapsible
```

Verify each component file exists in `src/components/ui/`.

- [ ] **Step 2: Install react-day-picker if not already present**

The Calendar component depends on `react-day-picker`. Check if it was installed by shadcn:

```bash
bun pm ls | grep react-day-picker
```

If missing: `bun add react-day-picker` (ask user first per package-installation rule).

**Note:** shadcn's Calendar uses `react-day-picker` v9. Verify the installed version with `bun pm ls | grep react-day-picker`. If v9+, the `DateRange` type is imported from `"react-day-picker"` and the Calendar props are `mode="range"`, `selected`, `onSelect`. If v8, the import path is the same but prop names may differ — check the generated `calendar.tsx` component for the correct API.

- [ ] **Step 2b: Install date-fns for French locale date formatting**

```bash
bun pm ls | grep date-fns
```

If missing: `bun add date-fns` (ask user first per package-installation rule). Required by `DateRangePicker` component for `format()` with French locale.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ package.json bun.lock
git commit -m "chore: add shadcn slider, calendar, popover, checkbox, dropdown-menu, sheet, collapsible"
```

---

## Task 1: Types and Zod validation schema

**Files:**
- Create: `src/features/search/types/search.types.ts`
- Create: `src/features/search/lib/search-params-schema.ts`

- [ ] **Step 1: Create search types**

```typescript
// src/features/search/types/search.types.ts

export interface SearchParams {
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  locations?: string[]
  priceMin?: number
  priceMax?: number
  accessibility?: string[]
}

export interface SuiteSearchResult {
  id: string
  title: string
  description: string | null
  price: string // numeric → string from Drizzle, parse with Number() for display
  capacity: number
  mainImage: string
  establishmentName: string
  city: string
}

export interface FilterOptions {
  cities: string[]
  priceRange: { min: number; max: number }
  accessibilityAmenities: { id: string; name: string }[]
}
```

- [ ] **Step 2: Create Zod validation schema for search params**

```typescript
// src/features/search/lib/search-params-schema.ts
import { z } from "zod/v4";

const searchParamsSchema = z.object({
  destination: z.string().optional(),
  checkIn: z.iso.date().optional(),
  checkOut: z.iso.date().optional(),
  guests: z.coerce.number().int().positive().optional(),
  locations: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().positive().optional(),
  accessibility: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .optional(),
});

export type ValidatedSearchParams = z.infer<typeof searchParamsSchema>;

export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): ValidatedSearchParams {
  const result = searchParamsSchema.safeParse(raw);
  if (!result.success) {
    return {}; // invalid params → no filters (fail gracefully)
  }
  const { priceMin, priceMax, ...rest } = result.data;
  // Ignore if priceMin > priceMax
  if (priceMin !== undefined && priceMax !== undefined && priceMin > priceMax) {
    return rest;
  }
  return result.data;
}
```

Note: Zod v4 is already installed (`"zod": "^4.3.6"` in package.json). Use `z.iso.date()` for ISO date string validation. URL search params come as strings so use `z.coerce` for numbers.

- [ ] **Step 3: Commit**

```bash
git add src/features/search/types/ src/features/search/lib/
git commit -m "feat(search): add search types and Zod param validation schema"
```

---

## Task 2: Server queries (search-suites + get-filter-options)

**Files:**
- Create: `src/features/search/queries/search-suites.ts`
- Create: `src/features/search/queries/get-filter-options.ts`
- Test: `src/features/search/queries/search-suites.test.ts` (optional — DB integration tests need PGlite setup, skip if not already configured)

**Reference files:**
- `src/lib/db/index.ts` — DB connection
- `src/lib/db/schema/domain.ts` — table definitions (lines 58-85 establishment, 89-116 suite, 142-151 amenity, 155-168 establishmentAmenity, 172-183 suiteAmenity)
- `src/features/establishments/queries/get-establishments.ts` — query pattern reference

- [ ] **Step 1: Create search-suites query**

```typescript
// src/features/search/queries/search-suites.ts
import { db } from "@/lib/db";
import {
  suite,
  establishment,
  suiteAmenity,
  establishmentAmenity,
} from "@/lib/db/schema/domain";
import { and, eq, gte, lte, ilike, inArray, isNull, or, sql, asc } from "drizzle-orm";
import type { ValidatedSearchParams } from "@/features/search/lib/search-params-schema";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

const MAX_RESULTS = 50;

export async function searchSuites(
  params: ValidatedSearchParams,
): Promise<SuiteSearchResult[]> {
  const conditions = [
    isNull(suite.deletedAt),
    isNull(establishment.deletedAt),
  ];

  if (params.locations && params.locations.length > 0) {
    // Case-insensitive city matching (spec requires ILIKE)
    const cityConditions = params.locations.map(
      (city) => ilike(establishment.city, city),
    );
    conditions.push(or(...cityConditions)!);
  }

  if (params.priceMin !== undefined) {
    conditions.push(gte(suite.price, String(params.priceMin)));
  }

  if (params.priceMax !== undefined) {
    conditions.push(lte(suite.price, String(params.priceMax)));
  }

  if (params.guests !== undefined) {
    conditions.push(gte(suite.capacity, params.guests));
  }

  // Base query
  let query = db
    .select({
      id: suite.id,
      title: suite.title,
      description: suite.description,
      price: suite.price,
      capacity: suite.capacity,
      mainImage: suite.mainImage,
      establishmentName: establishment.name,
      city: establishment.city,
    })
    .from(suite)
    .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
    .where(and(...conditions))
    .orderBy(asc(suite.price))
    .limit(MAX_RESULTS);

  const results = await query;

  // If accessibility filters are set, post-filter (AND logic — suite must have ALL)
  // A suite qualifies if the amenity is linked via suiteAmenity OR via
  // establishmentAmenity on its parent establishment (spec requirement).
  if (params.accessibility && params.accessibility.length > 0) {
    const suiteIds = results.map((row) => row.id);
    if (suiteIds.length === 0) return [];

    // Build a map of establishmentId → suiteIds for reverse lookup
    const establishmentIds = [...new Set(results.map((row) => row.id))];

    // Get suite-level amenity matches
    const suiteAmenityCounts = await db
      .select({
        suiteId: suiteAmenity.suiteId,
        amenityId: suiteAmenity.amenityId,
      })
      .from(suiteAmenity)
      .where(
        and(
          inArray(suiteAmenity.suiteId, suiteIds),
          inArray(suiteAmenity.amenityId, params.accessibility),
        ),
      );

    // Get establishment-level amenity matches (these apply to ALL suites in that establishment)
    // We need establishmentId from the results — re-query to get it
    const suiteEstablishments = await db
      .select({
        suiteId: suite.id,
        establishmentId: suite.establishmentId,
      })
      .from(suite)
      .where(inArray(suite.id, suiteIds));

    const suiteToEstablishment = new Map(
      suiteEstablishments.map((row) => [row.suiteId, row.establishmentId]),
    );
    const uniqueEstablishmentIds = [
      ...new Set(suiteToEstablishment.values()),
    ];

    const estAmenityCounts =
      uniqueEstablishmentIds.length > 0
        ? await db
            .select({
              establishmentId: establishmentAmenity.establishmentId,
              amenityId: establishmentAmenity.amenityId,
            })
            .from(establishmentAmenity)
            .where(
              and(
                inArray(
                  establishmentAmenity.establishmentId,
                  uniqueEstablishmentIds,
                ),
                inArray(establishmentAmenity.amenityId, params.accessibility),
              ),
            )
        : [];

    // Build per-establishment amenity set
    const estAmenityMap = new Map<string, Set<string>>();
    for (const row of estAmenityCounts) {
      if (!estAmenityMap.has(row.establishmentId)) {
        estAmenityMap.set(row.establishmentId, new Set());
      }
      estAmenityMap.get(row.establishmentId)!.add(row.amenityId);
    }

    // Build per-suite amenity set (combining suite-level + establishment-level)
    const suiteAmenityMap = new Map<string, Set<string>>();
    for (const row of suiteAmenityCounts) {
      if (!suiteAmenityMap.has(row.suiteId)) {
        suiteAmenityMap.set(row.suiteId, new Set());
      }
      suiteAmenityMap.get(row.suiteId)!.add(row.amenityId);
    }

    // Merge establishment amenities into each suite's set
    for (const [suiteId, estId] of suiteToEstablishment) {
      const estAmenities = estAmenityMap.get(estId);
      if (estAmenities) {
        if (!suiteAmenityMap.has(suiteId)) {
          suiteAmenityMap.set(suiteId, new Set());
        }
        for (const amenityId of estAmenities) {
          suiteAmenityMap.get(suiteId)!.add(amenityId);
        }
      }
    }

    // Filter: suite must have ALL requested amenities
    const requiredCount = params.accessibility.length;
    return results.filter((searchResult) => {
      const amenitySet = suiteAmenityMap.get(searchResult.id);
      if (!amenitySet) return false;
      return params.accessibility!.every((amenityId) =>
        amenitySet.has(amenityId),
      );
    });
  }

  return results;
}
```

- [ ] **Step 2: Create get-filter-options query**

```typescript
// src/features/search/queries/get-filter-options.ts
import { db } from "@/lib/db";
import { suite, establishment, amenity } from "@/lib/db/schema/domain";
import { eq, isNull, sql, inArray } from "drizzle-orm";
import type { FilterOptions } from "@/features/search/types/search.types";

export async function getFilterOptions(): Promise<FilterOptions> {
  const [citiesResult, priceRangeResult, amenitiesResult] = await Promise.all([
    // Distinct cities from active establishments
    db
      .selectDistinct({ city: establishment.city })
      .from(establishment)
      .where(isNull(establishment.deletedAt))
      .orderBy(establishment.city),

    // Min/max price from active suites in active establishments
    db
      .select({
        minPrice: sql<string>`min(${suite.price})`,
        maxPrice: sql<string>`max(${suite.price})`,
      })
      .from(suite)
      .innerJoin(establishment, eq(suite.establishmentId, establishment.id))
      .where(
        sql`${suite.deletedAt} is null and ${establishment.deletedAt} is null`,
      ),

    // Accessibility amenities (scope = 'property' or 'both')
    db
      .select({ id: amenity.id, name: amenity.name })
      .from(amenity)
      .where(inArray(amenity.scope, ["property", "both"])),
  ]);

  const cities = citiesResult.map((row) => row.city);

  const priceRange = {
    min: priceRangeResult[0]?.minPrice
      ? Math.floor(Number(priceRangeResult[0].minPrice))
      : 0,
    max: priceRangeResult[0]?.maxPrice
      ? Math.ceil(Number(priceRangeResult[0].maxPrice))
      : 500,
  };

  return {
    cities,
    priceRange,
    accessibilityAmenities: amenitiesResult,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/search/queries/
git commit -m "feat(search): add search-suites and get-filter-options server queries"
```

---

## Task 3: UserMenu component (shared layout)

**Files:**
- Create: `src/components/layout/UserMenu.tsx`

**Reference:** Current Header auth logic at `src/components/layout/Header.tsx:15-32`

- [ ] **Step 1: Create UserMenu component**

```typescript
// src/components/layout/UserMenu.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

interface UserMenuProps {
  isAuthenticated: boolean;
  userName?: string;
}

export function UserMenu({ isAuthenticated, userName }: UserMenuProps) {
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/sign-in" aria-label="Se connecter">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  function handleLogout() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Menu de ${userName}`}>
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/bookings">Mes réservations</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/UserMenu.tsx
git commit -m "feat(layout): add UserMenu dropdown component"
```

---

## Task 4: Search sub-components (DestinationInput, DateRangePicker, GuestSelector)

**Files:**
- Create: `src/features/search/components/DestinationInput.tsx`
- Create: `src/features/search/components/DateRangePicker.tsx`
- Create: `src/features/search/components/GuestSelector.tsx`

- [ ] **Step 1: Create DestinationInput**

```typescript
// src/features/search/components/DestinationInput.tsx
"use client";

import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DestinationInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationInput({ value, onChange }: DestinationInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Destination
      </span>
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Où allez-vous ?"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create DateRangePicker**

```typescript
// src/features/search/components/DateRangePicker.tsx
"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  checkIn?: Date;
  checkOut?: Date;
  onDateChange: (range: { checkIn?: Date; checkOut?: Date }) => void;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onDateChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const dateRange: DateRange | undefined =
    checkIn || checkOut ? { from: checkIn, to: checkOut } : undefined;

  function handleSelect(range: DateRange | undefined) {
    onDateChange({ checkIn: range?.from, checkOut: range?.to });
    if (range?.from && range?.to) {
      setOpen(false);
    }
  }

  function formatDateRange(): string {
    if (!checkIn) return "Quand ?";
    const checkInStr = format(checkIn, "d MMM", { locale: fr });
    if (!checkOut) return checkInStr;
    const checkOutStr = format(checkOut, "d MMM", { locale: fr });
    return `${checkInStr} — ${checkOutStr}`;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Dates
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto justify-start p-0 text-sm font-normal shadow-none hover:bg-transparent"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

**Note:** This requires `date-fns` for French locale formatting. Check if already installed:

```bash
bun pm ls | grep date-fns
```

If missing, ask user before installing: `bun add date-fns`.

- [ ] **Step 3: Create GuestSelector**

```typescript
// src/features/search/components/GuestSelector.tsx
"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const MIN_GUESTS = 1;
const MAX_GUESTS = 10;

export function GuestSelector({ value, onChange }: GuestSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Voyageurs
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto justify-start p-0 text-sm font-normal shadow-none hover:bg-transparent"
          >
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            {value} voyageur{value > 1 ? "s" : ""}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="start">
          <div className="flex items-center justify-between">
            <span className="text-sm">Voyageurs</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(Math.max(MIN_GUESTS, value - 1))}
                disabled={value <= MIN_GUESTS}
              >
                -
              </Button>
              <span className="w-4 text-center text-sm">{value}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onChange(Math.min(MAX_GUESTS, value + 1))}
                disabled={value >= MAX_GUESTS}
              >
                +
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/search/components/DestinationInput.tsx src/features/search/components/DateRangePicker.tsx src/features/search/components/GuestSelector.tsx
git commit -m "feat(search): add DestinationInput, DateRangePicker, GuestSelector sub-components"
```

---

## Task 5: SearchBar (desktop) and SearchBarMobile

**Files:**
- Create: `src/features/search/components/SearchBar.tsx`
- Create: `src/features/search/components/SearchBarMobile.tsx`

- [ ] **Step 1: Create desktop SearchBar**

The SearchBar reads current search params from the URL via `useSearchParams()`, manages local state for the form fields, and on submit redirects to `/suites?...` with the new params.

```typescript
// src/features/search/components/SearchBar.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DestinationInput } from "@/features/search/components/DestinationInput";
import { DateRangePicker } from "@/features/search/components/DateRangePicker";
import { GuestSelector } from "@/features/search/components/GuestSelector";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(
    searchParams.get("destination") ?? "",
  );
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get("checkIn")
      ? new Date(searchParams.get("checkIn")!)
      : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get("checkOut")
      ? new Date(searchParams.get("checkOut")!)
      : undefined,
  );
  const [guests, setGuests] = useState(
    Number(searchParams.get("guests")) || 2,
  );

  function handleSearch() {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0]);
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0]);
    params.set("guests", String(guests));

    // If destination is set, also add it as a location filter
    if (destination) {
      params.set("locations", destination);
    }

    router.push(`/suites?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-0 rounded-full border bg-background px-4 py-2 shadow-sm">
      <DestinationInput value={destination} onChange={setDestination} />
      <Separator orientation="vertical" className="mx-3 h-8" />
      <DateRangePicker
        checkIn={checkIn}
        checkOut={checkOut}
        onDateChange={({ checkIn: newIn, checkOut: newOut }) => {
          setCheckIn(newIn);
          setCheckOut(newOut);
        }}
      />
      <Separator orientation="vertical" className="mx-3 h-8" />
      <GuestSelector value={guests} onChange={setGuests} />
      <Button
        onClick={handleSearch}
        className="ml-3 rounded-full"
        size="sm"
      >
        <Search className="mr-2 h-4 w-4" />
        Rechercher
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create SearchBarMobile**

Compact summary bar for mobile. Clicking opens a Sheet with full search fields.

```typescript
// src/features/search/components/SearchBarMobile.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DestinationInput } from "@/features/search/components/DestinationInput";
import { DateRangePicker } from "@/features/search/components/DateRangePicker";
import { GuestSelector } from "@/features/search/components/GuestSelector";

export function SearchBarMobile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [destination, setDestination] = useState(
    searchParams.get("destination") ?? "",
  );
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get("checkIn")
      ? new Date(searchParams.get("checkIn")!)
      : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get("checkOut")
      ? new Date(searchParams.get("checkOut")!)
      : undefined,
  );
  const [guests, setGuests] = useState(
    Number(searchParams.get("guests")) || 2,
  );

  function buildSummary(): string {
    const parts: string[] = [];
    if (destination) parts.push(destination);
    if (checkIn) {
      const checkInStr = checkIn.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      if (checkOut) {
        const checkOutStr = checkOut.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        parts.push(`${checkInStr}–${checkOutStr}`);
      } else {
        parts.push(checkInStr);
      }
    }
    parts.push(`${guests} voy.`);
    return parts.join(" · ");
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (destination) {
      params.set("destination", destination);
      params.set("locations", destination);
    }
    if (checkIn) params.set("checkIn", checkIn.toISOString().split("T")[0]);
    if (checkOut) params.set("checkOut", checkOut.toISOString().split("T")[0]);
    params.set("guests", String(guests));

    setOpen(false);
    router.push(`/suites?${params.toString()}`);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex flex-1 items-center gap-2 rounded-full border bg-background px-4 py-2 text-left text-sm shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{buildSummary()}</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Rechercher</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-6 py-4">
          <DestinationInput value={destination} onChange={setDestination} />
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onDateChange={({ checkIn: newIn, checkOut: newOut }) => {
              setCheckIn(newIn);
              setCheckOut(newOut);
            }}
          />
          <GuestSelector value={guests} onChange={setGuests} />
          <Button onClick={handleSearch} className="w-full">
            Rechercher
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/search/components/SearchBar.tsx src/features/search/components/SearchBarMobile.tsx
git commit -m "feat(search): add desktop SearchBar and mobile SearchBarMobile"
```

---

## Task 6: Filter components (FilterSection, LocationFilter, PriceRangeFilter, AccessibilityFilter, FilterPanel)

**Files:**
- Create: `src/features/search/components/FilterSection.tsx`
- Create: `src/features/search/components/LocationFilter.tsx`
- Create: `src/features/search/components/PriceRangeFilter.tsx`
- Create: `src/features/search/components/AccessibilityFilter.tsx`
- Create: `src/features/search/components/FilterPanel.tsx`

- [ ] **Step 1: Create FilterSection (reusable collapsible wrapper)**

```typescript
// src/features/search/components/FilterSection.tsx
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FilterSection({
  title,
  defaultOpen = true,
  children,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <span className="text-sm font-medium">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}
```

- [ ] **Step 2: Create LocationFilter**

```typescript
// src/features/search/components/LocationFilter.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface LocationFilterProps {
  cities: string[];
  selectedCities: string[];
  onChange: (cities: string[]) => void;
}

export function LocationFilter({
  cities,
  selectedCities,
  onChange,
}: LocationFilterProps) {
  function handleToggle(city: string, checked: boolean) {
    if (checked) {
      onChange([...selectedCities, city]);
    } else {
      onChange(selectedCities.filter((selectedCity) => selectedCity !== city));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {cities.map((city) => (
        <label key={city} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={selectedCities.includes(city)}
            onCheckedChange={(checked) => handleToggle(city, checked === true)}
          />
          {city}
        </label>
      ))}
      <span className="text-xs text-muted-foreground">
        + autres départements à venir
      </span>
    </div>
  );
}
```

- [ ] **Step 3: Create PriceRangeFilter**

```typescript
// src/features/search/components/PriceRangeFilter.tsx
"use client";

import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export function PriceRangeFilter({
  min,
  max,
  value,
  onChange,
}: PriceRangeFilterProps) {
  return (
    <div className="flex flex-col gap-4">
      <Slider
        min={min}
        max={max}
        step={5}
        value={value}
        onValueChange={(newValue) => onChange(newValue as [number, number])}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{min} &euro;</span>
        <span>{max} &euro;</span>
      </div>
      <p className="text-center text-sm font-medium">
        {value[0]} &euro; — {value[1]} &euro; / nuit
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Create AccessibilityFilter**

```typescript
// src/features/search/components/AccessibilityFilter.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface AccessibilityAmenity {
  id: string;
  name: string;
}

interface AccessibilityFilterProps {
  amenities: AccessibilityAmenity[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function AccessibilityFilter({
  amenities,
  selectedIds,
  onChange,
}: AccessibilityFilterProps) {
  function handleToggle(amenityId: string, checked: boolean) {
    if (checked) {
      onChange([...selectedIds, amenityId]);
    } else {
      onChange(selectedIds.filter((id) => id !== amenityId));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {amenities.map((accessibilityAmenity) => (
        <label
          key={accessibilityAmenity.id}
          className="flex items-center gap-2 text-sm"
        >
          <Checkbox
            checked={selectedIds.includes(accessibilityAmenity.id)}
            onCheckedChange={(checked) =>
              handleToggle(accessibilityAmenity.id, checked === true)
            }
          />
          {accessibilityAmenity.name}
        </label>
      ))}
      <span className="text-xs text-muted-foreground">
        + autres options à venir
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Create FilterPanel (orchestrator)**

The FilterPanel reads search params from the URL, manages filter state, and updates the URL on changes. On mobile it is rendered inside a Sheet (handled by the parent page).

```typescript
// src/features/search/components/FilterPanel.tsx
"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FilterSection } from "@/features/search/components/FilterSection";
import { LocationFilter } from "@/features/search/components/LocationFilter";
import { PriceRangeFilter } from "@/features/search/components/PriceRangeFilter";
import { AccessibilityFilter } from "@/features/search/components/AccessibilityFilter";
import type { FilterOptions } from "@/features/search/types/search.types";

interface FilterPanelProps {
  filterOptions: FilterOptions;
}

export function FilterPanel({ filterOptions }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === undefined) continue;
        if (Array.isArray(value)) {
          for (const item of value) {
            params.append(key, item);
          }
        } else {
          params.set(key, value);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const selectedCities = searchParams.getAll("locations");
  const priceMin = Number(searchParams.get("priceMin")) || filterOptions.priceRange.min;
  const priceMax = Number(searchParams.get("priceMax")) || filterOptions.priceRange.max;
  const selectedAccessibility = searchParams.getAll("accessibility");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Filtres
      </h2>

      <FilterSection title="Localisation">
        <LocationFilter
          cities={filterOptions.cities}
          selectedCities={selectedCities}
          onChange={(cities) => updateParams({ locations: cities })}
        />
      </FilterSection>

      <FilterSection title="Prix / nuit">
        <PriceRangeFilter
          min={filterOptions.priceRange.min}
          max={filterOptions.priceRange.max}
          value={[priceMin, priceMax]}
          onChange={([newMin, newMax]) =>
            updateParams({
              priceMin: String(newMin),
              priceMax: String(newMax),
            })
          }
        />
      </FilterSection>

      {filterOptions.accessibilityAmenities.length > 0 && (
        <FilterSection title="Accessibilité" defaultOpen={false}>
          <AccessibilityFilter
            amenities={filterOptions.accessibilityAmenities}
            selectedIds={selectedAccessibility}
            onChange={(ids) => updateParams({ accessibility: ids })}
          />
        </FilterSection>
      )}

      <span className="text-sm text-muted-foreground">Autres filtres...</span>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/features/search/components/FilterSection.tsx src/features/search/components/LocationFilter.tsx src/features/search/components/PriceRangeFilter.tsx src/features/search/components/AccessibilityFilter.tsx src/features/search/components/FilterPanel.tsx
git commit -m "feat(search): add filter panel with location, price range, and accessibility filters"
```

---

## Task 7: SuiteSearchCard and SuiteSearchGrid

**Files:**
- Create: `src/features/search/components/SuiteSearchCard.tsx`
- Create: `src/features/search/components/SuiteSearchGrid.tsx`

- [ ] **Step 1: Create SuiteSearchCard**

```typescript
// src/features/search/components/SuiteSearchCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

interface SuiteSearchCardProps {
  suite: SuiteSearchResult;
}

export function SuiteSearchCard({ suite }: SuiteSearchCardProps) {
  const formattedPrice = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(suite.price));

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[16/10]">
        <Image
          src={suite.mainImage}
          alt={suite.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold">{suite.title}</h3>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {suite.capacity}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Badge variant="secondary" className="text-xs font-normal">
            {suite.establishmentName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            · {suite.city}
          </span>
        </div>
        {suite.description && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {suite.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between px-4 pb-4 pt-0">
        <p>
          <span className="font-semibold">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground"> / nuit</span>
        </p>
        <Button asChild size="sm">
          <Link href={`/suites/${suite.id}`}>Voir la suite</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Create SuiteSearchGrid**

```typescript
// src/features/search/components/SuiteSearchGrid.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SuiteSearchCard } from "@/features/search/components/SuiteSearchCard";
import type { SuiteSearchResult } from "@/features/search/types/search.types";

interface SuiteSearchGridProps {
  suites: SuiteSearchResult[];
}

export function SuiteSearchGrid({ suites }: SuiteSearchGridProps) {
  if (suites.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Aucune suite ne correspond à vos critères. Essayez de modifier vos
          filtres.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {suites.length} suite{suites.length > 1 ? "s" : ""} disponible
        {suites.length > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suites.map((suiteResult) => (
          <SuiteSearchCard key={suiteResult.id} suite={suiteResult} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/search/components/SuiteSearchCard.tsx src/features/search/components/SuiteSearchGrid.tsx
git commit -m "feat(search): add SuiteSearchCard and SuiteSearchGrid components"
```

---

## Task 8: `/suites` route page and loading skeleton

**Files:**
- Create: `src/features/search/components/MobileFilterSheet.tsx`
- Create: `app/suites/page.tsx`
- Create: `app/suites/loading.tsx`

- [ ] **Step 1: Create MobileFilterSheet client component**

Extracted into its own client component to avoid rendering Sheet (which uses React context) directly in a Server Component.

```typescript
// src/features/search/components/MobileFilterSheet.tsx
"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterPanel } from "@/features/search/components/FilterPanel";
import type { FilterOptions } from "@/features/search/types/search.types";

interface MobileFilterSheetProps {
  filterOptions: FilterOptions;
}

export function MobileFilterSheet({ filterOptions }: MobileFilterSheetProps) {
  return (
    <div className="mb-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <FilterPanel filterOptions={filterOptions} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

- [ ] **Step 2: Create the page Server Component**

```typescript
// app/suites/page.tsx
import { parseSearchParams } from "@/features/search/lib/search-params-schema";
import { searchSuites } from "@/features/search/queries/search-suites";
import { getFilterOptions } from "@/features/search/queries/get-filter-options";
import { FilterPanel } from "@/features/search/components/FilterPanel";
import { MobileFilterSheet } from "@/features/search/components/MobileFilterSheet";
import { SuiteSearchGrid } from "@/features/search/components/SuiteSearchGrid";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SuitesPage({ searchParams }: Props) {
  const rawParams = await searchParams;
  const validatedParams = parseSearchParams(rawParams);

  const [suites, filterOptions] = await Promise.all([
    searchSuites(validatedParams),
    getFilterOptions(),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Résultats de votre recherche</h1>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <FilterPanel filterOptions={filterOptions} />
        </aside>

        {/* Mobile filter trigger */}
        <MobileFilterSheet filterOptions={filterOptions} />

        {/* Results grid */}
        <div className="flex-1">
          <SuiteSearchGrid suites={suites} />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create loading skeleton**

```typescript
// app/suites/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function SuitesLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-72" />
      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Skeleton className="h-96 w-full" />
        </aside>
        <div className="flex-1">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/search/components/MobileFilterSheet.tsx app/suites/page.tsx app/suites/loading.tsx
git commit -m "feat(search): add /suites search results page with filter sidebar"
```

---

## Task 9: Refactor Header with SearchBar and UserMenu

**Files:**
- Modify: `src/components/layout/Header.tsx`

**Current Header:** `src/components/layout/Header.tsx` (38 lines) — simple server component with brand link + auth nav buttons.

- [ ] **Step 1: Rewrite Header to integrate SearchBar and UserMenu**

The Header becomes a hybrid: server component that fetches auth session, renders client components (SearchBar, UserMenu). The SearchBar is hidden on admin/manager routes and on the home page `/`.

```typescript
// src/components/layout/Header.tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/features/search/components/SearchBar";
import { SearchBarMobile } from "@/features/search/components/SearchBarMobile";
import { UserMenu } from "@/components/layout/UserMenu";
import { HeaderSearchVisibility } from "@/components/layout/HeaderSearchVisibility";

export async function Header() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="border-b px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="shrink-0 font-semibold">
          Hôtels Clair de Lune
        </Link>

        <Suspense fallback={null}>
          <HeaderSearchVisibility>
            {/* Desktop search */}
            <div className="hidden flex-1 justify-center lg:flex">
              <SearchBar />
            </div>
            {/* Mobile search */}
            <div className="flex flex-1 lg:hidden">
              <SearchBarMobile />
            </div>
          </HeaderSearchVisibility>
        </Suspense>

        <UserMenu
          isAuthenticated={!!session}
          userName={session?.user.name ?? undefined}
        />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create HeaderSearchVisibility client component**

This component hides the search bar on routes where it's not relevant (admin, manager, home page).

```typescript
// src/components/layout/HeaderSearchVisibility.tsx
"use client";

import { usePathname } from "next/navigation";

const HIDDEN_SEARCH_PATTERNS = ["/admin", "/manager", "/sign-in", "/sign-up"];

interface HeaderSearchVisibilityProps {
  children: React.ReactNode;
}

export function HeaderSearchVisibility({ children }: HeaderSearchVisibilityProps) {
  const pathname = usePathname();

  const shouldHide =
    pathname === "/" ||
    HIDDEN_SEARCH_PATTERNS.some((pattern) => pathname.startsWith(pattern));

  if (shouldHide) return null;

  return <>{children}</>;
}
```

- [ ] **Step 3: Verify the app builds**

```bash
bun run build
```

If build errors occur, fix them before committing.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/HeaderSearchVisibility.tsx src/components/layout/UserMenu.tsx
git commit -m "refactor(layout): redesign Header with search bar and UserMenu dropdown"
```

---

## Task 10: Manual smoke test and visual polish

- [ ] **Step 1: Start the dev server**

```bash
docker compose up -d db
bun run dev
```

- [ ] **Step 2: Verify these flows in browser**

1. Navigate to `/suites` — should show all suites in a 3-column grid
2. Use the filter sidebar — change location, price, accessibility → URL updates and results re-filter
3. Use the search bar in the header — fill destination + dates + guests → click Rechercher → redirects to `/suites?...`
4. Resize to mobile — search bar becomes compact, filters behind Sheet
5. Click user icon while logged out → redirects to `/sign-in`
6. Log in → click user icon → dropdown shows "Mes réservations" and "Se déconnecter"
7. Navigate to `/` — search bar should NOT appear in header
8. Navigate to `/admin/*` — search bar should NOT appear

- [ ] **Step 3: Fix any visual discrepancies with the Figma mockup**

Compare the running app with the mockup screenshots. Adjust spacing, fonts, colors as needed.

- [ ] **Step 4: Run lint**

```bash
bun run lint
```

Fix any lint errors.

- [ ] **Step 5: Final commit with any polish fixes**

```bash
git add src/features/search/ src/components/layout/ app/suites/
git commit -m "fix(search): visual polish and lint fixes"
```

---

## Summary of commits (expected)

| # | Commit message |
|---|----------------|
| 0 | `chore: add shadcn slider, calendar, popover, checkbox, dropdown-menu, sheet, collapsible` |
| 1 | `feat(search): add search types and Zod param validation schema` |
| 2 | `feat(search): add search-suites and get-filter-options server queries` |
| 3 | `feat(layout): add UserMenu dropdown component` |
| 4 | `feat(search): add DestinationInput, DateRangePicker, GuestSelector sub-components` |
| 5 | `feat(search): add desktop SearchBar and mobile SearchBarMobile` |
| 6 | `feat(search): add filter panel with location, price range, and accessibility filters` |
| 7 | `feat(search): add SuiteSearchCard and SuiteSearchGrid components` |
| 8 | `feat(search): add /suites search results page with filter sidebar` |
| 9 | `refactor(layout): redesign Header with search bar and UserMenu dropdown` |
| 10 | `fix(search): visual polish and lint fixes` |
