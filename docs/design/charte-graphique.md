# Charte graphique — Hôtel Clair de Lune

Document de référence consolidé à partir de la codebase (tokens CSS, classes Tailwind consommées, composants UI).

---

## 1. Palette de couleurs

### 1.1 Tokens sémantiques (source : `app/globals.css`)

Toutes les couleurs sont définies en **OKLCH** pour une perception uniforme. Chaque token possède une variante light (`:root`) et dark (`.dark`).

#### Thème clair (défaut)

| Token | Valeur OKLCH | Rendu approx. | Rôle |
|-------|-------------|---------------|------|
| `--background` | `oklch(0.977 0.010 81.8)` | Crème très clair | Fond de page |
| `--foreground` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Texte principal |
| `--card` | `oklch(1 0 0)` | Blanc pur | Fond des cartes |
| `--card-foreground` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Texte sur carte |
| `--popover` | `oklch(1 0 0)` | Blanc pur | Fond popover |
| `--popover-foreground` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Texte popover |
| `--primary` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Couleur principale de marque |
| `--primary-foreground` | `oklch(0.985 0 0)` | Blanc cassé | Texte sur primary |
| `--secondary` | `oklch(0.93 0.020 303.5)` | Lavande très clair | Fond secondaire |
| `--secondary-foreground` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Texte sur secondary |
| `--muted` | `oklch(0.95 0.010 303.5)` | Gris lavande | Fond atténué |
| `--muted-foreground` | `oklch(0.50 0.030 303.5)` | Gris violet moyen | Texte secondaire / désactivé |
| `--accent` | `oklch(0.751 0.100 74.3)` | Doré / jaune orangé | Accent principal (CTA) |
| `--accent-light` | `oklch(0.817 0.089 81.9)` | Doré clair | Accent léger (recherche, surbrillance) |
| `--accent-foreground` | `oklch(0.263 0.105 303.5)` | Violet très foncé | Texte sur accent |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Rouge orangé | Erreurs, suppressions |
| `--border` | `oklch(0.90 0.020 303.5)` | Gris lavande clair | Bordures |
| `--input` | `oklch(0.90 0.020 303.5)` | Gris lavande clair | Bordures champs |
| `--ring` | `oklch(0.713 0.137 307.0)` | Violet moyen | Anneau de focus |

#### Thème sombre

| Token | Valeur OKLCH | Rôle |
|-------|-------------|------|
| `--background` | `oklch(0.20 0.06 303.5)` | Fond de page sombre |
| `--foreground` | `oklch(0.985 0 0)` | Texte clair |
| `--card` | `oklch(0.263 0.105 303.5)` | Fond carte (violet foncé) |
| `--primary` | `oklch(0.713 0.137 307.0)` | Primary éclairci |
| `--primary-foreground` | `oklch(0.263 0.105 303.5)` | Texte foncé sur primary clair |
| `--secondary` | `oklch(0.35 0.060 303.5)` | Secondary assombri |
| `--muted` | `oklch(0.35 0.060 303.5)` | Fond atténué sombre |
| `--muted-foreground` | `oklch(0.713 0.137 307.0)` | Texte secondaire éclairci |
| `--destructive` | `oklch(0.704 0.191 22.216)` | Rouge éclairci |
| `--border` | `oklch(1 0 0 / 10%)` | Bordure subtile (blanc 10%) |
| `--input` | `oklch(1 0 0 / 15%)` | Champs (blanc 15%) |

#### Couleurs de graphiques (data viz)

