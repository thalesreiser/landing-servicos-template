import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classificar,
  formatarBytes,
  formatarLimites,
  formatarMetrica,
  formatarNota,
  inpDeEventos,
  mediana,
} from '../src/lib/metricas.ts';

test('classifies with Google thresholds, bounds inclusive', () => {
  assert.equal(classificar('TTFB', 800), 'bom');
  assert.equal(classificar('TTFB', 801), 'melhorar');
  assert.equal(classificar('TTFB', 1800), 'melhorar');
  assert.equal(classificar('TTFB', 1801), 'ruim');
  assert.equal(classificar('LCP', 2500), 'bom');
  assert.equal(classificar('LCP', 4000), 'melhorar');
  assert.equal(classificar('LCP', 4001), 'ruim');
  assert.equal(classificar('INP', 200), 'bom');
  assert.equal(classificar('INP', 500), 'melhorar');
  assert.equal(classificar('INP', 501), 'ruim');
  assert.equal(classificar('CLS', 0.1), 'bom');
  assert.equal(classificar('CLS', 0.25), 'melhorar');
  assert.equal(classificar('CLS', 0.26), 'ruim');
  assert.equal(classificar('TBT', 0), 'bom');
});

test('median of odd and even counts, ignoring missing values', () => {
  assert.equal(mediana([3, 1, 2]), 2);
  assert.equal(mediana([4, 1, 3, 2]), 2.5);
  assert.equal(mediana([5, undefined, null, Number.NaN]), 5);
  assert.equal(mediana([]), undefined);
});

test('does not reorder the input', () => {
  const valores = [3, 1, 2];
  mediana(valores);
  assert.deepEqual(valores, [3, 1, 2]);
});

test('formats values in pt-BR with the unit of each metric', () => {
  assert.equal(formatarMetrica('TTFB', 420), '0,42 s');
  assert.equal(formatarMetrica('LCP', 1234), '1,23 s');
  assert.equal(formatarMetrica('INP', 56.4), '56 ms');
  assert.equal(formatarMetrica('TBT', 1234), '1.234 ms');
  assert.equal(formatarMetrica('CLS', 0.0042), '0,00');
  assert.equal(formatarMetrica('CLS', 0.123), '0,12');
});

test('formats the thresholds', () => {
  assert.equal(formatarLimites('LCP'), 'Bom: até 2,5 s · Ruim: acima de 4,0 s');
  assert.equal(formatarLimites('TTFB'), 'Bom: até 0,8 s · Ruim: acima de 1,8 s');
  assert.equal(formatarLimites('INP'), 'Bom: até 200 ms · Ruim: acima de 500 ms');
  assert.equal(formatarLimites('CLS'), 'Bom: até 0,1 · Ruim: acima de 0,25');
});

test('formats bytes and scores', () => {
  assert.equal(formatarBytes(345_600), '346 KB');
  assert.equal(formatarBytes(1_250_000), '1,3 MB');
  assert.equal(formatarNota(0.987), '99');
  assert.equal(formatarNota(1), '100');
  assert.equal(formatarNota(null), '–');
});

test('INP is the slowest interaction, ignoring events outside interactions', () => {
  const eventos = [
    { interactionId: 0, duration: 400 },
    { interactionId: 7, duration: 40 },
    { interactionId: 7, duration: 56 },
    { interactionId: 9, duration: 48 },
  ];
  assert.equal(inpDeEventos(eventos), 56);
  assert.equal(inpDeEventos([{ interactionId: 0, duration: 64 }]), undefined);
  assert.equal(inpDeEventos([]), undefined);
});
