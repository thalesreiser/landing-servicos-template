# Briefing de cliente novo

Roteiro para a primeira conversa com um cliente. Cada pergunta indica o campo do JSON do
nicho (`nichos/<nicho>.json`) que a resposta preenche; os nomes seguem `src/lib/schema.ts`.
Comece o JSON com `npm run novo-nicho -- <nome>` (veja o README) e preencha durante ou
logo depois da conversa.

Leve as perguntas impressas ou num formulário, mas conduza como conversa: o objetivo é
sair com os textos-base, a lista de materiais e os limites do conselho profissional
entendidos pelos dois lados.

## 1. O negócio

| Pergunta | Campo |
| --- | --- |
| Qual é o nome do negócio como deve aparecer no site? | `site.nome` |
| Em uma frase, o que vocês fazem e para quem? | `site.titulo`, `secoes[hero].titulo` |
| Como o cliente costuma descrever o serviço quando procura no Google? | `site.descricao` (até 170 caracteres) |
| Que tipo de negócio é (escritório, clínica, consultório, prestador de serviços)? | `site.schema_tipo` |
| Já existe um domínio? Qual? Quem tem acesso a ele? | `site.url` (depois da publicação) |

## 2. Identidade visual

| Pergunta | Campo |
| --- | --- |
| Tem logotipo? Em quais formatos (SVG, PNG com fundo transparente)? | `src/assets/nichos/<nicho>/` (o template ainda não exibe logotipo: o cabeçalho mostra `site.nome` em texto) |
| Quais são as cores da marca (códigos, se houver manual)? | `tema.cor_primaria`, `tema.cor_destaque` |
| Prefere um visual claro e sóbrio ou mais colorido? | `tema.cor_fundo`, `tema.cor_superficie`, `tema.cor_texto` |
| Usa alguma fonte da marca? | `tema.fonte_titulo`, `tema.fonte_texto`, `tema.fontes` |
| Há sites (de qualquer área) cujo visual você gosta? | referência para o tema |

As cores escolhidas precisam passar no teste de contraste (4,5:1). Se a cor da marca não
passar com texto branco, ajuste o tom ou use `tema.cor_primaria_contraste` escuro, e
explique o motivo ao cliente: legibilidade e acessibilidade.

## 3. Contato e localização

| Pergunta | Campo |
| --- | --- |
| Qual número de WhatsApp recebe os contatos do site? | `contato.whatsapp` (DDI + DDD + número) |
| Qual mensagem pronta o visitante deve enviar ao clicar no WhatsApp? | `contato.mensagem_whatsapp` |
| Qual e-mail aparece no site e responde pela privacidade? | `contato.email` |
| Tem telefone fixo? | `contato.telefone` |
| Qual é o endereço completo, com CEP? Atende só on-line? | `contato.endereco`, seção `mapa` |
| Quais são os dias e horários de atendimento? | `contato.horario` |
| Os contatos do formulário devem chegar em qual e-mail? | `secoes[formulario].chave` (conta Formspree ou Web3Forms) |
| Que perguntas o formulário precisa fazer (assunto, unidade, convênio)? | `secoes[formulario].campos` |
| Em quanto tempo vocês respondem um contato? | `secoes[formulario].texto` |

## 4. Serviços

| Pergunta | Campo |
| --- | --- |
| Quais são os serviços principais (de 3 a 6)? | `secoes[servicos].itens[].titulo` |
| Em duas linhas, o que cada um inclui? | `secoes[servicos].itens[].descricao` |
| Qual serviço deve ficar em destaque? | ordem de `itens` |
| Como funciona o atendimento, do primeiro contato ao início? | `secoes[como_funciona].passos` |

## 5. Sobre e equipe

| Pergunta | Campo |
| --- | --- |
| Como você apresentaria o negócio em dois ou três parágrafos? | `secoes[sobre].paragrafos` |
| Quais registros profissionais devem aparecer (OAB, CREFITO, CNPJ)? | `secoes[sobre].registros`, `secoes[rodape].registros` |
| Quem é a equipe? Nome, cargo, registro e uma bio curta de cada pessoa. | `secoes[sobre].equipe` |
| Tem fotos da equipe e do espaço? | `secoes[sobre].imagem`, `equipe[].foto`, `secoes[hero].imagem` |

## 6. Prova social e convênios

| Pergunta | Campo |
| --- | --- |
| Atende convênios ou tem parceiros? Quais exatamente? | seção `convenios` |
| Existem depoimentos com autorização escrita de quem os deu? | seção `depoimentos` (veja as regras do nicho abaixo) |

