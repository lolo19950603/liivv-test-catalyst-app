/** Split a dollar amount across lines proportionally; last line absorbs rounding remainder. */
export function allocateAmountBySubtotal(lineSubtotals: number[], totalAmount: number): number[] {
  if (lineSubtotals.length === 0 || totalAmount <= 0) {
    return lineSubtotals.map(() => 0);
  }

  const subtotalSum = lineSubtotals.reduce((sum, value) => sum + value, 0);

  if (subtotalSum <= 0) {
    return lineSubtotals.map(() => 0);
  }

  const totalCents = Math.round(totalAmount * 100);
  let allocatedCents = 0;

  return lineSubtotals.map((lineSubtotal, index) => {
    if (index === lineSubtotals.length - 1) {
      return (totalCents - allocatedCents) / 100;
    }

    const shareCents = Math.round((lineSubtotal / subtotalSum) * totalCents);

    allocatedCents += shareCents;

    return shareCents / 100;
  });
}
