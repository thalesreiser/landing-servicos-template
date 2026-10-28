# landing-servicos-template

Template de landing page de serviços em **Astro + Tailwind CSS**, configurável por um
arquivo JSON por nicho. Cada cliente novo é um JSON novo em `nichos/`, sem mudar o código.

## Demos

Sites de demonstração, com nomes, contatos e endereços fictícios:

| Nicho | JSON | Endereço |
| --- | --- | --- |
| Advocacia | [`nichos/advocacia.json`](nichos/advocacia.json) | https://advocacia-demo.pages.dev |
| Todas as seções (referência) | [`nichos/exemplo.json`](nichos/exemplo.json) | https://landing-servicos-exemplo.pages.dev |

Clínica de fisioterapia: em construção.

## Como rodar

Requer Node.js 24 (veja `.nvmrc`).

```bash
npm install
NICHO=exemplo npm run dev     # servidor local em http://localhost:4321
NICHO=exemplo npm run build   # site estático em dist/
npm run check                 # tipos e templates
npm test                      # testes unitários e validação de todos os nichos
```

No PowerShell, defina a variável antes: `$env:NICHO = "exemplo"; npm run build`.
Sem `NICHO`, o build usa `exemplo`. Um nome que não existe em `nichos/` falha o build.

## Estrutura

```
src/
├── components/        # Hero, Servicos, Sobre, ComoFunciona, Depoimentos,
│                      # FAQ, Formulario, Mapa, Rodape, BotaoWhatsApp
├── layouts/Base.astro # head, tema, aviso de demonstração, cabeçalho, rastreamento
├── lib/               # schema do nicho (Zod), link do WhatsApp, endereço e mapa
└── pages/             # index.astro (monta as seções) e política de privacidade
nichos/                # um JSON por nicho
public/img/            # imagens, uma pasta por nicho
politica-de-privacidade.md
```

## O JSON do nicho

Validado em `src/lib/schema.ts`; um erro de digitação falha o build com a mensagem do campo.

| Chave          | Conteúdo                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| `demo`         | `true` mostra o aviso "site de demonstração" e marca a página `noindex`  |
| `site`         | nome, título e descrição (SEO)                                           |
| `tema`         | cores (hexadecimal) e fontes; `fontes_url` carrega o Google Fonts        |
| `contato`      | WhatsApp (DDI + DDD), mensagem pronta, e-mail, telefone, endereço, horário |
| `rastreamento` | `google_analytics` (`G-...`) e `meta_pixel`, opcionais                   |
| `revisao`      | `termos_vetados`: palavras que os textos nunca podem usar; os testes reprovam o nicho se alguma aparecer |
| `publicacao`   | `cloudflare_projeto`: projeto da Cloudflare Pages; sem ele, o nicho só é compilado no CI |
| `secoes`       | lista ordenada das seções; a ordem do JSON é a ordem da página           |

Cada item de `secoes` tem um `tipo` (`hero`, `servicos`, `sobre`, `como_funciona`,
`depoimentos`, `faq`, `formulario`, `mapa`, `rodape`, `botao_whatsapp`) e aceita:

- `id`: âncora da seção (padrão: o próprio tipo)
- `menu`: texto do link no cabeçalho
- `ativo: false`: esconde a seção sem apagá-la

`nichos/exemplo.json` liga todas as seções e serve de referência.

### Regras de conteúdo e acessibilidade

Os testes rodam sobre todos os nichos:

- **Contraste:** todas as combinações de cor usadas pelos componentes precisam de 4,5:1
  (nível AA da WCAG).
- **Termos vetados:** nenhum texto pode conter um item de `revisao.termos_vetados`, sem
  diferenciar maiúsculas e acentos. O nicho de advocacia usa essa lista para seguir o
  Provimento 205/2021 da OAB, que proíbe, por exemplo, mencionar valores ou gratuidade,
  prometer resultados, usar expressões autopromocionais e anunciar especialidade sem
  título certificado.

### Formulário

Funciona com [Formspree](https://formspree.io) ou [Web3Forms](https://web3forms.com),
sem backend. Em `chave`, use o id do formulário (Formspree) ou a access key (Web3Forms);
os dois são públicos por natureza. Com `chave` vazia, o formulário fica em modo de
demonstração e não envia nada.

## Publicação (Cloudflare Pages)

O GitHub Actions compila cada nicho e publica na Cloudflare Pages os que têm
`publicacao.cloudflare_projeto` no JSON:

- **push na `main`:** publica em produção (`<projeto>.pages.dev`)
- **pull request:** publica uma prévia por branch e mostra o link no resumo da execução
- o projeto é criado na Cloudflare no primeiro deploy, se ainda não existir
- PRs de forks e do Dependabot não recebem os secrets e não publicam

### Configuração (uma vez por repositório)

1. Na Cloudflare, em **My Profile › API Tokens › Create Token › Custom token**, crie um
   token com uma única permissão: **Account › Cloudflare Pages › Edit**, restrito à sua conta.
2. Copie o **Account ID**, que aparece na página inicial do painel da Cloudflare.
3. Grave os dois valores como secrets do repositório. O `gh` pede o valor sem exibi-lo,
   então ele não fica no histórico do terminal:

   ```bash
   gh secret set CLOUDFLARE_API_TOKEN --repo thalesreiser/landing-servicos-template
   gh secret set CLOUDFLARE_ACCOUNT_ID --repo thalesreiser/landing-servicos-template
   ```

   Também dá para cadastrar em **Settings › Secrets and variables › Actions** no GitHub.

Sem os secrets, o job de deploy só emite um aviso e o CI continua verde. O token nunca vai
para o código, para o `.env` ou para mensagens; para trocá-lo, gere um novo na Cloudflare,
rode o `gh secret set` de novo e revogue o antigo.

## Licença

[MIT](LICENSE)
