// Starts a new niche from the example: `npm run novo-nicho -- <nome>` copies
// nichos/exemplo.json to nichos/<nome>.json without the production address and the
// Cloudflare project, so the copy never deploys over the example site.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nichoSchema } from '../src/lib/schema.ts';

export const NOME_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Creates `<nome>.json` in `pasta` from `exemplo.json`; returns the new file URL. */
export function criarNicho(nome: string, pasta: URL): URL {
  if (!NOME_VALIDO.test(nome)) {
    throw new Error(`nome inválido: "${nome}". Use letras minúsculas, números e hífens (ex.: clinica-sorriso).`);
  }
  const destino = new URL(`${nome}.json`, pasta);
  if (existsSync(destino)) throw new Error(`o nicho "${nome}" já existe em nichos/${nome}.json`);

  const nicho = JSON.parse(readFileSync(new URL('exemplo.json', pasta), 'utf8'));
  delete nicho.publicacao;
  delete nicho.site.url;

  const resultado = nichoSchema.safeParse(nicho);
  if (!resultado.success) throw new Error(`nichos/exemplo.json inválido: ${resultado.error.message}`);

  writeFileSync(destino, `${JSON.stringify(nicho, null, 2)}\n`, { flag: 'wx' });
  return destino;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const nome = process.argv[2] ?? '';
  try {
    criarNicho(nome, new URL('../nichos/', import.meta.url));
  } catch (erro) {
    console.error(erro instanceof Error ? erro.message : erro);
    console.error('Uso: npm run novo-nicho -- <nome>');
    process.exit(1);
  }
  console.log(`Criado nichos/${nome}.json (cópia de exemplo.json, sem publicacao e sem site.url).

Próximos passos:
  1. Preencha site, tema, contato e secoes com os dados do briefing (docs/briefing.md).
  2. Ponha as imagens em public/img/${nome}/.
  3. Se o nicho tiver regras de publicidade, liste os termos proibidos em revisao.termos_vetados.
  4. Veja o resultado: NICHO=${nome} npm run dev
  5. Rode npm test (schema, contraste e termos vetados) e NICHO=${nome} npm run build.
  6. Para publicar, adicione "publicacao": { "cloudflare_projeto": "<projeto>" } e site.url.`);
}
