import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { nichoSchema } from '../src/lib/schema.ts';
import {
  divisoresDasSecoes,
  fundoMarcaFaixa,
  fundoTextura,
  iconesDaFaixa,
  imagemMarcaFaixa,
  imagemTextura,
  recorteDivisor,
  variaveisTextura,
} from '../src/lib/tema.ts';

const exemplo: unknown = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));
const copia = () => structuredClone(exemplo) as { tema: Record<string, unknown>; secoes: Record<string, unknown>[] };

test('the button gesture defaults to padrao and accepts the three styles', () => {
  const nicho = copia();
  delete nicho.tema.botao;
  assert.equal(nichoSchema.parse(nicho).tema.botao, 'padrao');
  for (const botao of ['seta', 'suave', 'carimbo']) {
    nicho.tema.botao = botao;
    assert.equal(nichoSchema.parse(nicho).tema.botao, botao);
  }
  nicho.tema.botao = 'sombra';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('the section divider defaults to the plain cut', () => {
  const nicho = copia();
  delete nicho.tema.divisor;
  assert.equal(nichoSchema.parse(nicho).tema.divisor, 'reto');
  nicho.tema.divisor = 'rasgo';
  assert.equal(nichoSchema.safeParse(nicho).success, false);
});

test('dividers: never on the first section, filete everywhere, shapes only where the color changes', () => {
  const fundos = ['superficie', 'fundo', 'fundo', 'primaria', 'superficie'] as const;
  assert.deepEqual(divisoresDasSecoes([...fundos], 'reto'), [false, false, false, false, false]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'filete'), [false, true, true, true, true]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'onda'), [false, true, false, true, true]);
  assert.deepEqual(divisoresDasSecoes([...fundos], 'diagonal'), [false, true, false, true, true]);
});

test('the wave is deterministic, changes with the index and stays inside the box', () => {
  assert.equal(recorteDivisor('onda', 3), recorteDivisor('onda', 3));
  const ondas = [1, 2, 3, 4, 5].map((i) => recorteDivisor('onda', i));
  assert.equal(new Set(ondas).size, ondas.length);
  for (const onda of ondas) {
    assert.match(onda, /^polygon\(0% [\d.]+%, .*, 100% 100%, 0 100%\)$/);
    const valores = [...onda.matchAll(/(-?[\d.]+)%/g)].map((m) => Number(m[1]));
    assert.ok(valores.every((v) => v >= 0 && v <= 100), onda);
    // The crest rises at least 40% of the box (about 20 px of the 48 px divider).
    const ys = valores.filter((_, k) => k % 2 === 1);
    assert.ok(Math.min(...ys) <= 60, onda);
  }
});

test('the slope alternates sides from one boundary to the next', () => {
  assert.notEqual(recorteDivisor('diagonal', 1), recorteDivisor('diagonal', 2));
  assert.equal(recorteDivisor('diagonal', 1), recorteDivisor('diagonal', 3));
});

const cores = { cor_texto: '#000000', cor_primaria: '#0E6B63', cor_primaria_contraste: '#FFFFFF' };

test('texture and band watermark default to none and reject unknown values', () => {
  const nicho = copia();
  delete nicho.tema.textura;
  delete nicho.tema.marca_faixa;
  const { tema } = nichoSchema.parse(nicho);
  assert.equal(tema.textura, 'nenhuma');
  assert.equal(tema.marca_faixa, 'nenhuma');
  for (const [campo, valor] of [['textura', 'grao'], ['marca_faixa', 'fita'], ['icones_faixa', ['nao-existe']]] as const) {
    const errado = copia();
    errado.tema[campo] = valor;
    assert.equal(nichoSchema.safeParse(errado).success, false, campo);
  }
});

test('textures are inline SVG tiles in the theme colors, nothing for "nenhuma"', () => {
  assert.equal(imagemTextura(cores, 'nenhuma'), undefined);
  assert.equal(imagemMarcaFaixa(cores, 'nenhuma', ['mao']), undefined);
  const pontos = imagemTextura(cores, 'pontos')!;
  assert.match(pontos, /^url\("data:image\/svg\+xml,/);
  assert.ok(decodeURIComponent(pontos).includes("fill='#0E6B63' opacity='0.08'"));
  assert.ok(decodeURIComponent(imagemTextura(cores, 'papel')!).includes("opacity='0.04'"));
  // No raw quotes or semicolons: the value goes into the inline style of <html>.
  for (const valor of [pontos, imagemTextura(cores, 'papel')!, imagemMarcaFaixa(cores, 'icones', ['mao'])!]) {
    assert.doesNotMatch(valor.slice(5, -2), /["';]/);
  }
});

test('the darkest texture point and the lightest band point use the opacity constants', () => {
  assert.equal(fundoTextura(cores, 'papel', '#FFFFFF'), '#f5f5f5');
  assert.equal(fundoTextura(cores, 'nenhuma', '#FFFFFF'), '#FFFFFF');
  assert.equal(fundoMarcaFaixa({ ...cores, cor_primaria: '#000000' }, 'riscado'), '#0f0f0f');
});

test('the icon watermark uses up to three distinct icons, a star by default', () => {
  assert.deepEqual(iconesDaFaixa(['mao', 'mao', 'coluna', 'corrida', 'osso']), ['mao', 'coluna', 'corrida']);
  assert.deepEqual(iconesDaFaixa([]), ['estrela']);
});

test('only the textures in use become CSS variables', () => {
  assert.deepEqual(variaveisTextura({ ...cores, textura: 'nenhuma', marca_faixa: 'nenhuma' }, []), []);
  const vars = variaveisTextura({ ...cores, textura: 'papel', marca_faixa: 'riscado' }, []);
  assert.deepEqual(vars.map((v) => v.split(':')[0]), ['--textura', '--marca-faixa']);
});

test('service numbers are off by default and details are optional', () => {
  const nicho = copia();
  const servicos = nicho.secoes.find((s) => s.tipo === 'servicos') as Record<string, unknown> & { itens: Record<string, unknown>[] };
  delete servicos.numerar;
  for (const item of servicos.itens) delete item.detalhe;
  let lido = nichoSchema.parse(nicho).secoes.find((s) => s.tipo === 'servicos');
  assert.equal(lido?.tipo === 'servicos' && lido.numerar, false);
  servicos.numerar = true;
  servicos.itens[0]!.detalhe = 'Sessão individual · 50 min';
  lido = nichoSchema.parse(nicho).secoes.find((s) => s.tipo === 'servicos');
  assert.ok(lido?.tipo === 'servicos' && lido.numerar);
  assert.equal(lido?.tipo === 'servicos' && lido.itens[0]!.detalhe, 'Sessão individual · 50 min');
});
