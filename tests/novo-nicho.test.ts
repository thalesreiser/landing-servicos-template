import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { criarNicho } from '../scripts/novo-nicho.ts';
import { nichoSchema } from '../src/lib/schema.ts';

const pastas: string[] = [];
after(() => pastas.forEach((pasta) => rmSync(pasta, { recursive: true, force: true })));

/** Temporary nichos/ folder with a copy of the example niche. */
function pastaTemporaria(): URL {
  const pasta = mkdtempSync(join(tmpdir(), 'novo-nicho-'));
  pastas.push(pasta);
  copyFileSync(new URL('../nichos/exemplo.json', import.meta.url), join(pasta, 'exemplo.json'));
  return pathToFileURL(`${pasta}/`);
}

test('rejects invalid names', () => {
  const pasta = pastaTemporaria();
  for (const nome of ['', 'Clinica', 'clínica', 'com espaco', '-inicio', 'fim-', 'duplo--hifen', '../fora', 'a_b']) {
    assert.throws(() => criarNicho(nome, pasta), /nome inválido/, nome);
  }
  assert.deepEqual(readdirSync(pasta), ['exemplo.json']);
});

test('refuses to overwrite an existing niche', () => {
  const pasta = pastaTemporaria();
  writeFileSync(new URL('outro.json', pasta), '{"intacto": true}');
  assert.throws(() => criarNicho('outro', pasta), /já existe/);
  assert.throws(() => criarNicho('exemplo', pasta), /já existe/);
  assert.equal(readFileSync(new URL('outro.json', pasta), 'utf8'), '{"intacto": true}');
});

test('copies the example without publicacao and site.url, still a valid demo', () => {
  const pasta = pastaTemporaria();
  const arquivo = criarNicho('clinica-2', pasta);
  const copia = JSON.parse(readFileSync(arquivo, 'utf8'));
  const exemplo = JSON.parse(readFileSync(new URL('exemplo.json', pasta), 'utf8'));

  assert.equal(copia.publicacao, undefined);
  assert.equal(copia.site.url, undefined);
  assert.equal(copia.demo, true);
  assert.deepEqual(copia.secoes, exemplo.secoes);
  const resultado = nichoSchema.safeParse(copia);
  assert.ok(resultado.success, resultado.error?.message);
});
