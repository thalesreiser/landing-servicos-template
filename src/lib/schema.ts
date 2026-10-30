import { z } from 'astro/zod';
import { PROVEDORES_FONTE, separarPilha } from './fontes.ts';
import { NOMES_ICONES } from './icones.ts';
import { EXTENSOES_IMAGEM, PADRAO_SRC_IMAGEM } from './imagens.ts';

// LocalBusiness subtypes that fit a services landing page (https://schema.org/LocalBusiness).
export const TIPOS_SCHEMA = [
  'LocalBusiness',
  'LegalService',
  'MedicalBusiness',
  'MedicalClinic',
  'Physiotherapy',
  'Dentist',
  'AccountingService',
  'HomeAndConstructionBusiness',
  'HealthAndBeautyBusiness',
] as const;

const cor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'use uma cor hexadecimal, ex.: #1F6FEB');

// A family self-hosted from a font provider at build time (see src/lib/fontes.ts).
const fonte = z.object({
  familia: z.string().min(1),
  // Only the weights the page uses: each one is a file the visitor downloads.
  pesos: z.array(z.number().int().min(100).max(900).multipleOf(100)).min(1),
  provedor: z.enum(PROVEDORES_FONTE).default('google'),
  eixos: z.record(z.string().regex(/^[a-z]{4}$/), z.tuple([z.number(), z.number()])).optional(),
});

// File in src/assets/nichos/<nicho>/, optimized at build time; width and height come from the file.
const imagem = z.object({
  src: z.string().regex(PADRAO_SRC_IMAGEM, `caminho relativo a src/assets/nichos/<nicho>/, ex.: "hero.jpg" (${EXTENSOES_IMAGEM.join(', ')})`),
  alt: z.string(),
});

const acao = z.discriminatedUnion('tipo', [
  z.object({ tipo: z.literal('whatsapp'), texto: z.string(), mensagem: z.string().optional() }),
  z.object({ tipo: z.literal('link'), texto: z.string(), href: z.string() }),
]);

// Fields every section accepts: `id` is the anchor (defaults to the type),
// `menu` adds the section to the header nav, `ativo: false` hides it.
const comum = {
  id: z.string().regex(/^[a-z0-9-]+$/).optional(),
  menu: z.string().optional(),
  ativo: z.boolean().default(true),
};

const hero = z.object({
  ...comum,
  tipo: z.literal('hero'),
  titulo: z.string(),
  subtitulo: z.string(),
  selo: z.string().optional(),
  acao_principal: acao,
  acao_secundaria: acao.optional(),
  imagem: imagem.optional(),
});

