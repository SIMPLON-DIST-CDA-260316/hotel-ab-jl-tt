# Audit des dépendances — 2026-03-23

## Résumé

Audit des dépendances du projet Hotel Clair de Lune : versions, configuration, cohérence avec les standards du projet.

**Branche :** `chore/deps-audit`

---

## Constats

### P1 — `tsconfig.json` : `strict: false`

- **Fichier :** `tsconfig.json:11`
- **Problème :** `"strict": false` alors que les rules du projet (`2-typescript.md`) imposent le mode strict.
- **Impact :** Pas de vérification `null`/`undefined`, pas de `strictFunctionTypes`, pas de `noImplicitAny`. Les bugs passent au travers du compilateur.
- **Action proposée :** Passer à `"strict": true` et corriger les erreurs de compilation.
- **Risque :** Potentiellement beaucoup d'erreurs à corriger. À évaluer d'abord avec `tsc --noEmit`.
- **Statut :** En attente

---

### P2 — Script `db:seed-admin` documenté mais inexistant

- **Fichier :** `README.md` (section "Compte administrateur initial") + `package.json`
- **Problème :** Le README documente `bun run db:seed-admin` mais ni le script ni le fichier source n'existent.
- **Impact :** Documentation trompeuse pour les contributeurs.
- **Action proposée :** Option A — créer le script. Option B — retirer la section du README.
- **Statut :** En attente

---

### P3 — `components.json` : mauvais chemin CSS

- **Fichier :** `components.json:8`
- **Problème :** `"css": "src/app/globals.css"` mais le fichier réel est `app/globals.css`.
- **Impact :** `npx shadcn add` peut échouer ou ne pas injecter les styles correctement.
- **Action proposée :** Corriger en `"css": "app/globals.css"`.
- **Statut :** Corrigé

---

### P4 — Doublon `@radix-ui/react-slot` + `radix-ui`

- **Fichier :** `package.json:18,26`
- **Problème :** `@radix-ui/react-slot` (ancien namespace) et `radix-ui` (nouveau namespace unifié) sont tous deux installés. Le nouveau package inclut déjà `react-slot`.
- **Impact :** Poids inutile, risque de versions divergentes.
- **Action proposée :** Vérifier les imports existants, migrer vers `radix-ui` si applicable, supprimer `@radix-ui/react-slot`.
- **Résolution :** Seul `src/components/ui/button.tsx` importait depuis `@radix-ui/react-slot`. Le package `radix-ui` embarque `@radix-ui/react-slot` dans ses propres `node_modules` — l'import existant continue de résoudre. `@radix-ui/react-slot` supprimé du top-level. Build + tests OK.
- **Statut :** Corrigé

---

### P5 — Vitest `environment: "node"` vs tests React

- **Fichier :** `vitest.config.ts:13`
- **Problème :** `environment: "node"` alors que `@testing-library/react` et `jsdom` sont installés. Les tests de composants React ont besoin de `jsdom`.
- **Impact :** Si tous les tests actuels sont des tests de logique pure (pas de composants), c'est correct. Mais dès qu'un test de composant sera ajouté, il échouera.
- **Action proposée :** Vérifier les tests existants. Si aucun test de composant, laisser en `node` et documenter l'utilisation de `// @vitest-environment jsdom` par fichier. Sinon, passer à `jsdom`.
- **Statut :** En attente

---

### P6 — `tw-animate-css` absent

- **Problème :** Ni `tailwindcss-animate` ni `tw-animate-css` n'est installé. Les composants shadcn animés (Dialog, Sheet, Dropdown, etc.) en ont besoin.
- **Impact :** Les animations d'entrée/sortie des composants shadcn ne fonctionnent pas.
- **Action proposée :** Vérifier si des composants animés sont utilisés. Si oui, installer `tw-animate-css` et l'importer dans `globals.css`.
- **Statut :** En attente

---

## Points vérifiés — OK

| Élément | Statut |
|---------|--------|
| Next.js `^16.1.6` (dernière majeure) | OK |
| React `^19.2.4` (dernière stable) | OK |
| Tailwind CSS v4 + PostCSS config | OK |
| Drizzle ORM + Kit (dernières versions) | OK |
| Better Auth `^1.5.5` | OK |
| Zod `^4.3.6` | OK |
| Vitest `^4.1.0` | OK |
| Playwright `^1.58.2` | OK |
| ESLint v9 flat config + boundaries | OK |
| `globals.css` OKLCH + design tokens | OK |
| `@electric-sql/pglite` pour tests DB | OK |
| `components.json` style new-york + RSC | OK |
| Alias `@/*` cohérent tsconfig/vitest | OK |

---

## Suivi

- [ ] **P1** — Activer `strict: true` *(haute — à évaluer)*
- [ ] **P2** — Script `db:seed-admin` *(faible)*
- [x] **P3** — Corriger chemin CSS `components.json` *(triviale)*
- [x] **P4** — Supprimer doublon Radix *(faible)*
- [ ] **P5** — Vérifier env Vitest *(faible)*
- [ ] **P6** — Installer `tw-animate-css` *(faible)*

## Journal de résolution

- **P3** (2026-03-23) : `components.json` — `"css": "src/app/globals.css"` → `"css": "app/globals.css"`
- **P4** (2026-03-23) : `bun remove @radix-ui/react-slot` — doublon avec `radix-ui`. Build + tests OK.
