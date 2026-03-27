# Charte graphique — Hôtel Clair de Lune

> **Projet :** Application de gestion hôtelière — Hôtel Clair de Lune\
> **Équipe :** Julien Lemarchand, Thélio Trinité, Agathe Boncompain\
> **Date :** Mars 2026

> **Sources :** Ce document est la version technique de la charte, extraite de l'implémentation (tokens CSS, composants shadcn/ui, classes Tailwind). Le document de design original est disponible sur [Google Docs](https://docs.google.com/document/d/1lKRaRJAv9yNGHURP-SydDhMh_ijiVEembWwgXMUnPsI/edit?tab=t.0#heading=h.wnh3puvh5rjv).

---

## 1. Palette de couleurs

Le design system utilise une palette **violet / doré** en espace colorimétrique OKLCH, avec un mode clair et un mode sombre.

### 1.1 Mode clair (par défaut)

| Rôle | Token CSS | Valeur OKLCH | Hex approx. | Usage |
|------|-----------|-------------|-------------|-------|
| Background | `--background` | `oklch(0.977 0.010 81.8)` | `#FBF7F0` | Fond de page (crème chaud) |
| Foreground | `--foreground` | `oklch(0.263 0.105 303.5)` | `#30114D` | Texte principal (violet foncé) |
| Card | `--card` | `oklch(1 0 0)` | `#FFFFFF` | Fond des cartes (blanc) |
| Card text | `--card-foreground` | `oklch(0.263 0.105 303.5)` | `#30114D` | Texte sur cartes |
| Primary | `--primary` | `oklch(0.263 0.105 303.5)` | `#30114D` | Boutons, liens principaux (violet foncé) |
| Primary text | `--primary-foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Texte sur primary |
| Secondary | `--secondary` | `oklch(0.93 0.020 303.5)` | `#EAE5F3` | Boutons secondaires (lavande clair) |
| Secondary text | `--secondary-foreground` | `oklch(0.263 0.105 303.5)` | `#30114D` | Texte sur secondary |
| Muted | `--muted` | `oklch(0.95 0.010 303.5)` | `#F0EDF4` | États désactivés |
| Muted text | `--muted-foreground` | `oklch(0.50 0.030 303.5)` | `#675F72` | Texte secondaire |
| Accent | `--accent` | `oklch(0.751 0.100 74.3)` | `#D4A563` | Couleur d'accentuation (doré) |
| Accent light | `--accent-light` | `oklch(0.817 0.089 81.9)` | `#E0BE80` | Accent clair (doré pâle) |
| Accent text | `--accent-foreground` | `oklch(0.263 0.105 303.5)` | `#30114D` | Texte sur accent |
| Destructive | `--destructive` | `oklch(0.577 0.245 27.325)` | `#E7000B` | Suppression, erreurs (rouge) |
| Border | `--border` | `oklch(0.90 0.020 303.5)` | `#E1DBE9` | Bordures (lavande subtil) |
| Ring | `--ring` | `oklch(0.713 0.137 307.0)` | `#B98AE5` | Focus ring (violet moyen) |

### 1.2 Mode sombre

| Rôle | Token CSS | Valeur OKLCH | Hex approx. | Usage |
|------|-----------|-------------|-------------|-------|
| Background | `--background` | `oklch(0.20 0.06 303.5)` | `#1C0D2C` | Fond de page (violet très foncé) |
| Foreground | `--foreground` | `oklch(0.985 0 0)` | `#FAFAFA` | Texte principal (blanc cassé) |
| Card | `--card` | `oklch(0.263 0.105 303.5)` | `#30114D` | Fond des cartes (violet foncé) |
| Primary | `--primary` | `oklch(0.713 0.137 307.0)` | `#B98AE5` | Boutons, liens (violet moyen) |
| Primary text | `--primary-foreground` | `oklch(0.263 0.105 303.5)` | `#30114D` | Texte sur primary |
| Secondary | `--secondary` | `oklch(0.35 0.060 303.5)` | `#413254` | Boutons secondaires |
| Muted | `--muted` | `oklch(0.35 0.060 303.5)` | `#413254` | États désactivés |
| Muted text | `--muted-foreground` | `oklch(0.713 0.137 307.0)` | `#B98AE5` | Texte secondaire (violet moyen) |
| Accent | `--accent` | `oklch(0.751 0.100 74.3)` | `#D4A563` | Accentuation (doré) |
| Destructive | `--destructive` | `oklch(0.704 0.191 22.216)` | `#FF6467` | Suppression, erreurs (rouge clair) |
| Border | `--border` | `oklch(1 0 0 / 10%)` | `#FFFFFF1A` | Bordures (blanc 10% opacité) |

