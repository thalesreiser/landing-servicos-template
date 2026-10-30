// Performance metrics: Google's thresholds, classification, median and pt-BR formatting.
// Used by the lab report (scripts/metricas.ts); the same thresholds rate the field data in GA4.

export const METRICAS = ['TTFB', 'LCP', 'INP', 'CLS', 'TBT'] as const;
export type Metrica = (typeof METRICAS)[number];

export type Status = 'bom' | 'melhorar' | 'ruim';

interface Limite {
  /** Upper bound (inclusive) of "bom". */
  bom: number;
  /** Upper bound (inclusive) of "precisa melhorar"; above it is "ruim". */
  ruim: number;
  unidade: 'ms' | '';
}

// Core Web Vitals and TTFB: https://web.dev/articles/vitals and https://web.dev/articles/ttfb.
// TBT is not a Core Web Vital; these are Lighthouse's mobile scoring references.
export const LIMITES: Record<Metrica, Limite> = {
  TTFB: { bom: 800, ruim: 1800, unidade: 'ms' },
  LCP: { bom: 2500, ruim: 4000, unidade: 'ms' },
  INP: { bom: 200, ruim: 500, unidade: 'ms' },
  CLS: { bom: 0.1, ruim: 0.25, unidade: '' },
  TBT: { bom: 200, ruim: 600, unidade: 'ms' },
};

export function classificar(metrica: Metrica, valor: number): Status {
  const limite = LIMITES[metrica];
  if (valor <= limite.bom) return 'bom';
  if (valor <= limite.ruim) return 'melhorar';
  return 'ruim';
}

export const ROTULOS_STATUS: Record<Status, string> = {
  bom: 'Bom',
  melhorar: 'Precisa melhorar',
  ruim: 'Ruim',
};

/** Median of the finite values; undefined when there are none. */
export function mediana(valores: readonly (number | null | undefined)[]): number | undefined {
  const ordenados = valores.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
  if (ordenados.length === 0) return undefined;
  const meio = Math.floor(ordenados.length / 2);
  return ordenados.length % 2 ? ordenados[meio] : (ordenados[meio - 1]! + ordenados[meio]!) / 2;
}

function numero(valor: number, casas: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

/**
 * Value as shown in the report: seconds for TTFB and LCP (0,42 s), milliseconds for INP and
 * TBT (120 ms), and the unitless CLS score (0,02).
 */
export function formatarMetrica(metrica: Metrica, valor: number): string {
  if (metrica === 'CLS') return numero(valor, 2);
  if (metrica === 'TTFB' || metrica === 'LCP') return `${numero(valor / 1000, 2)} s`;
  return `${numero(Math.round(valor), 0)} ms`;
}

/** The thresholds as text, e.g. "Bom: até 2,5 s · Ruim: acima de 4 s". */
export function formatarLimites(metrica: Metrica): string {
  const { bom, ruim } = LIMITES[metrica];
  const texto = (valor: number) => {
    if (metrica === 'CLS') return numero(valor, valor * 100 % 10 ? 2 : 1);
    if (metrica === 'TTFB' || metrica === 'LCP') return `${numero(valor / 1000, 1)} s`;
    return `${numero(valor, 0)} ms`;
  };
  return `Bom: até ${texto(bom)} · Ruim: acima de ${texto(ruim)}`;
}

/** Bytes in KB or MB (decimal, like Lighthouse and browsers' network panels). */
export function formatarBytes(bytes: number): string {
  if (bytes < 1000 * 1000) return `${numero(Math.round(bytes / 1000), 0)} KB`;
  return `${numero(bytes / 1000 / 1000, 1)} MB`;
}

/** Lighthouse category score (0 to 1) as 0–100. */
export function formatarNota(nota: number | null | undefined): string {
  return typeof nota === 'number' ? String(Math.round(nota * 100)) : '–';
}

export interface EntradaEvento {
  interactionId: number;
  duration: number;
}

/**
 * INP from Event Timing entries: each interaction lasts as long as its slowest event, and
 * with fewer than 50 interactions INP is the slowest interaction (as in web-vitals).
 */
export function inpDeEventos(entradas: readonly EntradaEvento[]): number | undefined {
  const interacoes = new Map<number, number>();
  for (const { interactionId, duration } of entradas) {
    if (interactionId > 0) interacoes.set(interactionId, Math.max(interacoes.get(interactionId) ?? 0, duration));
  }
  return interacoes.size ? Math.max(...interacoes.values()) : undefined;
}
