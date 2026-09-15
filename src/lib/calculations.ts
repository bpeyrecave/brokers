import { addDays, daysBetween, monthKey, thirteenthOf, todayISO } from "./dates";
import type { FavorabilityLabel, FeeSettings, FxPoint } from "./types";

export function convertMarket(usdAmount: number, rate: number): number {
  return usdAmount * rate;
}

export interface ConversionResult {
  eur: number;
  feesUsd: number;
  effectiveRate: number;
}

// Calibrated against a real Wise quote: sending a USD balance already held in
// Wise to an external EUR bank account, $5,000 -> $15.01 fee (0.30%), no rate
// markup. There's only one real data point to calibrate from, so both tiers
// default to the same percentage (effectively flat) - lower feePercentAbove if
// a quote at a larger amount ever shows the real step-down.
export const WISE_FEES: FeeSettings = {
  feePercentBelow: 0.3,
  feePercentAbove: 0.3,
  tierThresholdUsd: 1000,
  fixedFeeUsd: 0,
};

/**
 * Applies the Wise fee model on top of the market rate: the exchange rate
 * itself is untouched (Wise converts at the real mid-market rate) and instead
 * a transparent fee is deducted from the USD before conversion, matching how
 * Wise actually charges. The percentage fee is applied in two marginal tiers -
 * like a tax bracket - since Wise's real percentage fee gets cheaper as the
 * amount grows: a higher rate on the portion up to the threshold, a lower
 * rate above it.
 */
export function convertWithFees(usdAmount: number, rate: number, fees: FeeSettings): ConversionResult {
  if (usdAmount <= 0) {
    return { eur: convertMarket(usdAmount, rate), feesUsd: 0, effectiveRate: rate };
  }
  const belowAmount = Math.min(usdAmount, fees.tierThresholdUsd);
  const aboveAmount = Math.max(usdAmount - fees.tierThresholdUsd, 0);
  const feesUsd = belowAmount * (fees.feePercentBelow / 100) + aboveAmount * (fees.feePercentAbove / 100) + fees.fixedFeeUsd;
  const usdAfterFees = Math.max(usdAmount - feesUsd, 0);
  const eur = usdAfterFees * rate;
  return { eur, feesUsd, effectiveRate: rate };
}

function findExact(series: FxPoint[], iso: string): FxPoint | undefined {
  return series.find((p) => p.date === iso);
}

/**
 * Resolves a calendar date to an actual trading-day point: exact match if the
 * market was open, otherwise the nearest earlier day, otherwise the nearest
 * later day. Returns null if the series has no data at all near that date.
 */
export function resolveTradingPoint(
  series: FxPoint[],
  iso: string,
): { point: FxPoint; exact: boolean } | null {
  const exact = findExact(series, iso);
  if (exact) return { point: exact, exact: true };

  let before: FxPoint | undefined;
  for (const p of series) {
    if (p.date < iso && (!before || p.date > before.date)) before = p;
  }
  if (before) return { point: before, exact: false };

  let after: FxPoint | undefined;
  for (const p of series) {
    if (p.date > iso && (!after || p.date < after.date)) after = p;
  }
  if (after) return { point: after, exact: false };

  return null;
}

export function latestPoint(series: FxPoint[]): FxPoint | undefined {
  return series[series.length - 1];
}

/** The 13th of the month before the given "yyyy-mm-13" (or any) date. */
export function previousThirteenthIso(thirteenthIso: string): string {
  const prevMonthAnchor = addDays(thirteenthIso, -20); // lands in the previous month
  return thirteenthOf(prevMonthAnchor);
}

/** The most recent "13th of the month" benchmark date on or before `asOfIso`. */
export function mostRecentThirteenthIso(asOfIso: string): string {
  const day = Number(asOfIso.slice(8, 10));
  if (day >= 13) return thirteenthOf(asOfIso);
  return previousThirteenthIso(thirteenthOf(asOfIso));
}

export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return ((to - from) / from) * 100;
}

/** % of comparison values strictly below `value` — i.e. how good `value` is versus history. */
export function percentileRank(value: number, values: number[]): number {
  if (values.length === 0) return 50;
  const below = values.filter((v) => v < value).length;
  return (below / values.length) * 100;
}

