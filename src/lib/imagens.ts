// Niche images live in src/assets/nichos/<nicho>/ so astro:assets can optimize them
// (files in public/ are copied as they are). The JSON `src` is relative to that folder.

export const PASTA_IMAGENS = '/src/assets/nichos';
export const EXTENSOES_IMAGEM = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const;

// Relative path, no "..", ending in a supported extension: "hero.jpg", "equipe/helena.webp".
export const PADRAO_SRC_IMAGEM = new RegExp(
  `^(?!.*(?:^|/)\.\.(?:/|$))[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*\.(?:${EXTENSOES_IMAGEM.join('|')})$`,
  'i',
);

/** Project path (import.meta.glob key) of an image from nichos/<nicho>.json. */
export function caminhoImagem(nicho: string, src: string): string {
  if (!PADRAO_SRC_IMAGEM.test(src)) {
    throw new Error(
      `Imagem "${src}" do nicho "${nicho}": use um caminho relativo a ${PASTA_IMAGENS.slice(1)}/${nicho}/ ` +
        `terminado em ${EXTENSOES_IMAGEM.map((e) => `.${e}`).join(', ')} (ex.: "hero.jpg").`,
    );
  }
  return `${PASTA_IMAGENS}/${nicho}/${src}`;
}

/** Looks the image up in the import.meta.glob result; a missing file fails the build with its path. */
export function resolverImagem<T>(arquivos: Record<string, T>, nicho: string, src: string): T {
  const caminho = caminhoImagem(nicho, src);
  const arquivo = arquivos[caminho];
  if (arquivo === undefined) {
    const prefixo = `${PASTA_IMAGENS}/${nicho}/`;
    const existentes = Object.keys(arquivos)
      .filter((chave) => chave.startsWith(prefixo))
      .map((chave) => chave.slice(prefixo.length));
    throw new Error(
      `Imagem "${src}" do nicho "${nicho}" não encontrada: crie o arquivo ${caminho.slice(1)}.` +
        (existentes.length > 0 ? ` Arquivos nessa pasta: ${existentes.join(', ')}.` : ''),
    );
  }
  return arquivo;
}

/** Widths for srcset: the given candidates up to the file's own width (never upscaled). */
export function largurasImagem(larguraOriginal: number, candidatas: number[]): number[] {
  const larguras = candidatas.filter((largura) => largura < larguraOriginal);
  return [...new Set([...larguras, Math.min(larguraOriginal, Math.max(...candidatas))])].sort((a, b) => a - b);
}
