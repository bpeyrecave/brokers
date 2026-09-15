import { useDashboard } from "../context/DashboardContext";
import { addDays } from "../lib/dates";
import { formatEUR, formatRate, formatSignedPercent, formatUSD } from "../lib/format";
import { convertWithFees, percentChange, resolveTradingPoint } from "../lib/calculations";

function DeltaPill({ label, changePercent }: { label: string; changePercent: number | null }) {
  if (changePercent === null) return null;
  const cls = changePercent > 0.005 ? "pill-up" : changePercent < -0.005 ? "pill-down" : "pill-flat";
  const arrow = changePercent > 0.005 ? "↑" : changePercent < -0.005 ? "↓" : "→";
  return (
    <span className={`pill ${cls}`}>
      {arrow} {label} {formatSignedPercent(changePercent)}
    </span>
  );
}

export function RateHero() {
  const { series, asOfIso, amount, setAmount, fees } = useDashboard();

  const current = resolveTradingPoint(series, asOfIso);
  const prevDay = resolveTradingPoint(series, addDays(asOfIso, -1));
  const sevenDay = resolveTradingPoint(series, addDays(asOfIso, -7));
  const thirtyDay = resolveTradingPoint(series, addDays(asOfIso, -30));

  if (!current) return null;

  const changeToday = prevDay ? percentChange(prevDay.point.rate, current.point.rate) : null;
  const change7d = sevenDay ? percentChange(sevenDay.point.rate, current.point.rate) : null;
  const change30d = thirtyDay ? percentChange(thirtyDay.point.rate, current.point.rate) : null;

  const trendPercent = change7d ?? changeToday ?? 0;
  const trendText =
    trendPercent > 0.05
      ? "The dollar is strengthening against the euro — good news for your paycheck."
      : trendPercent < -0.05
        ? "The dollar is weakening against the euro right now."
        : "The dollar has been roughly stable against the euro lately.";

  const result = convertWithFees(amount, current.point.rate, fees);

  return (
    <div className="hero-card">
      <h2 className="hero-eyebrow">USD → EUR · what your salary is actually worth</h2>
      <div className="hero-rate num">
        $1 = €{formatRate(current.point.rate)}
        <span className="unit">1 US dollar buys this many euros</span>
      </div>
      <div className="hero-changes">
        <DeltaPill label="today" changePercent={changeToday} />
        <DeltaPill label="7d" changePercent={change7d} />
        <DeltaPill label="30d" changePercent={change30d} />
      </div>
      <div className="hero-direction">{trendText}</div>

      <div className="hero-divider" />

      <div className="hero-calc">
        <div>
          <div className="hero-calc-label">What do I get today?</div>
          <div className="hero-calc-sub">Type any amount — everything below updates with it.</div>
        </div>

        <div className="hero-amount-row">
          <span className="hero-amount-prefix">$</span>
          <input
            className="hero-amount-input num"
            type="number"
            min={0}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
            aria-label="USD amount"
          />
        </div>

        <div>
          <div className="hero-result num">{formatEUR(result.eur)}</div>
          {fees.mode === "wise" && result.feesUsd > 0 && (
            <div className="hero-fee-note">Wise fee: {formatUSD(result.feesUsd)} · rate used is the real mid-market rate, no markup</div>
          )}
        </div>
      </div>
    </div>
  );
}
