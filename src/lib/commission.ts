/** Monthly employee commission tiers based on delivered order totals. */
export function getCommissionRate(monthlyTotal: number): number {
  if (monthlyTotal > 200_000_000) return 0.07;
  if (monthlyTotal >= 100_000_000) return 0.05;
  return 0.03;
}

export function calculateCommission(monthlyTotal: number): {
  total: number;
  rate: number;
  percentLabel: string;
  commission: number;
} {
  const rate = getCommissionRate(monthlyTotal);
  return {
    total: monthlyTotal,
    rate,
    percentLabel: `${Math.round(rate * 100)}٪`,
    commission: Math.floor(monthlyTotal * rate),
  };
}
