/** Employee commission is a fixed 20% of delivered order totals for the month. */
export function getCommissionRate(): number {
  return 0.2;
}

export function calculateCommission(monthlyTotal: number): {
  total: number;
  rate: number;
  percentLabel: string;
  commission: number;
} {
  const rate = getCommissionRate();
  return {
    total: monthlyTotal,
    rate,
    percentLabel: `${Math.round(rate * 100)}٪`,
    commission: Math.floor(monthlyTotal * rate),
  };
}
