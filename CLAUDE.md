# CLAUDE.md

Voir @README.md pour la stack, les commandes et le démarrage.

## Contexte produit

Application de gestion pour l'hôtel **Clair de Lune**. Quatre rôles : visiteur, client, gérant, administrateur.

Routes prévues (voir `docs/ARCHITECTURE.md`) :
- Publiques : `/`, `/etablissements`, `/etablissements/[id]`, `/suites/[id]`, `/contact/[id]`
- Auth : `/inscription`, `/connexion`
- Client : `/reservations`
- Admin : `/admin/etablissements`, `/admin/gerants`
- Gérant : `/gerant/suites`

Les user stories détaillées avec critères d'acceptation sont dans `docs/user-stories.md`.
Le modèle de données (MCD, MLD, règles de gestion) est dans `docs/merise.md`.
