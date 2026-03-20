# ADR-001 : Service d'emailing transactionnel

> **Statut :** En attente de validation
> **Date :** 2026-03-17
> **Auteur :** Julien Lemarchand
> **Contexte décisionnel :** Brainstorming équipe du 2026-03-17

---

## Contexte

L'application Clair de Lune nécessite l'envoi d'emails transactionnels pour :

| Type | Déclencheur | Responsable technique |
|---|---|---|
| Vérification email | Création de compte | Better Auth (`sendVerificationEmail` callback) |
| Reset mot de passe | Demande utilisateur | Better Auth (`sendResetPassword` callback) |
| Confirmation réservation | Server action `create-reservation` | Code métier |
| Annulation réservation | Server action `cancel-reservation` | Code métier |
| Demande de feedback | Post-séjour (`date_fin` atteinte) | Cron / batch |

La stack actuelle est : **Next.js 16, Better Auth, Drizzle ORM, Bun, PostgreSQL**.

## Options évaluées

### Option A — Resend (recommandé)

[Resend](https://resend.com) est un service d'email transactionnel conçu pour les développeurs.

**Pour :**
- Better Auth documente officiellement l'intégration avec Resend dans ses exemples
- Développé par la même équipe que [React Email](https://react.email) — les templates email sont des composants React, ce qui est cohérent avec notre stack
- SDK léger, basé sur HTTP — compatible Bun nativement, pas de dépendances natives Node.js
- Setup minimal : 1 package (`resend`), 1 variable d'environnement (`RESEND_API_KEY`)
- Free tier : 100 emails/jour (~3 000/mois) — largement suffisant pour le projet
- Aucun impact sur la base de données (service layer pur)

**Contre :**
- Vendor lock-in (mais la couche d'abstraction est fine — on peut swapper en changeant quelques lignes dans un fichier `src/lib/email.ts`)
- Nécessite un domaine vérifié pour l'envoi en production (sinon limité à `onboarding@resend.dev`)

### Option B — AWS SES (écarté)

**Pour :**
- Le moins cher à grande échelle ($0.10 / 1 000 emails)
- Standard industrie, très fiable

**Contre :**
- Complexité opérationnelle disproportionnée pour un projet éducatif : configuration IAM, vérification de domaine SES, sortie du sandbox (demande manuelle à AWS), gestion de credentials AWS
- SDK `@aws-sdk/client-ses` lourd (nombreux sous-packages)
- Pas d'intégration native avec Better Auth (à câbler manuellement)
- Pas de support React Email natif

### Option C — Supabase Email (écarté)

**Pour :**
- Déjà dans l'écosystème si on utilisait Supabase Auth

**Contre :**
- **Non viable** : la fonctionnalité email de Supabase est couplée exclusivement à Supabase Auth. On utilise Better Auth — il est impossible d'utiliser Supabase Email standalone pour envoyer des emails transactionnels arbitraires
- Nécessiterait de migrer toute la couche d'authentification

## Décision

**Resend** est retenu comme service d'emailing transactionnel.

## Conséquences

### Ce qui change
- Ajout des packages : `resend`, `@react-email/components`, `react-email`
- Ajout de `RESEND_API_KEY` dans `.env`
- Configuration des callbacks `sendVerificationEmail` et `sendResetPassword` dans `src/lib/auth.ts`
- Création d'un module `src/lib/email.ts` pour les emails métier
- Templates email dans `src/emails/` (composants React)

### Ce qui ne change pas
- Aucune table en base de données
- Aucun changement d'architecture
- Le schéma Drizzle n'est pas impacté

### Risques identifiés
- Le free tier (100/jour) est suffisant pour le développement et la démo, mais un passage en production réelle nécessiterait le plan payant ($20/mois)
- Un domaine vérifié sera nécessaire pour les envois en production (pas bloquant en dev)
