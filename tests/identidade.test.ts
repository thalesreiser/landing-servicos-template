import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';
import { divisoresDasSecoes, recorteDivisor } from '../src/lib/tema.ts';

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

test('the section divider defaults to the plain cut', () => {
  const nicho = copia();
  delete nicho.tema.divisor;
  assert.equal(nichoSchema.parse(nicho).tema.divisor, 'reto');
  nicho.tema.divisor = 'rasgo';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('dividers: never on the first section, filete everywhere, shapes only where the color changes', () => {
  const fundos = ['superficie', 'fundo', 'fundo', 'primaria', 'superficie'] as const;
  assert.deepEqual(divisoresDasSecoes([...fundos], 'reto'), [false, false, false, false, false]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'filete'), [false, true, true, true, true]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'onda'), [false, true, false, true, true]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'diagonal'), [false, true, false, true, true]);
});

test('the wave is deterministic, changes with the index and stays inside the box', () => {
  assert.equal(recorteDivisor('onda', 3), recorteDivisor('onda', 3));
  const ondas = [1, 2, 3, 4, 5].map((i) => recorteDivisor('onda', i));
  assert.equal(new Set(ondas).size, ondas.length);
  for (const onda of ondas) {
    assert.match(onda, /^polygon\(0% [\d.]+%, .*, 100% 100%, 0 100%\)$/);
    const valores = [...onda.matchAll(/(-?[\d.]+)%/g)].map((m) => Number(m[1]));
    assert.ok(valores.every((v) => v >= 0 && v <= 100), onda);
    // The crest rises at least 40% of the box (about 20 px of the 48 px divider).
    const ys = valores.filter((_, k) => k % 2 === 1);
    assert.ok(Math.min(...ys) <= 60, onda);
  }
});

test('the slope alternates sides from one boundary to the next', () => {
  assert.notEqual(recorteDivisor('diagonal', 1), recorteDivisor('diagonal', 2));
  assert.equal(recorteDivisor('diagonal', 1), recorteDivisor('diagonal', 3));
});
