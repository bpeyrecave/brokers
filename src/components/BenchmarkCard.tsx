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
    ? `Managing the exchange yourself would currently have earned you ${formatSignedEUR(cmp.diffEur)} this month, compared with the organization's benchmark rate.`
    : negative
      ? `The organization's ${formatLong(cmp.benchmarkPoint.date)} benchmark is currently ${formatSignedEUR(-cmp.diffEur)} better than today's rate for this amount.`
      : `Today's rate is essentially the same as the organization's benchmark this month.`;

  return (
    <div className="card">
      <CardTitle icon={IconTarget} tone="violet">
        You vs. the 13th
        <InfoTooltip text="Your organization sets its monthly conversion rate around the 13th of each month. This compares that benchmark rate against today's rate, for the amount in the calculator above." />
      </CardTitle>
      <div className="card-sub">Organization benchmark: {formatLong(cmp.benchmarkPoint.date)}{!cmp.benchmarkExact ? " (nearest trading day)" : ""}</div>

      <div className="benchmark-grid">
        <div className="benchmark-figure">
          <div className="figure-label">Organization benchmark</div>
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