export function classifyFavorability(percentile: number): FavorabilityLabel {
  if (percentile >= 90) return "VERY_FAVORABLE";
  if (percentile >= 65) return "FAVORABLE";
  if (percentile >= 35) return "AVERAGE";
  if (percentile >= 10) return "UNFAVORABLE";
  return "VERY_UNFAVORABLE";
}

export const FAVORABILITY_LABELS: Record<FavorabilityLabel, string> = {
  VERY_FAVORABLE: "Very favorable",
  FAVORABLE: "Favorable",
  AVERAGE: "Average",
  UNFAVORABLE: "Unfavorable",
  VERY_UNFAVORABLE: "Very unfavorable",
};

export interface RangeStats {
  avg: number;
  min: FxPoint;
  max: FxPoint;
  count: number;
}

/** Stats over the trailing `days` calendar days ending at (and including) `asOfIso`. */
export function statsForTrailingDays(series: FxPoint[], asOfIso: string, days: number): RangeStats | null {
  const start = addDays(asOfIso, -days);
  const points = series.filter((p) => p.date > start && p.date <= asOfIso);
  if (points.length === 0) return null;
  const sum = points.reduce((s, p) => s + p.rate, 0);
  let min = points[0];
  let max = points[0];
  for (const p of points) {
    if (p.rate < min.rate) min = p;
    if (p.rate > max.rate) max = p;
  }
  return { avg: sum / points.length, min, max, count: points.length };
}

/** Stats for the calendar month containing `asOfIso`, only counting days up to and including it. */
export function statsForMonthToDate(series: FxPoint[], asOfIso: string): RangeStats | null {
  const key = monthKey(asOfIso);
  const points = series.filter((p) => monthKey(p.date) === key && p.date <= asOfIso);
  if (points.length === 0) return null;
  const sum = points.reduce((s, p) => s + p.rate, 0);
  let min = points[0];
  let max = points[0];
  for (const p of points) {
    if (p.rate < min.rate) min = p;
    if (p.rate > max.rate) max = p;
  }
  return { avg: sum / points.length, min, max, count: points.length };
}

export interface BenchmarkComparison {
  benchmarkDateRequested: string;
  benchmarkPoint: FxPoint;
  benchmarkExact: boolean;
  todayPoint: FxPoint;
  eurAtBenchmark: number;
  eurToday: number;
  diffEur: number;
  diffPercent: number;
}

export function compareToThirteenth(
  series: FxPoint[],
  usdAmount: number,
  asOfIso: string,
): BenchmarkComparison | null {
  const today = resolveTradingPoint(series, asOfIso);
  if (!today) return null;
  const benchmarkDateRequested = mostRecentThirteenthIso(asOfIso);
  const benchmark = resolveTradingPoint(series, benchmarkDateRequested);
  if (!benchmark) return null;

  const eurAtBenchmark = convertMarket(usdAmount, benchmark.point.rate);
  const eurToday = convertMarket(usdAmount, today.point.rate);

  return {
    benchmarkDateRequested,
    benchmarkPoint: benchmark.point,
    benchmarkExact: benchmark.exact,
    todayPoint: today.point,
    eurAtBenchmark,
    eurToday,
    diffEur: eurToday - eurAtBenchmark,
    diffPercent: percentChange(eurAtBenchmark, eurToday),
  };
}

export interface TimeComparisonRow {
  label: string;
  dateRequested: string;
  point: FxPoint;
  exact: boolean;
  eur: number;
}

export function buildTimeComparison(series: FxPoint[], usdAmount: number, asOfIso: string): TimeComparisonRow[] {
  const rows: { label: string; dateRequested: string }[] = [
    { label: "Today", dateRequested: asOfIso },
    { label: "Yesterday", dateRequested: addDays(asOfIso, -1) },
    { label: "7 days ago", dateRequested: addDays(asOfIso, -7) },
    { label: "30 days ago", dateRequested: addDays(asOfIso, -30) },
    { label: "13th of this month", dateRequested: mostRecentThirteenthIso(asOfIso) },
  ];

  return rows
    .map((r) => {
      const resolved = resolveTradingPoint(series, r.dateRequested);
      if (!resolved) return null;
      return {
        label: r.label,
        dateRequested: r.dateRequested,
        point: resolved.point,
        exact: resolved.exact,
        eur: convertMarket(usdAmount, resolved.point.rate),
      };
    })
    .filter((r): r is TimeComparisonRow => r !== null);
}

