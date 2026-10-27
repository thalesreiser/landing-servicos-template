// @ts-check
import { readdirSync } from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Each file in nichos/ is a niche; NICHO picks which one is built.
const nichos = readdirSync(new URL('./nichos/', import.meta.url))
  .filter((arquivo) => arquivo.endsWith('.json'))
  .map((arquivo) => arquivo.replace(/\.json$/, ''));

// https://astro.build/config
export default defineConfig({
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
