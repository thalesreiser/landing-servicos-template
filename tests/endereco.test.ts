import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatarEndereco, urlAbrirMapa, urlMapa } from '../src/lib/endereco.ts';

const endereco = { logradouro: 'Rua A, 10', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', cep: '01000-000' };

test('formats the address on one line', () => {
  assert.equal(formatarEndereco(endereco), 'Rua A, 10 - Centro, São Paulo/SP, 01000-000');
});

test('skips the optional parts', () => {
  assert.equal(formatarEndereco({ logradouro: 'Rua A, 10', cidade: 'Recife', uf: 'PE' }), 'Rua A, 10, Recife/PE');
});

test('builds a keyless Google Maps embed URL', () => {
  const url = new URL(urlMapa(endereco));
  assert.equal(url.origin + url.pathname, 'https://www.google.com/maps');
  assert.equal(url.searchParams.get('q'), 'Rua A, 10 - Centro, São Paulo/SP, 01000-000');
  assert.equal(url.searchParams.get('output'), 'embed');
});

test('builds a Google Maps search link for the address', () => {
  const url = new URL(urlAbrirMapa(endereco));
  assert.equal(url.origin + url.pathname, 'https://www.google.com/maps/search/');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('query'), 'Rua A, 10 - Centro, São Paulo/SP, 01000-000');
});
