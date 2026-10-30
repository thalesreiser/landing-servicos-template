# landing-servicos-template

Template de landing page de serviços em **Astro + Tailwind CSS**, configurável por um
arquivo JSON por nicho. Cada cliente novo é um JSON novo em `nichos/`, sem mudar o código.

## Demos

Sites de demonstração, com nomes, contatos e endereços fictícios:

| Nicho | JSON | Endereço |
| --- | --- | --- |
| Advocacia | [`nichos/advocacia.json`](nichos/advocacia.json) | https://advocacia-demo.pages.dev |
| Fisioterapia | [`nichos/fisioterapia.json`](nichos/fisioterapia.json) | https://fisioterapia-demo.pages.dev |
| Todas as seções (referência) | [`nichos/exemplo.json`](nichos/exemplo.json) | https://landing-servicos-exemplo.pages.dev |

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
├── lib/               # schema do nicho (Zod), WhatsApp, endereço e mapa, SEO (JSON-LD, imagem de compartilhamento)
└── pages/             # index.astro (monta as seções), política de privacidade, og.png e robots.txt
nichos/                # um JSON por nicho
public/img/            # imagens, uma pasta por nicho
politica-de-privacidade.md
```

## O JSON do nicho

Validado em `src/lib/schema.ts`; um erro de digitação falha o build com a mensagem do campo.

| Chave          | Conteúdo                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| `demo`         | `true` mostra o aviso "site de demonstração" e marca a página `noindex`  |
| `site`         | nome, título e descrição (SEO); `url` (endereço de produção) e `schema_tipo` (tipo schema.org), veja [SEO](#seo) |
| `tema`         | cores (hexadecimal) e fontes; `fontes_url` carrega o Google Fonts. `cor_destaque` é a assinatura do nicho: filete acima dos títulos, números dos passos, aspas dos depoimentos e marcadores dos convênios |
| `contato`      | WhatsApp (DDI + DDD), mensagem pronta, e-mail, telefone, endereço, horário |
| `rastreamento` | `google_analytics` (`G-...`) e `meta_pixel`, opcionais                   |
| `revisao`      | `termos_vetados`: palavras que os textos nunca podem usar; os testes reprovam o nicho se alguma aparecer |
| `publicacao`   | `cloudflare_projeto`: projeto da Cloudflare Pages; sem ele, o nicho só é compilado no CI |
| `secoes`       | lista ordenada das seções; a ordem do JSON é a ordem da página           |

Cada item de `secoes` tem um `tipo` (`hero`, `servicos`, `sobre`, `como_funciona`,
`depoimentos`, `convenios`, `faq`, `formulario`, `mapa`, `rodape`, `botao_whatsapp`) e aceita:

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

### SEO

Gerado no build a partir do JSON, sem configuração extra:

- **Meta tags:** título, descrição, `canonical`, Open Graph (`og:*`) e `twitter:card` nas duas páginas.
- **Imagem de compartilhamento:** `/og.png` (1200×630), desenhada com as cores do tema, o nome
  do site e o título do hero.
- **JSON-LD (schema.org):** na página inicial, o negócio (nome, descrição, contato, endereço,
  horário) e um `FAQPage` com as perguntas da seção `faq`.
- **`sitemap-index.xml` e `robots.txt`:** o robots.txt libera o rastreamento e aponta para o sitemap.

`site.url` é o endereço de produção, sem barra final (ex.: `https://advocacia-demo.pages.dev`).
Sem ele, o build funciona, mas sem `canonical`, `og:url`, `og:image` e sitemap.
`site.schema_tipo` aceita `LocalBusiness` (padrão), `LegalService`, `MedicalBusiness`,
`MedicalClinic`, `Physiotherapy`, `Dentist`, `AccountingService`,
`HomeAndConstructionBusiness` e `HealthAndBeautyBusiness`.

Nos demos (`demo: true`), as páginas têm `<meta name="robots" content="noindex">`. O robots.txt
não bloqueia o rastreamento de propósito: o buscador só vê o `noindex` se puder abrir a página.

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
