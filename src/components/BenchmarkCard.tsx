import { useDashboard } from "../context/DashboardContext";
import { compareToThirteenth } from "../lib/calculations";
import { formatEUR, formatSignedEUR, formatSignedPercent } from "../lib/format";
import { formatLong } from "../lib/dates";
import { InfoTooltip } from "./InfoTooltip";
import { CardTitle } from "./CardTitle";
import { IconTarget } from "./icons";

export function BenchmarkCard() {
  const { series, asOfIso, amount } = useDashboard();
  const cmp = compareToThirteenth(series, amount, asOfIso);
  if (!cmp) return null;

  const positive = cmp.diffEur > 0.005;
  const negative = cmp.diffEur < -0.005;
  const cls = positive ? "delta-up" : negative ? "delta-down" : "delta-flat";

  const sentence = positive
    ? `Managing the exchange yourself would currently have earned you ${formatSignedEUR(cmp.diffEur)} this month, compared with the UNDP's rate.`
    : negative
      ? `The UNDP's ${formatLong(cmp.benchmarkPoint.date)} rate is currently ${formatSignedEUR(-cmp.diffEur)} better than today's rate for this amount.`
      : `Today's rate is essentially the same as the UNDP's rate this month.`;

  return (
    <div className="card">
      <CardTitle icon={IconTarget} tone="violet">
        You vs. the 13th
        <InfoTooltip text="The UNDP sets its exchange rate around the 13th of each month. This compares that rate against today's rate, for the amount above." />
      </CardTitle>
      <div className="card-sub">UNDP's rate: {formatLong(cmp.benchmarkPoint.date)}{!cmp.benchmarkExact ? " (nearest trading day)" : ""}</div>

      <div className="benchmark-grid">
        <div className="benchmark-figure">
          <div className="figure-label">UNDP's rate</div>
          <div className="figure-value num">{formatEUR(cmp.eurAtBenchmark)}</div>
        </div>
        <div className="benchmark-figure">
          <div className="figure-label">If exchanged today</div>
          <div className="figure-value num">{formatEUR(cmp.eurToday)}</div>
        </div>
      </div>

      <div className={`benchmark-diff ${cls}`}>
        <div className="diff-value num">{formatSignedEUR(cmp.diffEur)}</div>
        <div className="num">{formatSignedPercent(cmp.diffPercent)}</div>
      </div>

      <div className="plain-language">{sentence}</div>
    </div>
  );
}
