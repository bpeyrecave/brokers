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
        <InfoTooltip text="Wise converts at the real mid-market rate (no markup) and charges a transparent fee instead - a small percentage of the amount plus a small flat fee. Market rate mode shows the raw rate with no fees, for comparison. Adjust the numbers below to match your actual Wise quote." />
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
              <label htmlFor="fee-percent">Wise fee (%)</label>
              <input
                id="fee-percent"
                type="number"
                step="0.01"
                min={0}
                value={fees.feePercent}
                onChange={(e) => setFees({ ...fees, feePercent: Number(e.target.value) || 0 })}
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
          Defaults approximate a typical USD→EUR Wise transfer funded by bank/ACH. Your actual fee depends on the
          amount and funding method — check{" "}
          <a href="https://wise.com/us/send-money/" target="_blank" rel="noreferrer">
            wise.com
          </a>{" "}
          for an exact quote and update the numbers above to match.
        </p>
      )}
    </div>
  );
}
