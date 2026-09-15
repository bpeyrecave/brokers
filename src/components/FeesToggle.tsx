import { useDashboard } from "../context/DashboardContext";
import { InfoTooltip } from "./InfoTooltip";

export function FeesToggle() {
  const { fees, setFees } = useDashboard();

  return (
    <div className="card">
      <div className="card-title">
        Market rate or real conversion?
        <InfoTooltip text="Market rate mode uses the raw ECB reference rate everywhere on this page. Real conversion mode subtracts a provider markup and flat fee, so figures reflect what you'd actually receive through a service like Wise or your bank." />
      </div>
      <div className="card-sub">The theoretical rate isn't always what you actually receive after provider fees.</div>

      <div className="fees-bar">
        <div className="mode-switch">
          <button type="button" className={fees.mode === "market" ? "active" : ""} onClick={() => setFees({ ...fees, mode: "market" })}>
            Market rate
          </button>
          <button type="button" className={fees.mode === "real" ? "active" : ""} onClick={() => setFees({ ...fees, mode: "real" })}>
            Real conversion
          </button>
        </div>

        {fees.mode === "real" && (
          <div className="fees-fields">
            <div className="field">
              <label htmlFor="fee-markup">Provider markup (%)</label>
              <input
                id="fee-markup"
                type="number"
                step="0.05"
                min={0}
                value={fees.markupPercent}
                onChange={(e) => setFees({ ...fees, markupPercent: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label htmlFor="fee-fixed">Flat fee (USD)</label>
              <input
                id="fee-fixed"
                type="number"
                step="1"
                min={0}
                value={fees.fixedFeeUsd}
                onChange={(e) => setFees({ ...fees, fixedFeeUsd: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
