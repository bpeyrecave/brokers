import { useDashboard } from "../context/DashboardContext";
import { buildSmartMetrics } from "../lib/calculations";
import { formatEUR, formatRate, formatSignedEUR } from "../lib/format";
import { formatShort } from "../lib/dates";
import { CardTitle } from "./CardTitle";
import { IconTarget } from "./icons";

export function SmartMetrics() {
  const { series, asOfIso, amount } = useDashboard();
  const m = buildSmartMetrics(series, amount, asOfIso);
  if (!m) return null;

  return (
    <div className="card">
      <CardTitle icon={IconTarget} tone="accent">Is chasing the perfect rate worth it?</CardTitle>
      <div className="card-sub">A few extra reference points to keep timing in perspective.</div>

      <div className="metric-list">
        <div className="metric-row">
          <span className="metric-label">30-day average rate</span>
          <span className="metric-value num">€{formatRate(m.avg30)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">90-day average rate</span>
          <span className="metric-value num">€{formatRate(m.avg90)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">
            Best rate this month ({formatShort(m.bestThisMonth.date)})
          </span>
          <span className="metric-value num">€{formatRate(m.bestThisMonth.rate)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">
            Worst rate this month ({formatShort(m.worstThisMonth.date)})
          </span>
          <span className="metric-value num">€{formatRate(m.worstThisMonth.rate)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">Today's ${amount.toLocaleString("en-US")} vs. best day this month</span>
          <span className="metric-value num">
            {formatEUR(m.eurToday)} vs {formatEUR(m.eurAtBestThisMonth)} ({formatSignedEUR(-m.distanceFromHighEur)})
          </span>
        </div>
        <div className="metric-row">
          <span className="metric-label">If you'd perfectly timed this month vs. the 13th</span>
          <span className="metric-value num">{formatSignedEUR(m.bestVsThirteenthEur)}</span>
        </div>
      </div>
    </div>
  );
}
