# Search & Filters — Design Spec

**Branche :** `feat/search-and-filters`
**Date :** 2026-03-26
**Auteur :** Julien Lemarchand + Claude

## Contexte

L'application affiche actuellement les établissements sur `/establishments` et les suites dans le détail d'un établissement. La maquette Figma introduit une page de recherche de suites avec navbar de recherche, filtres latéraux et grille de résultats.

## Objectif

Créer une expérience de recherche de suites avec :
- Une navbar redesignée intégrant une barre de recherche (destination, dates, voyageurs)
- Un panneau de filtres latéral (localisation, prix, accessibilité)
- Une grille de résultats responsive (suites avec badge établissement)
- Filtrage côté serveur via search params (URLs partageables)

## Hors scope

- Filtrage par disponibilité (croisement dates × bookings) — prévu ultérieurement
- Autocomplete avancé sur la destination (input texte simple pour l'instant)
- Fonctionnalité "Autres filtres..." (placeholder visuel)
- Pagination (limite implicite à 50 résultats pour cette itération)

## Contraintes schéma DB

- La table `establishment` n'a **pas de colonne `department`** — les champs disponibles sont `city`, `address`, `postalCode`
- Le filtre "Localisation" utilise `city` (pas département). Le département pourra être dérivé du `postalCode` (2 premiers chiffres) dans une itération future
- La colonne suite s'appelle `title` (pas `name`)
- La colonne image s'appelle `mainImage` et est `NOT NULL`

---

## 1. Navbar (Header)

### Desktop

```
[ Logo "Hôtels Clair de Lune" ] [ Destination | Dates | Voyageurs ] [ Rechercher ] [ UserIcon ]
```

- **Logo** : lien vers `/`, texte "Hôtels Clair de Lune"
- **Barre de recherche** : 3 segments séparés par des dividers dans un conteneur arrondi avec bordure
  - **Destination** : input texte avec icône pin, label "DESTINATION" au-dessus de la valeur
  - **Dates** : date range picker (calendrier shadcn), label "DATES", affiche "15 mars — 18 mars"
  - **Voyageurs** : sélecteur numérique dans un Popover, label "VOYAGEURS", affiche "2 voyageurs"
- **Bouton "Rechercher"** : noir, redirige vers `/suites?destination=...&checkIn=...&checkOut=...&guests=...`
- **Icône user** : si déconnecté → redirige vers `/sign-in` ; si connecté → DropdownMenu (Mes réservations, Se déconnecter)

### Mobile

```
[ SearchSummary "Aveyron, 15-18 mars · 2 voy." ▼ ] [ FilterIcon ] [ UserIcon ]
```

- **Résumé cliquable** : condensé de la recherche active, au clic ouvre un panneau/modal avec les champs complets (même champs que desktop)
- **Icône filtre** : ouvre le FilterPanel en Sheet (drawer bottom)
- **Icône user** : même logique que desktop

### Composants

| Composant | Chemin | Type |
|-----------|--------|------|
| SearchBar | `src/features/search/components/SearchBar.tsx` | Client |
| SearchBarMobile | `src/features/search/components/SearchBarMobile.tsx` | Client |
| DestinationInput | `src/features/search/components/DestinationInput.tsx` | Client |
| DateRangePicker | `src/features/search/components/DateRangePicker.tsx` | Client |
| GuestSelector | `src/features/search/components/GuestSelector.tsx` | Client |
| UserMenu | `src/components/layout/UserMenu.tsx` | Client |

Le Header existant (`src/components/layout/Header.tsx`) est refactoré pour intégrer ces composants. La SearchBar lit les search params côté client via `useSearchParams()` (les layouts Next.js ne reçoivent pas `searchParams`).

**Visibilité par rôle** : la barre de recherche est affichée uniquement sur les pages publiques. Les pages admin/manager n'affichent pas la SearchBar (le Header détecte le segment de route via `usePathname()` et masque la SearchBar sur `/admin/*` et `/manager/*`).

---

## 2. Panneau de filtres

### Desktop — Sidebar gauche

- **Titre** : "FILTRES" en uppercase, petite taille
- **Localisation** : section collapsible (chevron), checkboxes par ville. Liste dynamique basée sur les villes distinctes des établissements en DB. Mention grisée "+ autres départements à venir".
- **Prix / nuit** : section collapsible, Slider range dual-thumb (min/max). Bornes dynamiques depuis les données. Affichage "90 € — 210 € / nuit" sous le slider.
- **Accessibilité** : section collapsible, checkboxes (Accès PMR, Plain-pied). Basé sur les amenities ayant le scope "property" ou "both".
- **"Autres filtres..."** : texte grisé, non cliquable (placeholder futur)

### Mobile — Sheet (drawer bottom)

- Même contenu que desktop
- Ouvert via l'icône filtre dans la navbar mobile
- Bouton "Appliquer" en bas pour fermer et déclencher le filtrage

### Comportement

- Chaque changement de filtre met à jour les search params de l'URL → le Server Component re-fetch
- **Synchronisation destination ↔ localisation** : le champ "Destination" dans la SearchBar est un raccourci d'entrée. Quand l'utilisateur tape une ville et clique "Rechercher", ça pré-coche la ville correspondante dans le filtre localisation. Les deux sources écrivent dans le même search param `locations[]`. Modifier les checkboxes ne met pas à jour le texte du champ destination (one-way).
- Compteur de résultats : "12 suites disponibles"

### États vides

- **Aucun résultat** : message centré "Aucune suite ne correspond à vos critères." avec suggestion de modifier les filtres (composant Alert inline)
- **Aucun filtre actif** : afficher toutes les suites (pas de filtre = pas de restriction)
- **Description null** sur une card : ne pas afficher la zone description (pas de placeholder)

### Composants

| Composant | Chemin | Type |
|-----------|--------|------|
| FilterPanel | `src/features/search/components/FilterPanel.tsx` | Client |
| FilterSection | `src/features/search/components/FilterSection.tsx` | Client |
| LocationFilter | `src/features/search/components/LocationFilter.tsx` | Client |
| PriceRangeFilter | `src/features/search/components/PriceRangeFilter.tsx` | Client |
| AccessibilityFilter | `src/features/search/components/AccessibilityFilter.tsx` | Client |

---

## 3. Grille de suites

### SuiteSearchCard

- **Photo** : zone image en haut (`mainImage`, toujours présent — NOT NULL), aspect-ratio ~16/10
- **Ligne titre** : nom de la suite (bold) + icône capacité (Users) avec nombre à droite
- **Ligne établissement** : badge pill gris clair avec nom de l'établissement + "·" + ville
- **Description** : 2-3 lignes, truncate avec `line-clamp-3`
- **Ligne prix** : prix en gras + "/ nuit" à gauche + bouton "Voir la suite" noir à droite → lien vers `/suites/[id]`

### Grille responsive

- Mobile : `grid-cols-1` (default)
- Tablette : `md:grid-cols-2` (768px+)
- Desktop : `lg:grid-cols-3` (1024px+)
- Gap : `gap-6`

### Composants

| Composant | Chemin | Type |
|-----------|--------|------|
| SuiteSearchCard | `src/features/search/components/SuiteSearchCard.tsx` | Server |
| SuiteSearchGrid | `src/features/search/components/SuiteSearchGrid.tsx` | Server |

---

## 4. Route `/suites`

### Page Server Component

**Chemin** : `app/suites/page.tsx`

**Search params acceptés** :
- `destination` (string) — nom de ville (utilisé pour pré-cocher le filtre localisation)
- `checkIn` (string, ISO date) — date d'arrivée (capturé dans l'URL pour usage futur, pas de filtrage DB dans cette itération)
- `checkOut` (string, ISO date) — date de départ (idem)
- `guests` (number) — nombre de voyageurs
- `locations[]` (string[]) — villes cochées dans les filtres
- `priceMin` (number) — prix minimum
- `priceMax` (number) — prix maximum
- `accessibility[]` (string[]) — IDs des amenities accessibilité

