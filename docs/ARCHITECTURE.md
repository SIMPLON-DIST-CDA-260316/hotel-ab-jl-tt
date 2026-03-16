# Architecture technique — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand
> **Créé le :** 2026-03-16
> **Dernière mise à jour :** 2026-03-16

## 1. Vue d'ensemble

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Serveur   │────▶│    Base de   │
│  (Navigateur)│◀────│     Web     │◀────│   données    │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Pattern architectural :** MVC (Model-View-Controller)

## 2. Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework MVC | _À définir (Symfony / Django)_ | _À justifier_ |
| Langage backend | _À définir (PHP / Python)_ | _À justifier_ |
| Base de données | _À définir (MySQL / PostgreSQL)_ | _À justifier_ |
| ORM | _À définir (Doctrine / Django ORM)_ | _À justifier_ |
| Moteur de templates | _À définir (Twig / Django Templates)_ | _À justifier_ |
| CSS / UI | _À définir (Bootstrap / Tailwind / custom)_ | _À justifier_ |
| Gestion des assets | _À définir (Webpack Encore / Vite / collectstatic)_ | _À justifier_ |
| Authentification | _À définir (Security / Django Auth)_ | _À justifier_ |

## 3. Modèle de données

### Entités principales

| Entité | Attributs clés | Relations |
|--------|---------------|-----------|
| **Etablissement** | nom, ville, adresse, description | 1 gérant, N suites |
| **Gerant** | nom, prénom, email, mot de passe | 1 établissement |
| **Suite** | titre, description, prix, image principale, galerie | 1 établissement, N réservations |
| **Client** | nom, prénom, email, mot de passe | N réservations |
| **Reservation** | date_debut, date_fin, statut, prix_total | 1 client, 1 suite |
| **Contact** | nom, email, sujet, message | 1 établissement |

### Diagrammes MERISE

- **MCD** : _À réaliser_
- **MLD** : _À réaliser_
- **MPD** : _À réaliser_

### Diagramme de cas d'utilisation (UML)

_À réaliser — doit illustrer les interactions entre les 4 rôles (administrateur, gérant, client, visiteur) et le système._

## 4. Architecture des routes

### Pages publiques (visiteur)

| Route | Description |
|-------|-------------|
| `GET /` | Page d'accueil |
| `GET /etablissements` | Liste des établissements |
| `GET /etablissements/{id}` | Détail d'un établissement et ses suites |
| `GET /suites/{id}` | Détail d'une suite (galerie, prix) |
| `GET /contact/{etablissement_id}` | Formulaire de contact |
| `POST /contact/{etablissement_id}` | Envoi du formulaire |

### Authentification

| Route | Description |
|-------|-------------|
| `GET /inscription` | Formulaire d'inscription client |
| `POST /inscription` | Création de compte |
| `GET /connexion` | Formulaire de connexion |
| `POST /connexion` | Authentification |
| `POST /deconnexion` | Déconnexion |

### Espace client

| Route | Description |
|-------|-------------|
| `GET /reservations` | Mes réservations |
| `POST /reservations` | Créer une réservation |
| `POST /reservations/{id}/annuler` | Annuler une réservation |

### Back-office administrateur

| Route | Description |
|-------|-------------|
| `GET /admin/etablissements` | Gestion des établissements |
| `GET /admin/etablissements/nouveau` | Formulaire de création |
| `POST /admin/etablissements` | Créer un établissement |
| `GET /admin/etablissements/{id}/modifier` | Formulaire de modification |
| `PUT /admin/etablissements/{id}` | Modifier un établissement |
| `DELETE /admin/etablissements/{id}` | Supprimer un établissement |
| `GET /admin/gerants` | Gestion des gérants |
| `GET /admin/gerants/nouveau` | Formulaire de création |
| `POST /admin/gerants` | Créer un gérant |
| `GET /admin/gerants/{id}/modifier` | Formulaire de modification |
| `PUT /admin/gerants/{id}` | Modifier un gérant |
| `DELETE /admin/gerants/{id}` | Supprimer un gérant |

### Back-office gérant

| Route | Description |
|-------|-------------|
| `GET /gerant/suites` | Gestion des suites |
| `GET /gerant/suites/nouvelle` | Formulaire de création |
| `POST /gerant/suites` | Créer une suite |
| `GET /gerant/suites/{id}/modifier` | Formulaire de modification |
| `PUT /gerant/suites/{id}` | Modifier une suite |
| `DELETE /gerant/suites/{id}` | Supprimer une suite |

## 5. Sécurité

| Aspect | Mesure |
|--------|--------|
| Mots de passe | Hashage (bcrypt / argon2) |
| Contrôle d'accès | Rôles : ADMIN, GERANT, CLIENT |
| Validation | Côté client + côté serveur |
| Protection CSRF | Token CSRF sur tous les formulaires |
| Upload d'images | Validation type MIME, taille max, renommage |
| SQL injection | ORM avec requêtes paramétrées |
| XSS | Échappement automatique via le moteur de templates |

## 6. Gestion des images

| Paramètre | Valeur |
|-----------|--------|
| Formats acceptés | _À définir (jpg, png, webp)_ |
| Taille max | _À définir_ |
| Stockage | _À définir (local / cloud)_ |
| Redimensionnement | _À définir_ |

## 7. Environnements

| Environnement | Usage |
|---------------|-------|
| **dev** | Développement local |
| **prod** | _À définir (déploiement)_ |

## 8. Décisions à prendre

- [ ] Choix du framework (Symfony vs Django)
- [ ] Choix de la base de données (MySQL vs PostgreSQL)
- [ ] Choix du framework CSS (Bootstrap vs Tailwind vs autre)
- [ ] Stratégie de stockage des images (local vs cloud)
- [ ] Stratégie de déploiement
- [ ] Réalisation des diagrammes MERISE (MCD, MLD, MPD)
- [ ] Réalisation du diagramme de cas d'utilisation UML
