import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { escaparXml, familiaGenerica, quebrarLinhas, svgCompartilhamento } from '../src/lib/og.ts';
import { nichoSchema } from '../src/lib/schema.ts';

const pasta = new URL('../nichos/', import.meta.url);
const ler = (arquivo: string): Record<string, any> => JSON.parse(readFileSync(new URL(arquivo, pasta), 'utf8'));

test('escapes XML special characters', () => {
  assert.equal(escaparXml(`"A" & <b>'s`), '&quot;A&quot; &amp; &lt;b&gt;&apos;s');
});

test('wraps words without exceeding the line width', () => {
  assert.deepEqual(quebrarLinhas('um dois tres quatro', 9, 3), ['um dois', 'tres', 'quatro']);
});

test('cuts the text with an ellipsis after the last line', () => {
  const linhas = quebrarLinhas('um dois tres quatro cinco seis sete oito', 9, 2);
  assert.equal(linhas.length, 2);
  assert.ok(linhas[1]!.endsWith('…'));
  assert.ok(linhas.every((linha) => linha.length <= 9));
});

for (const arquivo of readdirSync(pasta).filter((nome) => nome.endsWith('.json'))) {
  test(`nichos/${arquivo} share image is a 1200x630 SVG with the niche name`, () => {
    const dados = ler(arquivo);
    const svg = svgCompartilhamento(nichoSchema.parse(dados));
    assert.match(svg, /^<svg [^>]*width="1200" height="630"/);
    assert.ok(svg.includes(escaparXml(dados.site.nome)));
    assert.ok(svg.includes(dados.tema.cor_primaria));
  });
}

test('the share image survives hostile text', () => {
  const dados = ler('exemplo.json');
  dados.site.nome = 'A & B <Consultoria>';
  const svg = svgCompartilhamento(nichoSchema.parse(dados));
  assert.ok(svg.includes('A &amp; B &lt;Consultoria&gt;'));
  assert.equal(svg.includes('<Consultoria>'), false);
});

test('reduces a CSS font stack to its generic family', () => {
  assert.equal(familiaGenerica('"Source Serif 4", Georgia, serif'), 'serif');
  assert.equal(familiaGenerica('Nunito, system-ui, sans-serif'), 'sans-serif');
  assert.equal(familiaGenerica('system-ui'), 'sans-serif');
});
