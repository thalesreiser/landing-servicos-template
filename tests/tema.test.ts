import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';
import { coresFaixa, fundosDasSecoes, RAIOS, variaveisRaio } from '../src/lib/tema.ts';

const exemplo: unknown = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));

test('every radius emits the three shape variables', () => {
  for (const raio of RAIOS) {
    assert.deepEqual(
      variaveisRaio(raio).map((v) => v.split(':')[0]),
      ['--raio', '--raio-botao', '--raio-campo'],
    );
  }
});

test('reto is square and suave has pill buttons', () => {
  assert.deepEqual(variaveisRaio('reto'), ['--raio:2px', '--raio-botao:2px', '--raio-campo:2px']);
  assert.ok(variaveisRaio('suave').includes('--raio-botao:9999px'));
});

test('raio and card default to the medium, outlined look', () => {
  const nicho = structuredClone(exemplo) as { tema: Record<string, unknown> };
  delete nicho.tema.raio;
  delete nicho.tema.card;
  const { tema } = nichoSchema.parse(nicho);
  assert.equal(tema.raio, 'medio');
  assert.equal(tema.card, 'contorno');
});

test('rejects an unknown radius or card style', () => {
  for (const [campo, valor] of [['raio', 'redondo'], ['card', 'sombra']] as const) {
    const nicho = structuredClone(exemplo) as { tema: Record<string, unknown> };
    nicho.tema[campo] = valor;
    assert.equal(nichoSchema.safeParse(nicho).success, false, campo);
  }
});

test('sections alternate the light backgrounds, starting with superficie', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, {}, {}]), ['superficie', 'fundo', 'superficie', 'fundo']);
});

test('an explicit background wins and auto sections continue from it', () => {
  assert.deepEqual(fundosDasSecoes([{}, { fundo: 'superficie' }, {}]), ['superficie', 'superficie', 'fundo']);
});

test('a primary band does not break the light alternation', () => {
  assert.deepEqual(fundosDasSecoes([{}, {}, { fundo: 'primaria' }, {}, {}]), ['superficie', 'fundo', 'primaria', 'superficie', 'fundo']);
});

test('band colors: contrast text, muted text blended at 90%, accent defaults to the text', () => {
  const faixa = coresFaixa({ cor_primaria: '#000000', cor_primaria_contraste: '#FFFFFF' });
  assert.deepEqual(faixa, { fundo: '#000000', texto: '#FFFFFF', texto_suave: '#e6e6e6', destaque: '#FFFFFF' });
  assert.equal(coresFaixa({ cor_primaria: '#000000', cor_primaria_contraste: '#FFFFFF', cor_destaque_faixa: '#D8C7A3' }).destaque, '#D8C7A3');
});

test('a form section cannot use the primary band', () => {
  const nicho = structuredClone(exemplo) as { secoes: Record<string, unknown>[] };
  nicho.secoes.find((s) => s.tipo === 'formulario')!.fundo = 'primaria';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
  nicho.secoes.find((s) => s.tipo === 'formulario')!.fundo = 'fundo';
  assert.equal(nichoSchema.safeParse(nicho).success, true);
});
