import { useDashboard } from "../context/DashboardContext";
import { buildDecisionSummary, FAVORABILITY_LABELS } from "../lib/calculations";
import { formatPercent, formatSignedEUR, formatSignedPercent } from "../lib/format";
import { InfoTooltip } from "./InfoTooltip";

const INTERPRETATION: Record<string, string> = {
  VERY_FAVORABLE: "From a recent historical perspective, today's USD→EUR rate is very favorable — it's near the top of its recent range.",
  FAVORABLE: "From a recent historical perspective, today's USD→EUR rate is relatively favorable.",
  AVERAGE: "Today's rate is roughly in line with its recent range — neither a great nor a bad day to convert.",
  UNFAVORABLE: "From a recent historical perspective, today's USD→EUR rate is on the weaker side.",
  VERY_UNFAVORABLE: "From a recent historical perspective, today's USD→EUR rate is near the bottom of its recent range.",
};

export function DecisionCard() {
  const { series, asOfIso, amount } = useDashboard();
  const summary = buildDecisionSummary(series, amount, asOfIso);
  if (!summary) return null;

  return (
    <div className="card">
      <h2 className="card-title">
        Should I exchange today?
        <InfoTooltip
          text={
            <>
              This is not a prediction. The label compares today's rate against its own recent history: the percentage of the last 30 and 90 days
              it beats, averaged. ≥90% = very favorable, ≥65% = favorable, ≥35% = average, ≥10% = unfavorable, below 10% = very unfavorable.
            </>
          }
        />
      </h2>
      <div className="card-sub">Based on transparent historical percentiles — not a prediction of what happens next.</div>

      <span className={`favorability-badge badge-${summary.label.toLowerCase()}`}>{FAVORABILITY_LABELS[summary.label]}</span>

      <div className="decision-stats">
        <div className="decision-stat">
          <div className="stat-label">Better than in the last 30 days</div>
          <div className="stat-value num">{formatPercent(summary.percentile30, 0)} of days</div>
        </div>
        <div className="decision-stat">
          <div className="stat-label">Better than in the last 90 days</div>
          <div className="stat-value num">{formatPercent(summary.percentile90, 0)} of days</div>
        </div>
        <div className="decision-stat">
          <div className="stat-label">Vs. 30-day average rate</div>
          <div className="stat-value num">{formatSignedPercent(summary.vs30dAvgPercent)}</div>
        </div>
        <div className="decision-stat">
          <div className="stat-label">Vs. this month's 13th</div>
          <div className="stat-value num">{formatSignedPercent(summary.vsThirteenthPercent)}</div>
        </div>
      </div>

      <div className="decision-interpretation">
        {INTERPRETATION[summary.label]}
        <br />
        For ${amount.toLocaleString("en-US")}, today's advantage vs the 13th:{" "}
        <strong className="num">{formatSignedEUR(summary.advantageVsThirteenthEur)}</strong>.
      </div>
    </div>
  );
}
