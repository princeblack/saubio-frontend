# Commandes – Web (Next.js)

> Prérequis : Node.js ≥ 20.11.1, `npm` ≥ 10, navigateur moderne.  
> Toutes les commandes sont exécutées depuis la racine `saubio/`.

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement**
   ```bash
   nx dev web
   ```
   - Adresse : `http://localhost:4200` (proxy Nx) ou `http://localhost:3000` (Next.js direct)
   - API : `NEXT_PUBLIC_API_BASE_URL` (défaut `http://localhost:3001/api`)
   - Hot reload automatique

3. **Construire pour la production**
   ```bash
   nx build web
   ```
   - Sortie dans `dist/apps/web`

4. **Servir la build statique**
   ```bash
   nx serve-static web
   ```

5. **Lint du projet**
   ```bash
   nx lint web
   ```

6. **Tests end-to-end (Playwright)**
   ```bash
   nx e2e web-e2e
   ```
   > Configurez Playwright (`apps/web-e2e/playwright.config.ts`) avant première exécution.

7. **Générer un composant**
   ```bash
   nx g @nx/react:component hero-cta --project=web --directory=src/components/landing
   ```

8. **Réinitialiser le cache Nx (si besoin)**
   ```bash
   nx reset
   ```
