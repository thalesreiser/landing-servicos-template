# landing-servicos-template
Template de landing page de serviços configurável por JSON, para vender a vários
clientes (um arquivo por nicho em `nichos/`).

## Regras
- Astro + Tailwind CSS. Nada de frameworks extras (React, Vue, bibliotecas de UI)
  sem perguntar. Formulário via Formspree ou Web3Forms, sem backend.
- O código não muda entre clientes: tudo que é específico de um cliente fica no
  JSON do nicho (`nichos/<nicho>.json`) e em `src/assets/nichos/<nicho>/` (imagens).
- Componentes recebem dados por props; nenhum texto de cliente fixo em `src/`.
- Textos da interface em português do Brasil. Commits, branches e PRs em inglês.
- Acessível (rótulos, contraste, foco visível, `alt` em imagens) e responsivo
  (legível a 360 px de largura). Meta: 90+ no Lighthouse.
- Advocacia: textos sóbrios, sem promessa de resultado nem "o melhor"/"garantido"
  (Provimento 205/2021 da OAB).
- Demos usam nomes e fotos fictícios e mostram o aviso "site de demonstração".
- Rode `npm run check`, `npm test` e `npm run build` antes de dizer que terminou.
- Nunca commitar dados reais, `.env` ou credenciais. Chaves públicas de
  formulário (Formspree/Web3Forms) ficam no JSON do nicho.
- Deploy só pelo GitHub Actions (Cloudflare Pages). O token da Cloudflare existe
  apenas como secret do repositório (`CLOUDFLARE_API_TOKEN`); nunca peça, imprima
  ou grave o valor. Um nicho é publicado quando tem `publicacao.cloudflare_projeto`.
- As matrizes do CI saem de `nichos/` (`scripts/matriz-ci.ts`); não edite nomes de
  nicho no workflow. O check obrigatório da main é `ci-ok`.

## Comandos
- `NICHO=exemplo npm run dev`
- `NICHO=advocacia npm run build`
- `npm run check`
- `npm test`
- `node scripts/matriz-ci.ts` (mostra o que o CI vai compilar e publicar)
- `npm run novo-nicho -- <nome>` (cria `nichos/<nome>.json` a partir do exemplo)
