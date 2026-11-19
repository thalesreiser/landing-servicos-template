// Theme helpers: shape tokens (tema.raio) and section backgrounds, emitted by Base.astro as CSS variables.

import { misturar } from './contraste.ts';
import { ICONES, type NomeIcone } from './icones.ts';

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

// tema.textura: a faint pattern on the superficie sections ("papel": fine grain in the text
// color; "pontos": a 16 px dot grid in the primary color). tema.marca_faixa: a watermark on
// primary bands ("riscado": 1 px diagonal lines every 8 px; "icones": line icons). Both are
// small inline SVG tiles used as the section background (no download, no fixed page layer),
// at these peak opacities, which tests/contraste.test.ts checks at the darkest (or lightest) point.
export const TEXTURAS = ['nenhuma', 'papel', 'pontos'] as const;
export type Textura = (typeof TEXTURAS)[number];
export const MARCAS_FAIXA = ['nenhuma', 'riscado', 'icones'] as const;
export type MarcaFaixa = (typeof MARCAS_FAIXA)[number];

export const OPACIDADE_TEXTURA = { papel: 0.04, pontos: 0.08 } as const;
export const OPACIDADE_MARCA_FAIXA = { riscado: 0.06, icones: 0.06 } as const;

type CoresTextura = { cor_texto: string; cor_primaria: string; cor_primaria_contraste: string };

function urlSvg(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replaceAll("'", '%27')}")`;
}

// Color channels from 0 to 1, for an SVG color matrix.
function canais01(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.round((v / 255) * 1000) / 1000;
  return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
}

const XMLNS = "xmlns='http://www.w3.org/2000/svg'";

/** CSS background-image of the light-section texture, or undefined for "nenhuma". */
export function imagemTextura(tema: CoresTextura, textura: Textura): string | undefined {
  if (textura === 'papel') {
    const [r, g, b] = canais01(tema.cor_texto);
    // Noise alpha with more contrast, in the text color; the rect opacity caps it at the constant.
    return urlSvg(
      `<svg ${XMLNS} width='160' height='160'><filter id='p' x='0' y='0' width='1' height='1' color-interpolation-filters='sRGB'>` +
        `<feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/>` +
        `<feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} 0 0 0 2.4 -.9'/></filter>` +
        `<rect width='160' height='160' filter='url(#p)' opacity='${OPACIDADE_TEXTURA.papel}'/></svg>`,
    );
  }
  if (textura === 'pontos') {
    return urlSvg(
      `<svg ${XMLNS} width='16' height='16'><circle cx='8' cy='8' r='.8' fill='${tema.cor_primaria}' opacity='${OPACIDADE_TEXTURA.pontos}'/></svg>`,
    );
  }
  return undefined;
}

/** Darkest point under light-section text: the texture color at full strength over `base`. */
export function fundoTextura(tema: CoresTextura, textura: Textura, base: string): string {
  if (textura === 'papel') return misturar(tema.cor_texto, base, OPACIDADE_TEXTURA.papel);
  if (textura === 'pontos') return misturar(tema.cor_primaria, base, OPACIDADE_TEXTURA.pontos);
  return base;
}

/** Up to three distinct icons for the "icones" watermark (a star when there are none). */
export function iconesDaFaixa(icones: NomeIcone[]): NomeIcone[] {
  const unicos = [...new Set(icones)].slice(0, 3);
  return unicos.length > 0 ? unicos : ['estrela'];
}

// Where the icons sit in the 168x112 tile, cycling through the list.
const POSICOES_ICONES = [
  [16, 14],
  [100, 22],
  [58, 66],
  [128, 72],
] as const;

/** CSS background-image of the primary-band watermark, or undefined for "nenhuma". */
export function imagemMarcaFaixa(tema: CoresTextura, marca: MarcaFaixa, icones: NomeIcone[]): string | undefined {
  // Light lines in the band's text color; opacity on the whole drawing, so crossings never add up.
  const cor = tema.cor_primaria_contraste;
  if (marca === 'riscado') {
    return urlSvg(
      `<svg ${XMLNS} width='8' height='8'><path d='M-1 1l2-2M0 8l8-8M7 9l2-2' stroke='${cor}' stroke-width='1' opacity='${OPACIDADE_MARCA_FAIXA.riscado}'/></svg>`,
    );
  }
  if (marca === 'icones') {
    const lista = iconesDaFaixa(icones);
    const desenhos = POSICOES_ICONES.map(([x, y], i) => {
      const caminhos = ICONES[lista[i % lista.length]!].map((d) => `<path d='${d}'/>`).join('');
      return `<g transform='translate(${x} ${y}) scale(1.25)'>${caminhos}</g>`;
    }).join('');
    return urlSvg(
      `<svg ${XMLNS} width='168' height='112'><g fill='none' stroke='${cor}' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round' opacity='${OPACIDADE_MARCA_FAIXA.icones}'>${desenhos}</g></svg>`,
    );
  }
  return undefined;
}

/** Lightest point under band text: the watermark (contrast color) at full strength over the band. */
export function fundoMarcaFaixa(tema: CoresTextura, marca: MarcaFaixa): string {
  if (marca === 'nenhuma') return tema.cor_primaria;
  return misturar(tema.cor_primaria_contraste, tema.cor_primaria, OPACIDADE_MARCA_FAIXA[marca]);
}

/** --textura and --marca-faixa for Base.astro (only the ones in use). */
export function variaveisTextura(tema: CoresTextura & { textura: Textura; marca_faixa: MarcaFaixa }, icones: NomeIcone[]): string[] {
  const textura = imagemTextura(tema, tema.textura);
  const marca = imagemMarcaFaixa(tema, tema.marca_faixa, icones);
  return [...(textura ? [`--textura:${textura}`] : []), ...(marca ? [`--marca-faixa:${marca}`] : [])];
}

// servicos.numerar (global.css, .numero-fantasma): the ghost number is the text color at 8%, or
// the accent at 15% with editorial "linha" cards; text running over it is checked in the contrast test.
export const OPACIDADE_NUMERO = { texto: 0.08, destaque: 0.15 } as const;

// tema.foto_tom (Imagem.astro, global.css .foto-tom): "harmonizado" desaturates the niche photos a
// little (85%), adds 5% contrast and lays the primary color over them in soft-light, at
// tema.foto_tom_intensidade, so stock photos from different sources read as one shoot.
export const FOTO_TONS = ['natural', 'harmonizado'] as const;
export type FotoTom = (typeof FOTO_TONS)[number];
