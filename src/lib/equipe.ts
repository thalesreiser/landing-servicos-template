/** Tailwind classes of the team grid: the list itself and each card. */
export interface GradeEquipe {
  lista: string;
  cartao?: string | undefined;
}

/**
 * Team grid by head count. The columns follow the number of people, so there is never an
 * empty column; when there are fewer people than the desktop grid has columns, the list is
 * narrowed and centred instead of leaving the empty space on the right.
 */
export function gradeEquipe(quantidade: number): GradeEquipe {
  if (quantidade <= 1) return { lista: 'mx-auto max-w-md' };
  if (quantidade === 2) return { lista: 'mx-auto max-w-4xl sm:grid-cols-2' };
  // 3 people: on tablets (two columns) the third card takes the whole row instead of half of it.
  if (quantidade === 3) return { lista: 'sm:grid-cols-2 lg:grid-cols-3', cartao: 'sm:max-lg:last:col-span-2' };
  if (quantidade === 4) return { lista: 'sm:grid-cols-2 lg:grid-cols-4' };
  return { lista: 'sm:grid-cols-2 lg:grid-cols-3' };
}
