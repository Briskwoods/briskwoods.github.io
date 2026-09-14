# Briskwoods — Jeffrey Gichuki

Personal portfolio site, rebuilt with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
Deploys automatically to GitHub Pages on every push to `main`.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:4321`.

```bash
npm run build     # builds the static site into dist/
npm run preview   # preview the production build locally
```

## Deployment (GitHub Pages)

This repo includes `.github/workflows/deploy.yml`, which builds and deploys the site automatically
on every push to `main` — no manual steps needed, similar to a Vercel auto-deploy.

**One-time setup**, after you push this repo to GitHub:

1. Go to your repo's **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow builds the site and publishes it. Check the **Actions** tab for
   progress; your live URL is shown there and in Settings → Pages once the first deploy finishes.

This repo is set up as a **user page** (`briskwoods.github.io`), which GitHub Pages serves at the
domain root. If you ever move this to a different repo name (a *project* page instead), you'll
need to set a `base` path in `astro.config.mjs` — see the comment there.

## Project structure

```
src/
  layouts/Layout.astro     — <head>, fonts, meta tags, pre-paint theme script
  components/               — one component per section (Hero, Work, Experience, ...)
  styles/global.css         — design tokens (colors, fonts) + component styles
  pages/index.astro         — assembles the page
public/                      — static files served as-is (favicons, résumé PDF, profile photo)
```

## Notable features

- **Dark/light theme toggle** — persists to `localStorage`, respects system preference on first
  visit, and sets the theme before paint to avoid a flash of the wrong theme.
- **Code Snippets section** — fetches code files client-side from a public GitHub repo
  (`Briskwoods/SonOfMabinSnippets` by default) and renders them with category filters and a
  syntax-highlighted modal (via Prism.js). Configure the source repo in
  `src/components/CodeSnippets.astro`.
- **Scroll-reveal animations** and a **mobile nav** — plain JS, no framework runtime needed.

## Notable details

- The **Millionaire Life** project icon is hotlinked from CrazyGames' image CDN rather than stored
  locally (no local icon file existed for it). If you'd rather self-host it, save a copy to
  `public/icons/millionaire-life.png` and update the `icon` path in `src/components/Projects.astro`.