### 1.3 Approche

- **Palette violet / doré** : teintes violettes (hue ~303) pour la structure et le texte, doré (hue ~74-82) pour l'accentuation — évoque l'univers hôtelier haut de gamme du Clair de Lune
- **Destructive en rouge** : seule couleur chaude vive de l'interface, réservée aux actions dangereuses (suppression, erreurs)
- **OKLCH** : espace colorimétrique perceptuellement uniforme, natif Tailwind CSS 4
- **Light/Dark** : basculement via classe `.dark` sur `<html>`

---

## 2. Typographie

### 2.1 Police système

L'application utilise la **stack de polices système** par défaut du navigateur :

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
```

**Justification :** performances optimales (aucun téléchargement de police), rendu natif sur chaque OS, cohérence avec les conventions de l'interface système.

### 2.2 Hiérarchie typographique

| Niveau | Élément | Classes Tailwind | Usage |
|--------|---------|-----------------|-------|
| H1 | `<h1>` | `text-3xl font-bold` | Titre de page |
| H2 | `<h2>` | `text-2xl font-semibold` | Sections principales |
| H3 | `<h3>` | `text-xl font-semibold` | Sous-sections |
| Body | `<p>` | `text-base` | Texte courant |
| Small | `<small>` | `text-sm text-muted-foreground` | Labels, légendes |

> **Note :** La hiérarchie ci-dessus reflète les conventions utilisées dans le code. Les tailles exactes peuvent varier selon le contexte (responsive, cards, etc.).

---

## 3. Composants UI

L'interface est construite avec **shadcn/ui** (preset New York), personnalisée avec la palette violet / doré.

### 3.1 Configuration

| Paramètre | Valeur |
|-----------|--------|
| Style | New York |
| Base color | Personnalisée (violet / doré) |
| CSS Variables | Activées |
| Icônes | Lucide |
| Border radius | `0.625rem` (10px) |

### 3.2 Composants utilisés

| Composant | Usage |
|-----------|-------|
| `Button` | Actions principales (formulaires, navigation, suppression) |
| `Input` | Champs texte des formulaires |
| `Label` | Labels associés aux champs de formulaire |
| `Card` | Conteneurs visuels (cartes établissement, cartes suite, squelettes de chargement) |
| `Select` | Sélection dans les formulaires (ex: établissement dans le formulaire suite) |
| `Textarea` | Champs texte multi-lignes (descriptions) |
| `Skeleton` | États de chargement (listes établissements, listes suites) |
| `AlertDialog` | Confirmation avant suppression (établissements, suites) |

---

## 4. Wireframes

Wireframes de la fonctionnalité **"Consulter les établissements et les suites"** (US4), en version mobile et desktop.

> **Source :** [Figma — Hotel Clair de Lune wireframes](https://www.figma.com/design/CkVjOlkjiNVovuVxl2PdVS/Hotel-Clair-de-Lune---wireframes)

### 4.1 Accueil

Page d'entrée avec recherche de séjour (destination, dates, voyageurs) et aperçu des établissements.

| Mobile | Desktop |
|--------|---------|
| ![Accueil — mobile](assets/wireframe-accueil-mobile.png) | ![Accueil — desktop](assets/wireframe-accueil-desktop.png) |

### 4.2 Liste des établissements

Page listant tous les établissements du groupe avec nom, ville et description.

| Mobile | Desktop |
|--------|---------|
| ![Établissements — mobile](assets/wireframe-etablissements-mobile.png) | ![Établissements — desktop](assets/wireframe-etablissements-desktop.png) |

### 4.3 Recherche

Interface de recherche de séjour avec filtres.

| Mobile | Desktop |
|--------|---------|
| ![Recherche — mobile](assets/wireframe-recherche-mobile.png) | ![Recherche — desktop](assets/wireframe-recherche-desktop.png) |

### 4.4 Détail d'une suite

Page de détail avec galerie d'images, description, prix et informations de la suite.

| Mobile | Desktop |
|--------|---------|
| ![Suite — mobile](assets/wireframe-suite-mobile.png) | ![Suite — desktop](assets/wireframe-suite-desktop.png) |

> **Export :** Depuis Figma, sélectionner chaque frame (Mobile / Desktop) puis File > Export > PNG (2x). Stocker les fichiers dans `docs/deliverables/assets/`.

