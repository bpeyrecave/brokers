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

export type EventImpact = "HIGH" | "MEDIUM" | "LOW";

export interface FxEvent {
  title: string;
  country: string;
  date: string; // ISO datetime
  impact: EventImpact;
  forecast: string | null;
  previous: string | null;
  note: string;
}

export interface EventsData {
  source: string | string[];
  fetchedAt: string;
  ok: boolean;
  events: FxEvent[];
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

export type FeeMode = "market" | "real";

export interface FeeSettings {
  mode: FeeMode;
  /** Percentage points shaved off the market rate as provider markup, e.g. 0.4 for 0.4%. */
  markupPercent: number;
  /** Flat fee per conversion, in USD. */
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
