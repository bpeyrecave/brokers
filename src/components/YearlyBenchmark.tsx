import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { buildMonthlyThirteenths } from "../lib/calculations";
import { formatEUR, formatRate } from "../lib/format";
import { formatMonthShortYear } from "../lib/dates";
import { CardTitle } from "./CardTitle";
import { IconBars } from "./icons";
import { InfoTooltip } from "./InfoTooltip";

export function YearlyBenchmark() {
  const { series, asOfIso, amount } = useDashboard();

  const rows = useMemo(() => buildMonthlyThirteenths(series, amount, asOfIso, 12), [series, amount, asOfIso]);
  if (rows.length === 0) return null;

  const values = rows.map((r) => r.eur);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const best = rows.reduce((a, b) => (b.eur > a.eur ? b : a));
  const worst = rows.reduce((a, b) => (b.eur < a.eur ? b : a));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.01);
  const latestMonthKey = rows[rows.length - 1].monthKey;

  return (
    <div className="card">
      <CardTitle icon={IconBars} tone="accent">
        A year of the 13th
        <InfoTooltip text="What your chosen USD amount would have been worth if converted on the organization's benchmark date (the 13th, or nearest trading day) each month, for the last 12 months. Uses the raw market rate, no fees." />
      </CardTitle>
      <div className="card-sub">
        ${amount.toLocaleString("en-US")} converted on the 13th of every month for the last year — this is what the
        automatic option alone would have given you each month.
      </div>

      <div className="bench-summary">
        <div>
          <div className="stat-label">Average</div>
          <div className="stat-value num">{formatEUR(avg)}</div>
        </div>
        <div>
          <div className="stat-label">Best month ({formatMonthShortYear(best.dateRequested)})</div>
          <div className="stat-value num">{formatEUR(best.eur)}</div>
        </div>
        <div>
          <div className="stat-label">Worst month ({formatMonthShortYear(worst.dateRequested)})</div>
          <div className="stat-value num">{formatEUR(worst.eur)}</div>
        </div>
      </div>

      <div className="bench-list">
        {rows.map((row) => {
          const widthPct = 8 + ((row.eur - min) / range) * 92;
          const isLatest = row.monthKey === latestMonthKey;
          const isBest = row.monthKey === best.monthKey;
          const isWorst = row.monthKey === worst.monthKey;
          return (
            <div className={`bench-row${isLatest ? " is-latest" : ""}`} key={row.monthKey}>
              <div className="bench-label">
                {formatMonthShortYear(row.dateRequested)}
                {!row.exact && <span className="bench-note"> · nearest trading day</span>}
              </div>
              <div className="bench-bar-track">
                <div
                  className={`bench-bar-fill${isBest ? " is-best" : ""}${isWorst ? " is-worst" : ""}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <div className="bench-rate num">€{formatRate(row.point.rate)}</div>
              <div className="bench-value num">{formatEUR(row.eur)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
