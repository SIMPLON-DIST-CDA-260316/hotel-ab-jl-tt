# Cahier des charges

## Contexte du projet

L'Hôtel Clair de Lune est une chaîne d'hôtels ruraux, située dans des régions calmes et naturelles en France. L'établissement souhaite développer une application web pour permettre à ses clients de réserver directement leurs chambres, sans passer par des plateformes tierces. L'application doit aussi permettre une gestion efficace des établissements, des suites, et des réservations.

## Modalités pédagogiques

- Activité à réaliser en groupe de 3
- **Deadline :** 10 jours ouvrés

## User Stories

### US1 : Gérer les établissements

**En tant qu'** administrateur, je veux pouvoir gérer les établissements (créer, modifier, supprimer) pour maintenir à jour la liste des hôtels.

**Description :** L'administrateur est un employé du groupe Hôtel Clair de Lune chargé du maintien de l'application web. Chaque établissement comporte un nom, une ville, une adresse, et une description.

### US2 : Gérer les gérants

**En tant qu'** administrateur, je veux pouvoir gérer les gérants des hôtels (créer, modifier, supprimer) afin de leur permettre de gérer leurs établissements.

**Description :** Un gérant est responsable de son propre établissement. Chaque gérant a un nom, un prénom, une adresse e-mail et un mot de passe sécurisé.

### US3 : Gérer les suites

**En tant que** gérant, je veux pouvoir gérer les suites de mon hôtel (créer, modifier, supprimer) pour permettre leur réservation par les clients.

**Description :** Chaque suite comprend un titre, une image principale, une description, un prix et une galerie d'images. Le prix d'une suite est fixe, quelle que soit la période de réservation.

### US4 : Consulter les établissements et les suites

**En tant que** client, je veux pouvoir consulter les établissements et les suites disponibles afin de réserver une chambre.

**Description :** Tout visiteur du site peut accéder à une page listant les établissements du groupe Hôtel Clair de Lune. Chaque établissement possède une page dédiée où sont listées les suites avec leurs informations détaillées.

### US5 : Réserver une suite

**En tant que** client, je veux pouvoir réserver une suite en ligne en sélectionnant l'établissement, la suite et les dates de séjour.

**Description :** La page de réservation permet aux clients de sélectionner un établissement, une suite, une date de début et une date de fin de séjour. Le client peut savoir si la suite est disponible ou non pour les dates sélectionnées. Si le client souhaite finaliser la réservation, il doit créer un compte ou se connecter avec un nom, un prénom, une adresse e-mail et un mot de passe sécurisé.

### US6 : Voir et annuler ses réservations

**En tant que** client, je veux pouvoir consulter mes réservations et annuler celles qui respectent les conditions d'annulation.

**Description :** Une fois connecté, un client peut consulter ses réservations en cours ou passées. Il peut également annuler une réservation, à condition que l'annulation soit faite au moins 3 jours avant la date du séjour.

### US7 : Contacter un établissement

**En tant que** visiteur, je veux pouvoir contacter un établissement pour poser une question ou commander un service supplémentaire.

**Description :** Un formulaire de contact est disponible pour permettre aux visiteurs ou clients de poser des questions ou demander des services supplémentaires. Les sujets disponibles incluent :
- "Je souhaite poser une réclamation"
- "Je souhaite commander un service supplémentaire"
- "Je souhaite en savoir plus sur une suite"
- "J'ai un souci avec cette application"

Les messages sont directement envoyés à l'administrateur.

## Étapes

### I. Gestion de projet

- **Critères d'acceptation :** Chaque User Story doit être accompagnée de critères d'acceptation clairs définissant ce que la fonctionnalité doit accomplir.
- **Priorisation :** Classez les User Stories selon leur importance (haute, moyenne, basse).
- **GitHub Projects :** Utilisez GitHub Projects pour organiser les User Stories et les tâches. Créez des colonnes comme "To Do", "In Progress", "Done" pour suivre l'avancement.

### II. Charte graphique

- **Palette de couleurs :** Incluez les couleurs principales à utiliser dans l'application.
- **Polices d'écriture :** Définissez les polices utilisées pour l'interface.
- **Wireframes :** Créez et exportez les wireframes de la fonctionnalité "Consulter les établissements et les suites" en version mobile et desktop.

### III. Développement

- **Installation du framework :** Choisissez et installez un framework MVC comme Symfony ou Django pour structurer le projet.
- **Diagramme de cas d'utilisation :** Réalisez un diagramme UML Use Case pour identifier les interactions principales entre les utilisateurs (administrateurs, gérants, clients, visiteurs) et l'application. Ce diagramme doit illustrer les fonctionnalités accessibles à chaque type d'utilisateur et leurs interactions avec le système.
- **Base de données :** Définissez la structure de la base de données grâce à la méthode MERISE (MCD, MLD, MPD).
- **Développement des fonctionnalités :** Implémentez les fonctionnalités selon les User Stories et critères d'acceptation.

### IV. Documentation

- **README :** Rédigez un fichier README.md avec les instructions pour déployer l'application localement ainsi que les informations pour créer un compte administrateur.
- **Documentation technique :** Créez un document .pdf regroupant vos réflexions sur les technologies choisies, les diagrammes (MERISE, diagramme de cas d'utilisation).

## Modalités d'évaluation

Présentation individuelle de l'application web et démonstration des fonctionnalités devant le formateur.

## Livrables

- Le lien du dépôt Github public contenant le code de l'application
- Le lien vers votre board Github Project
- Le fichier README.md pour l'installation en local
- Une documentation technique en .pdf comprenant le diagramme de cas d'utilisation et vos schémas MERISE
- Une charte graphique en .pdf avec la palette de couleurs, les polices d'écriture, et les wireframes

## Critères de performance

- Qualité et fiabilité de l'application
- Respect des fonctionnalités décrites dans les User Stories
- Facilité d'utilisation de l'application
- Respect des bonnes pratiques de développement
- Cohérence visuelle avec la charte graphique
- Projet versionné régulièrement et de manière atomique (plusieurs "commit" par jour pendant toute la durée du projet)
- Une branche par fonctionnalité
