# Analyse design de la concurrence — Hôtel Clair de Lune

> **Auteur :** Agathe Boncompain
> **Créé le :** 2026-03-17
> **Axes analysés :** UI / identité visuelle · UX / parcours de réservation · Mobile / responsive

---

## Méthodologie

Chaque concurrent est analysé sur trois axes :

- **UI / Identité visuelle** : palette, typographie, hiérarchie visuelle, cohérence de marque
- **UX / Parcours de réservation** : nombre d'étapes, friction, clarté des informations, gestion des erreurs
- **Mobile / Responsive** : lisibilité, ergonomie tactile, performance perçue

Une note de **1 à 5** est attribuée sur chaque axe. Le tableau de synthèse en fin de document permet une comparaison rapide.

---

## 1. Booking.com

### UI / Identité visuelle — 4/5

Booking.com s'appuie sur une identité visuelle très reconnaissable centrée sur le bleu cobalt (`#003580`) et le jaune (`#FFB700`) pour les CTA. La typographie est neutre et lisible (système sans-serif), avec une hiérarchie claire entre les titres de propriétés, les prix et les boutons d'action.

**Points forts**
- CTA "Réserver" toujours visible, bien contrasté, répété à plusieurs endroits de la page
- Badges de confiance omniprésents (avis, "Genius", labels qualité) qui rassurent visuellement
- Prix mis en avant avec une typographie large et grasse, immédiatement lisible
- Cohérence visuelle forte sur toutes les pages (fiche, liste, confirmation)

**Points faibles**
- Densité d'information très élevée sur les pages de résultats — sentiment de surcharge
- Nombreux bandeaux promotionnels et alertes ("Plus que 2 chambres !") qui relèvent du dark pattern et génèrent un stress artificiel
- Identité visuelle générique, peu émotionnelle — aucune évocation de l'expérience séjour
- Publicités et recommandations sponsorisées mélangées aux résultats organiques sans distinction claire

**Ce qu'on peut retenir pour Hôtel Clair de Lune** : la clarté du prix et la visibilité du CTA sont des standards à respecter. En revanche, éviter absolument les dark patterns (faux sentiment d'urgence, stock artificiel) qui nuisent à la confiance sur le long terme.

---

### UX / Parcours de réservation — 4/5

Le parcours de Booking est très optimisé pour la conversion. Il suit un entonnoir en 4 étapes principales : recherche → liste → fiche → confirmation.

**Étapes du parcours**
1. Page d'accueil : saisie destination + dates + voyageurs
2. Page liste : résultats filtrables, carte intégrée, tri par prix/note/distance
3. Fiche établissement : galerie, description, chambres disponibles avec prix, politique d'annulation
4. Sélection chambre → récapitulatif → création de compte ou connexion → paiement → confirmation

**Points forts**
- La disponibilité est vérifiée dès la recherche, pas à la dernière étape
- Le prix total (taxes comprises) est affiché tôt dans le parcours
- La politique d'annulation est clairement indiquée sur chaque offre
- Possibilité de réserver sans créer de compte (via email uniquement)
- Confirmation par email immédiate et bien structurée

**Points faibles**
- Trop d'options et de surcharges sur la fiche (activités, taxis, assurances…) qui distraient de l'objectif principal
- Upselling agressif à chaque étape (assurance annulation, breakfast payant ajouté par défaut)
- Le parcours est optimisé pour la plateforme, pas pour l'établissement — l'hôtel disparaît derrière Booking

**Ce qu'on peut retenir** : vérifier la disponibilité en amont, afficher le prix total tôt, permettre la réservation avec un minimum de friction avant la création de compte.

---

### Mobile / Responsive — 5/5

L'application Booking est l'une des références du secteur sur mobile.

**Points forts**
- Application native iOS/Android très performante, chargement rapide
- Version web mobile parfaitement adaptée : un seul champ de recherche en hero, résultats en cards scrollables
- Filtres accessibles via un bouton flottant, pas cachés dans un menu
- Cartes de résultats compactes mais lisibles, avec photo, note, prix et CTA visibles sans scroller
- Réservation complète réalisable en moins de 3 minutes sur mobile

**Points faibles**
- Notifications push très agressives sur l'application
- La carte interactive peut être lente à charger sur connexion faible

---

## 2. Airbnb

### UI / Identité visuelle — 5/5

Airbnb est la référence en matière de design émotionnel dans le secteur. L'identité repose sur le rouge corail (`#FF5A5F`), une typographie propriétaire (Cereal), et une direction artistique centrée sur la photo.

**Points forts**
- La photographie est au cœur du design : grande, plein écran, immersive
- Typographie propriétaire cohérente et douce, qui renforce l'image de marque
- Hiérarchie visuelle épurée — on voit d'abord la photo, puis le titre, puis le prix
- Micro-animations soignées (transitions, hover, loading states) qui donnent une sensation de qualité
- Design system très cohérent de la landing page jusqu'à la confirmation
- Palette sobre qui met en valeur les contenus des hôtes plutôt que l'interface

