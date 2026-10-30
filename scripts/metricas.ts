// Lab performance report for a published page: Lighthouse on mobile and desktop, N runs each,
// median of TTFB, LCP, INP (scripted interactions), CLS and TBT, written as HTML and JSON.
//
//   npm run metricas -- <url> [<url>...] [--saida <dir>] [--execucoes <n>]
//   npm run metricas -- --todos            (every niche with site.url and publicacao)
//   --lighthouse also saves each run's full Lighthouse report, for digging into a number.
//
// Needs a local Chrome (puppeteer channel "chrome"), or CHROME_PATH pointing to Chrome or Edge.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { desktopConfig, generateReport, navigation, type Config, type Result } from 'lighthouse';
import puppeteer, { type Browser, type ElementHandle, type Page, type Viewport } from 'puppeteer-core';
import { inpDeEventos, METRICAS, type EntradaEvento, type Metrica } from '../src/lib/metricas.ts';
import { nichoSchema, type Nicho } from '../src/lib/schema.ts';
import { DISPOSITIVOS, gerarHtml, resumir, TEMA_PADRAO, type Dispositivo, type Execucao, type Relatorio } from './lib/relatorio.ts';

const PASTA_NICHOS = new URL('../nichos/', import.meta.url);

interface NichoLido {
  nome: string;
  dados: Nicho;
}

function lerNichos(): NichoLido[] {
  return readdirSync(PASTA_NICHOS)
    .filter((arquivo) => arquivo.endsWith('.json'))
    .map((arquivo) => ({
      nome: arquivo.replace(/\.json$/, ''),
      dados: nichoSchema.parse(JSON.parse(readFileSync(new URL(arquivo, PASTA_NICHOS), 'utf8'))),
    }));
}

/** The niche published at this URL's origin, for its name and colors. */
function acharNicho(url: string, nichos: NichoLido[]): NichoLido | undefined {
  const origem = new URL(url).origin;
  return nichos.find((n) => n.dados.site.url && new URL(n.dados.site.url).origin === origem);
}

// Mobile is Lighthouse's default: simulated mid-range phone, slow 4G, CPU 4x slower.
const CONFIGS: Record<Dispositivo, Config> = {
  celular: { extends: 'lighthouse:default' },
  computador: desktopConfig,
};

// For the interactions, the page gets the screen and CPU slowdown of Lighthouse's preset.
const EMULACAO: Record<Dispositivo, { tela: Viewport; cpu: number; toque: boolean }> = {
  celular: { tela: { width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true }, cpu: 4, toque: true },
  computador: { tela: { width: 1350, height: 940, deviceScaleFactor: 1 }, cpu: 1, toque: false },
};

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Taps that do not leave the page: toggle a menu, open a FAQ answer, type in the form. Each
 * element is scrolled into view and left to paint first, as a visitor scrolls to it.
 * Cookie banner buttons are never pressed (accepting would load third-party tags).
 */
async function interagir(page: Page, toque: boolean): Promise<string[]> {
  const feitas: string[] = [];
  const preparar = async (seletor: string) => {
    for (const elemento of await page.$$(seletor)) {
      if (!(await elemento.isVisible())) continue;
      await elemento.scrollIntoView();
      await esperar(1000);
      return elemento;
    }
    return undefined;
  };
  const tocar = (elemento: ElementHandle) => (toque ? elemento.tap() : elemento.click());
  const tentar = async (descricao: string, acao: () => Promise<boolean>) => {
    try {
      if (await acao()) feitas.push(descricao);
    } catch {
      // Element hidden or detached on this layout: skip it.
    }
  };
  await tentar('abrir o menu', async () => {
    const botao = await preparar('header button[aria-expanded]');
    if (!botao) return false;
    await tocar(botao);
    await esperar(500);
    await tocar(botao);
    return true;
  });
  await tentar('abrir uma pergunta frequente', async () => {
    const pergunta = await preparar('details > summary');
    if (!pergunta) return false;
    await tocar(pergunta);
    return true;
  });
  await tentar('digitar no formulário', async () => {
    const campo = await preparar('form input[type="text"], form input:not([type]), form textarea');
    if (!campo) return false;
    await tocar(campo);
    await esperar(300);
    await campo.type('Maria', { delay: 120 });
    return true;
  });
  await esperar(1000);
  return feitas;
}

