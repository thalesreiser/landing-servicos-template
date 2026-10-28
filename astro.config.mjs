// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Each file in nichos/ is a niche; NICHO picks which one is built.
const nichos = readdirSync(new URL('./nichos/', import.meta.url))
  .filter((arquivo) => arquivo.endsWith('.json'))
  .map((arquivo) => arquivo.replace(/\.json$/, ''));

// `site` (canonical, sitemap, robots.txt) comes from site.url of the selected niche.
// Unknown niches are left to the astro:env validation; without site.url the sitemap is skipped.
const { NICHO = 'exemplo' } = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };
const site = nichos.includes(NICHO)
  ? JSON.parse(readFileSync(new URL(`./nichos/${NICHO}.json`, import.meta.url), 'utf8')).site?.url
  : undefined;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
  env: {
    schema: {
      NICHO: envField.enum({
        context: 'server',
        access: 'public',
        values: nichos,
        default: 'exemplo',
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