**Points faibles**
- Les nouvelles catégories de navigation ("Piscines", "Design", "Cabanes"…) peuvent désorienter les utilisateurs avec un objectif précis
- La recherche par dates est moins intuitive que sur Booking pour un usage "je sais où je veux aller"

**Ce qu'on peut retenir pour Hôtel Clair de Lune** : la photo grande et immersive comme premier élément visuel, une identité de marque émotionnelle cohérente. C'est le modèle le plus pertinent pour un hôtel rural qui vend une expérience.

---

### UX / Parcours de réservation — 4/5

**Étapes du parcours**
1. Page d'accueil : recherche destination + dates + voyageurs, ou navigation par catégories
2. Liste de résultats : cards photos, prix par nuit, note, carte interactive
3. Fiche logement : galerie immersive, description détaillée, équipements, avis, calendrier de disponibilité
4. Sélection dates → récapitulatif prix détaillé → connexion obligatoire → paiement → confirmation

**Points forts**
- La fiche logement est très complète et inspirante — l'utilisateur se projette facilement
- Le calendrier de disponibilité est intégré directement à la fiche, sans aller-retour
- Le récapitulatif des prix est très détaillé (nuit × nombre de nuits + frais de service + taxes)
- Les avis sont bien mis en valeur et influencent positivement la conversion

