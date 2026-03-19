# Hotel Clair de Lune

Application de gestion hôtelière.

## Stack technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router)
- **UI** : React 19 + Tailwind CSS 4
- **Base de données** : PostgreSQL 16
- **ORM** : Drizzle ORM
- **Authentification** : Better Auth
- **Runtime / Package manager** : [Bun](https://bun.com/)
- **Conteneurisation** : Docker + Docker Compose

## Démarrage rapide

### Prérequis

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://docs.docker.com/get-docker/) et Docker Compose

### 1. Cloner le dépôt

```bash
git clone https://github.com/SIMPLON-DIST-CDA-260316/hotel-ab-jl-tt.git
cd hotel-ab-jl-tt
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir `BETTER_AUTH_SECRET` dans `.env` :

```env
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_clair_de_lune
BETTER_AUTH_SECRET=your-secret-here
```

> **Note :** Garder `localhost` dans `DATABASE_URL`. L'Option B (tout en Docker) override automatiquement cette valeur via `docker-compose.yml`.

### Option A — Dev local (recommandée)

Postgres dans Docker, Next.js en local. **Hot-reload actif** : les modifications de code sont reflétées instantanément.

```bash
docker compose up -d db    # Lance PostgreSQL
bun install                # Installe les dépendances
bun run db:push            # Applique le schéma
bun run db:seed            # (optionnel) Insère les données de test
bun run dev                # Démarre Next.js
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

Après un `git pull` avec des changements de schéma, relancer `bun run db:push` pour synchroniser la DB.

Pour arrêter :

```bash
# Ctrl+C pour stopper Next.js, puis :
docker compose down db      # Arrête PostgreSQL
```

### Option B — Tout en Docker

Environnement complet conteneurisé (Postgres + Next.js). Le schéma DB est appliqué automatiquement au démarrage. **Pas de hot-reload** : les modifications de code nécessitent un rebuild (`--build`). Pour insérer les données de test, ajouter `SEED_DB=true` dans `.env`.

```bash
docker compose up -d --build   # Build et lance tous les services
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

Pour arrêter :

```bash
docker compose down         # Arrête tous les services
```

## Scripts disponibles

| Commande          | Description                                     |
|-------------------|-------------------------------------------------|
| `bun run dev`     | Lance le serveur de développement               |
| `bun run build`   | Compile l'application pour la production        |
| `bun run start`   | Démarre le serveur de production                |
| `bun run lint`    | Vérifie le code avec ESLint                     |
| `bun run db:push`        | Applique le schéma Drizzle à la base de données |
| `bun run db:seed`        | Insère les données de test (idempotent)          |
| `bun run db:seed-admin`  | Crée le compte administrateur initial            |

## Compte administrateur initial

Le rôle `admin` ne peut pas être obtenu via l'inscription publique. Pour créer le premier compte admin :

```bash
SEED_ADMIN_EMAIL=admin@example.com \
SEED_ADMIN_PASSWORD=MotDePasse1! \
SEED_ADMIN_NAME="Prénom Nom" \
bun run db:seed-admin
```

Le script est **idempotent** : si un compte avec cet email existe déjà, il est ignoré.

## Documentation

- [Présentation produit](docs/product.md)
- [User Stories](docs/user-stories.md)
- [Cahier des charges](docs/cahier-des-charges.md)
- [Architecture technique](docs/ARCHITECTURE.md)
- [GitHub Project Board](https://github.com/orgs/SIMPLON-DIST-CDA-260316/projects/4)

## Équipe

| Membre | Rôle |
|--------|------|
| **Julien Lemarchand** | Base de données, persistance, documentation |
| **Thélio Trinité** | Logique métier, couche applicative |
| **Agathe Boncompain** | UX/UI design, charte graphique, implémentation |

> Ownership partagé : code reviews croisées et décisions techniques prises collectivement.

## Licence

Projet réalisé dans le cadre de la formation CDA — SIMPLON.
