# CLAUDE.md

Voir @README.md pour la stack, les commandes et le démarrage.

## Contexte produit

Application de gestion pour l'hôtel **Clair de Lune**. Quatre rôles : visiteur, client, gérant, administrateur.

Routes prévues (voir `docs/ARCHITECTURE.md`) :
- Publiques : `/`, `/establishments`, `/establishments/[id]`, `/suites/[id]`, `/inquiries/[id]`
- Auth : `/sign-up`, `/sign-in`
- Client : `/bookings`
- Admin : `/admin/establishments`, `/admin/managers`
- Gérant : `/manager/suites`

Les user stories détaillées avec critères d'acceptation sont dans `docs/spec/user-stories.md`.
Le modèle de données (MCD, MLD, règles de gestion) est dans `docs/design/merise.md`.
