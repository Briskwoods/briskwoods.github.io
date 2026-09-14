// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// This repo's og:url (https://briskwoods.github.io/) and the .vs project name
// both point to this being a GitHub *user* page repo (briskwoods.github.io),
// which GitHub Pages serves at the domain root — so no `base` path is needed.
//
// If you ever rename this to a *project* page repo instead (e.g. a repo called
// "portfolio" deployed at https://briskwoods.github.io/portfolio/), set
// `base: '/portfolio'` below and update the `site` value to match.
export default defineConfig({
  site: 'https://briskwoods.github.io',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
