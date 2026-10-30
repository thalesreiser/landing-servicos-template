// Lab performance report: data model, median aggregation and the client-facing HTML (pt-BR).
// Pure functions; scripts/metricas.ts runs Lighthouse and writes the files.
import {
  classificar,
  formatarBytes,
  formatarLimites,
  formatarMetrica,
  formatarNota,
  mediana,
  ROTULOS_STATUS,
  type Metrica,
} from '../../src/lib/metricas.ts';

export const DISPOSITIVOS = ['celular', 'computador'] as const;
export type Dispositivo = (typeof DISPOSITIVOS)[number];

export const NOTAS = ['desempenho', 'acessibilidade', 'boas_praticas', 'seo'] as const;
export type Nota = (typeof NOTAS)[number];

/** One Lighthouse run (navigation plus the scripted interactions). */
export interface Execucao {
  metricas: Partial<Record<Metrica, number>>;
  notas: Partial<Record<Nota, number>>;
  peso_bytes?: number | undefined;
  requisicoes?: number | undefined;
  /** False when the page asks search engines not to index it (demos use noindex on purpose). */
  indexavel?: boolean | undefined;
  /** Lighthouse's CPU benchmark of the measuring machine; low values mean a busy or slow machine. */
  indice_maquina?: number | undefined;
}

export interface Medicao {
  metricas: Partial<Record<Metrica, number>>;
  notas: Partial<Record<Nota, number>>;
  peso_bytes?: number | undefined;
  requisicoes?: number | undefined;
  indexavel?: boolean | undefined;
  execucoes: Execucao[];
}

export interface Tema {
  cor_primaria: string;
  cor_primaria_contraste: string;
  cor_destaque: string;
  cor_fundo: string;
  cor_superficie: string;
  cor_texto: string;
  cor_texto_suave: string;
}

export interface Relatorio {
  url: string;
  nome: string;
  /** ISO date and time of the measurement. */
  data: string;
  lighthouse: string;
  navegador: string;
  /** Runs per device. */
  execucoes: number;
  /** What the scripted interactions did, for the INP note. */
  interacoes: string[];
  dispositivos: Record<Dispositivo, Medicao>;
  tema: Tema;
}

/** Neutral colors for a URL that matches no niche. */
export const TEMA_PADRAO: Tema = {
  cor_primaria: '#1F2937',
  cor_primaria_contraste: '#FFFFFF',
  cor_destaque: '#1D4ED8',
  cor_fundo: '#FFFFFF',
  cor_superficie: '#F3F4F6',
  cor_texto: '#111827',
  cor_texto_suave: '#4B5563',
};

function medianaDe<T extends string>(execucoes: Partial<Record<T, number>>[], chaves: readonly T[]): Partial<Record<T, number>> {
  const saida: Partial<Record<T, number>> = {};
  for (const chave of chaves) {
    const valor = mediana(execucoes.map((e) => e[chave]));
    if (valor !== undefined) saida[chave] = valor;
  }
  return saida;
}

/** Median of each metric and score across the runs (each value on its own, as with any lab median). */
export function resumir(execucoes: Execucao[], metricas: readonly Metrica[]): Medicao {
  return {
    metricas: medianaDe(execucoes.map((e) => e.metricas), metricas),
    notas: medianaDe(execucoes.map((e) => e.notas), NOTAS),
    peso_bytes: mediana(execucoes.map((e) => e.peso_bytes)),
    requisicoes: mediana(execucoes.map((e) => e.requisicoes)),
    indexavel: execucoes.some((e) => e.indexavel === false) ? false : execucoes.length ? true : undefined,
    execucoes,
  };
}

export const ROTULOS_DISPOSITIVO: Record<Dispositivo, string> = {
  celular: 'Celular',
  computador: 'Computador',
};

const ROTULOS_NOTA: Record<Nota, string> = {
  desempenho: 'Desempenho',
  acessibilidade: 'Acessibilidade',
  boas_praticas: 'Boas práticas',
  seo: 'SEO',
};

