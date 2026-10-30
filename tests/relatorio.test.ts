import assert from 'node:assert/strict';
import { test } from 'node:test';
import { METRICAS } from '../src/lib/metricas.ts';
import { escapar, formatarData, gerarHtml, resumir, TEMA_PADRAO, type Execucao, type Relatorio } from '../scripts/lib/relatorio.ts';

const execucao = (lcp: number, desempenho: number, indexavel = true): Execucao => ({
  metricas: { TTFB: 300, LCP: lcp, INP: 48, CLS: 0.01, TBT: 20 },
  notas: { desempenho, acessibilidade: 1, boas_praticas: 1, seo: 1 },
  peso_bytes: 120_000,
  requisicoes: 6,
  indexavel,
});

function relatorio(extra: Partial<Relatorio> = {}): Relatorio {
  return {
    url: 'https://exemplo.pages.dev',
    nome: 'Clínica <Teste>',
    data: '2026-10-30T17:05:00.000Z',
    lighthouse: '13.5.0',
    navegador: 'Chrome 156',
    execucoes: 3,
    interacoes: ['abrir uma pergunta frequente'],
    dispositivos: {
      celular: resumir([execucao(2600, 0.9), execucao(4100, 0.8), execucao(2000, 1)], METRICAS),
      computador: resumir([execucao(500, 1), execucao(700, 1), execucao(600, 1)], METRICAS),
    },
    tema: TEMA_PADRAO,
    ...extra,
  };
}

test('summarizes each metric and score by its own median', () => {
  const medicao = resumir([execucao(2600, 0.9), execucao(4100, 0.8), execucao(2000, 1)], METRICAS);
  assert.equal(medicao.metricas.LCP, 2600);
  assert.equal(medicao.notas.desempenho, 0.9);
  assert.equal(medicao.peso_bytes, 120_000);
  assert.equal(medicao.execucoes.length, 3);
  assert.equal(medicao.indexavel, true);
});

test('a page is non-indexable when any run saw noindex', () => {
  assert.equal(resumir([execucao(1, 1), execucao(1, 1, false)], METRICAS).indexavel, false);
});

test('escapes text that goes into the HTML', () => {
  assert.equal(escapar(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('formats the date in Brasília time', () => {
  assert.equal(formatarData('2026-10-30T17:05:00.000Z'), '30 de outubro de 2026, 14:05');
});

test('the report shows values, statuses and thresholds in pt-BR', () => {
  const html = gerarHtml(relatorio());
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /Clínica &lt;Teste&gt;/);
  assert.match(html, /2,60 s<\/span><span class="status melhorar">Precisa melhorar/);
  assert.match(html, /0,60 s<\/span><span class="status bom">Bom/);
  assert.match(html, /Bom: até 2,5 s · Ruim: acima de 4,0 s/);
  assert.match(html, /abrir uma pergunta frequente/);
  assert.match(html, /3 vezes em cada perfil/);
  assert.doesNotMatch(html, /noindex<\/code>/);
});

test('the report is self-contained: no external scripts, styles, images or fonts', () => {
  const html = gerarHtml(relatorio());
  assert.doesNotMatch(html, /<(script|link|img|iframe)\b/i);
  assert.doesNotMatch(html, /url\(|@import/i);
});

test('explains the SEO score of a noindex page', () => {
  const sem = relatorio();
  sem.dispositivos.celular.indexavel = false;
  assert.match(gerarHtml(sem), /noindex<\/code>/);
});

test('a missing metric is shown as not measured', () => {
  const sem = relatorio();
  delete sem.dispositivos.computador.metricas.INP;
  assert.match(gerarHtml(sem), /não medido/);
});
