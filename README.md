# Quiz API v2

Une API francophone gratuite pour réaliser des quiz.

C'est une API participative : tout le monde peut proposer des questions. Les propositions non‑admin sont soumises à modération.

Plus d'infos : `https://quizzapi.jomoreschi.fr/`

Base URL par défaut: `/api/v2`

Note sécurité: les requêtes d'écriture (POST/PUT/DELETE) sont protégées par CSRF + session. Les requêtes de lecture (GET) sont publiques sauf mention contraire.

**Sommaire**
- Guide rapide: récupérer des quiz
- Routes détaillées: toutes les ressources
- Authentification, CSRF et CORS

## Guide rapide — Récupérer des quiz

- Endpoint: `GET /api/v2/quiz`
- Paramètres query facultatifs:
  - `difficulty`: `facile` | `normal` | `difficile`
  - `category`: slug de catégorie (ex: `histoire`, `culture_generale`)
  - `limit`: nombre souhaité (ex: `10`)
- Réponse: `{ count: number, quizzes: Array<{ id, question, answer, badAnswers[], category, difficulty }> }`

Exemples

- Obtenir 10 questions faciles de la catégorie « histoire »:
  - `GET /api/v2/quiz?difficulty=facile&category=histoire&limit=10`

- Obtenir des questions (tout niveau, toutes catégories):
  - `GET /api/v2/quiz`

- Lister les catégories disponibles:
  - `GET /api/v2/quiz/categories`

Remarques
- Le champ `answer` est la bonne réponse; `badAnswers` contient 3 propositions incorrectes. Mélangez client‑side pour afficher un QCM.
- Les résultats sont renvoyés dans un ordre aléatoire côté API; `count` reflète le nombre retourné.

## Routes détaillées

Toutes les routes ci‑dessous sont préfixées par `/api/v2`.

Public / Utilitaires
- `GET /csrf`: génère un token CSRF (cookie `csrf-token` + `token` dans la réponse).
- `GET /test`: vérification simple de l’API.
- `GET /user`: informations de l’utilisateur courant (auth requise).

Auth
- `POST /auth/register`: crée un compte.
  - Body: `{ name, email, password, passwordConfirm }`
  - Règles: `email` valide, `password` fort, `passwordConfirm` identique, `name` alphanumérique.
- `POST /auth/login`: ouvre une session (cookie).
  - Body: `{ username: email, password }` (champ `username` = email, stratégie locale)
- `POST /auth/logout`: ferme la session.

Recovery (mot de passe)
- `GET /recovery/send-mail`: envoie un email de récupération.
  - Body: `{ email }`
- `POST /recovery/recover-password`: réinitialise le mot de passe.
  - Body: `{ token, email, newPassword }` (mot de passe fort requis)

Quiz — Public
- `GET /quiz`: filtre et renvoie des quiz validés.
  - Query: `difficulty`, `category` (slug), `limit`
  - Réponse: `{ count, quizzes: [...] }` (voir Guide rapide)
- `GET /quiz/:id`: récupère un quiz par ID.
- `GET /quiz/categories`: liste des catégories `{ id, name, slug }`.
- `GET /quiz/categories/:id`: récupère une catégorie par ID.
- `GET /quiz/count`: nombre total de quiz validés.

Quiz — Proposer / Modérer
- `POST /quiz`: propose un quiz.
  - Auth: CSRF requis; session non obligatoire mais si non‑admin, le quiz est `pending: true` (soumis à modération).
  - Body requis:
    - `question`, `answer`, `badAnswer1`, `badAnswer2`, `badAnswer3`
    - `categoryId` (ID de la catégorie)
    - `difficulty` ∈ `facile | normal | difficile`
- `GET /quiz/pending`: liste des quiz en attente (admin requis).
- `PUT /quiz/pending/:id`: change le statut `pending` (admin requis).
  - Body: `{ status: boolean }`
- `GET /quiz/getAll`: liste paginée pour l’admin.
  - Query: `search`, `category` (ID), `difficulty`, `page` (défaut 1), `limit` (défaut 10)
  - Réponse: `{ quizzes, count, page, totalPages }`
- `PUT /quiz/:id`: met à jour un quiz (admin requis).
- `DELETE /quiz/:id`: supprime un quiz (admin requis).

Administration — Utilisateurs
- `GET /admin/users`: liste des utilisateurs (admin).
- `GET /admin/users/:id`: détail d’un utilisateur (admin).
- `POST /admin/users`: crée un utilisateur (admin).
  - Body: `{ name, email, password, passwordConfirm }`
- `DELETE /admin/users/:id`: supprime un utilisateur (admin).
- `PUT /admin/users/:id/role`: met à jour le rôle (admin).
  - Body: `{ role: 'USER' | 'ADMIN' }`

Administration — Catégories
- `POST /admin/categories`: crée une catégorie (admin).
  - Body: `{ name }` → `slug` généré automatiquement.
- `PUT /admin/categories/:id`: met à jour une catégorie (admin).
  - Body: `{ name }`
- `DELETE /admin/categories/:id`: supprime une catégorie (admin).

## Authentification, CSRF et CORS

- Session: l’auth utilise des cookies de session (`cookie-session`).
- CSRF: pour POST/PUT/DELETE, obtenir un token via `GET /api/v2/csrf` puis envoyer l’en‑tête `x-csrf-token` avec la valeur fournie. Le cookie `csrf-token` est aussi défini par l’API.
- CORS: seules les origines configurées via `FRONTEND_URL` et `DEVELOPMENT_FRONTEND_URL` peuvent envoyer des requêtes avec `credentials: true` (auth/admin). Les GET publics sur `/quiz` sont ouverts.

## Exemples requêtes

- Récupérer 5 quiz « normal » en culture générale:
  - `curl "https://<votre-domaine>/api/v2/quiz?difficulty=normal&category=culture_generale&limit=5"`

- Flux CSRF + création de quiz (exemple minimal):
  1) Récupérer le token: `curl -i https://<domaine>/api/v2/csrf`
  2) Utiliser le header `x-csrf-token: <token>` pour POST:
     - `curl -X POST https://<domaine>/api/v2/quiz \
        -H 'Content-Type: application/json' \
        -H 'x-csrf-token: <token>' \
        --data '{
          "question":"Capitale de la France ?",
          "answer":"Paris",
          "badAnswer1":"Lyon",
          "badAnswer2":"Marseille",
          "badAnswer3":"Bordeaux",
          "categoryId":"<ID_categorie>",
          "difficulty":"facile"
        }'`

## Déploiement / Configuration (aperçu)

- Variables: voir `.env.example` (secrets cookies/CSRF, URLs frontend, SMTP, DB...).
- Base de données: Prisma (MySQL). Modèles: `User`, `Category`, `Quiz`, `Recovery`.

Pour toute question ou amélioration, ouvrez une issue ou PR.
