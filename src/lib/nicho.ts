import { z } from 'astro/zod';
import { NICHO } from 'astro:env/server';
import { nichoSchema, type Nicho } from './schema.ts';

const arquivos = import.meta.glob<unknown>('/nichos/*.json', { eager: true, import: 'default' });

let carregado: Nicho | undefined;

/** Loads and validates nichos/<NICHO>.json; fails the build with a readable message. */
export function carregarNicho(): Nicho {
  if (carregado) return carregado;
  const dados = arquivos[`/nichos/${NICHO}.json`];
  if (dados === undefined) {
    throw new Error(`Nicho "${NICHO}" não encontrado em nichos/.`);
  }
  const resultado = nichoSchema.safeParse(dados);
  if (!resultado.success) {
    throw new Error(`nichos/${NICHO}.json inválido:\n${z.prettifyError(resultado.error)}`);
  }
  carregado = resultado.data;
  return carregado;
}
