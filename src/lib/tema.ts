// Theme helpers: shape tokens (tema.raio) and section backgrounds, emitted by Base.astro as CSS variables.

import { misturar } from './contraste.ts';

export const RAIOS = ['reto', 'medio', 'suave'] as const;
export type Raio = (typeof RAIOS)[number];

// Card treatment (global.css): outlined, raised with a soft shadow, or an editorial top rule.
export const CARTOES = ['contorno', 'elevado', 'linha'] as const;
export type Cartao = (typeof CARTOES)[number];

// Motion (global.css): "sutil" turns on scroll reveal, micro-interactions, the animated FAQ and
// page transitions; "nenhuma" turns all of it off. prefers-reduced-motion always wins.
export const ANIMACOES = ['sutil', 'nenhuma'] as const;
export type Animacoes = (typeof ANIMACOES)[number];

const FORMAS: Record<Raio, { cartao: string; botao: string; campo: string }> = {
  reto: { cartao: '2px', botao: '2px', campo: '2px' },
  medio: { cartao: '12px', botao: '8px', campo: '8px' },
  suave: { cartao: '16px', botao: '9999px', campo: '12px' },
};

/** CSS custom properties for cards and images, buttons and chips, and form fields. */
export function variaveisRaio(raio: Raio): string[] {
  const forma = FORMAS[raio];
  return [`--raio:${forma.cartao}`, `--raio-botao:${forma.botao}`, `--raio-campo:${forma.campo}`];
}

// Section backgrounds: the two light theme colors, or a contrast band in the primary color.
export const FUNDOS = ['fundo', 'superficie', 'primaria'] as const;
export type Fundo = (typeof FUNDOS)[number];

// Light text on the band is drawn at this opacity over the primary color.
export const OPACIDADE_TEXTO_FAIXA = 0.9;

/**
 * Background of each section, in order. An explicit `fundo` wins; the others alternate the two
 * light colors (starting with superficie), skipping over primary bands so light sections never repeat.
 */
export function fundosDasSecoes(secoes: { fundo?: Fundo | undefined }[]): Fundo[] {
  let ultimoClaro: Fundo = 'fundo';
  return secoes.map(({ fundo }) => {
    const escolhido = fundo ?? (ultimoClaro === 'fundo' ? 'superficie' : 'fundo');
    if (escolhido !== 'primaria') ultimoClaro = escolhido;
    return escolhido;
  });
}

/** Colors inside a primary band: what text, muted text and the accent turn into. */
export function coresFaixa(tema: {
  cor_primaria: string;
  cor_primaria_contraste: string;
  cor_destaque_faixa?: string | undefined;
}): { fundo: string; texto: string; texto_suave: string; destaque: string } {
  return {
    fundo: tema.cor_primaria,
    texto: tema.cor_primaria_contraste,
    texto_suave: misturar(tema.cor_primaria_contraste, tema.cor_primaria, OPACIDADE_TEXTO_FAIXA),
    destaque: tema.cor_destaque_faixa ?? tema.cor_primaria_contraste,
  };
}

// Hero mesh (global.css, .hero-malha): two soft radial glows, the primary color in the top-right
// corner and the accent in the bottom-left, at these peak opacities over the section background.
// Kept low so primary-colored text over it still passes AA (tests/contraste.test.ts).
export const MALHA = { primaria: 0.05, destaque: 0.04 } as const;

// tema.fundo_hero: the mesh above, or a flat background (for palettes with little contrast to spare).
export const FUNDOS_HERO = ['malha', 'liso'] as const;
export type FundoHero = (typeof FUNDOS_HERO)[number];

function comAlfa(hex: string, alfa: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alfa})`;
}

/** CSS custom properties with the two mesh colors, derived from the theme. */
export function variaveisMalha(tema: { cor_primaria: string; cor_destaque: string }): string[] {
  return [`--malha-a:${comAlfa(tema.cor_primaria, MALHA.primaria)}`, `--malha-b:${comAlfa(tema.cor_destaque, MALHA.destaque)}`];
}

/** Darkest point the hero text can sit on: both glows at full strength over `base` (worst case). */
export function fundoMalha(tema: { cor_primaria: string; cor_destaque: string }, base: string): string {
  return misturar(tema.cor_destaque, misturar(tema.cor_primaria, base, MALHA.primaria), MALHA.destaque);
}
