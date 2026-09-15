const eurFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" });
const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const eurNoDecimals = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function formatEUR(value: number): string {
  return eurFormatter.format(value);
}

export function formatEURCompact(value: number): string {
  return eurNoDecimals.format(value);
}

export function formatUSD(value: number): string {
  return usdFormatter.format(value);
}

export function formatRate(rate: number): string {
  return rate.toFixed(4);
}

export function formatSignedEUR(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${eurFormatter.format(Math.abs(value))}`;
}

export function formatSignedPercent(value: number, digits = 2): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