| Token | Light | Dark |
|-------|-------|------|
| `--chart-1` | `oklch(0.263 0.105 303.5)` | `oklch(0.713 0.137 307.0)` |
| `--chart-2` | `oklch(0.713 0.137 307.0)` | `oklch(0.751 0.100 74.3)` |
| `--chart-3` | `oklch(0.751 0.100 74.3)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

### 1.2 Couleurs utilitaires Tailwind (statuts)

Ces couleurs Tailwind standard sont utilisées pour les indicateurs sémantiques de statut, en dehors du système de tokens :

| Intention | Couleurs utilisées | Contexte |
|-----------|-------------------|----------|
| **Succès / Confirmé** | `green-50` → `green-950` | Réservation confirmée, paiement validé |
| **Danger / Annulé** | `red-50` → `red-950` | Réservation annulée, expirée, erreurs |
| **Attente / Avertissement** | `amber-50` → `amber-950` | Réservation en attente, paiement en cours |
| **Information** | `blue-100`, `blue-800` | Badges de types (DB viewer) |
| **Neutre / Terminé** | `gray-50` → `gray-900`, `zinc-50` → `zinc-900` | État terminé, séparateurs, détails |

### 1.3 Opacités courantes

Les tokens sémantiques sont déclinés avec des modificateurs d'opacité `/N` :

- **Fonds subtils** : `bg-primary/5`, `bg-primary/10`, `bg-primary/15`
- **Hover** : `bg-primary/90`, `bg-secondary/90`, `bg-accent/90`
- **Texte atténué** : `text-primary-foreground/40`, `/60`, `/70`
- **Bordures subtiles** : `border-primary-foreground/10`, `border-primary/30`
- **Focus** : `ring-ring/50`

### 1.4 Dégradés

| Usage | Définition |
|-------|-----------|
| Overlay image | `from-black/70` ou `from-black/80` via `via-black/20` |
| Fond section | `from-primary/10` → `to-primary/5` |
| CTA contact | Dégradé vers `to-[oklch(0.20_0.09_303.5)]` |

### 1.5 Couleurs hors système (inline)

| Valeur | Fichier | Usage |
|--------|---------|-------|
| `oklch(0.16 0.08 303.5)` | `Footer.tsx` | Fond footer (violet très sombre) |
| `oklch(0.20 0.09 303.5)` | `ContactCta.tsx` | Fin de dégradé CTA |
| `rgba(0,0,0,0.55)` | Carte recherche | Overlay sombre |

---

## 2. Typographie

### 2.1 Familles de polices

| Classe Tailwind | Police | Usage |
|----------------|--------|-------|
| `font-sans` (défaut) | **Comfortaa** (Google Fonts) + system-ui, sans-serif | Corps de texte, UI, boutons, formulaires |
| `font-serif` | Serif système (Georgia, etc.) | Titres des pages détail (suites) — élégance |
| `font-mono` | Mono système | DB viewer, références de réservation |

La police Comfortaa est chargée via `next/font` avec `display: "swap"` et exposée via la variable CSS `--font-comfortaa`.

### 2.2 Hiérarchie typographique

#### Titres de page (H1)

| Contexte | Taille | Graisse | Famille | Interligne | Espacement | Responsive |
|----------|--------|---------|---------|------------|------------|------------|
| Hero landing | `text-5xl` | `font-light` (300) | sans | `leading-tight` | — | `md:text-6xl` |
| Détail suite | `text-4xl` | `font-semibold` (600) | **serif** | `leading-tight` | `tracking-tight` | `md:text-5xl` |
| Checkout | `text-xl` | `font-bold` (700) | sans | — | — | `sm:text-2xl` |

#### Titres de section (H2)

| Contexte | Taille | Graisse | Famille | Extras |
|----------|--------|---------|---------|--------|
| Section détail suite | `text-2xl` | `font-semibold` (600) | **serif** | — |
| Section landing | `text-2xl` | `font-semibold` (600) | sans | `uppercase tracking-wide` |
| CTA contact | `text-2xl` | `font-semibold` (600) | sans | `md:text-3xl` |
| Options | `text-lg` | `font-semibold` (600) | sans | — |
| En-tête formulaire | `text-sm` | `font-semibold` (600) | sans | `uppercase tracking-wide` |

#### Sous-titres (H3)

| Contexte | Taille | Graisse | Extras |
|----------|--------|---------|--------|
| Carte highlight | `text-base` | `font-semibold` (600) | — |
| Carte établissement | `text-base` | `font-semibold` (600) | — |
| Overlay carousel | `text-base` | `font-semibold` (600) | `text-white drop-shadow-md` |

#### Corps de texte

| Rôle | Taille | Graisse | Couleur | Extras |
|------|--------|---------|---------|--------|
| Paragraphe principal | `text-base` | normal (400) | `foreground` | — |
| Introduction hero | `text-base` | `font-light` (300) | `primary-foreground/70` | `leading-relaxed` |
| Description suite | `text-[15px]` | `font-light` (300) | `zinc-500` | `leading-relaxed whitespace-pre-line` |
| Témoignage | `text-sm` | normal (400) | `muted-foreground` | `italic leading-relaxed` |
| Auteur témoignage | `text-sm` | `font-semibold` (600) | — | — |

#### Texte UI / Formulaires

| Élément | Taille | Graisse | Couleur |
|---------|--------|---------|---------|
| Bouton | `text-sm` | `font-bold` (700) | selon variante |
| Badge | `text-xs` | `font-medium` (500) | selon variante |
| Label formulaire | `text-sm` | `font-medium` (500) | `foreground` |
| Erreur formulaire | `text-xs` | normal | `destructive` |
| Texte d'aide | `text-xs` | normal | `muted-foreground` |
| Titre carte (CardTitle) | hérité | `font-semibold` (600) | `card-foreground` |
| Description carte | `text-sm` | normal | `muted-foreground` |

#### Texte secondaire / Métadonnées

| Rôle | Taille | Graisse | Couleur |
|------|--------|---------|---------|
| Spécifications suite | `text-sm` | `font-light` (300) | `zinc-400` |
| Équipements | `text-sm` | `font-light` (300) | `zinc-500` |
| Lien établissement | `text-sm` | `font-light` (300) | `zinc-400` |
| Label petit (carousel) | `text-[10px]` | `font-semibold` (600) | `zinc-400` + `tracking-widest uppercase` |

#### Texte d'accentuation

| Rôle | Taille | Graisse | Extras |
|------|--------|---------|--------|
| Branding hero | `text-sm` | `font-medium` (500) | `uppercase tracking-[0.2em] text-ring` |
| Prix total | `text-2xl` | `font-bold` (700) | `tracking-tight` |
| Prix ligne | `text-sm` | `font-medium` (500) | `text-right` |

### 2.3 Échelle typographique résumée

| Classe Tailwind | Taille CSS | Usages principaux |
|----------------|-----------|-------------------|
| `text-6xl` | 3.75rem | Hero H1 (md+) |
| `text-5xl` | 3rem | Hero H1, Détail suite H1 (md+) |
| `text-4xl` | 2.25rem | Détail suite H1 (base) |
| `text-3xl` | 1.875rem | CTA H2 (md+) |
| `text-2xl` | 1.5rem | H2 sections, prix total |
| `text-xl` | 1.25rem | Checkout H1 (base) |
| `text-lg` | 1.125rem | H2 options |
| `text-base` | 1rem | H3, paragraphes, options |
| `text-sm` | 0.875rem | Labels, boutons, badges, descriptions |
| `text-xs` | 0.75rem | Erreurs, aide, micro-labels |
| `text-[15px]` | 15px | Description suite (custom) |
| `text-[10px]` | 10px | Label carousel (custom) |

### 2.4 Espacement typographique

| Classe | Valeur | Usage |
|--------|--------|-------|
| `tracking-tight` | -0.025em | Titres H1 suite, prix total |
| `tracking-wide` | 0.025em | En-têtes de section uppercase |
| `tracking-widest` | 0.1em | Micro-labels carousel |
| `tracking-[0.2em]` | 0.2em | Branding hero |
| `leading-none` | 1 | Titres de carte, labels |
| `leading-tight` | 1.25 | H1 hero et détail |
| `leading-relaxed` | 1.625 | Descriptions, témoignages |

---

## 3. Rayons de bordure

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius` (base) | `0.625rem` (10px) | Référence |
| `--radius-sm` | `0.375rem` (6px) | Badges, petits éléments |
| `--radius-md` | `0.5rem` (8px) | Inputs, boutons |
| `--radius-lg` | `0.625rem` (10px) | Cartes |
| `--radius-xl` | `0.875rem` (14px) | Modales, grands conteneurs |

---

## 4. Synthèse des principes visuels

- **Palette** : Violet foncé (primary) + Doré (accent) — évoque le luxe et la nuit (« Clair de Lune »)
- **Espace couleur** : OKLCH pour une cohérence perceptuelle
- **Typographie sans** : Comfortaa — arrondie, douce, accueillante
- **Typographie serif** : Réservée aux titres de page détail pour un contraste élégant
- **Graisse dominante** : `font-semibold` (600) pour les titres, `font-light` (300) pour les descriptions — contraste fort/léger
- **Mobile-first** : Tailles de texte de base compactes, élargies via `sm:` / `md:`
- **Hiérarchie par le poids** : Combinaison taille + graisse + tracking pour distinguer les niveaux (H1 large/léger vs H2 moyen/gras vs section uppercase/petit)
