// Small kicker above each section title (tema.rotulos, TituloSecao.astro): "01 · Serviços",
// "II · O escritório" or just "Serviços". Decorative (aria-hidden): the H2 carries the meaning.

export const ESTILOS_ROTULO = ['nenhum', 'numerados', 'romanos', 'texto'] as const;
export type EstiloRotulo = (typeof ESTILOS_ROTULO)[number];

const ROMANOS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** Roman numeral of a positive integer (1 → "I", 4 → "IV"). */
export function romano(n: number): string {
  let resto = n;
  let saida = '';
  for (const [valor, simbolo] of ROMANOS) {
    while (resto >= valor) {
      saida += simbolo;
      resto -= valor;
    }
  }
  return saida;
}

/**
 * Kicker of each section, in page order. The hero has none and the count starts at the first
 * section after it; the text is `rotulo`, or the menu label. "texto" without a text gives none.
 */
export function rotulosDasSecoes(
  secoes: { tipo: string; menu?: string | undefined; rotulo?: string | undefined }[],
  estilo: EstiloRotulo,
): (string | undefined)[] {
  let numero = 0;
  return secoes.map((secao) => {
    if (secao.tipo === 'hero') return undefined;
    numero += 1;
    const texto = secao.rotulo ?? secao.menu;
    if (estilo === 'nenhum') return undefined;
    if (estilo === 'texto') return texto;
    const marca = estilo === 'romanos' ? romano(numero) : String(numero).padStart(2, '0');
    return texto ? `${marca} · ${texto}` : marca;
  });
}
