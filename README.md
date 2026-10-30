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
| `tema`         | cores (hexadecimal), fontes, forma e movimento, veja [Fontes](#fontes), [Forma](#forma-raio-e-cartões) e [Animações](#animações-e-fundo-do-hero). `cor_destaque` é a assinatura do nicho: filete acima dos títulos, números dos passos, aspas dos depoimentos e marcadores dos convênios |
| `contato`      | WhatsApp (DDI + DDD), mensagem pronta, e-mail, telefone, endereço, horário; `rotulo_cabecalho` é o texto do botão de WhatsApp do cabeçalho (padrão "WhatsApp"; no celular, ele some quando a página tem a barra do `botao_whatsapp`) |
| `rastreamento` | `google_analytics` (`G-...`) e `meta_pixel`, opcionais; `aviso_cookies` (textos do aviso), veja [Rastreamento](#rastreamento-e-cookies) |
| `revisao`      | `termos_vetados`: palavras que os textos nunca podem usar; os testes reprovam o nicho se alguma aparecer |
| `publicacao`   | `cloudflare_projeto`: projeto da Cloudflare Pages; sem ele, o nicho só é compilado no CI |
| `secoes`       | lista ordenada das seções; a ordem do JSON é a ordem da página           |

Cada item de `secoes` tem um `tipo` (`hero`, `servicos`, `sobre`, `como_funciona`,
`depoimentos`, `convenios`, `faq`, `formulario`, `mapa`, `rodape`, `botao_whatsapp`) e aceita:

- `id`: âncora da seção (padrão: o próprio tipo)
- `menu`: texto do link no cabeçalho
- `ativo: false`: esconde a seção sem apagá-la
- `fundo`: `fundo`, `superficie` ou `primaria`, veja [Fundos das seções](#fundos-das-seções)

`nichos/exemplo.json` liga todas as seções e serve de referência.

Ícones aceitos em `servicos.itens[].icone` (desenhos em `src/lib/icones.ts`): `balanca`, `maleta`,
`casa`, `pessoas`, `documento`, `escudo`, `coracao`, `atividade`, `calendario`, `relogio`, `celular`,
`email`, `local`, `check`, `mensagem`, `estrela` e, para a área de saúde, `osso`, `corrida`,
`cerebro`, `coluna` e `mao`. No celular, o ícone fica à esquerda do texto, para o cartão ser mais baixo.

### Forma (raio e cartões)

Dois campos opcionais de `tema` dão a cada nicho uma forma própria, além das cores e fontes:

| Campo | Valores | Efeito |
| --- | --- | --- |
| `raio` | `reto`, `medio` (padrão), `suave` | cantos de cartões, imagens, botões, etiquetas e campos: `reto` usa 2 px em tudo; `medio`, 12 px nos cartões e 8 px nos botões; `suave`, 16 px nos cartões e botões em pílula |
| `card` | `contorno` (padrão), `elevado`, `linha` | `contorno`: borda fina; `elevado`: sem borda, com sombra suave na cor primária; `linha`: sem caixa, só um filete no topo (lista editorial) e ícones soltos na cor de destaque |

Nas demos: advocacia `reto` + `linha`, fisioterapia `suave` + `elevado`, exemplo `medio` + `contorno`.

### Animações e fundo do hero

Dois campos opcionais de `tema` controlam o movimento e o fundo do hero:

| Campo | Valores | Efeito |
| --- | --- | --- |
| `animacoes` | `sutil` (padrão), `nenhuma` | `sutil`: seções e cartões aparecem ao rolar (em cascata nas listas), botões sobem 1 px no hover, cartões e links do menu reagem ao hover, as respostas do FAQ abrem deslizando, o cabeçalho ganha sombra ao rolar e a navegação entre páginas faz um fade cruzado; `nenhuma` desliga tudo isso |
| `fundo_hero` | `malha` (padrão), `liso` | `malha`: dois brilhos suaves no hero, da cor primária (canto superior direito) e da cor de destaque (canto inferior esquerdo); `liso`: cor chapada |

- Quem pede menos movimento no sistema (`prefers-reduced-motion`) nunca vê deslocamento,
  qualquer que seja o valor.
- O conteúdo é visível sem JavaScript. Só o script de revelação (cerca de 0,7 KB) esconde
  algo, e só o que está abaixo da dobra. O hero nunca anima, para não atrasar o LCP. As
  animações usam só opacidade e `transform`, então não deslocam o layout (CLS 0).
- O teste de contraste confere texto, texto suave e cor primária sobre o ponto mais escuro da
  `malha`. Se uma paleta reprovar ali, use `"fundo_hero": "liso"`.

### Fundos das seções

Sem `fundo`, as seções alternam `superficie` e `fundo` (o hero começa em `superficie`), então
duas seções seguidas nunca têm a mesma cor, qualquer que seja a ordem do JSON. Com `fundo`, a
seção usa a cor pedida, e a alternância continua a partir dela.

`"fundo": "primaria"` cria uma faixa de contraste na cor primária: o texto passa a
`cor_primaria_contraste`, o texto suave a essa cor com 90% de opacidade, os botões primários
se invertem e a cor de destaque vira `tema.cor_destaque_faixa` (opcional; o padrão é
`cor_primaria_contraste`). Use uma faixa por página, no máximo. O formulário não aceita
`primaria`. O teste de contraste confere as cores da faixa em todos os nichos, mesmo nos que
ainda não usam uma.

### Destaques do hero

`hero.destaques` (opcional, até 4 itens) lista fatos curtos, como registro no conselho,
horário ou modalidade de atendimento:

```json
"destaques": [
  { "rotulo": "Sessões", "valor": "Individuais, de 50 minutos" },
  { "rotulo": "Horário", "valor": "Seg. a sex. 7h–20h · sáb. 8h–12h" }
]
```

Sem `imagem`, eles ocupam um painel à direita do título no desktop e viram etiquetas abaixo
dos botões no celular (só os 3 primeiros). Com `imagem`, a foto fica à direita e todos os
destaques aparecem como etiquetas abaixo dos botões. Use só fatos verificáveis: os textos
passam pelo teste de termos vetados como qualquer outro.

### Chamadas no meio da página

`como_funciona` e `faq` aceitam `chamada` (opcional): uma linha de texto e um botão ao fim da
seção, para o visitante não precisar rolar até o formulário. A `acao` é a mesma do hero
(`whatsapp`, com `mensagem` opcional, ou `link`):

```json
"chamada": {
  "texto": "Não encontrou a sua dúvida? Pergunte pelo WhatsApp.",
  "acao": { "tipo": "whatsapp", "texto": "Enviar dúvida pelo WhatsApp", "mensagem": "Olá! Tenho uma dúvida." }
}
```

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

### Mapa

A seção `mapa` mostra o endereço, o horário e os contatos ao lado de um mapa do Google Maps,
gerado de `contato.endereco` (ou de `embed_url`, se o JSON tiver um link de incorporação).

- O mapa só carrega quando o visitante clica em "Carregar mapa". Até lá, o espaço mostra um
  desenho de ruas nas cores do tema, com o endereço e o botão, e nenhuma requisição vai ao
  Google: o mapa incorporado baixa cerca de 40 arquivos e 0,5 MB e grava cookies do Google,
  então ele espera a ação do visitante, como o GA4 espera o "Aceitar".
- O mapa não carrega sozinho ao rolar até ele, de propósito: rolar não é pedir o mapa, e o
  Lighthouse rola a página inteira, então o peso voltaria ao relatório.
- O quadro tem a mesma altura antes e depois do clique (sem deslocar o layout). O botão
  funciona pelo teclado e, depois do carregamento, o foco vai para o mapa.
- Sem JavaScript, o botão não aparece; o link "Abrir no Google Maps" continua ao lado.

### Rastreamento e cookies

Com `rastreamento.google_analytics` ou `rastreamento.meta_pixel` no JSON, o site mostra um
aviso de cookies (LGPD) com "Aceitar" e "Recusar". Sem nenhum dos dois, não há aviso nem
script de terceiros.

- O GA4 e o Pixel só carregam depois de "Aceitar"; antes disso, nenhuma requisição vai ao
  Google ou à Meta. A escolha fica no `localStorage` e o aviso não volta.
- O mapa do Google Maps não depende do aviso: ele só carrega com o clique em "Carregar mapa"
  (veja [Mapa](#mapa)).
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

## Métricas de desempenho

Duas fontes que se complementam:

- **Laboratório** (`npm run metricas`): mede a página publicada em condições controladas e gera
  um relatório para mostrar ao cliente.
- **Visitantes reais** (GA4): com o Google Analytics configurado e os cookies aceitos, cada
  visita envia os números medidos no aparelho de quem visitou.

Os indicadores são os Core Web Vitals, que o Google usa para avaliar a experiência da página,
mais o tempo de resposta do servidor:

| Indicador | O que mede | Bom | Ruim |
| --- | --- | --- | --- |
| TTFB | tempo até o servidor começar a enviar a página | até 0,8 s | acima de 1,8 s |
| LCP | tempo até o maior elemento da tela (título ou foto de abertura) aparecer | até 2,5 s | acima de 4 s |
| INP | atraso entre um toque ou clique e a resposta na tela | até 200 ms | acima de 500 ms |
| CLS | quanto o conteúdo muda de lugar sozinho durante o carregamento | até 0,1 | acima de 0,25 |

Entre "Bom" e "Ruim", a faixa é "Precisa melhorar". As faixas e a formatação ficam em
`src/lib/metricas.ts`.

### Relatório de laboratório

```bash
npm run metricas -- https://advocacia-demo.pages.dev   # uma página
npm run metricas -- --todos                            # todo nicho com site.url e publicacao
npm run metricas -- <url> --saida relatorios --execucoes 5
```

| Opção | Padrão | Efeito |
| --- | --- | --- |
| `--saida <pasta>` | `relatorios-metricas/` (fora do git) | onde gravar os arquivos |
| `--execucoes <n>` | `3` | medições por dispositivo; o relatório mostra a mediana |
| `--lighthouse` | desligado | grava também o relatório completo do Lighthouse de cada medição |

Precisa do Google Chrome instalado; para usar outro (ou o Edge), aponte `CHROME_PATH` para o
executável. Cada endereço leva de 2 a 4 minutos com 3 medições. O resultado são dois arquivos,
`<nicho>-<data>.html` e `<nicho>-<data>.json`:

- o **HTML** é o relatório para o cliente: autocontido (abre sem internet), com o nome e as
  cores do nicho, e sai bem impresso em PDF (Ctrl+P, "Salvar como PDF", com "Gráficos de
  fundo" marcado);
- o **JSON** guarda a mediana e cada medição, para comparar ao longo do tempo.

Como mede: o [Lighthouse](https://developer.chrome.com/docs/lighthouse) abre a página sem cache
com o perfil de celular (aparelho intermediário simulado, 4G lenta, processador 4× mais lento) e
o de computador, várias vezes. O LCP, o CLS, o TBT, o peso da página e as notas vêm do
Lighthouse. Depois de cada medição do Lighthouse, o script faz uma visita comum, sem cache, com
a tela e o processador do perfil, e dela saem os outros dois:

- **TTFB:** tempo real até o primeiro byte, incluindo DNS e conexão, medido desta conexão;
- **INP:** o script rola até o menu, um item do FAQ e um campo do formulário (os que a página
  tiver), toca neles e mede a resposta com a Event Timing API do navegador, a mesma que o
  `web-vitals` usa. Nada é clicado no aviso de cookies.

O TBT (tempo de bloqueio) aparece como estimativa complementar do INP.

Dicas:

- O processador da máquina influencia o resultado no celular. Feche programas pesados e evite
  rodar builds ao mesmo tempo; o JSON guarda o `indice_maquina` do Lighthouse de cada medição
  (abaixo de uns 700, a máquina estava ocupada ou é lenta).
- Para o relatório que vai ao cliente, use `--execucoes 5`.
- O comando não roda no CI: ele depende da rede até o site publicado e da máquina que mede,
  e uma variação normal entre medições quebraria o build sem motivo.

### Como ler e o que dizer ao cliente

- Cada indicador traz o valor, a faixa do Google e a cor: verde (Bom), amarelo (Precisa
  melhorar) e vermelho (Ruim). O celular é o que mais pesa: a maioria das visitas vem dele.
- Uma frase que se sustenta: "Nos testes de laboratório, os quatro indicadores ficaram na faixa
  'Bom' do Google no celular e no computador, e a página inteira tem X KB."
- Não prometa posição na busca. Desempenho é um dos sinais que o Google considera, ao lado da
  relevância do conteúdo. A avaliação que o Google usa vem de visitantes reais do Chrome
  (relatório CrUX, 28 dias), aparece no Search Console (Core Web Vitals) e no
  [PageSpeed Insights](https://pagespeed.web.dev) quando o site tem tráfego suficiente, e pode
  ser diferente da de laboratório.
- Nas demos, a nota de SEO fica abaixo de 100 por causa do `noindex` (veja [SEO](#seo)); o
  relatório explica isso numa nota. No site definitivo do cliente, ela some.

### Visitantes reais (GA4)

Com `rastreamento.google_analytics` no JSON, depois de "Aceitar" no aviso de cookies, a página
mede TTFB, LCP, INP e CLS com a biblioteca [`web-vitals`](https://github.com/GoogleChrome/web-vitals)
e envia cada um como evento do GA4. Sem GA ou sem consentimento, nada disso carrega: a
biblioteca é um arquivo separado, baixado só depois do aceite, quando a página terminou de
carregar e o navegador está ocioso, por isso não afeta o Lighthouse. Se o visitante recusar
depois, os envios param.

| Evento | Parâmetros |
| --- | --- |
| `TTFB`, `LCP`, `INP`, `CLS` | `metric_value` (valor, em ms; CLS sem unidade), `metric_rating` (`good`, `needs-improvement` ou `poor`), `metric_delta`, `metric_id` e `value` (o delta arredondado; no CLS, multiplicado por 1000) |

Para ver no GA4:

1. Em **Administrador › Definições personalizadas**, crie uma dimensão personalizada de escopo
   de evento com o parâmetro `metric_rating` e uma métrica personalizada de escopo de evento
   com `metric_value` (unidade padrão). Elas só passam a valer para os eventos recebidos depois.
2. Em **Relatórios › Engajamento › Eventos** aparecem `LCP`, `INP`, `CLS` e `TTFB`, com a
   contagem de cada um.
3. Em **Explorar › Exploração livre**, use as dimensões "Nome do evento" e `metric_rating` e a
   métrica "Contagem de eventos": a parte de `good` em cada indicador é a porcentagem de visitas
   com experiência boa. Com a métrica `metric_value`, dá para ver a média.
4. Para conferir a instalação, abra o site, aceite os cookies e veja os eventos em
   **Relatórios › Tempo real** (o INP e o CLS chegam quando a aba é fechada ou trocada).

O GA4 só recebe as visitas de quem aceitou os cookies, então é uma amostra. O Google avalia o
75º percentil (o valor que 75% das visitas atingem); o GA4 não calcula percentis na interface,
mas a exportação para o BigQuery permite.

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
4. Imagens em `src/assets/nichos/<nicho>/`, referenciadas no JSON pelo caminho relativo a
   essa pasta (ex.: `"src": "equipe.jpg"`), sempre com `alt`. Largura e altura vêm do
   próprio arquivo; o build gera as versões otimizadas (veja [Imagens](#imagens)).
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
