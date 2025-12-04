# Saubio Frontend

Standalone Next.js application extracted from the original Nx monorepo. This project contains the public Saubio web app plus the duplicated shared libraries (`libs/config`, `libs/models`, `libs/utils`, `libs/ui`) so it can be developed and deployed independently from the backend and mobile apps.

## Prerequisites

- Node.js 20+
- npm 10+

## Getting Started

```bash
npm install
npm run dev
```

The app expects an API at `http://localhost:3001/api` by default. Override it via `NEXT_PUBLIC_API_BASE_URL` in a `.env.local` if needed.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js locally with hot reload. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Run the production build (after `npm run build`). |
| `npm run lint` | Run ESLint using `next lint`. |
| `npm run test` | Execute Jest unit tests (JS DOM environment). |
| `npm run typecheck` | Run TypeScript type checking without emit. |

## Testing

Jest is configured with `ts-jest` and `@testing-library/react`. CSS imports are stubbed via `identity-obj-proxy`. Run `npm run test` to execute all unit tests under `src/app/**/__tests__`.

## Tailwind & Styling

TailwindCSS is enabled via `postcss.config.js` and `tailwind.config.js`. Content globs include the `libs` directory so shared UI components pick up style classes.

## Git Workflow

This folder is a separate Git repository (e.g., `git@github.com:princeblack/saubio-frontend.git`). Initialize/push with:

```bash
git init
git add .
git commit -m "chore: bootstrap standalone frontend"
git branch -M main
git remote add origin git@github.com:princeblack/saubio-frontend.git
git push -u origin main
```

Repeat all commits/pushes from this directory so backend/mobile history stays isolated.

## CI/CD

Workflow: `.github/workflows/frontend-ci.yml`

- Triggers on pushes/PRs targeting `main`.
- Steps: `npm ci`, lint, Jest, `npm run build`.
- On `main`, the deploy job SSHs into the server, updates `/var/www/saubio-frontend`, preserves `.env.production`, pulls the infra repo, then rebuilds the `frontend` (and `nginx`) services via `docker compose up -d --build frontend nginx`.

Secrets à créer dans GitHub (identiques au backend) :

| Secret | Description |
| --- | --- |
| `SSH_HOST` | IP / hôte du serveur. |
| `SSH_USER` | Utilisateur SSH (root ou autre). |
| `SSH_KEY` | Clé privée pour se connecter. |
| `SSH_PORT` | Port SSH si différent de 22 (sinon laissez vide). |

La tâche sauvegarde et restaure automatiquement `.env.production` afin de conserver les valeurs propres au serveur après chaque `git reset`.
