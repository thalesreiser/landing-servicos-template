// Shape tokens of the theme: tema.raio picks the corner radii that Base.astro emits as CSS variables.

export const RAIOS = ['reto', 'medio', 'suave'] as const;
export type Raio = (typeof RAIOS)[number];

// Card treatment (global.css): outlined, raised with a soft shadow, or an editorial top rule.
export const CARTOES = ['contorno', 'elevado', 'linha'] as const;
export type Cartao = (typeof CARTOES)[number];

const FORMAS: Record<Raio, { cartao: string; botao: string; campo: string }> = {
  reto: { cartao: '2px', botao: '2px', campo: '2px' },
  medio: { cartao: '12px', botao: '8px', campo: '8px' },
  suave: { cartao: '16px', botao: '9999px', campo: '12px' },
};

/** CSS custom properties for cards and images, buttons and chips, and form fields. */
export function variaveisRaio(raio: Raio): string[] {
  const forma = FORMAS[raio];
  return [`--raio:${forma.cartao}`, `--raio-botao:${forma.botao}`, `--raio-campo:${forma.campo}`];
}
