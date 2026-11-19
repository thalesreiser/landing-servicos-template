import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { romano, rotulosDasSecoes } from '../src/lib/rotulos.ts';
import { nichoSchema } from '../src/lib/schema.ts';

const exemplo: unknown = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));
const secoes = [{ tipo: 'hero' }, { tipo: 'servicos', menu: 'Serviços' }, { tipo: 'sobre', menu: 'Sobre', rotulo: 'O escritório' }, { tipo: 'mapa' }];

test('roman numerals', () => {
  assert.deepEqual([1, 2, 3, 4, 9, 14, 40].map(romano), ['I', 'II', 'III', 'IV', 'IX', 'XIV', 'XL']);
});

test('numbered kickers skip the hero, start at 01 and prefer rotulo over the menu label', () => {
  assert.deepEqual(rotulosDasSecoes(secoes, 'numerados'), [undefined, '01 · Serviços', '02 · O escritório', '03']);
});

test('roman, text-only and no kickers', () => {
  assert.deepEqual(rotulosDasSecoes(secoes, 'romanos'), [undefined, 'I · Serviços', 'II · O escritório', 'III']);
  assert.deepEqual(rotulosDasSecoes(secoes, 'texto'), [undefined, 'Serviços', 'O escritório', undefined]);
  assert.deepEqual(rotulosDasSecoes(secoes, 'nenhum'), [undefined, undefined, undefined, undefined]);
});

test('kickers default to none; sections accept their own rotulo', () => {
  const nicho = structuredClone(exemplo) as { tema: Record<string, unknown>; secoes: Record<string, unknown>[] };
  delete nicho.tema.rotulos;
  assert.equal(nichoSchema.parse(nicho).tema.rotulos, 'nenhum');
  nicho.tema.rotulos = 'romanos';
  nicho.secoes[1]!.rotulo = 'Outro texto';
  assert.equal(nichoSchema.safeParse(nicho).success, true);
  nicho.tema.rotulos = 'letras';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});
