// Stroke icons on a 24x24 grid, drawn with currentColor. Names are what a niche
// JSON uses in `icone`.
export const ICONES = {
  balanca: [
    'M12 3v18',
    'M7 21h10',
    'M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2',
    'm2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
    'm16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z',
  ],
  maleta: ['M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z', 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'],
  casa: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z'],
  pessoas: [
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
    'M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2',
    'M16 3.13a4 4 0 0 1 0 7.75',
    'M22 21v-2a4 4 0 0 0-3-3.87',
  ],
  documento: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z', 'M14 2v6h6', 'M8 13h8', 'M8 17h8'],
  escudo: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'],
  coracao: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z',
  ],
  atividade: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  calendario: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  relogio: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  celular: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'],
  email: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'm22 7-10 6L2 7'],
  local: ['M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z', 'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  check: ['M20 6 9 17l-5-5'],
  mensagem: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  estrela: ['m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z'],
} as const;

export type NomeIcone = keyof typeof ICONES;

export const NOMES_ICONES = Object.keys(ICONES) as [NomeIcone, ...NomeIcone[]];
