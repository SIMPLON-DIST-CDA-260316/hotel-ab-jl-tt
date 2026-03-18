# Redécoupage des User Stories en Epics + sub-issues

> **Date :** 2026-03-18
> **Participants :** Julien Lemarchand
> **Contexte :** Analyse des US fournies dans le cahier des charges avant le démarrage du développement

---

## Ce qu'on a reçu

Le cahier des charges fournit 7 User Stories (US1 à US7) qui couvrent l'ensemble des fonctionnalités attendues : gestion des établissements, gérants, suites, consultation publique, réservation, gestion des réservations et formulaire de contact.

Ces US sont bien formulées (persona, besoin, finalité) et couvrent le périmètre fonctionnel demandé.

## Ce qu'on a observé

En confrontant ces US à notre stack (Next.js App Router, Drizzle ORM), notre architecture (feature-based) et nos contraintes (deadline de 10 jours ouvrés, équipe de 3), plusieurs problèmes sont apparus :

### Les US sont trop larges pour être des unités de travail

Chaque US regroupe plusieurs parcours utilisateur distincts. Par exemple, US1 "Gérer les établissements" contient : créer, modifier, supprimer, protéger contre la suppression si réservations futures. Ce sont des développements de complexité très différente, touchant des fichiers différents, et qui ne tiennent pas dans une seule branche atomique.

Le cahier des charges demande par ailleurs *"une branche par fonctionnalité"* et des *"commits atomiques"*. Avec des US aussi larges, une branche couvrirait un CRUD complet — trop gros pour une revue de code efficace.

### L'authentification est un prérequis invisible

US5 (réserver) et US6 (voir ses réservations) exigent que le client soit connecté. US2 (gérer les gérants) et US3 (gérer les suites) impliquent des rôles (admin, gérant). Mais aucune US ne couvre l'inscription, la connexion ou la gestion des rôles. C'est pourtant une feature complète dans notre codebase (`features/auth/`) et un prérequis technique pour la majorité des US.

### Le découpage ne reflète pas l'ordre de développement naturel

Tel quel, US1 (gérer les établissements, admin) est en première position et priorité haute. Mais en pratique, on ne peut pas tester la gestion admin sans d'abord avoir la consultation publique (US4) et l'authentification. L'ordre de développement logique serait : Auth → US4 (consultation) → US1/US2/US3 (admin/gérant) → US5/US6 (réservation) → US7 (contact).

### La priorité n'est pas discriminante

5 US sur 7 sont en priorité haute ("Must have"). Quand presque tout est prioritaire, la priorisation ne sert plus à orienter les choix en cas de retard ou de blocage.

## Ce qu'on a décidé

### Transformer les US existantes en Epics

Les 7 US du cahier des charges deviennent des **Epics** (issues parentes). Leur contenu (description, critères d'acceptation) reste intact — ce sont les objectifs fonctionnels de référence, tels que définis par le cahier des charges.

### Découper chaque Epic en sub-issues

Chaque Epic est découpé en **user stories fines** (sub-issues GitHub), dimensionnées pour :
- Être réalisables en 1-2 jours par un développeur
- Correspondre à une branche Git et une PR
- Traverser le board (Backlog → Sprint → In Progress → Done)

### Ajouter un Epic "Authentification"

Un Epic dédié à l'authentification est créé pour couvrir le prérequis manquant : inscription, connexion/déconnexion, gestion des rôles.

### Découpage prévu

**Epic : Authentification** (ajouté)
- S'inscrire en tant que client
- Se connecter / se déconnecter

**Epic : Consulter les établissements et les suites** (US4 — socle visible, à développer en premier)
- Voir la liste des établissements
- Voir le détail d'un établissement et ses suites
- Voir le détail d'une suite avec galerie

**Epic : Gérer les établissements** (US1)
- Créer un établissement
- Modifier un établissement
- Supprimer un établissement (avec protection réservations)

**Epic : Gérer les gérants** (US2)
- Créer un compte gérant et l'assigner à un établissement
- Modifier / désactiver un gérant

**Epic : Gérer les suites** (US3)
- Créer une suite avec images
- Modifier une suite
- Supprimer une suite (avec protection réservations)

**Epic : Réserver une suite** (US5)
- Vérifier la disponibilité d'une suite
- Créer une réservation

**Epic : Voir et annuler ses réservations** (US6)
- Consulter mes réservations
- Annuler une réservation (règle des 3 jours)

**Epic : Contacter un établissement** (US7)
- Envoyer un message via le formulaire de contact (US déjà bien dimensionnée)

## Pourquoi ce choix

- **Traçabilité** : les Epics conservent le lien avec le cahier des charges, les sub-issues reflètent le travail réel
- **Board lisible** : les sub-issues traversent le Kanban, les Epics restent en référence avec une barre de progression
- **Branches atomiques** : chaque sub-issue = une branche = une PR, conforme à la demande du cahier des charges
- **Priorisation effective** : on peut séquencer les sub-issues indépendamment et adapter en cas de retard
- **Aligné avec l'architecture** : chaque sub-issue correspond à un ensemble cohérent de fichiers dans une feature

## Ce qu'on ne change pas

- Le périmètre fonctionnel reste identique à celui du cahier des charges
- Les critères d'acceptation des US originales sont conservés intégralement
- La numérotation d'origine (US1-US7) est préservée dans les titres des Epics pour la traçabilité
