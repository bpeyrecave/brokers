import { useMemo, useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import { convertMarket, resolveTradingPoint, whatIfExchangedOn } from "../lib/calculations";
import { addDays, formatLong } from "../lib/dates";
import { formatEUR, formatSignedEUR } from "../lib/format";

export function WhatIfTool() {
  const { series, asOfIso, amount } = useDashboard();
  const minDate = series[0]?.date ?? asOfIso;
  const [dateA, setDateA] = useState(() => addDays(asOfIso, -30));
  const [compareMode, setCompareMode] = useState(false);
  const [dateB, setDateB] = useState(() => addDays(asOfIso, -7));

  const resultVsToday = useMemo(() => whatIfExchangedOn(series, amount, dateA, asOfIso), [series, amount, dateA, asOfIso]);

  const twoDateResult = useMemo(() => {
    if (!compareMode) return null;
    const a = resolveTradingPoint(series, dateA);
    const b = resolveTradingPoint(series, dateB);
    if (!a || !b) return null;
    const eurA = convertMarket(amount, a.point.rate);
    const eurB = convertMarket(amount, b.point.rate);
    return { a, b, eurA, eurB, diff: eurB - eurA };
  }, [compareMode, series, amount, dateA, dateB]);

  return (
    <div className="card">
      <h2 className="card-title">What if I had exchanged?</h2>
      <div className="card-sub">Pick any past date to see what your amount would have been worth.</div>

      <div className="whatif-controls">
        <div className="field">
          <label htmlFor="whatif-date-a">{compareMode ? "Date A" : "Date"}</label>
          <input
            id="whatif-date-a"
            type="date"
            min={minDate}
            max={asOfIso}
            value={dateA}
            onChange={(e) => e.target.value && setDateA(e.target.value)}
          />
        </div>
        {compareMode && (
          <div className="field">
            <label htmlFor="whatif-date-b">Date B</label>
            <input
              id="whatif-date-b"
              type="date"
              min={minDate}
              max={asOfIso}
              value={dateB}
              onChange={(e) => e.target.value && setDateB(e.target.value)}
            />
          </div>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setCompareMode((m) => !m)}>
          {compareMode ? "Compare vs. today instead" : "Compare two dates instead"}
        </button>
      </div>

      {!compareMode && resultVsToday && (
        <div className="whatif-result">
          <p style={{ marginBottom: "0.5rem" }}>
            On {formatLong(resultVsToday.resolved.date)}
            {!resultVsToday.exact ? " (nearest trading day)" : ""}, your ${amount.toLocaleString("en-US")} would have been worth{" "}
            <strong className="num">{formatEUR(resultVsToday.eur)}</strong>.
          </p>
          <p>
            Compared with today, that's{" "}
            <strong className={`num ${resultVsToday.diffEur > 0 ? "delta-up" : resultVsToday.diffEur < 0 ? "delta-down" : ""}`} style={{ padding: "0.1rem 0.4rem", borderRadius: 6 }}>
              {formatSignedEUR(resultVsToday.diffEur)}
            </strong>{" "}
            {resultVsToday.diffEur >= 0 ? "more today" : "less today"}.
          </p>
        </div>
      )}

      {compareMode && twoDateResult && (
        <div className="whatif-result">
          <p style={{ marginBottom: "0.5rem" }}>
            {formatLong(twoDateResult.a.point.date)}: <strong className="num">{formatEUR(twoDateResult.eurA)}</strong> &nbsp;·&nbsp;
            {formatLong(twoDateResult.b.point.date)}: <strong className="num">{formatEUR(twoDateResult.eurB)}</strong>
          </p>
          <p>
            Difference:{" "}
            <strong className={`num ${twoDateResult.diff > 0 ? "delta-up" : twoDateResult.diff < 0 ? "delta-down" : ""}`} style={{ padding: "0.1rem 0.4rem", borderRadius: 6 }}>
              {formatSignedEUR(twoDateResult.diff)}
            </strong>{" "}
            ({twoDateResult.diff >= 0 ? "Date B better" : "Date A better"})
          </p>
        </div>
      )}
    </div>
  );
}
