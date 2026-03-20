# Guide : Claude Code + Figma — Workflow rapide

> Pour Agathe — setup et utilisation au quotidien sur le projet Clair de Lune.

## 1. Prérequis

- [Claude Code](https://claude.ai/code) installé et fonctionnel
- Un compte Figma (gratuit suffit)
- Node.js / Bun installé

## 2. Setup du MCP Figma (une seule fois)

### Étape 1 — Obtenir un token Figma

1. Va sur [figma.com/developers](https://www.figma.com/developers)
2. **Personal Access Tokens** → crée un nouveau token
3. Copie-le, tu en auras besoin juste après

### Étape 2 — Configurer le MCP dans Claude Code

Lance Claude Code et tape :

```
/mcp
```

Puis ajoute le serveur Figma avec cette config :

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "ton-token-ici"
      }
    }
  }
}
```

> **Alternative :** tu peux aussi l'ajouter manuellement dans `~/.claude/settings.json` sous la clé `mcpServers`.

### Étape 3 — Vérifier

Relance Claude Code et vérifie que le serveur Figma apparaît dans les MCP connectés.

## 3. Workflow au quotidien

### Sens 1 : Code → Figma (le plus rapide)

C'est le workflow principal quand on veut aller vite.

```
Tu prompts Claude Code    →    UI générée    →    Capturée dans Figma
      (en code)                (localhost)         (frames éditables)
```

**Exemple concret :**

```
Toi : "Crée la page /etablissements avec une grille de cards,
       style shadcn, responsive, avec image, nom et ville"

Claude Code : génère le code, lance le dev server

Toi : "Capture cette page et envoie-la dans le fichier Figma [lien]"
```

Le résultat arrive dans Figma comme des **frames éditables** — pas des screenshots. L'équipe peut annoter, dupliquer, proposer des variantes.

### Sens 2 : Figma → Code

Quand un design existe déjà dans Figma et qu'il faut le coder.

```
Toi : "Implémente ce design : [lien Figma vers le frame]"
```

Claude Code lit le design via le MCP et génère le code correspondant avec les composants du projet (shadcn/ui, Tailwind).

## 4. Bonnes pratiques

| Faire | Éviter |
|-------|--------|
| Coder d'abord, capturer ensuite | Maquetter pixel-perfect avant de coder |
| Utiliser Figma pour discuter et comparer | Passer des heures à designer dans Figma |
| Capturer plusieurs états (vide, chargé, erreur) | Ne montrer qu'un seul état |
| Annoter directement dans Figma | Faire des retours par message |
| Organiser : 1 page Figma par feature | Tout mettre en vrac |

## 5. Commandes utiles dans Claude Code

| Besoin | Prompt |
|--------|--------|
| Générer une page | "Crée la page /suites/[id] avec le détail d'une suite, galerie photos, prix, bouton réserver" |
| Capturer vers Figma | "Capture localhost:3000/etablissements et envoie dans Figma [lien fichier]" |
| Coder depuis un design | "Implémente ce composant Figma : [lien vers le node]" |
| Itérer après review | "Ajuste le spacing et la taille du CTA selon les annotations Figma" |

## 6. Structure Figma recommandée pour le projet

```
📁 Clair de Lune
  📄 Pages publiques
     - Accueil
     - Liste établissements
     - Détail établissement
     - Détail suite
  📄 Auth
     - Inscription
     - Connexion
  📄 Espace client
     - Mes réservations
  📄 Admin
     - Gestion établissements
     - Gestion gérants
  📄 Gérant
     - Gestion suites
```

---

*Besoin d'aide ? Demande à Julien ou lance `claude` dans le terminal du projet.*
