import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';

const exemplo: unknown = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));
const copia = () => structuredClone(exemplo) as { tema: Record<string, unknown>; secoes: Record<string, unknown>[] };

test('the button gesture defaults to padrao and accepts the three styles', () => {
  const nicho = copia();
  delete nicho.tema.botao;
  assert.equal(nichoSchema.parse(nicho).tema.botao, 'padrao');
  for (const botao of ['seta', 'suave', 'carimbo']) {
    nicho.tema.botao = botao;
    assert.equal(nichoSchema.parse(nicho).tema.botao, botao);
  }
  nicho.tema.botao = 'sombra';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});
