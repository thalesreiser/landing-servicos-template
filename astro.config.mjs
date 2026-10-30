// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig, envField, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';
import { reservasDaFonte, variavelFonte } from './src/lib/fontes.ts';

// Each file in nichos/ is a niche; NICHO picks which one is built.
const nichos = readdirSync(new URL('./nichos/', import.meta.url))
  .filter((arquivo) => arquivo.endsWith('.json'))
  .map((arquivo) => arquivo.replace(/\.json$/, ''));

// `site` (canonical, sitemap, robots.txt) comes from site.url of the selected niche.
// Unknown niches are left to the astro:env validation; without site.url the sitemap is skipped.
const { NICHO = 'exemplo' } = { ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''), ...process.env };
const dados = nichos.includes(NICHO)
  ? JSON.parse(readFileSync(new URL(`./nichos/${NICHO}.json`, import.meta.url), 'utf8'))
  : {};
const site = dados.site?.url;

// tema.fontes is downloaded at build time and served from the site (Astro Fonts API).
// The page validates the JSON with the full schema; here only the shape the config needs is read.
/** @type {import('./src/lib/fontes.ts').FonteNicho[]} */
const fontes = Array.isArray(dados.tema?.fontes) ? dados.tema.fontes : [];
const pilhas = [dados.tema?.fonte_titulo ?? '', dados.tema?.fonte_texto ?? ''];
const fonts = fontes.map((fonte) => {
  const provedor = fonte.provedor ?? 'google';
  const reservas = reservasDaFonte(fonte.familia, pilhas);
  const familia = {
    name: fonte.familia,
    cssVariable: variavelFonte(fonte.familia),
    weights: /** @type {[number, ...number[]]} */ (fonte.pesos),
    styles: /** @type {['normal']} */ (['normal']),
    subsets: /** @type {['latin']} */ (['latin']),
    formats: /** @type {['woff2']} */ (['woff2']),
    ...(reservas.length > 0 && { fallbacks: reservas }),
  };
  if (provedor !== 'google') return { ...familia, provider: fontProviders[provedor]() };
  // Axes besides wght (e.g. opsz) keep variable fonts rendering as they did from Google Fonts.
  const eixos = Object.entries(fonte.eixos ?? {}).map(([eixo, faixa]) => [eixo, [faixa]]);
  // Cast: the config type only infers provider options from a literal fonts array.
  return /** @type {typeof familia & { provider: import('astro').FontProvider }} */ ({
    ...familia,
    provider: fontProviders.google(),
    ...(eixos.length > 0 && { options: { experimental: { variableAxis: Object.fromEntries(eixos) } } }),
  });
});

// https://astro.build/config
export default defineConfig({
  site,
  fonts,
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