## 7. Perguntas frequentes

| Pergunta | Campo |
| --- | --- |
| Quais são as cinco dúvidas que mais chegam pelo WhatsApp? | `secoes[faq].itens` |
| Como cada uma deve ser respondida? | `secoes[faq].itens[].resposta` |

## 8. Medição e privacidade

| Pergunta | Campo |
| --- | --- |
| Usa Google Analytics ou Meta Pixel? Quais ids? | `rastreamento.google_analytics`, `rastreamento.meta_pixel` |
| Quem é o responsável pelos dados pessoais (pessoa ou empresa) e qual o e-mail para pedidos de privacidade? | página de política de privacidade (`site.nome`, `contato.email`) |
| Por quanto tempo vocês guardam as mensagens recebidas? | revisão de `politica-de-privacidade.md` |

## 9. Seções e ordem

Mostre o demo do nicho mais parecido e pergunte quais seções ficam, saem (`ativo: false`)
e em que ordem aparecem (`secoes`). Pergunte também quais aparecem no menu (`menu`).

## Materiais a pedir

- [ ] Logotipo em SVG ou PNG transparente, em boa resolução
- [ ] Fotos do profissional, da equipe e do espaço, **com direito de uso** (fotógrafo
      contratado, autorização de quem aparece ou banco de imagens com licença)
- [ ] Números de registro profissional de cada pessoa listada (OAB, CREFITO etc.) e CNPJ
- [ ] Endereço completo com CEP e, se quiser, o link de incorporação do Google Maps
- [ ] Dias e horários de atendimento
- [ ] Lista de convênios ou parceiros, com nomes exatos
- [ ] Equipe: nome, cargo, registro e bio curta de cada pessoa
- [ ] Depoimentos, cada um com autorização expressa e por escrito de quem o deu
- [ ] Dados da política de privacidade: responsável pelo tratamento, e-mail de contato,
      prazo de guarda das mensagens
- [ ] Acesso ao domínio (registro.br ou outro) ou decisão de usar o endereço `.pages.dev`
- [ ] Ids de Google Analytics / Meta Pixel, se for usar

## Regras por nicho

O que não pedir e não publicar. O JSON do nicho lista os termos proibidos em
`revisao.termos_vetados` e os testes reprovam qualquer texto que os use, mas a regra vale
também para o que não é palavra: fotos, números e promessas. Em caso de dúvida, peça ao
cliente que confirme com o seu conselho; a responsabilidade ética pelo anúncio é do
profissional.

### Advocacia (Provimento 205/2021 da OAB e Código de Ética e Disciplina)

- **Não pedir nem publicar** valores de honorários, formas de pagamento, gratuidade,
  descontos ou "primeira consulta grátis".
- **Não pedir nem publicar** resultados obtidos, número de causas ganhas, promessas de
  resultado ou expressões como "o melhor", "líder", "garantido".
- **Não pedir** depoimentos de clientes nem lista de clientes ou casos atendidos.
- "Especialista" só com título de especialização comprovado; prefira "áreas de atuação".
- Evite descrever a estrutura do escritório como diferencial ("amplo", "moderno").
- **Pedir** o nome e o número de inscrição na OAB de cada advogado (e o registro da
  sociedade, se houver): o anúncio precisa identificá-los. Basta publicar uma vez, no perfil
  de cada advogado (`equipe[].registro`); não repita o número no hero, nos registros da
  seção "sobre" nem no rodapé.
- Tom informativo e sóbrio: o site informa áreas de atuação e como entrar em contato.

### Fisioterapia (COFFITO, Resolução 532/2021)

- **Não pedir nem publicar** preços, descontos, promoções ou sessões gratuitas.
- **Não publicar** promessa de cura ou de resultado ("sem dor", "definitivo", "milagre").
- **Depoimentos** só com autorização expressa e por escrito do paciente, guardada pelo
  cliente; não pedir depoimentos que prometam resultado.
- **Não pedir** fotos de pacientes, de "antes e depois" ou de procedimentos com paciente
  identificável. Se o cliente insistir, confira a regra vigente do COFFITO e exija a
  autorização por escrito de quem aparece.
- **Pedir** o nome e o número do CREFITO de cada fisioterapeuta e do responsável técnico
  da clínica: eles aparecem em `sobre.registros` e `equipe[].registro`.
- Convênios: publique só os que estão de fato credenciados.

### Outros nichos

Antes do briefing, procure as regras de publicidade do conselho da profissão (CFM, CFO,
CRP, CFC etc.), anote os termos proibidos em `revisao.termos_vetados` e acrescente aqui uma
seção para o nicho.
