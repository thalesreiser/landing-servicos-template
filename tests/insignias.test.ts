import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { idInsignia, LIMITE_INSIGNIA, textoAnel } from '../src/lib/insignias.ts';
import { nichoSchema } from '../src/lib/schema.ts';

const exemplo: unknown = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));
type Hero = { insignias?: unknown[] };
const comInsignias = (insignias: unknown[]) => {
  const nicho = structuredClone(exemplo) as { secoes: (Hero & { tipo: string })[] };
  nicho.secoes.find((s) => s.tipo === 'hero')!.insignias = insignias;
  return nicho;
};

test('ring text is uppercase, ends with a separator and goes round twice when short', () => {
  assert.equal(textoAnel('Sigilo profissional · LGPD'), 'SIGILO PROFISSIONAL · LGPD · ');
  assert.equal(textoAnel('Atende on-line'), 'ATENDE ON-LINE · ATENDE ON-LINE · ');
});

test('badge ids are unique', () => {
  assert.notEqual(idInsignia(), idInsignia());
});

test('hero accepts up to two badges, circular or label, primary by default', () => {
  const nicho = comInsignias([{ modelo: 'circular', texto: 'Atende on-line', icone: 'check' }, { modelo: 'etiqueta', texto: 'Sem cadastro' }]);
  const hero = nichoSchema.parse(nicho).secoes.find((s) => s.tipo === 'hero');
  assert.equal(hero?.tipo === 'hero' && hero.insignias?.[0]?.cor, 'primaria');
  assert.equal(nichoSchema.safeParse(comInsignias([...Array(3)].map(() => ({ modelo: 'etiqueta', texto: 'Texto' })))).success, false);
  assert.equal(nichoSchema.safeParse(comInsignias([{ modelo: 'adesivo', texto: 'Texto' }])).success, false);
  assert.equal(nichoSchema.safeParse(comInsignias([{ modelo: 'etiqueta', texto: 'Texto', cor: 'texto' }])).success, false);
  assert.equal(nichoSchema.safeParse(comInsignias([{ modelo: 'etiqueta', texto: '  ' }])).success, false);
});

test('badge text has a length limit per model', () => {
  const texto = (n: number) => 'x'.repeat(n);
  for (const modelo of ['etiqueta', 'circular'] as const) {
    const limite = LIMITE_INSIGNIA[modelo];
    assert.equal(nichoSchema.safeParse(comInsignias([{ modelo, texto: texto(limite) }])).success, true, modelo);
    const resultado = nichoSchema.safeParse(comInsignias([{ modelo, texto: texto(limite + 1) }]));
    assert.equal(resultado.success, false, modelo);
    assert.match(resultado.error!.message, new RegExp(`até ${limite} caracteres`));
  }
  assert.equal(LIMITE_INSIGNIA.etiqueta, 22);
});
