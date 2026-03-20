# User Stories — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand
> **Créé le :** 2026-03-16
> **Dernière mise à jour :** 2026-03-16

## Légende priorités

| Priorité | Signification |
|----------|---------------|
| 🔴 Haute | Indispensable (MVP) |
| 🟠 Moyenne | Important mais non bloquant |
| 🟢 Basse | Confort / amélioration |

---

## US1 — Gérer les établissements

**En tant qu'** administrateur,
**je veux** pouvoir créer, modifier et supprimer des établissements
**afin de** maintenir à jour la liste des hôtels du groupe.

**Priorité :** 🔴 Haute

**Description :**
L'administrateur est un employé du groupe Hôtel Clair de Lune chargé du maintien de l'application web. Chaque établissement comporte un nom, une ville, une adresse et une description.

**Critères d'acceptation :**
- [ ] L'administrateur peut créer un établissement avec : nom, ville, adresse, description
- [ ] L'administrateur peut modifier les informations d'un établissement existant
- [ ] L'administrateur peut supprimer un établissement
- [ ] Le nom de l'établissement est obligatoire
- [ ] La ville et l'adresse sont obligatoires
- [ ] Un message de confirmation s'affiche avant la suppression
- [ ] La suppression d'un établissement ayant des réservations futures est empêchée ou signalée

---

## US2 — Gérer les gérants

**En tant qu'** administrateur,
**je veux** pouvoir créer, modifier et supprimer les comptes des gérants
**afin de** leur permettre de gérer leurs établissements respectifs.

**Priorité :** 🔴 Haute

**Description :**
Un gérant est responsable de son propre établissement. Chaque gérant a un nom, un prénom, une adresse e-mail et un mot de passe sécurisé.

**Critères d'acceptation :**
- [ ] L'administrateur peut créer un gérant avec : nom, prénom, email, mot de passe
- [ ] L'administrateur peut modifier les informations d'un gérant
- [ ] L'administrateur peut supprimer un gérant
- [ ] L'adresse e-mail doit être unique et au format valide
- [ ] Le mot de passe doit respecter des critères de sécurité (min. 8 caractères, majuscule, chiffre, caractère spécial)
- [ ] Le mot de passe est stocké de manière sécurisée (hashé)
- [ ] Un gérant est associé à un seul établissement

---

## US3 — Gérer les suites

**En tant que** gérant,
**je veux** pouvoir créer, modifier et supprimer les suites de mon hôtel
**afin de** permettre leur réservation par les clients.

**Priorité :** 🔴 Haute

**Description :**
Chaque suite comprend un titre, une image principale, une description, un prix et une galerie d'images. Le prix d'une suite est fixe, quelle que soit la période de réservation.

**Critères d'acceptation :**
- [ ] Le gérant peut créer une suite avec : titre, description, prix, image principale, galerie d'images
- [ ] Le gérant peut modifier les informations d'une suite existante
- [ ] Le gérant peut supprimer une suite
- [ ] Le gérant ne peut gérer que les suites de son propre établissement
- [ ] Le titre et le prix sont obligatoires
- [ ] Le prix est un nombre positif
- [ ] L'image principale est obligatoire
- [ ] La galerie d'images accepte plusieurs fichiers (formats : jpg, png, webp)
- [ ] La suppression d'une suite ayant des réservations futures est empêchée ou signalée

---

## US4 — Consulter les établissements et les suites

**En tant que** visiteur (non connecté),
**je veux** pouvoir consulter les établissements et les suites disponibles
**afin de** choisir une chambre à réserver.

**Priorité :** 🔴 Haute

**Description :**
Tout visiteur du site peut accéder à une page listant les établissements du groupe Hôtel Clair de Lune. Chaque établissement possède une page dédiée où sont listées les suites avec leurs informations détaillées.

**Critères d'acceptation :**
- [ ] Une page liste tous les établissements avec leur nom, ville et description
- [ ] Chaque établissement a une page dédiée affichant ses suites
- [ ] Chaque suite affiche : titre, image principale, description, prix par nuit
- [ ] Le visiteur peut cliquer sur une suite pour voir le détail et la galerie d'images
- [ ] La page est accessible sans authentification
- [ ] L'affichage est responsive (mobile et desktop)

---

## US5 — Réserver une suite

**En tant que** client,
**je veux** pouvoir réserver une suite en ligne en sélectionnant l'établissement, la suite et les dates de séjour
**afin de** planifier mon séjour.

**Priorité :** 🔴 Haute

**Description :**
La page de réservation permet de sélectionner un établissement, une suite, une date de début et une date de fin de séjour. Le client peut vérifier la disponibilité. Pour finaliser, il doit créer un compte ou se connecter.

**Critères d'acceptation :**
- [ ] Le client peut sélectionner un établissement et une suite
- [ ] Le client peut choisir une date de début et une date de fin de séjour
- [ ] La date de fin doit être postérieure à la date de début
- [ ] Les dates passées ne sont pas sélectionnables
- [ ] Le système vérifie la disponibilité de la suite sur les dates choisies
- [ ] Un message clair indique si la suite est disponible ou non
- [ ] Si disponible, le prix total du séjour est affiché (nb nuits × prix/nuit)
- [ ] Pour finaliser, le client doit être connecté ou créer un compte (nom, prénom, email, mot de passe sécurisé)
- [ ] Après confirmation, la réservation est enregistrée et un récapitulatif est affiché
- [ ] Une suite ne peut pas être réservée deux fois sur des dates qui se chevauchent

---

## US6 — Voir et annuler ses réservations

**En tant que** client connecté,
**je veux** pouvoir consulter mes réservations et annuler celles qui respectent les conditions d'annulation
**afin de** gérer mes séjours.

**Priorité :** 🟠 Moyenne

**Description :**
Un client connecté peut consulter ses réservations en cours ou passées et annuler une réservation à condition que l'annulation soit faite au moins 3 jours avant la date du séjour.

**Critères d'acceptation :**
- [ ] Le client connecté peut voir la liste de ses réservations (en cours et passées)
- [ ] Chaque réservation affiche : établissement, suite, dates, prix total, statut
- [ ] Le client peut annuler une réservation si la date de début est dans plus de 3 jours
- [ ] Le bouton d'annulation est masqué ou désactivé si le délai de 3 jours n'est pas respecté
- [ ] Un message de confirmation est demandé avant annulation
- [ ] Après annulation, le statut de la réservation passe à "annulée"
- [ ] La suite redevient disponible pour les dates concernées

---

## US7 — Contacter un établissement

**En tant que** visiteur,
**je veux** pouvoir contacter un établissement via un formulaire
**afin de** poser une question ou commander un service supplémentaire.

**Priorité :** 🟠 Moyenne

**Description :**
Un formulaire de contact permet aux visiteurs ou clients de poser des questions ou demander des services supplémentaires. Les messages sont envoyés à l'administrateur.

**Critères d'acceptation :**
- [ ] Un formulaire de contact est accessible depuis la page d'un établissement
- [ ] Le formulaire comporte : nom, email, sujet (liste déroulante), message
- [ ] Les sujets disponibles sont :
  - "Je souhaite poser une réclamation"
  - "Je souhaite commander un service supplémentaire"
  - "Je souhaite en savoir plus sur une suite"
  - "J'ai un souci avec cette application"
- [ ] Tous les champs sont obligatoires
- [ ] L'email est validé côté client et serveur
- [ ] Le message est envoyé à l'administrateur (email ou stocké en base)
- [ ] Un message de confirmation s'affiche après envoi
- [ ] Le formulaire est accessible sans authentification
