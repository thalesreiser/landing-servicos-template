import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';
import { termosEncontrados } from '../src/lib/termos.ts';

const pasta = new URL('../nichos/', import.meta.url);
const arquivos = readdirSync(pasta).filter((arquivo) => arquivo.endsWith('.json'));
const ler = (arquivo: string): unknown => JSON.parse(readFileSync(new URL(arquivo, pasta), 'utf8'));

test('there is at least one niche', () => {
  assert.ok(arquivos.length > 0);
});

for (const arquivo of arquivos) {
  test(`nichos/${arquivo} matches the schema`, () => {
    const resultado = nichoSchema.safeParse(ler(arquivo));
    assert.ok(resultado.success, resultado.error?.message);
  });

  test(`nichos/${arquivo} demo flag shows the demo notice`, () => {
    const nicho = nichoSchema.parse(ler(arquivo));
    // Every niche in this repo is a demo with fictitious data.
    assert.equal(nicho.demo, true);
  });

  test(`nichos/${arquivo} uses none of its vetoed terms`, () => {
    const dados = ler(arquivo);
    const termos = nichoSchema.parse(dados).revisao?.termos_vetados ?? [];
    assert.deepEqual(termosEncontrados(dados, termos), []);
  });
}

const exemplo = () => structuredClone(ler('exemplo.json')) as { secoes: Record<string, unknown>[]; contato: Record<string, unknown> };

test('rejects an unknown icon', () => {
  const nicho = exemplo();
  const servicos = nicho.secoes.find((s) => s.tipo === 'servicos') as { itens: { icone: string }[] };
  servicos.itens[0]!.icone = 'nao-existe';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('rejects duplicated section ids', () => {
  const nicho = exemplo();
  nicho.secoes.push({ tipo: 'faq', titulo: 'De novo', itens: [{ pergunta: 'P', resposta: 'R' }] });
  const resultado = nichoSchema.safeParse(nicho);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.message, /ids de seção repetidos: faq/);
});

test('requires an address when the map has no embed_url', () => {
  const nicho = exemplo();
  delete nicho.contato.endereco;
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('requires options on select fields', () => {
  const nicho = exemplo();
  const form = nicho.secoes.find((s) => s.tipo === 'formulario') as { campos: { tipo: string; opcoes?: string[] }[] };
  delete form.campos.find((c) => c.tipo === 'select')!.opcoes;
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('rejects a convenios section without items', () => {
  const nicho = exemplo();
  const convenios = nicho.secoes.find((s) => s.tipo === 'convenios') as { itens: string[] };
  convenios.itens = [];
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('rejects a WhatsApp number without country code', () => {
  const nicho = exemplo();
  nicho.contato.whatsapp = '11999990000';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('rejects a self-hosted font that no font stack uses', () => {
  const nicho = exemplo() as ReturnType<typeof exemplo> & { tema: Record<string, unknown> };
  nicho.tema.fontes = [{ familia: 'Inter', pesos: [400] }];
  const resultado = nichoSchema.safeParse(nicho);
  assert.equal(resultado.success, false);
  assert.match(resultado.error!.issues[0]!.message, /"Inter" não aparece/);
  nicho.tema.fonte_texto = 'Inter, system-ui, sans-serif';
  assert.equal(nichoSchema.safeParse(nicho).success, true);
});

test('image src must be a path inside the niche assets folder', () => {
  const nicho = exemplo();
  const hero = nicho.secoes.find((s) => s.tipo === 'hero')!;
  hero.imagem = { src: '/img/exemplo/hero.webp', alt: '' };
  assert.equal(nichoSchema.safeParse(nicho).success, false);
  hero.imagem = { src: 'hero.webp', alt: '' };
  assert.equal(nichoSchema.safeParse(nicho).success, true);
});

test('hero accepts up to four highlights', () => {
  const nicho = exemplo();
  const hero = nicho.secoes.find((s) => s.tipo === 'hero')!;
  hero.destaques = Array.from({ length: 4 }, (_, i) => ({ rotulo: `Rótulo ${i}`, valor: 'Valor' }));
  assert.equal(nichoSchema.safeParse(nicho).success, true);
  (hero.destaques as unknown[]).push({ rotulo: 'Quinto', valor: 'Valor' });
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('header WhatsApp button label defaults to "WhatsApp"', () => {
  const nicho = exemplo();
  delete nicho.contato.rotulo_cabecalho;
  assert.equal(nichoSchema.parse(nicho).contato.rotulo_cabecalho, 'WhatsApp');
  nicho.contato.rotulo_cabecalho = 'Agendar';
  assert.equal(nichoSchema.parse(nicho).contato.rotulo_cabecalho, 'Agendar');
});
