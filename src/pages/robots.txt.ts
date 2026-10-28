import type { APIRoute } from 'astro';
import { robotsTxt } from '../lib/seo.ts';

// `site` comes from site.url of the niche (astro.config.mjs).
export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(site?.href), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
