import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gradeEquipe } from '../src/lib/equipe.ts';

test('one or two people: a narrower list, centred', () => {
  assert.deepEqual(gradeEquipe(1), { lista: 'mx-auto max-w-md' });
  assert.deepEqual(gradeEquipe(2), { lista: 'mx-auto max-w-4xl sm:grid-cols-2' });
});

test('three people fill three columns; the third card spans the tablet row', () => {
  assert.deepEqual(gradeEquipe(3), { lista: 'sm:grid-cols-2 lg:grid-cols-3', cartao: 'sm:max-lg:last:col-span-2' });
});

test('four people take four columns on desktop', () => {
  assert.deepEqual(gradeEquipe(4), { lista: 'sm:grid-cols-2 lg:grid-cols-4' });
});

test('larger teams wrap in three full-width columns', () => {
  for (const n of [5, 6, 9]) assert.deepEqual(gradeEquipe(n), { lista: 'sm:grid-cols-2 lg:grid-cols-3' });
});

test('only the narrowed grids are centred', () => {
  for (let n = 1; n <= 8; n++) {
    const { lista } = gradeEquipe(n);
    assert.equal(lista.includes('mx-auto'), lista.includes('max-w-'), `n=${n}`);
  }
});