function numero(lhr: Result, auditoria: string): number | undefined {
  const valor = lhr.audits[auditoria]?.numericValue;
  return typeof valor === 'number' ? valor : undefined;
}

function nota(lhr: Result, categoria: string): number | undefined {
  const valor = lhr.categories[categoria]?.score;
  return typeof valor === 'number' ? valor : undefined;
}

declare global {
  interface Window {
    __eventos?: EntradaEvento[];
  }
}

async function medir(
  navegador: Browser,
  url: string,
  dispositivo: Dispositivo,
): Promise<{ execucao: Execucao; interacoes: string[]; lhr: Result }> {
  const contexto = await navegador.createBrowserContext();
  const page = await contexto.newPage();
  try {
    const lhr = (await navigation(page, url, { config: CONFIGS[dispositivo] }))?.lhr;
    if (!lhr) throw new Error('o Lighthouse não devolveu resultado');
    if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);

    // TTFB as web-vitals defines it: navigation start to the first byte, including DNS, TCP and TLS.
    const ttfb = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return nav && nav.responseStart > 0 ? nav.responseStart - nav.startTime : undefined;
    });

    // INP from the page's own Event Timing entries. A Lighthouse timespan was tried first, but it
    // records screenshots in its trace, which inflated presentation delay several times over.
    const { tela, cpu, toque } = EMULACAO[dispositivo];
    await page.setViewport(tela);
    await page.emulateCPUThrottling(cpu);
    await page.evaluate(() => {
      window.__eventos = [];
      const registrar = (lista: PerformanceObserverEntryList) => {
        for (const e of lista.getEntries() as PerformanceEventTiming[]) {
          window.__eventos!.push({ interactionId: e.interactionId, duration: e.duration });
        }
      };
      // first-input is always recorded, so a page faster than the 16 ms threshold still reports.
      new PerformanceObserver(registrar).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);
      new PerformanceObserver(registrar).observe({ type: 'first-input', buffered: true });
    });
    const interacoes = await interagir(page, toque);
    const eventos = await page.evaluate(() => window.__eventos ?? []);

    const metricas: Partial<Record<Metrica, number>> = {
      TTFB: ttfb ?? numero(lhr, 'server-response-time'),
      LCP: numero(lhr, 'largest-contentful-paint'),
      INP: inpDeEventos(eventos),
      CLS: numero(lhr, 'cumulative-layout-shift'),
      TBT: numero(lhr, 'total-blocking-time'),
    };
    const requisicoes = lhr.audits['network-requests']?.details;
    return {
      execucao: {
        metricas,
        notas: {
          desempenho: nota(lhr, 'performance'),
          acessibilidade: nota(lhr, 'accessibility'),
          boas_praticas: nota(lhr, 'best-practices'),
          seo: nota(lhr, 'seo'),
        },
        peso_bytes: numero(lhr, 'total-byte-weight'),
        requisicoes: requisicoes && 'items' in requisicoes ? requisicoes.items.length : undefined,
        indexavel: lhr.audits['is-crawlable']?.score !== 0,
        indice_maquina: lhr.environment.benchmarkIndex,
      },
      interacoes,
      lhr,
    };
  } finally {
    await contexto.close();
  }
}

