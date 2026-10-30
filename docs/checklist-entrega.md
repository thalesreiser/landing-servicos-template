# Checklist de entrega

Antes de entregar o site a um cliente, confira cada item. Copie esta lista para a
issue ou o card de entrega e marque o que já foi feito.

## Conteúdo e regras do conselho

- [ ] Todos os textos foram aprovados pelo cliente, por escrito (e-mail ou mensagem).
- [ ] Os textos foram conferidos contra as regras de publicidade do conselho da profissão
      (veja as regras por nicho em [`briefing.md`](briefing.md)): sem preços, promessas,
      superlativos ou especialidade sem título.
- [ ] `revisao.termos_vetados` está preenchido e `npm test` passa.
- [ ] Os registros profissionais (OAB, CREFITO etc.) e o CNPJ estão corretos.
- [ ] Cada depoimento tem autorização expressa e por escrito de quem o deu, guardada pelo
      cliente (na fisioterapia, exigência da Resolução COFFITO 532/2021). Advocacia não
      publica depoimentos.
- [ ] Cada foto em que alguém pode ser identificado tem autorização por escrito dessa
      pessoa; as demais fotos têm licença de uso.
- [ ] Todo `alt` de imagem descreve a imagem de verdade.

## Privacidade (LGPD)

- [ ] A política de privacidade foi revisada com o cliente: responsável pelo tratamento
      (`site.nome`), e-mail de contato (`contato.email`), prazo de guarda das mensagens e
      ferramentas de medição de fato usadas.
- [ ] O texto de consentimento do formulário (`secoes[formulario].consentimento`) está
      de acordo com a política.
- [ ] Se houver Google Analytics ou Meta Pixel, os ids em `rastreamento` estão certos e o
      aviso de cookies pede consentimento antes de carregar os scripts.

## Configuração do JSON

- [ ] `demo: false` e o aviso "site de demonstração" não aparece mais; a página não tem
      `<meta name="robots" content="noindex">`.
- [ ] O JSON do cliente está no repositório (ou fork) do cliente, não neste template:
      aqui todo nicho é demo.
- [ ] `site.url` é o endereço final, sem barra no fim.
- [ ] Nenhum dado de exemplo sobrou (`example.com`, `00000`, "Pessoa Exemplo").

## Formulário e contato

- [ ] `secoes[formulario].chave` tem a chave real (Formspree ou Web3Forms) e a conta do
      provedor é do cliente ou está configurada para o e-mail dele.
- [ ] Um envio de teste chegou ao e-mail de destino e a mensagem de sucesso apareceu.
- [ ] O botão e o link do WhatsApp abrem a conversa com o número certo e a mensagem pronta.
- [ ] Telefone, e-mail, endereço, horário e mapa conferidos.

## Domínio e publicação

- [ ] `publicacao.cloudflare_projeto` definido e o deploy do GitHub Actions passou.
- [ ] Domínio próprio adicionado ao projeto na Cloudflare (Custom domains) e DNS apontado.
- [ ] HTTPS ativo no domínio e no `www` (ou redirecionamento de um para o outro).
- [ ] O endereço `.pages.dev` continua funcionando ou redireciona para o domínio.
- [ ] Imagem de compartilhamento (`/og.png`) aparece ao colar o link no WhatsApp.
- [ ] `sitemap-index.xml` e `robots.txt` abrem; site cadastrado no Google Search Console.

## Qualidade

- [ ] Lighthouse ou [PageSpeed Insights](https://pagespeed.web.dev) com 90+ em desempenho,
      acessibilidade, boas práticas e SEO, no celular e no computador.
- [ ] Site conferido num celular de verdade (360 px), com teclado (Tab e foco visível) e
      nos navegadores principais.
- [ ] Sem links quebrados (menu, âncoras, política de privacidade).

## Depois da entrega

- [ ] O cliente sabe como pedir alteração de texto: por escrito (e-mail ou mensagem), com
      o texto novo e a seção; prazo e forma de cobrança combinados no contrato.
- [ ] O cliente sabe que textos novos passam pela mesma revisão das regras do conselho.
- [ ] Acessos entregues ou documentados: domínio, conta do formulário, Analytics.
- [ ] Data da entrega e versão publicada (commit) registradas.
