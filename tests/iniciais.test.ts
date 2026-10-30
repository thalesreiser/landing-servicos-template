import assert from 'node:assert/strict';
import { test } from 'node:test';
import { iniciais } from '../src/lib/iniciais.ts';

test('uses the first and last name', () => {
  assert.equal(iniciais('Helena Ribeiro Antunes'), 'HA');
  assert.equal(iniciais('Mariana Lopes'), 'ML');
});

test('skips name particles and extra spaces', () => {
  assert.equal(iniciais('  Ana  de Souza '), 'AS');
  assert.equal(iniciais('João dos Santos e Silva'), 'JS');
});

test('a single name gives one letter', () => {
  assert.equal(iniciais('Camila'), 'C');
  assert.equal(iniciais('élcio'), 'É');
  assert.equal(iniciais(''), '');
});
