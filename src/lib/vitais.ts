// Real-user Web Vitals (field data) sent to GA4 after cookie consent, see AvisoCookies.astro.

/** GA4 event for a web-vitals metric (field data). CLS goes x1000 into `value`, which GA4 sums as an integer. */
export function eventoVital(metrica: {
  name: string;
  value: number;
  delta: number;
  id: string;
  rating: string;
}): ['event', string, Record<string, string | number>] {
  const fator = metrica.name === 'CLS' ? 1000 : 1;
  return [
    'event',
    metrica.name,
    {
      value: Math.round(metrica.delta * fator),
      metric_id: metrica.id,
      metric_value: metrica.value,
      metric_delta: metrica.delta,
      metric_rating: metrica.rating,
    },
  ];
}
