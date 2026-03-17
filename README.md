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

Remplir `BETTER_AUTH_SECRET` dans `.env`. Pour le dev local, adapter `DATABASE_URL` :

```env
# Dev local (Bun + Docker Postgres)
DATABASE_URL=postgresql://hotel:hotel@localhost:5432/hotel_clair_de_lune
# Docker Compose (tout conteneurisé)
DATABASE_URL=postgresql://hotel:hotel@db:5432/hotel_clair_de_lune
```

### Option A — Dev local

Postgres dans Docker, Next.js en local pour le hot-reload.

```bash
docker compose up -d db    # Lance PostgreSQL
bun install                # Installe les dépendances
bun run db:push            # Applique le schéma
bun run dev                # Démarre Next.js
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### Option B — Tout en Docker

Environnement complet conteneurisé (Postgres + Next.js).

```bash
docker compose up -d       # Lance tous les services
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande          | Description                                     |
|-------------------|-------------------------------------------------|
| `bun run dev`     | Lance le serveur de développement               |
| `bun run build`   | Compile l'application pour la production        |
| `bun run start`   | Démarre le serveur de production                |
| `bun run lint`    | Vérifie le code avec ESLint                     |
| `bun run db:push` | Applique le schéma Drizzle à la base de données |

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
