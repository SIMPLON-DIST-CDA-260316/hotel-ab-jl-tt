# Architecture en couches vs feature-based : où sont passés les Repository et les Service ?

> **Auteur :** Julien Lemarchand — 2026-03-17
>
> Ce document analyse comment les responsabilités d'une architecture en couches classique (Model → Repository → Service → Controller) se redistribuent dans une architecture feature-based avec Next.js App Router et Drizzle ORM. Il s'appuie sur le codebase de l'hôtel Clair de Lune comme cas concret.

---

## Le point de départ : l'architecture en couches

Dans un framework MVC classique (Symfony, Spring, Django), on organise le code en **couches horizontales**. Chaque couche a une responsabilité unique et ne communique qu'avec la couche directement en dessous :

```
Controller       reçoit la requête HTTP, délègue au service
    ↓
  Service        logique métier, orchestration, validation
    ↓
  Repository     accès aux données (CRUD), abstrait l'ORM
    ↓
    Model        définition de l'entité (colonnes, relations)
```

Concrètement, ça donne une arborescence par rôle technique :

```
controllers/
  ReservationController.ts
  EstablishmentController.ts
services/
  ReservationService.ts
  EstablishmentService.ts
repositories/
  ReservationRepository.ts
  EstablishmentRepository.ts
models/
  Reservation.ts
  Establishment.ts
```

Ce modèle a fait ses preuves. Mais il a une conséquence : **une feature est dispersée dans 4 dossiers**. Pour comprendre comment fonctionnent les réservations, il faut ouvrir 4 fichiers dans 4 endroits différents.

---

## L'alternative : l'architecture feature-based

L'idée est simple : au lieu d'organiser par rôle technique (tous les controllers ensemble, tous les services ensemble), on organise **par domaine métier** (tout ce qui concerne les réservations ensemble) :

```
src/features/reservations/
  components/     UI du domaine
  queries/        lecture de données + règles métier de lecture
  actions/        mutations + règles métier d'écriture
  lib/            logique métier pure (fonctions extraites)
  types/          types spécifiques
```

C'est une organisation **verticale** : chaque feature est une tranche autonome du métier.

---

## La question clé : où sont passées les responsabilités ?

Le passage d'une archi à l'autre ne supprime pas les responsabilités — il les **redistribue**. Voici comment.

### 1. Le Model → `src/lib/db/schema.ts`

Le schéma Drizzle centralise la définition de toutes les tables dans la couche **shared**. C'est logique : une table comme `user` est consommée par plusieurs features (auth, reservations, reviews…), donc elle ne peut pas vivre dans une seule feature.

```ts
// src/lib/db/schema.ts — c'est notre "Model"
export const booking = pgTable("booking", {
  id: text("id").primaryKey(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  // ...
});
```

### 2. Le Repository → il disparaît (et c'est normal)

Dans l'archi en couches, le repository sert à **abstraire l'ORM** pour que le service ne dépende pas d'une technologie spécifique. L'idée est de pouvoir changer d'ORM sans toucher à la logique métier.

Dans notre contexte, cette abstraction n'apporte rien :

- **Drizzle est déjà un query builder typé**, proche du SQL. Mettre un repository par-dessus, c'est emballer un wrapper dans un wrapper.
- **Notre schéma est fortement couplé à Drizzle** (enums PostgreSQL, check constraints, relations Drizzle). On ne va pas en changer — et c'est un choix assumé.
- **Le typage de bout en bout serait cassé.** Drizzle infère les types de retour des queries. Un repository générique perdrait cette information.

L'accès aux données se fait directement dans les `queries/` et `actions/`, là où il est consommé.

### 3. Le Service → distribué dans `queries/`, `actions/` et `lib/`

C'est le point le plus intéressant. Le "service" classique est un fichier fourre-tout qui contient toute la logique métier d'un domaine. Ici, cette logique est **éclatée par nature d'opération** :

#### Les `queries/` portent les règles métier de lecture

Une query n'est pas un simple `SELECT *`. Elle encode des règles :

```ts
// features/reservations/queries/get-available-suites.ts
export async function getAvailableSuites(checkIn: Date, checkOut: Date, guests: number) {
  return db.select()
    .from(suite)
    .where(and(
      isNull(suite.deletedAt),           // règle : on exclut les soft-deleted
      gte(suite.capacity, guests),        // règle : capacité suffisante
      notExists(/* chevauchement */)      // règle : pas de réservation existante
    ));
}
```

Dans une archi en couches, cette logique serait dans `SuiteService.getAvailable()` qui appellerait `SuiteRepository.findBy(...)`. Ici, la query fait les deux d'un coup — et le code est plus court, plus lisible, et entièrement typé.

#### Les `actions/` portent les règles métier d'écriture

Une Server Action est l'équivalent direct d'une méthode de service. C'est le point d'entrée pour toute mutation :

```ts
// features/reservations/actions/create-reservation.ts
"use server"

export async function createReservation(formData: FormData) {
  // 1. Validation des entrées (zod)
  // 2. Vérification de l'authentification
  // 3. Règles métier (la suite est-elle disponible ? calcul du prix)
  // 4. Transaction DB (insert booking + options)
  // 5. Revalidation du cache Next.js
}
```

