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

// ---------------------------------------------------------------------------------------------
// Niche identity: button gesture, section boundaries, textures, service numbers and photo tone.
// ---------------------------------------------------------------------------------------------

// tema.botao (global.css, data-botao on <html>): the primary button's gesture. "seta" adds an
// arrow that steps forward on hover, "suave" a diffuse shadow in the primary color, "carimbo" a
// solid offset shadow in the accent color that the button sinks into on click.
export const BOTOES = ['padrao', 'seta', 'suave', 'carimbo'] as const;
export type Botao = (typeof BOTOES)[number];

// tema.divisor (Divisor.astro): the boundary between two sections. "reto" is the plain cut;
// "filete" keeps it straight with a short centered rule and a small diamond; "onda" and
// "diagonal" raise the next section's background into the previous one.
export const DIVISORES = ['reto', 'filete', 'onda', 'diagonal'] as const;
export type Divisor = (typeof DIVISORES)[number];

/**
 * Which sections open with a divider: never the first one; "filete" at every boundary, the shapes
 * only where the background changes (both ends of a primary band included).
 */
export function divisoresDasSecoes(fundos: Fundo[], divisor: Divisor): boolean[] {
  return fundos.map((fundo, i) => i > 0 && divisor !== 'reto' && (divisor === 'filete' || fundo !== fundos[i - 1]));
}

// Small deterministic generator (mulberry32): the same seed always draws the same edge.
function sorteio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pct = (n: number) => `${Math.round(n * 10000) / 100}%`;

/**
 * Top edge of the next section as a CSS polygon() over the divider box (y: 0% top, 100% bottom).
 * "onda": one smooth curve whose height (60 to 100% of the box), crest and direction change with
 * the section index, so no two boundaries repeat. "diagonal": a straight slope, alternating sides.
 */
export function recorteDivisor(divisor: 'onda' | 'diagonal', indice: number): string {
  if (divisor === 'diagonal') {
    return indice % 2 === 0 ? 'polygon(0 100%, 100% 0, 100% 100%)' : 'polygon(0 0, 100% 100%, 0 100%)';
  }
  const r = sorteio(indice + 1);
  const amplitude = 0.6 + 0.4 * r();
  const y0 = 1 - amplitude * (0.25 + 0.45 * r());
  const y3 = 1 - amplitude * (0.25 + 0.45 * r());
  // The control point overshoots the crest, so the curve itself climbs about `amplitude` high.
  const crista = Math.max(0, 1 - 1.5 * amplitude);
  const [c1, c2] = indice % 2 === 0 ? [crista, 1] : [1, crista];
  const x1 = 0.2 + 0.2 * r();
  const x2 = 0.6 + 0.2 * r();
  const pontos: string[] = [];
  const passos = 24;
  for (let k = 0; k <= passos; k++) {
    const t = k / passos;
    const u = 1 - t;
    const x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3;
    const y = u ** 3 * y0 + 3 * u * u * t * c1 + 3 * u * t * t * c2 + t ** 3 * y3;
    pontos.push(`${pct(x)} ${pct(y)}`);
  }
  return `polygon(${pontos.join(', ')}, 100% 100%, 0 100%)`;
}
