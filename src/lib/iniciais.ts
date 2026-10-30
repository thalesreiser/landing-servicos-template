// Lowercase particles skipped in Portuguese names ("Ana de Souza" -> "AS").
const PARTICULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du', 'van', 'von']);

/** Monogram for a person without a photo: first and last name initials, e.g. "Helena Ribeiro Antunes" -> "HA". */
export function iniciais(nome: string): string {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter((parte) => parte && !PARTICULAS.has(parte.toLowerCase()));
  if (partes.length === 0) return '';
  const primeira = partes[0]!;
  const ultima = partes.length > 1 ? partes[partes.length - 1]! : '';
  return (primeira.charAt(0) + ultima.charAt(0)).toLocaleUpperCase('pt-BR');
}
