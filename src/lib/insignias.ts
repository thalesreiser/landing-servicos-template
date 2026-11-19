// Credential badges in the hero (hero.insignias, Insignia.astro): decorative and aria-hidden,
// so their text must only repeat facts already written on the page.

// "circular": text on a ring around an icon (SVG); "etiqueta": a label with an inner hairline (HTML).
export const MODELOS_INSIGNIA = ['circular', 'etiqueta'] as const;
export type ModeloInsignia = (typeof MODELOS_INSIGNIA)[number];

// Badge background; the text is always the page background color (tests/contraste.test.ts).
export const CORES_INSIGNIA = ['primaria', 'destaque'] as const;
export type CorInsignia = (typeof CORES_INSIGNIA)[number];

// The label stays short; the ring has room for a few more characters at the same legible size.
export const LIMITE_INSIGNIA: Record<ModeloInsignia, number> = { etiqueta: 22, circular: 26 };

export const MAXIMO_INSIGNIAS = 2;

/** Text around the ring: ends with a separator so it meets its own start; short texts go round twice. */
export function textoAnel(texto: string): string {
  const volta = `${texto.trim().toUpperCase()} · `;
  return volta.length <= 17 ? volta.repeat(2) : volta;
}

let contador = 0;

/** Unique id for the ring path of each rendered badge (a page can render a badge twice). */
export function idInsignia(): string {
  contador += 1;
  return `insignia-${contador}`;
}