export interface WhatIfResult {
  requestedDate: string;
  resolved: FxPoint;
  exact: boolean;
  eur: number;
  eurToday: number;
  diffEur: number;
  diffPercent: number;
}

export function whatIfExchangedOn(
  series: FxPoint[],
  usdAmount: number,
  dateIso: string,
  asOfIso: string,
): WhatIfResult | null {
  const resolved = resolveTradingPoint(series, dateIso);
  const today = resolveTradingPoint(series, asOfIso);
  if (!resolved || !today) return null;
  const eur = convertMarket(usdAmount, resolved.point.rate);
  const eurToday = convertMarket(usdAmount, today.point.rate);
  return {
    requestedDate: dateIso,
    resolved: resolved.point,
    exact: resolved.exact,
    eur,
    eurToday,
    diffEur: eurToday - eur,
    diffPercent: percentChange(eur, eurToday),
  };
}

export interface DecisionSummary {
  percentile30: number;
  percentile90: number;
  blendedPercentile: number;
  label: FavorabilityLabel;
  vs30dAvgPercent: number;
  vsThirteenthPercent: number;
  advantageVsThirteenthEur: number;
}

export function buildDecisionSummary(series: FxPoint[], usdAmount: number, asOfIso: string): DecisionSummary | null {
  const today = resolveTradingPoint(series, asOfIso);
  if (!today) return null;

  const last30 = statsForTrailingDays(series, asOfIso, 30);
  const start30 = addDays(asOfIso, -30);
  const start90 = addDays(asOfIso, -90);
  const values30 = series.filter((p) => p.date > start30 && p.date <= asOfIso).map((p) => p.rate);
  const values90 = series.filter((p) => p.date > start90 && p.date <= asOfIso).map((p) => p.rate);

  const percentile30 = percentileRank(today.point.rate, values30);
  const percentile90 = percentileRank(today.point.rate, values90);
  const blended = (percentile30 + percentile90) / 2;

  const benchmark = compareToThirteenth(series, usdAmount, asOfIso);

  return {
    percentile30,
    percentile90,
    blendedPercentile: blended,
    label: classifyFavorability(blended),
    vs30dAvgPercent: last30 ? percentChange(last30.avg, today.point.rate) : 0,
    vsThirteenthPercent: benchmark ? percentChange(benchmark.benchmarkPoint.rate, today.point.rate) : 0,
    advantageVsThirteenthEur: benchmark ? benchmark.diffEur : 0,
  };
}

export interface HodlSummary {
  daysSince13th: string;
  benchmarkDate: string;
  eurAtBenchmark: number;
  eurToday: number;
  diffEur: number;
}

export function buildHodlSummary(series: FxPoint[], usdAmount: number, asOfIso: string): HodlSummary | null {
  const cmp = compareToThirteenth(series, usdAmount, asOfIso);
  if (!cmp) return null;
  const days = daysBetween(cmp.benchmarkPoint.date, asOfIso);
  return {
    daysSince13th: `${days} ${days === 1 ? "day" : "days"}`,
    benchmarkDate: cmp.benchmarkPoint.date,
    eurAtBenchmark: cmp.eurAtBenchmark,
    eurToday: cmp.eurToday,
    diffEur: cmp.diffEur,
  };
}

export interface MonthlyBenchmarkRow {
  monthKey: string; // yyyy-mm
  dateRequested: string;
  point: FxPoint; // the benchmark (13th) point
  exact: boolean;
  eur: number; // value at the benchmark rate
  bestPoint: FxPoint; // the best rate available that same calendar month
  bestEur: number; // value at that best rate
  upsideEur: number; // bestEur - eur: what perfect timing would have added that month
}