export const DESCRICOES: Record<'TTFB' | 'LCP' | 'INP' | 'CLS', { nome: string; texto: string }> = {
  TTFB: {
    nome: 'Resposta do servidor (TTFB)',
    texto: 'Tempo até o servidor começar a enviar a página: quanto menor, mais cedo o visitante começa a ver o conteúdo.',
  },
  LCP: {
    nome: 'Carregamento do conteúdo principal (LCP)',
    texto:
      'Tempo até o maior elemento da tela, como o título principal ou a foto de abertura, aparecer: é quando o visitante percebe que a página carregou.',
  },
  INP: {
    nome: 'Resposta a toques e cliques (INP)',
    texto: 'Rapidez com que a página reage a toques e cliques: valores baixos significam que botões e menus respondem sem atraso perceptível.',
  },
  CLS: {
    nome: 'Estabilidade visual (CLS)',
    texto:
      'Quanto o conteúdo muda de lugar sozinho durante o carregamento: perto de zero, textos e botões não “pulam” enquanto o visitante lê ou toca na tela.',
  },
};

const PRINCIPAIS = ['TTFB', 'LCP', 'INP', 'CLS'] as const;

export function escapar(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** "30 de outubro de 2026, 14:05" in Brasília time. */
export function formatarData(iso: string): string {
  const data = new Date(iso);
  const dia = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  return `${dia}, ${hora}`;
}

function celulaMetrica(metrica: Metrica, valor: number | undefined): string {
  if (valor === undefined) return '<td class="valor"><span class="numero">–</span><span class="status sem">não medido</span></td>';
  const status = classificar(metrica, valor);
  return `<td class="valor"><span class="numero">${formatarMetrica(metrica, valor)}</span><span class="status ${status}">${ROTULOS_STATUS[status]}</span></td>`;
}

function linhaMetrica(metrica: (typeof PRINCIPAIS)[number], relatorio: Relatorio): string {
  const { nome, texto } = DESCRICOES[metrica];
  const celulas = DISPOSITIVOS.map((d) => celulaMetrica(metrica, relatorio.dispositivos[d].metricas[metrica])).join('');
  return `<tr><th scope="row"><span class="nome">${nome}</span><span class="explicacao">${texto}</span><span class="limites">${formatarLimites(metrica)}</span></th>${celulas}</tr>`;
}

function linhaContexto(rotulo: string, valores: string[]): string {
  return `<tr><th scope="row">${rotulo}</th>${valores.map((v) => `<td>${v}</td>`).join('')}</tr>`;
}

function contexto(relatorio: Relatorio): string {
  const por = (f: (m: Medicao) => string) => DISPOSITIVOS.map((d) => f(relatorio.dispositivos[d]));
  const linhas = [
    linhaContexto(
      'Tempo de bloqueio no carregamento (TBT)<span class="explicacao">Estimativa de laboratório para o INP: tempo em que a página fica ocupada e não consegue responder. Referência do Lighthouse: bom até 200 ms.</span>',
      por((m) => (m.metricas.TBT === undefined ? '–' : formatarMetrica('TBT', m.metricas.TBT))),
    ),
    linhaContexto(
      'Peso da página<span class="explicacao">Total transferido na primeira visita (HTML, imagens, fontes, scripts).</span>',
      por((m) => (m.peso_bytes === undefined ? '–' : `${formatarBytes(m.peso_bytes)} em ${Math.round(m.requisicoes ?? 0)} arquivos`)),
    ),
    ...NOTAS.map((nota) => linhaContexto(`Nota Lighthouse: ${ROTULOS_NOTA[nota]}`, por((m) => `${formatarNota(m.notas[nota])} / 100`))),
  ];
  return linhas.join('');
}

function cabecalhoDispositivos(primeira: string): string {
  return `<thead><tr><th scope="col">${primeira}</th>${DISPOSITIVOS.map((d) => `<th scope="col">${ROTULOS_DISPOSITIVO[d]}</th>`).join('')}</tr></thead>`;
}

function textoInteracoes(interacoes: string[]): string {
  if (interacoes.length === 0) return 'nenhuma interação pôde ser simulada nesta página';
  return interacoes.join(', ');
}

/** Self-contained HTML (inline CSS, system fonts, no external requests), printable to A4. */
export function gerarHtml(relatorio: Relatorio): string {
  const t = relatorio.tema;
  const nome = escapar(relatorio.nome);
  const url = escapar(relatorio.url);
  const semIndexar = DISPOSITIVOS.some((d) => relatorio.dispositivos[d].indexavel === false);
  const notaSeo = semIndexar
    ? '<p class="nota">A página pede aos buscadores que não a indexem (<code>noindex</code>), como todo site de demonstração; isso reduz a nota de SEO e some quando o site é publicado como definitivo.</p>'
    : '';
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Relatório de desempenho · ${nome}</title>
<style>
:root{--primaria:${t.cor_primaria};--primaria-contraste:${t.cor_primaria_contraste};--destaque:${t.cor_destaque};--fundo:${t.cor_fundo};--superficie:${t.cor_superficie};--texto:${t.cor_texto};--suave:${t.cor_texto_suave}}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:var(--fundo);color:var(--texto);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.pagina{max-width:960px;margin:0 auto;padding:0 16px 48px}
header{background:var(--primaria);color:var(--primaria-contraste);padding:32px 16px 28px}
header .pagina{padding-bottom:0}
header p{margin:0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.9}
h1{margin:6px 0 4px;font-size:28px;line-height:1.2}
header .url{font-size:15px;opacity:.95;word-break:break-all}
.dados{display:flex;flex-wrap:wrap;gap:8px 28px;margin:20px 0 8px;color:var(--suave);font-size:14px}
.dados strong{color:var(--texto);font-weight:600}
h2{margin:32px 0 12px;font-size:19px}
h2::before{content:"";display:block;width:40px;height:3px;background:var(--destaque);margin-bottom:10px}
table{width:100%;border-collapse:collapse;table-layout:fixed;background:var(--fundo)}
th,td{padding:14px 12px;border-bottom:1px solid color-mix(in srgb,var(--texto) 14%,transparent);text-align:left;vertical-align:top}
thead th{font-size:13px;color:var(--suave);font-weight:600;text-transform:uppercase;letter-spacing:.05em;border-bottom-width:2px}
thead th:first-child{width:58%}
tbody th{font-weight:600}
.nome{display:block;font-size:16px}
.explicacao{display:block;margin-top:4px;font-weight:400;color:var(--suave);font-size:14px}
.limites{display:block;margin-top:6px;font-weight:400;font-size:13px;color:var(--suave)}
.valor .numero{display:block;font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.status{display:inline-block;margin-top:6px;padding:2px 10px;border-radius:999px;font-size:13px;font-weight:600;border:1px solid}
.status::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;vertical-align:1px}
.bom{background:#E4F4EA;color:#0B5A2C;border-color:#0B5A2C}
.bom::before{background:#0B5A2C;border-radius:50%}
.melhorar{background:#FFF2D6;color:#734600;border-color:#734600}
.melhorar::before{background:#734600}
.ruim{background:#FDE4E2;color:#9B1C15;border-color:#9B1C15}
.ruim::before{width:0;height:0;background:none;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:9px solid #9B1C15}
.sem{color:var(--suave);border-color:var(--suave)}
.sem::before{display:none}
.contexto td{font-variant-numeric:tabular-nums}
.caixa{background:var(--superficie);padding:16px 20px;margin-top:12px}
.caixa p{margin:0 0 10px}
.caixa p:last-child{margin-bottom:0}
.nota{color:var(--suave);font-size:14px}
code{font-size:13px}
footer{margin-top:32px;color:var(--suave);font-size:13px}
@media (max-width:640px){
  table,thead,tbody,tr,th,td{display:block;width:100%}
  thead{display:none}
  tbody th{width:100%;border-bottom:0;padding-bottom:4px}
  td{display:inline-block;width:50%;border-bottom:0}
  td::before{display:block;font-size:12px;color:var(--suave);text-transform:uppercase;letter-spacing:.05em}
  td:nth-of-type(1)::before{content:"Celular"}
  td:nth-of-type(2)::before{content:"Computador"}
  tr{border-bottom:1px solid color-mix(in srgb,var(--texto) 14%,transparent)}
}
@page{size:A4;margin:14mm}
@media print{
  body{font-size:12px}
  header{padding:18px 16px}
  h1{font-size:22px}
  h2{margin-top:20px;break-after:avoid;break-inside:avoid}
  th,td{padding:8px 10px}
  .nome{font-size:13px}
  .explicacao,.nota{font-size:11px}
  .limites,thead th,footer{font-size:10px}
  .valor .numero{font-size:17px}
  tr,.caixa{break-inside:avoid}
}
</style>
</head>
<body>
<header><div class="pagina"><p>Relatório de desempenho</p><h1>${nome}</h1><div class="url">${url}</div></div></header>
<main class="pagina">
<div class="dados">
<span>Data: <strong>${formatarData(relatorio.data)}</strong></span>
<span>Dispositivos: <strong>celular e computador</strong></span>
<span>Medições: <strong>${relatorio.execucoes} por dispositivo (mediana)</strong></span>
</div>

<h2>Principais indicadores</h2>
<p class="nota">São os indicadores que o Google usa para avaliar a experiência de quem visita a página (Core Web Vitals: LCP, INP e CLS), mais o tempo de resposta do servidor. Cada um é classificado pelas faixas oficiais do Google.</p>
<table>${cabecalhoDispositivos('Indicador')}<tbody>${PRINCIPAIS.map((m) => linhaMetrica(m, relatorio)).join('')}</tbody></table>

<h2>Contexto</h2>
<table class="contexto">${cabecalhoDispositivos('Medida')}<tbody>${contexto(relatorio)}</tbody></table>
${notaSeo}

<h2>Como estes números foram obtidos</h2>
<div class="caixa">
<p><strong>Medição de laboratório.</strong> A página foi aberta ${relatorio.execucoes} ${relatorio.execucoes === 1 ? 'vez' : 'vezes'} em cada perfil, sem cache, com o Lighthouse ${escapar(relatorio.lighthouse)} (a ferramenta do Google por trás do PageSpeed Insights), e o relatório mostra a mediana. Celular: aparelho intermediário simulado, com 4G lenta e processador mais lento; computador: tela larga e conexão de banda larga simulada.</p>
<p><strong>TTFB</strong> é o tempo real de resposta do servidor, medido a partir da conexão de quem gerou o relatório. <strong>INP</strong> depende de interações de verdade: aqui ele foi medido com toques simulados (${escapar(textoInteracoes(relatorio.interacoes))}), e o TBT aparece no contexto como estimativa complementar.</p>
<p><strong>Visitantes reais.</strong> A avaliação que o Google usa na busca vem de visitantes reais do Chrome (relatório CrUX: o valor que 75% das visitas dos últimos 28 dias atingem) e só existe para sites com tráfego suficiente. Ela pode ser diferente desta, porque depende dos aparelhos e das conexões de quem visita o site.</p>
<p><strong>O que estes números não dizem.</strong> Desempenho é um dos sinais que o Google considera, ao lado da relevância do conteúdo; um bom resultado ajuda, mas não garante posição na busca.</p>
</div>

<footer>Gerado em ${formatarData(relatorio.data)} · ${escapar(relatorio.navegador)} · Lighthouse ${escapar(relatorio.lighthouse)}</footer>
</main>
</body>
</html>
`;
}
