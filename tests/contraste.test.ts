import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { misturar, razaoContraste } from '../src/lib/contraste.ts';
import { nichoSchema } from '../src/lib/schema.ts';
import { coresFaixa, fundoMalha } from '../src/lib/tema.ts';

const AA = 4.5;
// Footer text sits at 80% opacity over the text color (Rodape.astro).
const OPACIDADE_RODAPE = 0.8;
// Fixed color of the floating WhatsApp button (BotaoWhatsApp.astro).
const VERDE_WHATSAPP = '#1D7D4A';
// Fixed color of form field errors (--color-erro in global.css).
const COR_ERRO = '#B42318';

test('contrast ratio matches the WCAG reference values', () => {
  assert.equal(razaoContraste('#000000', '#FFFFFF'), 21);
  assert.equal(razaoContraste('#777777', '#777777'), 1);
  assert.equal(Math.round(razaoContraste('#767676', '#FFFFFF') * 100) / 100, 4.54);
});

test('blends a color over a background', () => {
  assert.equal(misturar('#FFFFFF', '#000000', 0.5), '#808080');
  assert.equal(misturar('#FFFFFF', '#000000', 1), '#ffffff');
});

test('floating WhatsApp button text passes AA', () => {
  assert.ok(razaoContraste('#FFFFFF', VERDE_WHATSAPP) >= AA);
});

const pasta = new URL('../nichos/', import.meta.url);
for (const arquivo of readdirSync(pasta).filter((a) => a.endsWith('.json'))) {
  test(`nichos/${arquivo} theme passes WCAG AA`, () => {
    const { tema: t } = nichoSchema.parse(JSON.parse(readFileSync(new URL(arquivo, pasta), 'utf8')));
    // Any section can become a primary band (fundo: "primaria"), so its colors are always checked.
    const faixa = coresFaixa(t);
    const pares: [string, string, string][] = [
      ['texto sobre fundo', t.cor_texto, t.cor_fundo],
      ['texto sobre superfície', t.cor_texto, t.cor_superficie],
      ['texto suave sobre fundo', t.cor_texto_suave, t.cor_fundo],
      ['texto suave sobre superfície', t.cor_texto_suave, t.cor_superficie],
      ['botão primário', t.cor_primaria_contraste, t.cor_primaria],
      ['primária sobre fundo', t.cor_primaria, t.cor_fundo],
      ['primária sobre superfície', t.cor_primaria, t.cor_superficie],
      // Accent: step numbers (fundo), testimonial quote marks (fundo), plan chip markers (superfície).
      ['destaque sobre fundo', t.cor_destaque, t.cor_fundo],
      ['destaque sobre superfície', t.cor_destaque, t.cor_superficie],
      // Hero mesh (any light background): heading, subtitle, kicker and secondary button.
      ...(t.fundo_hero === 'liso' ? [] : [t.cor_fundo, t.cor_superficie]).flatMap((base, i): [string, string, string][] => {
        const malha = fundoMalha(t, base);
        const nome = i === 0 ? 'malha do hero sobre fundo' : 'malha do hero sobre superfície';
        return [
          [`texto na ${nome}`, t.cor_texto, malha],
          [`texto suave na ${nome}`, t.cor_texto_suave, malha],
          [`primária na ${nome}`, t.cor_primaria, malha],
        ];
      }),
      ['erro de formulário sobre fundo', COR_ERRO, t.cor_fundo],
      ['erro de formulário sobre superfície', COR_ERRO, t.cor_superficie],
      ['faixa primária: texto e botão invertido', faixa.texto, faixa.fundo],
      ['faixa primária: texto suave', faixa.texto_suave, faixa.fundo],
      ['faixa primária: destaque', faixa.destaque, faixa.fundo],
      ['rodapé, aviso de demonstração e aviso de cookies', t.cor_fundo, t.cor_texto],
      ['rodapé a 80%', misturar(t.cor_fundo, t.cor_texto, OPACIDADE_RODAPE), t.cor_texto],
    ];
    const reprovados = pares
      .map(([nome, a, b]) => ({ nome, razao: razaoContraste(a, b) }))
      .filter(({ razao }) => razao < AA)
      .map(({ nome, razao }) => `${nome}: ${razao.toFixed(2)}`);
    assert.deepEqual(reprovados, [], `pares abaixo de ${AA}:1`);
  });
}
