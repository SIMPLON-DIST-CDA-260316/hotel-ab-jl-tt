# Données de seed — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand\
> **Créé le :** 2026-03-17\
> **Dernière mise à jour :** 2026-03-18

Données initiales à insérer en base pour le bon fonctionnement de l'application.

---

## 1. Aménités par défaut (~35)

### Niveau établissement (`scope: property` ou `both`)

| Catégorie | Aménités |
|---|---|
| **Stationnement** | Parking gratuit, Borne recharge VE |
| **Restauration** | Restaurant, Bar / salon, Petit-déjeuner disponible |
| **Bien-être** | Piscine extérieure, Piscine intérieure, Spa / jacuzzi, Sauna, Jardin |
| **Services** | Réception 24h, Bagagerie, Ménage quotidien |
| **Accessibilité** | Accès PMR, Ascenseur |
| **Animaux** | Animaux acceptés |
| **Technologie** | WiFi gratuit (parties communes) |

### Niveau suite (`scope: room` ou `both`)

| Catégorie | Aménités |
|---|---|
| **Salle de bain** | Douche, Baignoire, Sèche-cheveux, Articles de toilette, Peignoirs |
| **Technologie** | WiFi gratuit, TV écran plat, Prises USB |
| **Confort** | Climatisation, Chauffage, Insonorisation |
| **Boissons** | Minibar, Bouilloire, Machine Nespresso |
| **Mobilier** | Coffre-fort, Bureau, Penderie |
| **Extérieur** | Balcon, Terrasse privée |
| **Accessibilité** | Accessible fauteuil roulant, Salle de bain PMR |

---

## 2. Options par défaut (10)

| Option | `pricing_model` | Prix par défaut |
|---|---|---|
| Petit-déjeuner | `per_person_per_night` | 14 EUR |
| Demi-pension | `per_person_per_night` | 35 EUR |
| Lit supplémentaire | `per_night` | 20 EUR |
| Lit bébé | `per_night` | 0 EUR |
| Supplément animal | `per_night` | 10 EUR |
| Parking payant | `per_night` | 8 EUR |
| Accès spa | `per_person_per_stay` | 25 EUR |
| Panier pique-nique | `per_unit` | 18 EUR |
| Location vélos | `per_unit` | 15 EUR |
| Pack romantique | `per_stay` | 45 EUR |
