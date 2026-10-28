// Builds the CI matrices from nichos/: every niche is built, and niches with
// publicacao.cloudflare_projeto are also deployed. Run in CI as
// `node scripts/matriz-ci.ts`, which appends `nichos` and `deploy` to $GITHUB_OUTPUT.
import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nichoSchema } from '../src/lib/schema.ts';

export interface Matriz {
  nichos: string[];
  deploy: { nicho: string; projeto: string }[];
}

export function montarMatriz(pasta: URL): Matriz {
  const nichos = readdirSync(pasta)
    .filter((arquivo) => arquivo.endsWith('.json'))
    .map((arquivo) => arquivo.replace(/\.json$/, ''))
    .sort();

  const deploy: Matriz['deploy'] = [];
  for (const nicho of nichos) {
    const dados: unknown = JSON.parse(readFileSync(new URL(`${nicho}.json`, pasta), 'utf8'));
    const resultado = nichoSchema.safeParse(dados);
    if (!resultado.success) throw new Error(`nichos/${nicho}.json inválido: ${resultado.error.message}`);
    const projeto = resultado.data.publicacao?.cloudflare_projeto;
    if (!projeto) continue;
    const repetido = deploy.find((item) => item.projeto === projeto);
    if (repetido) throw new Error(`projeto "${projeto}" usado por ${repetido.nicho} e ${nicho}`);
    deploy.push({ nicho, projeto });
  }
  return { nichos, deploy };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matriz = montarMatriz(new URL('../nichos/', import.meta.url));
  const saida = `nichos=${JSON.stringify(matriz.nichos)}\ndeploy=${JSON.stringify(matriz.deploy)}\n`;
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, saida);
  process.stdout.write(saida);
}
