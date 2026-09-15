import { useDashboard } from "../context/DashboardContext";
import { buildTimeComparison } from "../lib/calculations";
import { formatEUR, formatSignedEUR } from "../lib/format";
import { formatShort } from "../lib/dates";
import { InfoTooltip } from "./InfoTooltip";
import { CardTitle } from "./CardTitle";
import { IconClock } from "./icons";

export function TimeComparison() {
  const { series, asOfIso, amount } = useDashboard();
  const rows = buildTimeComparison(series, amount, asOfIso);
  if (rows.length === 0) return null;

  const todayEur = rows[0].eur;

  return (
    <div className="card">
      <CardTitle icon={IconClock} tone="violet">
        Same ${amount.toLocaleString("en-US")}, different days
        <InfoTooltip text="Each row shows what your amount would convert to at that day's rate. When markets were closed (weekends/holidays), we use the nearest earlier trading day's rate." />
      </CardTitle>
      <div className="card-sub">Compare today against yesterday, last week, last month, and this month's UNDP rate.</div>

      <div className="tc-list">
        {rows.map((row, i) => {
          const diff = todayEur - row.eur;
          const deltaCls = i === 0 ? "" : diff > 0.005 ? "delta-up" : diff < -0.005 ? "delta-down" : "delta-flat";
          return (
            <div className={`tc-row${i === 0 ? " is-today" : ""}`} key={row.label}>
              <div className="tc-label">
                {row.label}
                <span className="tc-date">
                  {formatShort(row.point.date)}
                  {!row.exact ? " (nearest trading day)" : ""}
                </span>
              </div>
              <div className="tc-eur num">{formatEUR(row.eur)}</div>
              {i === 0 ? (
                <div className="tc-delta" />
              ) : (
                <div className={`tc-delta num pill ${deltaCls}`}>
                  {diff === 0 ? "even" : `Waiting: ${formatSignedEUR(diff)}`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