function bestRateInMonth(series: FxPoint[], key: string): FxPoint | null {
  let best: FxPoint | null = null;
  for (const p of series) {
    if (monthKey(p.date) === key && (!best || p.rate > best.rate)) best = p;
  }
  return best;
}

/**
 * The organization's 13th-of-the-month benchmark, applied to a fixed USD
 * amount, for each of the trailing `months` months ending at the most recent
 * 13th on or before `asOfIso` - alongside what the best rate available that
 * same month would have given you. Returned oldest first.
 */
export function buildMonthlyThirteenths(
  series: FxPoint[],
  usdAmount: number,
  asOfIso: string,
  months = 12,
): MonthlyBenchmarkRow[] {
  const rows: MonthlyBenchmarkRow[] = [];
  let anchor = mostRecentThirteenthIso(asOfIso);

  for (let i = 0; i < months; i++) {
    const key = monthKey(anchor);
    const resolved = resolveTradingPoint(series, anchor);
    const best = bestRateInMonth(series, key);
    if (resolved && best) {
      const eur = convertMarket(usdAmount, resolved.point.rate);
      const bestEur = convertMarket(usdAmount, best.rate);
      rows.push({
        monthKey: key,
        dateRequested: anchor,
        point: resolved.point,
        exact: resolved.exact,
        eur,
        bestPoint: best,
        bestEur,
        upsideEur: bestEur - eur,
      });
    }
    anchor = previousThirteenthIso(anchor);
  }

  return rows.reverse();
}

export interface SmartMetrics {
  avg30: number;
  avg90: number;
  bestThisMonth: FxPoint;
  worstThisMonth: FxPoint;
  eurToday: number;
  eurAtBestThisMonth: number;
  distanceFromHighEur: number;
  bestVsThirteenthEur: number;
}

export function buildSmartMetrics(series: FxPoint[], usdAmount: number, asOfIso: string): SmartMetrics | null {
  const today = resolveTradingPoint(series, asOfIso);
  const last30 = statsForTrailingDays(series, asOfIso, 30);
  const last90 = statsForTrailingDays(series, asOfIso, 90);
  const month = statsForMonthToDate(series, asOfIso);
  const benchmark = compareToThirteenth(series, usdAmount, asOfIso);
  if (!today || !last30 || !last90 || !month || !benchmark) return null;

  const eurToday = convertMarket(usdAmount, today.point.rate);
  const eurAtBestThisMonth = convertMarket(usdAmount, month.max.rate);

  return {
    avg30: last30.avg,
    avg90: last90.avg,
    bestThisMonth: month.max,
    worstThisMonth: month.min,
    eurToday,
    eurAtBestThisMonth,
    distanceFromHighEur: eurAtBestThisMonth - eurToday,
    bestVsThirteenthEur: eurAtBestThisMonth - benchmark.eurAtBenchmark,
  };
}

export type ChartRange = "1W" | "1M" | "3M" | "6M" | "YTD" | "1Y";

const RANGE_DAYS: Record<Exclude<ChartRange, "YTD">, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 182,
  "1Y": 365,
};

export function filterRange(series: FxPoint[], asOfIso: string, range: ChartRange): FxPoint[] {
  let start: string;
  if (range === "YTD") {
    start = `${asOfIso.slice(0, 4)}-01-01`;
  } else {
    start = addDays(asOfIso, -RANGE_DAYS[range]);
  }
  return series.filter((p) => p.date >= start && p.date <= asOfIso);
}

/** ISO dates of "the 13th" that fall within the span covered by the given points. */
export function thirteenthsWithin(points: FxPoint[]): string[] {
  if (points.length === 0) return [];
  const first = points[0].date;
  const last = points[points.length - 1].date;
  const keys = new Set(points.map((p) => monthKey(p.date)));
  return Array.from(keys)
    .sort()
    .map((k) => `${k}-13`)
    .filter((d) => d >= first && d <= last);
}

export function todayOrLatest(series: FxPoint[]): string {
  const latest = latestPoint(series);
  return latest?.date ?? todayISO();
}
