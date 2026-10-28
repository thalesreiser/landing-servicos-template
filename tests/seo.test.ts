import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema, type Nicho } from '../src/lib/schema.ts';
import { gerarJsonLd, localeOg, serializarJsonLd, urlAbsoluta } from '../src/lib/seo.ts';

const ler = (nome: string): Record<string, any> =>
  JSON.parse(readFileSync(new URL(`../nichos/${nome}.json`, import.meta.url), 'utf8'));
const nicho = (dados: unknown): Nicho => nichoSchema.parse(dados);
const grafo = (n: Nicho) => gerarJsonLd(n)['@graph'] as Record<string, any>[];

test('builds absolute URLs only when site.url is set', () => {
  assert.equal(urlAbsoluta('https://a.pages.dev', '/og.png'), 'https://a.pages.dev/og.png');
  assert.equal(urlAbsoluta('https://a.pages.dev/', '/politica-de-privacidade/'), 'https://a.pages.dev/politica-de-privacidade/');
  assert.equal(urlAbsoluta(undefined, '/'), undefined);
});

test('converts the language tag to an Open Graph locale', () => {
  assert.equal(localeOg('pt-BR'), 'pt_BR');
  assert.equal(localeOg('en'), 'en');
});

test('uses the schema.org type of each niche', () => {
  assert.equal(grafo(nicho(ler('advocacia')))[0]!['@type'], 'LegalService');
  assert.equal(grafo(nicho(ler('fisioterapia')))[0]!['@type'], 'Physiotherapy');
  const semTipo = ler('exemplo');
  delete semTipo.site.schema_tipo;
  assert.equal(grafo(nicho(semTipo))[0]!['@type'], 'LocalBusiness');
});

test('rejects a schema.org type outside the allowed list', () => {
  const dados = ler('exemplo');
  dados.site.schema_tipo = 'Restaurant';
  assert.equal(nichoSchema.safeParse(dados).success, false);
});

test('describes the business with contact, address, hours and image', () => {
  const dados = ler('advocacia');
  dados.contato.endereco.cep = '04538-132';
  const [negocio] = grafo(nicho(dados));
  assert.equal(gerarJsonLd(nicho(dados))['@context'], 'https://schema.org');
  assert.equal(negocio!.name, 'Ribeiro Antunes Advocacia');
  assert.equal(negocio!.url, 'https://advocacia-demo.pages.dev/');
  assert.equal(negocio!['@id'], 'https://advocacia-demo.pages.dev/#negocio');
  assert.equal(negocio!.image, 'https://advocacia-demo.pages.dev/og.png');
  assert.equal(negocio!.telephone, dados.contato.telefone);
  assert.equal(negocio!.email, dados.contato.email);
  assert.deepEqual(negocio!.address, {
    '@type': 'PostalAddress',
    streetAddress: 'Avenida Brigadeiro Faria Lima - Itaim Bibi',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    postalCode: '04538-132',
    addressCountry: 'BR',
  });
  assert.deepEqual(negocio!.openingHours, dados.contato.horario);
});

test('builds a FAQPage from the active FAQ sections', () => {
  const dados = ler('exemplo');
  const faq = dados.secoes.find((s: { tipo: string }) => s.tipo === 'faq');
  const pagina = grafo(nicho(dados)).find((item) => item['@type'] === 'FAQPage');
  assert.equal(pagina!.mainEntity.length, faq.itens.length);
  assert.deepEqual(pagina!.mainEntity[0], {
    '@type': 'Question',
    name: faq.itens[0].pergunta,
    acceptedAnswer: { '@type': 'Answer', text: faq.itens[0].resposta },
  });
  faq.ativo = false;
  assert.equal(grafo(nicho(dados)).length, 1);
});

test('leaves out what the niche does not have', () => {
  const dados = ler('exemplo');
  delete dados.site.url;
  delete dados.contato.endereco;
  delete dados.contato.horario;
  delete dados.contato.telefone;
  dados.secoes = dados.secoes.filter((s: { tipo: string }) => s.tipo !== 'faq' && s.tipo !== 'mapa');
  const ld = JSON.parse(serializarJsonLd(gerarJsonLd(nicho(dados))));
  assert.equal(ld['@graph'].length, 1);
  const [negocio] = ld['@graph'];
  for (const chave of ['url', '@id', 'image', 'address', 'openingHours']) assert.equal(chave in negocio, false, chave);
  // Falls back to the WhatsApp number.
  assert.equal(negocio.telephone, `+${dados.contato.whatsapp}`);
});

test('escapes the JSON so it cannot close the script tag', () => {
  const texto = serializarJsonLd({ a: '</script><script>alert(1)</script>', b: 'x & y' });
  assert.equal(/[<>&]/.test(texto), false);
  assert.deepEqual(JSON.parse(texto), { a: '</script><script>alert(1)</script>', b: 'x & y' });
});
