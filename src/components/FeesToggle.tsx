import { useDashboard } from "../context/DashboardContext";
import { InfoTooltip } from "./InfoTooltip";
import { CardTitle } from "./CardTitle";
import { IconWallet } from "./icons";

export function FeesToggle() {
  const { fees, setFees } = useDashboard();

  return (
    <div className="card">
      <CardTitle icon={IconWallet} tone="accent">
        Market rate or Wise?
        <InfoTooltip text="Wise converts at the real mid-market rate (no markup) and charges a transparent fee instead. That fee is a percentage of the amount that gets cheaper on the portion above a threshold - like a tax bracket - plus a small flat fee. Market rate mode shows the raw rate with no fees, for comparison. Adjust the numbers below to match your actual Wise quote." />
      </CardTitle>
      <div className="card-sub">
        Since we always convert through Wise, that's the default below — it deducts a transparent fee, not a hidden
        rate markup.
      </div>

      <div className="fees-bar">
        <div className="mode-switch">
          <button type="button" className={fees.mode === "market" ? "active" : ""} onClick={() => setFees({ ...fees, mode: "market" })}>
            Market rate
          </button>
          <button type="button" className={fees.mode === "wise" ? "active" : ""} onClick={() => setFees({ ...fees, mode: "wise" })}>
            Wise
          </button>
        </div>

        {fees.mode === "wise" && (
          <div className="fees-fields">
            <div className="field">
              <label htmlFor="fee-percent-below">Fee up to threshold (%)</label>
              <input
                id="fee-percent-below"
                type="number"
                step="0.01"
                min={0}
                value={fees.feePercentBelow}
                onChange={(e) => setFees({ ...fees, feePercentBelow: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label htmlFor="fee-threshold">Threshold (USD)</label>
              <input
                id="fee-threshold"
                type="number"
                step="100"
                min={0}
                value={fees.tierThresholdUsd}
                onChange={(e) => setFees({ ...fees, tierThresholdUsd: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label htmlFor="fee-percent-above">Fee above threshold (%)</label>
              <input
                id="fee-percent-above"
                type="number"
                step="0.01"
                min={0}
                value={fees.feePercentAbove}
                onChange={(e) => setFees({ ...fees, feePercentAbove: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="field">
              <label htmlFor="fee-fixed">Flat fee (USD)</label>
              <input
                id="fee-fixed"
                type="number"
                step="0.01"
                min={0}
                value={fees.fixedFeeUsd}
                onChange={(e) => setFees({ ...fees, fixedFeeUsd: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </div>

      {fees.mode === "wise" && (
        <p className="fees-footnote">
          Defaults are calibrated from a real quote: sending a USD balance already in Wise to an external EUR bank
          account, $5,000 → $15.01 (0.30%). That's only one data point, so both tiers start out equal — if you get a
          quote at a different amount and it's cheaper per dollar, lower "Fee above threshold" to match. Check{" "}
          <a href="https://wise.com/us/send-money/" target="_blank" rel="noreferrer">
            wise.com
          </a>{" "}
          any time you want to re-verify.
        </p>
      )}
    </div>
  );
}
