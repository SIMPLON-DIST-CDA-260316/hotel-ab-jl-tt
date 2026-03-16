# Hotel Clair de Lune

Application de gestion hôtelière.

## Stack technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router)
- **UI** : React 19 + Tailwind CSS 4
- **Base de données** : SQLite
- **ORM** : Drizzle ORM
- **Authentification** : Better Auth
- **Runtime / Package manager** : [Bun](https://bun.com/)

## Installation en local

### Prérequis

- [Bun](https://bun.com/) >= 1.0

### 1. Cloner le dépôt

```bash
git clone https://github.com/SIMPLON-DIST-CDA-260316/hotel-ab-jl-tt.git
cd hotel-ab-jl-tt
```

### 2. Installer les dépendances

```bash
bun install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir les valeurs dans `.env` :

```env
DATABASE_URL=file:./dev.db
BETTER_AUTH_SECRET=your_secret_key
```

### 4. Initialiser la base de données

```bash
bun run db:push
```

### 5. Lancer le serveur de développement

```bash
bun run dev
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