On retrouve exactement les mêmes étapes qu'un `ReservationService.create()` — mais sans la cérémonie d'une classe à instancier et d'un repository à injecter.

#### Le `lib/` accueille la logique métier pure extraite

Quand une règle métier est complexe ou réutilisée par plusieurs queries/actions **de la même feature**, on l'extrait dans `lib/` :

```ts
// features/reservations/lib/compute-total-price.ts
// Fonction pure : pas de Drizzle, pas de React, pas d'effets de bord
export function computeTotalPrice(
  pricePerNight: number,
  nights: number,
  options: { unitPrice: number; quantity: number }[]
): number {
  const basePrice = pricePerNight * nights;
  const optionsTotal = options.reduce((sum, o) => sum + o.unitPrice * o.quantity, 0);
  return basePrice + optionsTotal;
}
```

Ce type de fonction est **testable unitairement** sans base de données, exactement comme le serait une méthode dans un service classique.

### 4. Le Controller → Server Components + Server Actions

Next.js App Router élimine le concept de controller au sens classique :

- **Lecture** : le Server Component est le "controller GET". Il appelle les queries et passe les données aux composants.
- **Écriture** : la Server Action est le "controller POST". Elle reçoit le formulaire et exécute la mutation.

```ts
// app/reservations/page.tsx — c'est notre "controller" de lecture
import { getReservations } from "@/features/reservations/queries/get-reservations";
import { ReservationList } from "@/features/reservations/components/ReservationList";

export default async function ReservationsPage() {
  const reservations = await getReservations();  // appel direct, pas de service intermédiaire
  return <ReservationList reservations={reservations} />;
}
```

---

## Tableau récapitulatif

| Responsabilité | Archi en couches | Feature-based (Next.js + Drizzle) |
|---|---|---|
| **Définition des tables** | `models/` | `src/lib/db/schema.ts` (shared) |
| **Accès aux données** | `repositories/` | Drizzle directement dans `queries/` et `actions/` |
| **Règles métier de lecture** | `services/` | `features/xxx/queries/` |
| **Règles métier d'écriture** | `services/` | `features/xxx/actions/` |
| **Logique métier pure** | `services/` | `features/xxx/lib/` |
| **Point d'entrée lecture** | `controllers/` (GET) | Server Components dans `app/` |
| **Point d'entrée écriture** | `controllers/` (POST) | Server Actions dans `features/xxx/actions/` |

---

## Quand extraire dans `lib/` ?

Tout ne mérite pas d'être extrait. Voici la règle :

- **Réutilisé** par plusieurs queries ou actions de la même feature → extraire dans `lib/`
- **Complexe** et mérite ses propres tests unitaires → extraire dans `lib/`
- **Simple et utilisé une seule fois** → laisser inline dans la query ou l'action

---

## Le flux de dépendance

```
src/lib/db/ (shared)          ← schéma + connexion, importable par tous
      ↑
src/features/xxx/             ← queries, actions, lib, components
      ↑                         importe uniquement depuis shared
app/xxx/                      ← pages Next.js
                                importe depuis shared ET features
```

Règle stricte : **une feature n'importe jamais depuis une autre feature**. Si une query doit joindre des tables de plusieurs domaines (ex: suites + bookings pour vérifier la disponibilité), elle vit dans la feature **consommatrice** et importe le schéma depuis la couche shared.

---

## Ce que ça change au quotidien

### Pour naviguer dans le code

Au lieu de se demander "où est le service des réservations ?", on ouvre `features/reservations/` et tout est là : les composants, les requêtes, les mutations, la logique métier, les types.

### Pour ajouter une fonctionnalité

Au lieu de créer/modifier 4 fichiers dans 4 dossiers (model, repository, service, controller), on travaille dans un seul dossier feature. Les changements sont colocalisés.

### Pour tester

- **Logique métier pure** (`lib/`) : tests unitaires classiques, sans DB
- **Queries et actions** : tests d'intégration avec une vraie base de test — plus fiables que des mocks de repository
- **Composants** : tests de rendu qui peuvent utiliser les vrais types Drizzle

### Pour comprendre le périmètre d'un changement

Dans une archi en couches, renommer un champ touche model + repository + service + controller. Dans une archi feature-based, le blast radius est visible d'un coup d'oeil : c'est le contenu du dossier feature + le schéma shared.

---

## En résumé

L'architecture en couches et l'architecture feature-based répondent aux mêmes besoins de séparation des responsabilités. La différence est l'axe d'organisation :

- **En couches** : on découpe par **rôle technique** (accès données, logique métier, présentation)
- **Feature-based** : on découpe par **domaine métier** (réservations, suites, établissements)

Les responsabilités ne disparaissent pas — elles se redistribuent. Le model reste centralisé, le repository est absorbé par l'ORM, le service est éclaté en queries/actions/lib, et le controller est remplacé par les mécanismes natifs de Next.js.

Ni l'une ni l'autre n'est "meilleure" dans l'absolu. L'archi en couches est parfaitement adaptée aux frameworks MVC classiques où chaque couche a un rôle bien distinct. L'archi feature-based est mieux adaptée aux frameworks modernes comme Next.js App Router, où la frontière entre serveur et client est poreuse et où la colocation est un avantage.