**Layout** :
```
[ "Résultats de votre recherche" ]
[ FilterPanel (sidebar) ] [ SuiteSearchGrid (main) ]
```

- Suspense boundary avec skeleton pour la grille
- Le FilterPanel est à gauche sur desktop (`aside`, ~240px), hidden sur mobile (dans Sheet)

### Query serveur

**Chemin** : `src/features/search/queries/search-suites.ts`

**Validation** : les search params sont validés avec Zod à l'entrée de la query. Params invalides (guests négatif, priceMin > priceMax, date non ISO) → ignorés silencieusement (fallback sur "pas de filtre").

**Logique** :
- Join `suite` + `establishment` (pour nom établissement, ville)
- Filtres optionnels combinés en `AND` :
  - `locations[]` : `establishment.city IN (...)` (ILIKE pour ignorer la casse)
  - `priceMin` / `priceMax` : `suite.price BETWEEN min AND max`
  - `guests` : `suite.capacity >= guests`
  - `accessibility[]` : join sur `suiteAmenity` ou `establishmentAmenity` — logique `AND` (la suite doit avoir TOUTES les amenities cochées)
- Soft delete : `isNull(suite.deletedAt) AND isNull(establishment.deletedAt)`
- Limite : 50 résultats max
- Tri par défaut : prix croissant

