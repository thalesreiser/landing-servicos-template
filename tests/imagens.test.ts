import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { caminhoImagem, largurasImagem, resolverImagem } from '../src/lib/imagens.ts';

test('maps a JSON src to the niche assets folder', () => {
  assert.equal(caminhoImagem('advocacia', 'hero.jpg'), '/src/assets/nichos/advocacia/hero.jpg');
  assert.equal(caminhoImagem('advocacia', 'equipe/helena.webp'), '/src/assets/nichos/advocacia/equipe/helena.webp');
});

test('rejects absolute, public, parent and unsupported paths', () => {
  for (const src of ['/img/advocacia/hero.webp', '../exemplo/hero.jpg', 'a/../../b.jpg', 'hero.gif', 'https://example.com/a.jpg', 'hero']) {
    assert.throws(() => caminhoImagem('advocacia', src), /caminho relativo/, src);
  }
});

test('resolves an existing file from the glob result', () => {
  const arquivos = { '/src/assets/nichos/advocacia/hero.jpg': 'hero', '/src/assets/nichos/exemplo/hero.jpg': 'outro' };
  assert.equal(resolverImagem(arquivos, 'advocacia', 'hero.jpg'), 'hero');
});

test('a missing file fails with its expected path and the files that exist', () => {
  const arquivos = { '/src/assets/nichos/advocacia/sobre.jpg': 'sobre', '/src/assets/nichos/exemplo/hero.jpg': 'outro' };
  assert.throws(() => resolverImagem(arquivos, 'advocacia', 'hero.jpg'), (erro: Error) => {
    assert.match(erro.message, /src\/assets\/nichos\/advocacia\/hero\.jpg/);
    assert.match(erro.message, /Arquivos nessa pasta: sobre\.jpg\./);
    assert.doesNotMatch(erro.message, /exemplo/);
    return true;
  });
});

test('srcset widths never upscale the original', () => {
  assert.deepEqual(largurasImagem(2400, [480, 960, 1280]), [480, 960, 1280]);
  assert.deepEqual(largurasImagem(1000, [480, 960, 1280]), [480, 960, 1000]);
  assert.deepEqual(largurasImagem(300, [480, 960]), [300]);
});

// Every image a niche references must exist, so a missing photo is caught before the build.
const pasta = new URL('../nichos/', import.meta.url);
for (const arquivo of readdirSync(pasta).filter((a) => a.endsWith('.json'))) {
  test(`nichos/${arquivo} images exist in src/assets`, () => {
    const nicho = arquivo.replace(/\.json$/, '');
    const fontes: string[] = [];
    JSON.parse(readFileSync(new URL(arquivo, pasta), 'utf8'), (_chave, valor) => {
      if (valor && typeof valor === 'object' && typeof valor.src === 'string' && typeof valor.alt === 'string') fontes.push(valor.src);
      return valor;
    });
    for (const src of fontes) {
      assert.ok(existsSync(new URL(`..${caminhoImagem(nicho, src)}`, import.meta.url)), `${src} não existe`);
    }
  });
}
