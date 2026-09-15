/** One daily USD->EUR rate point: 1 USD = `rate` EUR. */
export interface FxPoint {
  date: string; // ISO yyyy-mm-dd
  rate: number;
}

export interface FxHistory {
  base: "USD";
  quote: "EUR";
  source: string;
  fetchedAt: string;
  series: FxPoint[];
}

export interface FxBrief {
  ok: boolean;
  generatedAt: string;
  model?: string;
  headline: string;
  summary: string;
  whatMattersNext: { date: string; label: string }[];
  forYou: string;
}

/**
 * Wise (and providers like it) don't mark up the exchange rate itself - you get
 * the real mid-market rate - they charge a transparent fee instead: a small flat
 * fee plus a percentage of the amount that itself gets cheaper as the amount
 * grows. Modeled here as two marginal tiers (like a tax bracket): a higher
 * percentage on the portion of the amount up to `tierThresholdUsd`, and a lower
 * percentage on the portion above it.
 */
export interface FeeSettings {
  /** Fee percentage applied to the portion of the amount up to tierThresholdUsd. */
  feePercentBelow: number;
  /** Fee percentage applied to the portion of the amount above tierThresholdUsd. */
  feePercentAbove: number;
  /** USD amount where the fee percentage steps down. */
  tierThresholdUsd: number;
  /** Flat fee per transfer, in USD. */
  fixedFeeUsd: number;
}

export interface ConversionRecord {
  id: string;
  amountUsd: number;
  date: string; // ISO yyyy-mm-dd, date converted
  rate: number; // actual rate used (1 USD = rate EUR)
  eurReceived: number; // actual EUR received, after fees
  feesUsd: number; // total fees, expressed in USD-equivalent, for display
  note?: string;
  createdAt: string;
}

export type FavorabilityLabel =
  | "VERY_FAVORABLE"
  | "FAVORABLE"
  | "AVERAGE"
  | "UNFAVORABLE"
  | "VERY_UNFAVORABLE";