const servicos = z.object({
  ...comum,
  tipo: z.literal('servicos'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  itens: z.array(z.object({ icone: z.enum(NOMES_ICONES), titulo: z.string(), descricao: z.string() })).min(1),
});

const sobre = z.object({
  ...comum,
  tipo: z.literal('sobre'),
  titulo: z.string(),
  paragrafos: z.array(z.string()).min(1),
  imagem: imagem.optional(),
  registros: z.array(z.object({ rotulo: z.string(), valor: z.string() })).optional(),
  equipe: z
    .array(
      z.object({
        nome: z.string(),
        cargo: z.string(),
        registro: z.string().optional(),
        bio: z.string().optional(),
        foto: imagem.optional(),
      }),
    )
    .optional(),
});

const comoFunciona = z.object({
  ...comum,
  tipo: z.literal('como_funciona'),
  titulo: z.string(),
  subtitulo: z.string().optional(),
  passos: z.array(z.object({ titulo: z.string(), descricao: z.string() })).min(1),
});

const depoimentos = z.object({
  ...comum,
  tipo: z.literal('depoimentos'),
  titulo: z.string(),
  itens: z.array(z.object({ nome: z.string(), texto: z.string(), detalhe: z.string().optional() })).min(1),
  // Small print under the testimonials (e.g. that they are published with the patient's consent).
  nota: z.string().optional(),
});

const convenios = z.object({
  ...comum,
  tipo: z.literal('convenios'),
  titulo: z.string(),
  texto: z.string().optional(),
  itens: z.array(z.string()).min(1),
});

const faq = z.object({
  ...comum,
  tipo: z.literal('faq'),
  titulo: z.string(),
  itens: z.array(z.object({ pergunta: z.string(), resposta: z.string() })).min(1),
});

const campo = z.object({
  nome: z.string().regex(/^[a-z_]+$/),
  rotulo: z.string(),
  tipo: z.enum(['text', 'email', 'tel', 'textarea', 'select']),
  obrigatorio: z.boolean().default(true),
  autocomplete: z.string().optional(),
  opcoes: z.array(z.string()).optional(),
});

const formulario = z.object({
  ...comum,
  tipo: z.literal('formulario'),
  titulo: z.string(),
  texto: z.string().optional(),
  provedor: z.enum(['formspree', 'web3forms']),
  // Public form id (Formspree) or access key (Web3Forms). Empty = demo mode, nothing is sent.
  chave: z.string().default(''),
  campos: z
    .array(campo)
    .min(1)
    .refine((campos) => campos.every((c) => c.tipo !== 'select' || (c.opcoes?.length ?? 0) > 0), {
      message: 'campos do tipo select precisam de opcoes',
    }),
  consentimento: z.string(),
  botao: z.string(),
  mensagem_sucesso: z.string(),
});

const mapa = z.object({
  ...comum,
  tipo: z.literal('mapa'),
  titulo: z.string(),
  embed_url: z.url().optional(),
});

const rodape = z.object({
  ...comum,
  tipo: z.literal('rodape'),
  texto: z.string().optional(),
  registros: z.array(z.string()).optional(),
  links: z.array(z.object({ texto: z.string(), href: z.string() })).optional(),
});

const botaoWhatsApp = z.object({
  ...comum,
  tipo: z.literal('botao_whatsapp'),
  rotulo: z.string().default('Fale conosco pelo WhatsApp'),
  mensagem: z.string().optional(),
});

const secao = z.discriminatedUnion('tipo', [
  hero,
  servicos,
  sobre,
  comoFunciona,
  depoimentos,
  convenios,
  faq,
  formulario,
  mapa,
  rodape,
  botaoWhatsApp,
]);

export const nichoSchema = z
  .object({
    demo: z.boolean().default(false),
    site: z.object({
      nome: z.string(),
      titulo: z.string(),
      descricao: z.string().max(170, 'a descrição de SEO deve ter até 170 caracteres'),
      // Production address: canonical, Open Graph, sitemap and JSON-LD need it.
      url: z.url({ protocol: /^https?$/ }).optional(),
      // schema.org type of the business in the JSON-LD (default LocalBusiness).
      schema_tipo: z.enum(TIPOS_SCHEMA).optional(),
      idioma: z.string().default('pt-BR'),
    }),
    tema: z.object({
      cor_primaria: cor,
      cor_primaria_contraste: cor.default('#FFFFFF'),
      cor_destaque: cor,
      cor_fundo: cor,
      cor_superficie: cor,
      cor_texto: cor,
      cor_texto_suave: cor,
      fonte_titulo: z.string(),
      fonte_texto: z.string(),
      fontes: z.array(fonte).default([]),
    }),
    contato: z.object({
      whatsapp: z.string().regex(/^\d{12,13}$/, 'DDI + DDD + número, só dígitos, ex.: 5511999990000'),
      mensagem_whatsapp: z.string(),
      email: z.email(),
      telefone: z.string().optional(),
      endereco: z
        .object({
          logradouro: z.string(),
          bairro: z.string().optional(),
          cidade: z.string(),
          uf: z.string().length(2),
          cep: z.string().optional(),
        })
        .optional(),
      horario: z.array(z.string()).optional(),
    }),
    rastreamento: z
      .object({
        google_analytics: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
        meta_pixel: z.string().regex(/^\d+$/).optional(),
      })
      .default({}),
    // Words the niche copy must never use (e.g. advertising rules of a professional council);
    // tests/nichos.test.ts fails the build when any text contains one.
    revisao: z.object({ termos_vetados: z.array(z.string().min(2)).min(1) }).optional(),
    // Niches with a Cloudflare Pages project are deployed by CI; the others are only built.
    publicacao: z
      .object({
        cloudflare_projeto: z
          .string()
          .regex(/^[a-z0-9][a-z0-9-]{0,56}[a-z0-9]$/, 'nome do projeto: letras minúsculas, números e hífens, até 58 caracteres'),
      })
      .optional(),
    secoes: z.array(secao).min(1),
  })
  .superRefine((nicho, ctx) => {
    const ids = nicho.secoes.map(ancoraSecao);
    const repetidos = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (repetidos.length > 0) {
      ctx.addIssue({ code: 'custom', path: ['secoes'], message: `ids de seção repetidos: ${[...new Set(repetidos)].join(', ')}` });
    }
    const pilhas = [nicho.tema.fonte_titulo, nicho.tema.fonte_texto].flatMap(separarPilha).map((nome) => nome.toLowerCase());
    nicho.tema.fontes.forEach((f, i) => {
      if (!pilhas.includes(f.familia.toLowerCase())) {
        ctx.addIssue({ code: 'custom', path: ['tema', 'fontes', i, 'familia'], message: `"${f.familia}" não aparece em fonte_titulo nem em fonte_texto` });
      }
    });
    const precisaEndereco = nicho.secoes.some((s) => s.tipo === 'mapa' && !s.embed_url);
    if (precisaEndereco && !nicho.contato.endereco) {
      ctx.addIssue({ code: 'custom', path: ['contato', 'endereco'], message: 'a seção mapa precisa de embed_url ou de contato.endereco' });
    }
  });

export type Nicho = z.output<typeof nichoSchema>;
export type Secao = Nicho['secoes'][number];
export type SecaoDo<T extends Secao['tipo']> = Extract<Secao, { tipo: T }>;
export type Acao = z.output<typeof acao>;
export type Imagem = z.output<typeof imagem>;

/** Anchor id of a section: its `id`, or its type in kebab-case. */
export function ancoraSecao(secao: { id?: string | undefined; tipo: string }): string {
  return secao.id ?? secao.tipo.replaceAll('_', '-');
}