**Retourne** : `SuiteSearchResult[]` avec id, title, description, price, capacity, mainImage, establishmentName, city

### Query filtres disponibles

**Chemin** : `src/features/search/queries/get-filter-options.ts`

Récupère les valeurs possibles pour les filtres dynamiques :
- Liste des villes (distinct depuis les établissements actifs)
- Min/max prix (depuis les suites actives)
- Liste des amenities accessibilité (scope "property" ou "both")

### Types

**Chemin** : `src/features/search/types/search.types.ts`

```typescript
interface SearchParams {
  destination?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  locations?: string[]
  priceMin?: number
  priceMax?: number
  accessibility?: string[]
}

interface SuiteSearchResult {
  id: string
  title: string
  description: string | null
  price: string // numeric → string from DB, parser avec Number() pour affichage
  capacity: number
  mainImage: string
  establishmentName: string
  city: string
}

interface FilterOptions {
  cities: string[]
  priceRange: { min: number; max: number }
  accessibilityAmenities: { id: string; name: string }[]
}
```

---

## 5. Composants shadcn à installer

| Composant | Usage |
|-----------|-------|
| Slider | Range prix dual-thumb |
| Calendar | Date range picker |
| Popover | Wrapper date picker + guest selector |
| Checkbox | Filtres localisation + accessibilité |
| DropdownMenu | Menu user connecté |
| Sheet | Filtres mobile (drawer) |
| Collapsible | Sections de filtres repliables |

Déjà installés : Button, Card, Input, Badge, Skeleton, Separator, AspectRatio, Select.

---

## 6. Structure des fichiers

```
src/features/search/
├── components/
│   ├── SearchBar.tsx
│   ├── SearchBarMobile.tsx
│   ├── DestinationInput.tsx
│   ├── DateRangePicker.tsx
│   ├── GuestSelector.tsx
│   ├── FilterPanel.tsx
│   ├── FilterSection.tsx
│   ├── LocationFilter.tsx
│   ├── PriceRangeFilter.tsx
│   ├── AccessibilityFilter.tsx
│   ├── SuiteSearchCard.tsx
│   └── SuiteSearchGrid.tsx
├── queries/
│   ├── search-suites.ts
│   └── get-filter-options.ts
└── types/
    └── search.types.ts

src/components/layout/
├── UserMenu.tsx          (nouveau)

app/suites/
├── page.tsx
└── loading.tsx
```

---

## 7. Pages existantes — impact

| Page | Impact |
|------|--------|
| `src/components/layout/Header.tsx` | Refonte complète — nouvelle navbar |
| `src/components/layout/LogoutButton.tsx` | Conservé, utilisé dans UserMenu dropdown |
| `app/layout.tsx` | Ajustement pour passer les search params au Header si nécessaire |
| `/establishments` | Aucun changement |
| `/establishments/[id]` | Aucun changement |
| `/suites/[id]` | Aucun changement |

---

## Implementation Log

_À remplir pendant l'implémentation — divergences par rapport à ce spec._

| Étape | Divergence | Raison |
|-------|-----------|--------|
| | | |
