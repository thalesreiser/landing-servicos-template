import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';
import { RAIOS, variaveisRaio } from '../src/lib/tema.ts';

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
