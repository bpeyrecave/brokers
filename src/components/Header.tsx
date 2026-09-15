import { formatLong } from "../lib/dates";
import { useDashboard } from "../context/DashboardContext";

export function Header() {
  const { asOfIso, fetchedAt } = useDashboard();

  return (
    <header className="site-header">
      <div className="site-title-group">
        <h1 className="site-title">
          Every Day I'm <span className="accent">HODLing</span>
        </h1>
        <p className="site-subtitle">Victor & Berta try to become brokers on a P2 salary.</p>
      </div>
      {asOfIso && (
        <div className="as-of">
          Rates as of <strong>{formatLong(asOfIso)}</strong>
          <br />
          ECB reference rate{fetchedAt ? `, refreshed ${new Date(fetchedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : ""}
        </div>
      )}
    </header>
  );
}
