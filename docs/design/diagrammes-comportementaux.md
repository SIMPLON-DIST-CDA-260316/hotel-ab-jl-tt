# Diagrammes comportementaux — Hôtel Clair de Lune

> **Auteur :** Julien Lemarchand\
> **Créé le :** 2026-03-17\
> **Dernière mise à jour :** 2026-03-23

Diagrammes UML dynamiques complémentaires au [modèle de données MERISE](./merise.md).

---

## 1. Cycle de vie d'une réservation (State Diagram)

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

## 2. Cycle de vie d'une demande de renseignement (State Diagram)

```mermaid
stateDiagram-v2
    direction LR

    [*] --> unread : Visiteur ou client envoie le formulaire

    unread --> read : Gérant ou admin consulte le message
    read --> replied : Gérant ou admin répond

    replied --> [*]
```

---

## 3. Flux de réservation (Flowchart)

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
