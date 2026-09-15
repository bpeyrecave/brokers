import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { buildMonthlyThirteenths } from "../lib/calculations";
import { formatEUR, formatRate, formatSignedEUR } from "../lib/format";
import { formatMonthShortYear, formatShort } from "../lib/dates";
import { CardTitle } from "./CardTitle";
import { IconBars } from "./icons";
import { InfoTooltip } from "./InfoTooltip";

export function YearlyBenchmark() {
  const { series, asOfIso, amount } = useDashboard();

  const rows = useMemo(() => buildMonthlyThirteenths(series, amount, asOfIso, 12), [series, amount, asOfIso]);
  if (rows.length === 0) return null;

  const totalBenchmark = rows.reduce((s, r) => s + r.eur, 0);
  const totalBest = rows.reduce((s, r) => s + r.bestEur, 0);
  const totalUpside = totalBest - totalBenchmark;

  const values = rows.flatMap((r) => [r.eur, r.bestEur]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.01);
  const barWidth = (v: number) => 8 + ((v - min) / range) * 92;
  const latestMonthKey = rows[rows.length - 1].monthKey;

  return (
    <div className="card">
      <CardTitle icon={IconBars} tone="accent">
        When UNDP sends your salary vs. the best rate that month
        <InfoTooltip text="For each of the last 12 months: what your chosen USD amount was worth converted on the UNDP's rate date (the 13th, or nearest trading day) versus what it would have been worth converted on that month's single best USD→EUR day. Uses the raw market rate, no fees." />
      </CardTitle>
      <div className="card-sub">
        ${amount.toLocaleString("en-US")} on the 13th of every month for the last year, compared with the best rate
        that same month — this is the most you could have squeezed out by timing it perfectly.
      </div>

      <div className="bench-summary">
        <div>
          <div className="stat-label">UNDP's rate (12 months)</div>
          <div className="stat-value num">{formatEUR(totalBenchmark)}</div>
        </div>
        <div>
          <div className="stat-label">Best rate (12 months)</div>
          <div className="stat-value num">{formatEUR(totalBest)}</div>
        </div>
        <div>
          <div className="stat-label">Annual upside from perfect timing</div>
          <div className="stat-value num delta-up" style={{ display: "inline-block", padding: "0.1rem 0.5rem", borderRadius: 8 }}>
            {formatSignedEUR(totalUpside)}
          </div>
        </div>
      </div>

      <div className="bench-list">
        {rows.map((row) => {
          const isLatest = row.monthKey === latestMonthKey;
          return (
            <div className="bench-month-group" key={row.monthKey}>
              <div className={`bench-row${isLatest ? " is-latest" : ""}`}>
                <div className="bench-label">
                  {formatMonthShortYear(row.dateRequested)}
                  {!row.exact && <span className="bench-note"> · nearest trading day</span>}
                </div>
                <div className="bench-bar-track">
                  <div className="bench-bar-fill bench-bar-benchmark" style={{ width: `${barWidth(row.eur)}%` }} />
                </div>
                <div className="bench-rate num">€{formatRate(row.point.rate)}</div>
                <div className="bench-value num">{formatEUR(row.eur)}</div>
              </div>
              <div className="bench-row bench-row-best">
                <div className="bench-label bench-label-best">Best ({formatShort(row.bestPoint.date)})</div>
                <div className="bench-bar-track">
                  <div className="bench-bar-fill bench-bar-best" style={{ width: `${barWidth(row.bestEur)}%` }} />
                </div>
                <div className="bench-rate num">€{formatRate(row.bestPoint.rate)}</div>
                <div className="bench-value num">
                  {formatEUR(row.bestEur)} <span className="bench-upside num">{formatSignedEUR(row.upsideEur)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
