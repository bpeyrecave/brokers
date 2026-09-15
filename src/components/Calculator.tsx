import { useDashboard } from "../context/DashboardContext";
import { convertWithFees, resolveTradingPoint } from "../lib/calculations";
import { formatEUR, formatUSD } from "../lib/format";
import { CardTitle } from "./CardTitle";
import { IconCalculator } from "./icons";

const PRESETS = [1000, 3000, 5000, 10000];

export function Calculator() {
  const { series, asOfIso, amount, setAmount, fees } = useDashboard();
  const current = resolveTradingPoint(series, asOfIso);

  const result = current ? convertWithFees(amount, current.point.rate, fees) : null;

  return (
    <div className="card calc-card">
      <div>
        <CardTitle icon={IconCalculator} tone="accent">What do I get today?</CardTitle>
        <div className="card-sub">Type any amount, or pick a preset — everything below updates with it.</div>
      </div>

      <div className="amount-row">
        <span className="currency-prefix">$</span>
        <input
          className="amount-input num"
          type="number"
          min={0}
          step={100}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          aria-label="USD amount"
        />
      </div>

      <div className="preset-buttons">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={`preset-btn${amount === p ? " active" : ""}`}
            onClick={() => setAmount(p)}
          >
            ${p.toLocaleString("en-US")}
          </button>
        ))}
      </div>

      {result && (
        <div className="calc-result">
          If you exchange ${amount.toLocaleString("en-US")} today
          {fees.mode === "wise" ? " via Wise" : ""} →
          <strong className="num">{formatEUR(result.eur)}</strong>
          {fees.mode === "wise" && result.feesUsd > 0 && (
            <span className="calc-fee-note">Wise fee: {formatUSD(result.feesUsd)} · rate used is the real mid-market rate, no markup</span>
          )}
        </div>
      )}
    </div>
  );
}
