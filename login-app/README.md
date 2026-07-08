# login-app

Source for the `/login/` page — a React + Framer Motion sign-in/landing screen for Conveyancing Guard. This is the only part of the site with a build step; everything else in the repo is plain static HTML/CSS/JS.

There's no real authentication here: both "Sign In" and "Demo Mode" simply navigate to `../index.html`, consistent with the rest of the site having no backend.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `../login/` (repo-root `login/`), which is committed as static files so GitHub Pages can serve it directly — no CI build step. After changing anything in `src/`, rebuild and commit the regenerated `login/` output alongside your source change.

## Notes

- `src/tokens.css` mirrors the design tokens in `../assets/styles.css`. If the root site's palette/type tokens change, update both by hand.
- `vite.config.js` uses `base: './'` (relative asset paths) and a custom `build.outDir` — both are required for the build to work correctly when served from the `/login/` subpath.
