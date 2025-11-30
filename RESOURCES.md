# Saubio Web – Resources & Configuration

## Aperçu
- **Framework** : Next.js 15 (App Router, TypeScript)
- **Styling** : Tailwind CSS 3.4 + design tokens Saubio
- **Build** : Nx `@nx/next` (bundler SWC)
- **Entrées clés** :
  - Layout : `apps/web/src/app/layout.tsx`
  - Page Landing : `apps/web/src/app/page.tsx`
  - Styles globaux : `apps/web/src/app/global.css`
  - Tailwind config : `apps/web/tailwind.config.js`

## Structure pertinente
```
apps/web/
 ├── public/                  # Assets statiques (favicon…)
 ├── src/
 │   ├── app/
 │   │   ├── layout.tsx
 │   │   ├── page.tsx
 │   │   └── global.css
 │   └── components/
 │       ├── landing/         # Sections landing page
 │       └── layout/          # Header & Footer
 ├── tailwind.config.js
 ├── postcss.config.js
 ├── tsconfig.json
 ├── project.json             # Cibles Nx (dev, build, lint…)
 └── next.config.js
```

## Design tokens
- Couleurs `saubio-*` (forest, moss, sun, cream…)
- Typo : Manrope (font loader Next.js)
- Classes utilitaires : `.section-container`, `.headline`, `.subheadline`

## Libs & dépendances partagées
- `@saubio/config` : infos support, discount, locales (utilisé dans header/footer)
- `@saubio/models` : types métier (à utiliser pour formulaires, API client)
- `@saubio/utils` : helpers (`formatEuro`, `calculateEcoSurcharge`)
- `@saubio/ui` : primitives React (boutons, pill) – à utiliser pour harmoniser les composants

## SEO & métadonnées
- Définies dans `layout.tsx` via l’objet `metadata`
- Ajouter ultérieurement `openGraph`, `alternates`, `robots`

## Internationalisation (TODO)
- Utiliser `next-intl` ou `@vercel/edge-config` + `i18next`
- Suivre locales `appConfig.locales`

## Tests & qualité
- Lint : `nx lint web`
- Tests E2E (Playwright) : `apps/web-e2e/` (généré par Nx, à compléter)
- Tests unitaires : ajouter `jest` + `@testing-library/react` dans les composants critiques

## Intégration backend
- Proxy possible via `project.json` (option `frontendProject` côté API)
- Appel API via `fetch`/React Query (prévu) → installer `@tanstack/react-query`

## Accessibilité
- Palette contrastée (vert/jaune/crème)
- Boutons focus visibles (`focus-visible` dans `PrimaryButton`)
- Ajouter `aria-*` sur sections interactives (TODO)
