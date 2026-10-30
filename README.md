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

### Créditos das fotos

As fotos da demo de advocacia são do [Pexels](https://www.pexels.com/license/), com licença
livre para uso comercial. As pessoas retratadas não têm relação com os nomes fictícios da demo.

| Arquivo | Foto | Autor |
| --- | --- | --- |
| `src/assets/nichos/advocacia/hero.webp` | [Advogado escrevendo em um caderno](https://www.pexels.com/photo/professional-lawyer-writing-on-a-notebook-8112113/) | Pavel Danilyuk |
| `src/assets/nichos/advocacia/escritorio.webp` | [Livros em uma estante](https://www.pexels.com/photo/piled-books-on-a-shelf-3927126/) | Muhammad Jawadur Rahman |
| `src/assets/nichos/advocacia/helena.webp` | [Retrato de mulher de blazer preto](https://www.pexels.com/photo/professional-woman-in-black-blazer-portrait-30479371/) | Augusto Carneiro Junior |
| `src/assets/nichos/advocacia/rafael.webp` | [Retrato de homem de terno](https://www.pexels.com/photo/professional-portrait-of-a-businessman-in-suit-39974539/) | Sam Agdasi |

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
├── layouts/Base.astro # head, tema, aviso de demonstração, cabeçalho, aviso de cookies
├── lib/               # schema do nicho (Zod), WhatsApp, endereço e mapa, SEO (JSON-LD, imagem de compartilhamento)
├── assets/nichos/     # imagens, uma pasta por nicho (otimizadas no build)
└── pages/             # index.astro (monta as seções), política de privacidade, 404, og.png e robots.txt
nichos/                # um JSON por nicho
politica-de-privacidade.md
```

## O JSON do nicho

Validado em `src/lib/schema.ts`; um erro de digitação falha o build com a mensagem do campo.

| Chave          | Conteúdo                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| `demo`         | `true` mostra o aviso "site de demonstração" e marca a página `noindex`  |
| `site`         | nome, título e descrição (SEO); `url` (endereço de produção) e `schema_tipo` (tipo schema.org), veja [SEO](#seo) |
| `tema`         | cores (hexadecimal) e fontes, veja [Fontes](#fontes). `cor_destaque` é a assinatura do nicho: filete acima dos títulos, números dos passos, aspas dos depoimentos e marcadores dos convênios |
| `contato`      | WhatsApp (DDI + DDD), mensagem pronta, e-mail, telefone, endereço, horário |
| `rastreamento` | `google_analytics` (`G-...`) e `meta_pixel`, opcionais; `aviso_cookies` (textos do aviso), veja [Rastreamento](#rastreamento-e-cookies) |
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

### Fontes

`tema.fonte_titulo` e `tema.fonte_texto` são pilhas de fontes do CSS. As famílias listadas em
`tema.fontes` são baixadas no build e servidas pelo próprio site (Fonts API do Astro), com
pré-carregamento e uma fonte de reserva com métricas ajustadas, para o texto não "pular" quando
a fonte chega. Nada é carregado de servidores de terceiros.

```json
"fonte_titulo": "\"Source Serif 4\", Georgia, serif",
"fonte_texto": "Inter, system-ui, sans-serif",
"fontes": [
  { "familia": "Source Serif 4", "pesos": [600], "eixos": { "opsz": [8, 60] } },
  { "familia": "Inter", "pesos": [400, 600] }
]
```

- `familia`: nome exato no provedor; precisa aparecer em `fonte_titulo` ou `fonte_texto`.
- `pesos`: só os pesos que a página usa (cada um é um download).
- `provedor`: `google` (padrão), `bunny` ou `fontsource`.
- `eixos`: opcional, outros eixos variáveis além do peso (ex.: `opsz`), só no Google.

As fontes que vêm depois da família na pilha servem de reserva. Sem `fontes`, o site usa só as
fontes do sistema (como o nicho `exemplo`).

### Imagens

As imagens de cada nicho ficam em `src/assets/nichos/<nicho>/` (não em `public/`), para o build
gerar versões AVIF e WebP em vários tamanhos (`srcset`/`sizes`). No JSON, `src` é o caminho
relativo a essa pasta:

```json
"imagem": { "src": "hero.jpg", "alt": "Fachada do escritório" }
"foto": { "src": "equipe/helena.jpg", "alt": "Retrato de Helena Ribeiro Antunes" }
```

- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp` e `.avif`. Use o original em boa
  resolução (por exemplo, 1600 px de largura para o hero e o "sobre", 400 px para retratos);
  o build nunca amplia a imagem.
- Largura e altura vêm do próprio arquivo. O hero carrega com prioridade; as demais, sob demanda.
- Um arquivo que não existe falha o build (e o `npm test`) com o caminho esperado.
- Imagens decorativas usam `"alt": ""`.

### Página 404

`src/pages/404.astro` gera o `404.html`: a Cloudflare Pages o devolve com status 404 para
endereços que não existem, com o layout do nicho, link para a página inicial e `noindex`.

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

Cada item de `campos` aceita, além de `nome`, `rotulo`, `tipo` e `obrigatorio`:
`placeholder`, `ajuda` (texto de apoio abaixo do rótulo) e `erro` (mensagem mostrada
abaixo do campo quando ele está inválido; o padrão é "Preencha este campo."). Com
`alternativa_whatsapp`, a seção mostra acima do formulário um link para o WhatsApp
com esse texto.

### Rastreamento e cookies

Com `rastreamento.google_analytics` ou `rastreamento.meta_pixel` no JSON, o site mostra um
aviso de cookies (LGPD) com "Aceitar" e "Recusar". Sem nenhum dos dois, não há aviso nem
script de terceiros.

- O GA4 e o Pixel só carregam depois de "Aceitar"; antes disso, nenhuma requisição vai ao
  Google ou à Meta. A escolha fica no `localStorage` e o aviso não volta.
- "Preferências de cookies", no rodapé, reabre o aviso para mudar a escolha.
- `rastreamento.aviso_cookies` troca os textos (`texto`, `aceitar`, `recusar`); os padrões
  são genéricos, em português.
- No celular, o aviso fica 6rem acima da borda inferior para não cobrir o botão do WhatsApp;
  a partir de 640 px, fica no canto inferior esquerdo.

Eventos de conversão, enviados só com consentimento e só para as ferramentas configuradas:

| Ação | GA4 | Meta Pixel |
| --- | --- | --- |
| Clique em qualquer link `wa.me` | `generate_lead` com `method: whatsapp` | `Contact` |
| Envio do formulário aceito pelo provedor | `generate_lead` com `method: form` | `Lead` |

O modo de demonstração do formulário (`chave` vazia) não envia eventos. No GA4, marque
`generate_lead` como evento principal (conversão) e, para separar WhatsApp de formulário nos
relatórios, crie uma dimensão personalizada de escopo de evento com o parâmetro `method`. No
Gerenciador de Eventos da Meta, `Contact` e `Lead` são eventos padrão e já aparecem sozinhos.

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

## Como criar um cliente novo

1. Faça o briefing com o roteiro de [`docs/briefing.md`](docs/briefing.md): perguntas por
   tema, o campo do JSON que cada uma preenche, materiais a pedir e o que o conselho da
   profissão não permite publicar.
2. Crie o JSON a partir do exemplo:

   ```bash
   npm run novo-nicho -- clinica-sorriso
   ```

   O script copia `nichos/exemplo.json` para `nichos/clinica-sorriso.json`. O nome aceita
   letras minúsculas, números e hífens, e um nicho que já existe nunca é sobrescrito. A
   cópia sai **sem** `publicacao` e sem `site.url`, para não publicar por cima do site de
   exemplo na Cloudflare.
3. Preencha o JSON: `site` (nome, título, descrição), `tema` (cores e fontes), `contato`,
   `rastreamento` (se houver), `revisao.termos_vetados` (termos proibidos pelo conselho) e
   o conteúdo de cada item de `secoes`. Desligue com `ativo: false` o que o cliente não quer.
4. Imagens em `public/img/<nicho>/`, referenciadas no JSON pelo caminho a partir de
   `public/` (ex.: `/img/clinica-sorriso/equipe.jpg`), com `alt`, `largura` e `altura`.
   Essa convenção pode mudar com o trabalho em andamento de otimização de imagens.
5. Rode `npm test`: o nicho novo passa pelo schema, pelo teste de contraste (4,5:1) e pelo
   de termos vetados. Depois, `NICHO=clinica-sorriso npm run build`.
6. Para publicar, acrescente `"publicacao": { "cloudflare_projeto": "<projeto>" }` e o
   `site.url` correspondente; o CI cria o projeto e faz o deploy (veja
   [Publicação](#publicação-cloudflare-pages)).

A cópia continua com `demo: true`: neste repositório todo nicho é um demo com dados
fictícios, e o teste exige isso. O site de um cliente real fica no repositório (ou fork)
do próprio cliente, com `demo: false`, dados reais e o projeto da Cloudflare dele. Antes de
entregar, siga o [`docs/checklist-entrega.md`](docs/checklist-entrega.md).

## Licença

[MIT](LICENSE)
