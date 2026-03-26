# UML — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand\
> **Créé le :** 2026-03-17\
> **Dernière mise à jour :** 2026-03-18

Diagrammes UML complémentaires au [dossier MERISE](./merise.md).

---

## 1. Modèle de domaine (Class Diagram)

> Vue orientée objet du domaine métier. Ce diagramme montre les entités
> avec leurs attributs clés, les relations typées (composition, agrégation,
> association) et les multiplicités.

```mermaid
classDiagram
    direction LR
    %% ─── Entités du domaine ───

    class User {
        <<entity>>
        +text id
        +text name
        +text email
        +Role role
        +timestamp deleted_at
    }

    class Establishment {
        <<entity>>
        +text id
        +text name
        +text address
        +text postal_code
        +text city
        +text description
        +text image
        +text phone
        +text email
        +time check_in_time
        +time check_out_time
        +timestamp deleted_at
    }

    class Suite {
        <<entity>>
        +text id
        +text title
        +text description
        +decimal price
        +text main_image
        +int capacity
        +decimal area
        +timestamp deleted_at
        +isAvailable(checkIn, checkOut) bool
    }

    class Image {
        <<entity>>
        +text id
        +text url
        +text alt
        +int position
    }

    class Amenity {
        <<entity>>
        +text id
        +text name
        +text slug
        +text category
        +AmenityScope scope
        +text icon
    }

    class Option {
        <<entity>>
        +text id
        +text name
        +text slug
        +text description
        +PricingModel pricing_model
        +decimal default_price
    }

    class EstablishmentOption {
        <<value object>>
        +decimal price
        +boolean included
    }

    class Booking {
        <<entity>>
        +text id
        +text reference
        +date check_in
        +date check_out
        +int guest_count
        +decimal price_per_night
        +decimal total_price
        +BookingStatus status
        +cancel()
        +complete()
    }

    class BookingOption {
        <<value object>>
        +int quantity
        +decimal unit_price
    }

    class Review {
        <<entity>>
        +text id
        +int rating
        +text comment
        +boolean flagged
    }

    class Inquiry {
        <<entity>>
        +text id
        +text name
        +text email
        +InquirySubject subject
        +text message
        +InquiryStatus status
    }

    note for Inquiry "Message one-shot via formulaire.\nRéponse par email (Resend).\nPas de thread conversationnel."

    %% ─── Enums ───

    class Role {
        <<enumeration>>
        admin
        manager
        client
    }

    class AmenityScope {
        <<enumeration>>
        property
        room
        both
    }

    class PricingModel {
        <<enumeration>>
        per_person_per_night
        per_night
        per_person_per_stay
        per_stay
        per_unit
    }

    class BookingStatus {
        <<enumeration>>
        pending
        confirmed
        cancelled
        completed
    }

    class InquirySubject {
        <<enumeration>>
        complaint
        extra_service
        suite_info
        app_issue
    }

    class InquiryStatus {
        <<enumeration>>
        unread
        read
        replied
    }

    %% ─── Relations ───

    User "1" --> "1..*" Establishment : manages
    User "1" --> "0..*" Booking : books
    User "0..1" --> "0..*" Inquiry : sends

    Establishment "1" *-- "0..*" Suite : offers
    Establishment "1" o-- "0..*" Inquiry : receives
    Establishment "0..*" -- "0..*" Amenity : has amenities
    Establishment "0..*" -- "0..*" Option : provides options
    Establishment .. EstablishmentOption : configures

    Suite "1" *-- "0..*" Image : illustrated by
    Suite "0..*" -- "0..*" Amenity : has extra amenities
    Suite "1" --> "0..*" Booking : concerns

    Booking "1" --> "0..1" Review : evaluated by
    Booking "0..*" -- "0..*" Option : selects options
    Booking .. BookingOption : details

    User --> Role
    Amenity --> AmenityScope
    Option --> PricingModel
    Booking --> BookingStatus
    Inquiry --> InquirySubject
    Inquiry --> InquiryStatus
```

---

## 2. Cycle de vie d'une réservation (State Diagram)

> Ce diagramme d'état modélise les transitions possibles du statut
> d'une réservation (`booking.status`), avec les conditions de garde.

```mermaid
stateDiagram-v2
    direction LR

    [*] --> pending : Client soumet la réservation\n(dates valides, suite disponible,\noptions sélectionnées)

    pending --> confirmed : Paiement réussi (mocké)
    pending --> cancelled : Abandon / timeout

    confirmed --> cancelled : Client annule\n[check_in > J+3]
    confirmed --> completed : check_out atteint\n(batch ou cron)

    cancelled --> [*]

    completed --> completed : Review ajoutée\n[0 ou 1 review par booking]
    completed --> [*]

    note right of pending
        Suite bloquée pour ces dates.
        Snapshot prix effectué.
        Options snapshot dans booking_option.
    end note

    note right of confirmed
        Paiement validé.
        Email de confirmation envoyé.
    end note

    note right of cancelled
        Suite redevient disponible.
        cancelled_at renseigné.
    end note

    note left of completed
        Le client peut laisser un avis.
        Email de feedback envoyé via Resend.
    end note
```

---

## 3. Cycle de vie d'une demande de renseignement (State Diagram)

```mermaid
stateDiagram-v2
    direction LR

    [*] --> unread : Visiteur ou client envoie le formulaire

    unread --> read : Gérant ou admin consulte le message
    read --> replied : Gérant ou admin répond

    replied --> [*]
```

---

## 4. Flux de réservation (Flowchart)

> Processus complet de création d'une réservation, du point de vue utilisateur
> et des contrôles métier côté serveur. Inclut la sélection d'options.

```mermaid
flowchart TD
    A([Client connecté<br/>visite une suite]) --> B{Suite disponible<br/>aux dates souhaitées ?}

    B -->|Non| C[Suite indisponible]
    C --> A

    B -->|Oui| D[Afficher formulaire<br/>de réservation]
    D --> E[Client saisit :<br/>dates, nb personnes,<br/>options souhaitées]
    E --> F{Validation serveur}

    F -->|check_out <= check_in| G[Erreur : dates invalides]
    G --> D

    F -->|guest_count > capacity| H[Erreur : capacité dépassée]
    H --> D

    F -->|Chevauchement dates| I[Erreur : suite plus disponible]
    I --> D

    F -->|Valide| J[Créer le booking]
    J --> K[Générer la référence<br/>CDL-2026-XXXX]
    K --> L[Snapshot price_per_night<br/>Calcul subtotal]
    L --> L2[Créer booking_options<br/>Snapshot unit_price<br/>Calcul options_total]
    L2 --> L3[total_price = subtotal + options_total]
    L3 --> M[status = pending]
    M --> P[Écran de paiement<br/>mock]
    P -->|Paiement réussi| Q[status = confirmed]
    P -->|Abandon| R[status = cancelled]
    Q --> Q2[Envoi email de confirmation<br/>via Resend]
    Q2 --> N([Redirection : Mes réservations])
    R --> N
```
