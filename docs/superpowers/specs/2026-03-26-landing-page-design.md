# Landing Page — Design Spec

**Branche :** `feat/landing-page`
**Date :** 2026-03-26
**Auteur :** Julien Lemarchand + Claude

## Contexte

La page d'accueil (`/`) est actuellement un placeholder avec des liens de navigation. L'application a besoin d'une landing page immersive qui vend l'expérience "Clair de Lune" — chaîne hôtelière rurale avec ~15 établissements dans le centre de la France — et oriente rapidement l'utilisateur vers la recherche de suites ou la consultation des établissements.

## Objectif

Créer une landing page qui :
- Pose l'atmosphère de la marque (visuel immersif, ambiance rurale)
- Donne accès immédiat à la recherche de suites via un formulaire intégré au hero
- Présente les établissements en carrousel horizontal
- Rassure avec des points forts et des témoignages
- Propose un CTA contact en bas de page

## Hors scope

- Barre de recherche dans la navbar (implémentée sur `feat/search-and-filters`, pas affichée sur la landing)
- Filtres de recherche (page `/suites` dédiée)
- Témoignages dynamiques depuis la base de données (contenu statique pour l'instant)
- Formulaire de contact (en cours de finalisation par Agathe, on fournit juste le lien)

## Dépendances

- **`feat/search-and-filters`** : les sous-composants `DestinationInput`, `DateRangePicker`, `GuestSelector` seront réutilisés dans le hero search card une fois la branche mergée. En attendant, un placeholder est utilisé.
- **Formulaire contact** : route à confirmer (probablement `/inquiries/new` ou similaire). Le CTA pointe vers cette route.

---

## 1. Structure de la page

Page Server Component : `app/page.tsx`

| # | Section | Type | Composant | Données |
|---|---------|------|-----------|---------|
| 1 | Navbar | Layout existant | `Header` | Sans `SearchBar` sur `/` |
| 2 | Hero | Server + Client | `HeroSection` + `HeroSearchCard` | Statique + interactivité search |
| 3 | Établissements | Server | `EstablishmentCarousel` | Query DB `getEstablishments()` |
| 4 | Points forts | Server | `HighlightsSection` | Statique (3 items) |
| 5 | Témoignages | Server | `TestimonialsSection` | Statique (3 reviews) |
| 6 | CTA Contact | Server | `ContactCta` | Statique |
| 7 | Footer | Server | `Footer` | Statique |

---

## 2. Hero

### Layout desktop

Image de fond plein écran (photo paysage rural). Deux zones côte à côte :

- **Gauche** : branding — surtitre "Chaîne hôtelière rurale" (uppercase, small), titre "Trouver votre séjour sous les étoiles" (grand, light), sous-texte descriptif (court paragraphe sur l'ambiance)
- **Droite** : carte glassmorphism semi-transparente (`backdrop-filter: blur()`, bordure subtile, ombre portée) contenant le formulaire de recherche en layout vertical

### Layout mobile

La carte search passe sous le texte de branding (stack vertical). Même disposition que le composant search en mobile sur les autres pages.

### HeroSearchCard (Client Component)

Champs en layout vertical :
- **Destination** : input texte (réutilise `DestinationInput` de `features/search/` quand disponible)
- **Dates** : date range picker (réutilise `DateRangePicker` quand disponible)
- **Voyageurs** : sélecteur numérique (réutilise `GuestSelector` quand disponible)
- **Bouton "Rechercher"** : fond blanc, texte sombre. Au submit → redirect vers `/suites?destination=...&checkIn=...&checkOut=...&guests=...`

**Phase 1 (placeholder)** : inputs natifs stylisés dans la carte glassmorphism, même redirect.
**Phase 2 (après merge search)** : remplacer par les vrais sous-composants.

### Style glassmorphism

```css
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 12px; /* var(--radius) */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
```

### Image de fond

Image statique servie depuis `/public/images/hero/` ou placeholder gradient en attendant une vraie photo. Utiliser `next/image` avec `fill` + `priority` pour le LCP.

---

## 3. Établissements (carrousel)

### Comportement

- Scroll horizontal (`overflow-x-auto`) avec les cards d'établissements
- Les cards débordent du viewport — l'utilisateur scroll latéralement
- Lien "Voir tous →" aligné à droite du titre, pointe vers `/establishments`

### Card établissement (dans le carrousel)

Card compacte avec :
- Image de l'établissement (aspect-ratio fixe)
- Nom (bold)
- Ville + nombre de suites
- Prix "à partir de X € / nuit" (prix min des suites de l'établissement)

### Données

Réutilise `getEstablishments()` existant dans `src/features/establishments/queries/`. Le prix "à partir de" nécessite soit :
- Un champ calculé dans la query existante (jointure sur `suite` pour `MIN(price)`)
- Une nouvelle query dédiée au carrousel

À évaluer à l'implémentation — préférer enrichir la query existante si le coût est faible.

### Responsive

- Desktop : cards ~280px de large, scroll horizontal
- Mobile : cards ~240px de large, même scroll horizontal

---

## 4. Points forts

3 cards statiques, centrées, en ligne sur desktop (stack sur mobile).

| # | Icône | Titre | Description |
|---|-------|-------|-------------|
| 1 | Lucide `Trees` ou similaire | Cadre naturel unique | Forêts, vallées et rivières — chaque établissement offre un écrin de nature préservée. |
| 2 | Lucide `CalendarCheck` ou similaire | Réservation directe | Sans intermédiaire, au meilleur prix. Votre séjour en quelques clics. |
| 3 | Lucide `Heart` ou similaire | Service personnalisé | Des gérants passionnés, à votre écoute pour un séjour sur mesure. |

Icônes : utiliser `lucide-react` (déjà installé). Pas d'emoji dans le code final.

---

## 5. Témoignages

3 cards statiques type Google Reviews. Contenu hardcodé dans un tableau de constantes.

Chaque card :
- Note en étoiles (★★★★★ ou ★★★★☆)
- Citation en italique
- Nom de l'auteur (prénom + initiale)
- Établissement associé + "Google Reviews"

Le contenu exact sera défini à l'implémentation (données fictives cohérentes avec le seed).

---

## 6. CTA Contact

Bandeau plein largeur, fond sombre (#1a2332 ou `--primary`).

- Titre : "Une question ? Un besoin particulier ?"
- Sous-texte : "Notre équipe vous répond sous 24h"
- Bouton : "Contactez-nous" → lien vers `/inquiries/new`

Une route placeholder `app/inquiries/new/page.tsx` est créée dans le cadre de ce travail (message "Formulaire bientôt disponible") pour que le lien soit typesafe. Agathe implémentera le vrai formulaire par la suite.

---

## 7. Footer

Composant layout partagé (`src/components/layout/Footer.tsx`), réutilisable sur toutes les pages.

3 colonnes sur desktop (stack sur mobile) :

| Colonne | Contenu |
|---------|---------|
| Marque | "Hôtels Clair de Lune", "Chaîne hôtelière rurale", "Centre de la France" |
| Navigation | Nos établissements, Connexion, Inscription |
| Contact | Email, téléphone |

Barre de copyright en bas : "© 2026 Hôtels Clair de Lune — Tous droits réservés"

---

## 8. Navbar — comportement conditionnel

Le `Header` existant doit être capable de masquer la `SearchBar` sur la landing page. Deux approches :

- **Prop** : `<Header showSearch={false} />` depuis `app/page.tsx`
- **Route detection** : le Header lit le pathname et masque la search sur `/`

Préférer la prop — explicite, pas de couplage avec les routes.

---

## 9. Structure des fichiers

```
src/features/landing/
├── components/
│   ├── HeroSection.tsx          # Server — layout hero + image de fond
│   ├── HeroSearchCard.tsx       # Client — carte glassmorphism + formulaire
│   ├── EstablishmentCarousel.tsx # Server — scroll horizontal + query
│   ├── HighlightsSection.tsx    # Server — 3 points forts
│   ├── TestimonialsSection.tsx  # Server — 3 témoignages
│   └── ContactCta.tsx           # Server — bandeau CTA contact
└── lib/
    └── landing-content.ts       # Constantes : highlights, testimonials

src/components/layout/
└── Footer.tsx                   # Nouveau — composant layout partagé

app/page.tsx                     # Refonte — compose les sections
```

---

## 10. Accessibilité

- Hero image : `alt` descriptif ou `role="img"` + `aria-label` sur le conteneur
- Skip link existant cible `#main-content` → le `<main>` wraps toutes les sections
- Cards du carrousel : navigables au clavier (focus visible sur les liens)
- Contraste texte blanc sur image sombre : vérifier ratio WCAG AA sur le hero
- Boutons et liens : min 44x44px touch target

---

## Implementation Log

_À remplir pendant l'implémentation — divergences par rapport à ce spec._

| Étape | Divergence | Raison |
|-------|-----------|--------|
| | | |