async function relatorioDe(
  url: string,
  execucoes: number,
  nicho: NichoLido | undefined,
  salvarLighthouse?: (dispositivo: Dispositivo, execucao: number, lhr: Result) => void,
): Promise<Relatorio> {
  const navegador = await puppeteer.launch({
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' as const }),
    headless: true,
  });
  try {
    const porDispositivo = {} as Relatorio['dispositivos'];
    let interacoes: string[] = [];
    let lighthouse = '';
    for (const dispositivo of DISPOSITIVOS) {
      const lista: Execucao[] = [];
      for (let i = 1; i <= execucoes; i++) {
        process.stdout.write(`  ${dispositivo} ${i}/${execucoes}... `);
        const medida = await medir(navegador, url, dispositivo);
        lista.push(medida.execucao);
        if (medida.interacoes.length > interacoes.length) interacoes = medida.interacoes;
        lighthouse = medida.lhr.lighthouseVersion;
        salvarLighthouse?.(dispositivo, i, medida.lhr);
        const { TTFB, LCP, INP, CLS } = medida.execucao.metricas;
        const ms = (v: number | undefined) => (v === undefined ? '–' : `${Math.round(v)} ms`);
        console.log(`TTFB ${ms(TTFB)}, LCP ${ms(LCP)}, INP ${ms(INP)}, CLS ${CLS?.toFixed(3) ?? '–'}`);
      }
      porDispositivo[dispositivo] = resumir(lista, METRICAS);
    }
    const tema = nicho?.dados.tema ?? TEMA_PADRAO;
    return {
      url,
      nome: nicho?.dados.site.nome ?? new URL(url).hostname,
      data: new Date().toISOString(),
      lighthouse,
      navegador: (await navegador.version()).replace('/', ' '),
      execucoes,
      interacoes,
      dispositivos: porDispositivo,
      tema: {
        cor_primaria: tema.cor_primaria,
        cor_primaria_contraste: tema.cor_primaria_contraste,
        cor_destaque: tema.cor_destaque,
        cor_fundo: tema.cor_fundo,
        cor_superficie: tema.cor_superficie,
        cor_texto: tema.cor_texto,
        cor_texto_suave: tema.cor_texto_suave,
      },
    };
  } finally {
    await navegador.close();
  }
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    saida: { type: 'string', default: 'relatorios-metricas' },
    execucoes: { type: 'string', default: '3' },
    todos: { type: 'boolean', default: false },
    lighthouse: { type: 'boolean', default: false },
  },
});

const execucoes = Number(values.execucoes);
if (!Number.isInteger(execucoes) || execucoes < 1) throw new Error('--execucoes precisa ser um número inteiro positivo');

const nichos = lerNichos();
const urls = [...positionals];
if (values.todos) {
  for (const { dados } of nichos) if (dados.site.url && dados.publicacao?.cloudflare_projeto) urls.push(dados.site.url);
}
if (urls.length === 0) {
  console.error('Uso: npm run metricas -- <url> [--saida <pasta>] [--execucoes <n>] [--lighthouse]   ou   npm run metricas -- --todos');
  process.exit(1);
}
for (const url of urls) {
  if (!/^https?:\/\//.test(url)) throw new Error(`endereço inválido: ${url}`);
}

const pasta = resolve(values.saida);
mkdirSync(pasta, { recursive: true });
for (const url of urls) {
  console.log(`${url} (${execucoes} medições por dispositivo)`);
  const nicho = acharNicho(url, nichos);
  const arquivo = `${nicho?.nome ?? new URL(url).hostname.replace(/[^a-z0-9-]+/gi, '-')}-${new Date().toISOString().slice(0, 10)}`;
  const relatorio = await relatorioDe(
    url,
    execucoes,
    nicho,
    values.lighthouse
      ? (dispositivo, i, lhr) => writeFileSync(join(pasta, `${arquivo}-lighthouse-${dispositivo}-${i}.html`), generateReport(lhr, 'html'))
      : undefined,
  );
  writeFileSync(join(pasta, `${arquivo}.json`), `${JSON.stringify(relatorio, null, 2)}\n`);
  writeFileSync(join(pasta, `${arquivo}.html`), gerarHtml(relatorio));
  console.log(`  -> ${join(pasta, `${arquivo}.html`)}`);
}
