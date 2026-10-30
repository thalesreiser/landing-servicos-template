import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eventoVital } from '../src/lib/vitais.ts';

test('sends each metric as a GA4 event named after it', () => {
  assert.deepEqual(eventoVital({ name: 'LCP', value: 1234.56, delta: 1234.56, id: 'v5-1', rating: 'good' }), [
    'event',
    'LCP',
    { value: 1235, metric_id: 'v5-1', metric_value: 1234.56, metric_delta: 1234.56, metric_rating: 'good' },
  ]);
});

test('scales CLS by 1000 in value, keeping the raw score in metric_value', () => {
  const [, nome, parametros] = eventoVital({ name: 'CLS', value: 0.123, delta: 0.023, id: 'v5-2', rating: 'needs-improvement' });
  assert.equal(nome, 'CLS');
  assert.equal(parametros.value, 23);
  assert.equal(parametros.metric_value, 0.123);
});

test('reports the delta in value, so GA4 sums add up to the final value', () => {
  const [, , parametros] = eventoVital({ name: 'INP', value: 300, delta: 100, id: 'v5-3', rating: 'needs-improvement' });
  assert.equal(parametros.value, 100);
  assert.equal(parametros.metric_value, 300);
});
