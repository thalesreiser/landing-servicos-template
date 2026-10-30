export interface Endereco {
  logradouro: string;
  bairro?: string | undefined;
  cidade: string;
  uf: string;
  cep?: string | undefined;
}

/** One-line address, e.g. "Rua A, 10 - Centro, São Paulo/SP, 01000-000". */
export function formatarEndereco(endereco: Endereco): string {
  const rua = endereco.bairro ? `${endereco.logradouro} - ${endereco.bairro}` : endereco.logradouro;
  const cidade = `${endereco.cidade}/${endereco.uf}`;
  return [rua, cidade, endereco.cep].filter(Boolean).join(', ');
}

/** Google Maps embed URL that needs no API key. */
export function urlMapa(endereco: Endereco): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(formatarEndereco(endereco))}&output=embed`;
}

/** Google Maps search link (opens the app on phones), for the "Abrir no Google Maps" button. */
export function urlAbrirMapa(endereco: Endereco): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatarEndereco(endereco))}`;
}
