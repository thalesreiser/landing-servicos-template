import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { pathToFileURL } from 'node:url';
import { montarMatriz } from '../scripts/matriz-ci.ts';

const exemplo = JSON.parse(readFileSync(new URL('../nichos/exemplo.json', import.meta.url), 'utf8'));
const pastas: string[] = [];
after(() => pastas.forEach((pasta) => rmSync(pasta, { recursive: true, force: true })));

/** Temporary nichos/ folder with copies of the example niche. */
function pastaCom(nichos: Record<string, object | undefined>): URL {
  const pasta = mkdtempSync(join(tmpdir(), 'nichos-'));
  pastas.push(pasta);
  for (const [nome, publicacao] of Object.entries(nichos)) {
    writeFileSync(join(pasta, `${nome}.json`), JSON.stringify({ ...exemplo, publicacao }));
  }
  return pathToFileURL(`${pasta}/`);
}

test('builds every niche of the repository', () => {
  assert.ok(montarMatriz(new URL('../nichos/', import.meta.url)).nichos.includes('exemplo'));
});

test('deploys only niches with a Cloudflare project, sorted by name', () => {
  const matriz = montarMatriz(
    pastaCom({
      fisioterapia: { cloudflare_projeto: 'fisio-demo' },
      advocacia: { cloudflare_projeto: 'advocacia-demo' },
      rascunho: undefined,
    }),
  );
  assert.deepEqual(matriz.nichos, ['advocacia', 'fisioterapia', 'rascunho']);
  assert.deepEqual(matriz.deploy, [
    { nicho: 'advocacia', projeto: 'advocacia-demo' },
    { nicho: 'fisioterapia', projeto: 'fisio-demo' },
  ]);
});

test('rejects two niches pointing to the same project', () => {
  const pasta = pastaCom({ a: { cloudflare_projeto: 'mesmo' }, b: { cloudflare_projeto: 'mesmo' } });
  assert.throws(() => montarMatriz(pasta), /projeto "mesmo" usado por a e b/);
});

test('rejects an invalid project name', () => {
  assert.throws(() => montarMatriz(pastaCom({ a: { cloudflare_projeto: 'Nome Invalido' } })), /inválido/);
});
