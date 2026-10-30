// Lazy import.meta.glob of src/assets/nichos/<NICHO>/ (vite plugin in astro.config.mjs).
declare module 'virtual:imagens-nicho' {
  const imagens: Record<string, () => Promise<{ default: ImageMetadata }>>;
  export default imagens;
}