**Points faibles**
- La connexion est obligatoire avant de pouvoir finaliser — pas de réservation en tant qu'invité
- Les frais de service Airbnb (jusqu'à 14 %) ne sont visibles que tard dans le parcours, ce qui crée une mauvaise surprise
- Le système de demande de réservation (vs réservation instantanée) peut frustrer les utilisateurs pressés

**Ce qu'on peut retenir** : le calendrier de disponibilité intégré à la fiche est une bonne pratique. Afficher le prix total dès que possible pour éviter la surprise.

---

### Mobile / Responsive — 5/5

**Points forts**
- Application mobile considérée comme l'une des meilleures du secteur en UX
- Navigation par swipe sur les photos, très naturelle
- Carte et liste commutables d'un tap
- Processus de réservation fluide, peu d'étapes sur petit écran
- Design responsive web également très soigné

**Points faibles**
- Application lourde, peut être lente sur appareils anciens
- Certaines informations de la fiche logement nécessitent beaucoup de scroll sur mobile

---

## 3. Gîtes de France

### UI / Identité visuelle — 2/5

Gîtes de France affiche une identité verte (`#4A7C59`) historiquement reconnaissable, mais dont le design web accuse son âge et manque de modernité.

**Points forts**
- Label et logo immédiatement reconnaissables par les Français de plus de 40 ans
- Charte couleur cohérente avec le positionnement nature/rural
- Étoiles et épis (classement qualité) bien mis en avant

**Points faibles**
- Typographie et mise en page vieillissantes, peu aérées
- Photos souvent de mauvaise qualité ou en petit format — le contraire de ce qu'on attend pour de l'hôtellerie rurale
- Absence de design system cohérent : les pages varient fortement selon les régions (gestion décentralisée)
- Hiérarchie visuelle faible — prix, disponibilité et CTA se perdent dans la page
- Aucune émotion transmise : le design est fonctionnel au minimum, pas inspirant

**Ce qu'on peut retenir** : ce qu'il ne faut pas faire. Des photos de qualité professionnelle et une identité visuelle moderne sont des différenciateurs forts face à cet acteur.

---

### UX / Parcours de réservation — 2/5

**Étapes du parcours**
1. Recherche par région/département + dates (formulaire basique)
2. Liste de résultats : peu filtrables, affichage daté
3. Fiche logement : informations complètes mais mal organisées, photos en petit
4. Disponibilité : souvent renvoi vers un calendrier externe ou un formulaire de demande de contact
5. Réservation : souvent hors ligne (téléphone, email) ou via un module tiers peu intégré

**Points forts**
- Informations descriptives souvent très complètes (équipements, animaux acceptés, etc.)
- Système de classement en épis rassurant pour les profils moins technophiles

**Points faibles**
- Absence de réservation en ligne directe sur de nombreuses fiches — forte friction
- Vérification de disponibilité peu claire ou absente en ligne
- Aucun espace client pour consulter ou gérer ses réservations
- Parcours interrompu régulièrement par des redirections vers des sites tiers ou des formulaires par email
- Temps de chargement lents, interface non optimisée

**Ce qu'on peut retenir** : l'opportunité est immense ici. Un parcours de réservation entièrement en ligne, fluide et avec confirmation instantanée est un avantage massif face à Gîtes de France.

---

### Mobile / Responsive — 2/5

**Points forts**
- Le site s'adapte globalement aux petits écrans (responsive de base)

**Points faibles**
- Expérience mobile médiocre : textes trop petits, boutons peu accessibles au pouce
- Pas d'application mobile dédiée
- Formulaires de recherche peu ergonomiques sur tactile
- Galeries photos non optimisées pour le swipe
- Temps de chargement élevés sur mobile/connexion moyenne

---

## 4. Expedia / Hotels.com

### UI / Identité visuelle — 3/5

Expedia utilise un bleu marine (`#00355F`) et un jaune vif pour les CTA, Hotels.com un rouge (`#C60000`). Les deux interfaces sont fonctionnelles mais génériques.

**Points forts**
- Interface claire et structurée, sans surcharge excessive
- Prix bien mis en avant, comparaison facilitée
- Badges de promotion et économies visibles

**Points faibles**
- Identité visuelle très corporate, aucune chaleur ni évocation de l'expérience voyage
- Forte ressemblance avec Booking sans en avoir la finesse d'exécution
- Publicités et offres sponsorisées très présentes, qui brouillent la lecture
- La marque de l'hôtel est complètement effacée derrière la plateforme

**Ce qu'on peut retenir** : le niveau de base attendu en termes de lisibilité des prix et de structure. À éviter : l'effacement de la marque propre derrière l'interface.

---

### UX / Parcours de réservation — 3/5

**Étapes du parcours**
1. Recherche destination + dates + voyageurs (avec option "vol + hôtel" intégrée)
2. Liste de résultats filtrables, carte disponible
3. Fiche hôtel : photos, équipements, types de chambres avec prix
4. Sélection chambre → connexion ou invité → paiement → confirmation

**Points forts**
- Parcours standard bien rodé, sans surprise négative
- Option de réservation sans création de compte disponible
- Politique d'annulation affichée clairement sur chaque chambre
- Comparaison de chambres possible sur la fiche hôtel

**Points faibles**
- L'intégration "vol + hôtel" complexifie la navigation pour les utilisateurs qui ne veulent que l'hôtel
- Upselling (assurance, location de voiture) intrusif à chaque étape
- Expérience moins fluide que Booking ou Airbnb sur le même parcours
- La fiche hôtel est moins riche et moins inspirante qu'Airbnb

**Ce qu'on peut retenir** : la possibilité de réserver sans compte est une bonne pratique à adopter (ou a minima, de différer la création de compte après la saisie des infos de réservation).

---

### Mobile / Responsive — 3/5

**Points forts**
- Application disponible, interface responsive correcte
- Réservation réalisable entièrement sur mobile

**Points faibles**
- Application moins aboutie qu'Airbnb ou Booking, mises à jour moins fréquentes
- Navigation par onglets en bas d'écran parfois confuse
- Temps de chargement des fiches hôtels perfectibles sur mobile

---

## 5. Tableau de synthèse

| Concurrent | UI / Identité visuelle | UX / Parcours | Mobile / Responsive | Score moyen |
|---|:---:|:---:|:---:|:---:|
| Booking.com | 4/5 | 4/5 | 5/5 | **4,3/5** |
| Airbnb | 5/5 | 4/5 | 5/5 | **4,7/5** |
| Gîtes de France | 2/5 | 2/5 | 2/5 | **2,0/5** |
| Expedia / Hotels.com | 3/5 | 3/5 | 3/5 | **3,0/5** |
| **Hôtel Clair de Lune (cible)** | — | — | — | **≥ 4/5** |

---

## 6. Recommandations design pour Hôtel Clair de Lune

### UI / Identité visuelle
- S'inspirer d'**Airbnb** : photographie grande format, identité émotionnelle, typographie douce et cohérente
- Éviter la densité de **Booking** : chaque page doit avoir un objectif unique et une hiérarchie claire
- Palette de couleurs en lien avec la nature et le calme — éviter le bleu corporate générique des OTAs
- Prévoir un vrai design system dès le départ pour garantir la cohérence entre les pages (charte typographique, couleurs, composants réutilisables)

### UX / Parcours de réservation
- Permettre la consultation des disponibilités **sans connexion** — ne demander l'authentification qu'au moment de confirmer la réservation (redirect, pas de blocage précoce)
- Afficher le **prix total** (avec ou sans petit-déjeuner) dès la sélection des dates, pas en fin de parcours
- Limiter le parcours de réservation à **3 étapes maximum** : sélection → récapitulatif → confirmation
- Proposer un **récapitulatif clair** avant le paiement, avec tous les détails (suite, dates, options, prix total)
- Confirmation par email structurée et rassurante, avec lien vers l'espace client

### Mobile / Responsive
- Concevoir en **mobile-first** : la majorité des utilisateurs consultera sur smartphone (cf. Persona Thomas)
- Photos en **format portrait** ou carré optimisé pour le scroll mobile
- Boutons et zones cliquables d'au moins **44px de hauteur** (standard d'accessibilité tactile)
- Formulaire de réservation adapté au clavier mobile : champs de date avec un date-picker natif, pas de saisie libre
- Tester systématiquement sur connexion 4G moyenne — éviter les ressources trop lourdes non compressées

