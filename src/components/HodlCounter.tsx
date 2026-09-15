import { useDashboard } from "../context/DashboardContext";
import { buildHodlSummary } from "../lib/calculations";
import { formatEUR, formatSignedEUR } from "../lib/format";

export function HodlCounter() {
  const { series, asOfIso, amount } = useDashboard();
  const hodl = buildHodlSummary(series, amount, asOfIso);
  if (!hodl) return null;

  const positive = hodl.diffEur > 0.005;
  const patienceLine = positive
    ? `Your patience is currently worth ${formatSignedEUR(hodl.diffEur)}.`
    : hodl.diffEur < -0.005
      ? `Your patience has currently cost you ${formatEUR(Math.abs(hodl.diffEur))}.`
      : "Your patience hasn't moved the needle either way — yet.";

  return (
    <div className="card hodl-card">
      <div className="hero-eyebrow" style={{ color: "var(--amber)" }}>
        HODLing since the 13th
      </div>
      <div className="hodl-days num">{hodl.daysSince13th}</div>
      <div className="hodl-values">
        <div>
          Value on the 13th
          <strong className="num">{formatEUR(hodl.eurAtBenchmark)}</strong>
        </div>
        <div>
          Value today
          <strong className="num">{formatEUR(hodl.eurToday)}</strong>
        </div>
      </div>
      <div className={`hodl-caption ${positive ? "delta-up" : "delta-down"}`} style={{ padding: "0.3rem 0.7rem", borderRadius: 8 }}>
        {patienceLine}
      </div>
    </div>
  );
}
