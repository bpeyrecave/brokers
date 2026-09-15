import { formatLong } from "../lib/dates";
import { useDashboard } from "../context/DashboardContext";
import { IconBell } from "./icons";

export function Header({ dataStale }: { dataStale: boolean }) {
  const { asOfIso, fetchedAt } = useDashboard();

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>
          Every Day I'm <span className="accent">HODLing</span>
        </h1>
        <p>Victor & Berta try to become brokers on a P2 salary.</p>
      </div>

      <div className="topbar-right">
        {asOfIso && (
          <div className="as-of-chip">
            <span className="as-of-label">Rates as of</span>
            <strong>{formatLong(asOfIso)}</strong>
            {fetchedAt && (
              <span className="as-of-refreshed">
                refreshed {new Date(fetchedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            )}
          </div>
        )}
        <div className={`topbar-bell${dataStale ? " is-stale" : ""}`} title={dataStale ? "Data may be stale" : "Data up to date"}>
          <IconBell />
          {dataStale && <span className="bell-dot" />}
        </div>
        <div className="avatar-chip" aria-hidden="true">
          VB
        </div>
      </div>
    </header>
  );
}
