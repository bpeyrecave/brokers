import { useActiveSection } from "../lib/useActiveSection";
import {
  IconBars,
  IconBell,
  IconCalendar,
  IconChart,
  IconClock,
  IconCoffee,
  IconGrid,
  IconList,
  IconLogo,
  IconTarget,
  IconWallet,
} from "./icons";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: IconGrid },
  { id: "benchmark", label: "Benchmark & HODL", icon: IconClock },
  { id: "history", label: "History", icon: IconChart },
  { id: "yearly", label: "A year of the 13th", icon: IconBars },
  { id: "timing", label: "Timing tools", icon: IconCalendar },
  { id: "brief", label: "Brief & events", icon: IconCoffee },
  { id: "fees", label: "Fees", icon: IconWallet },
  { id: "metrics", label: "Metrics", icon: IconTarget },
  { id: "log", label: "Conversion log", icon: IconList },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Sidebar({ dataStale }: { dataStale: boolean }) {
  const active = useActiveSection(NAV_ITEMS.map((i) => i.id));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <IconLogo />
        <div className="sidebar-brand-text">
          <strong>HODLing</strong>
          <span>FX dashboard</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Dashboard sections">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-link${active === id ? " active" : ""}`}
            onClick={() => scrollToSection(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`sidebar-status${dataStale ? " is-stale" : ""}`}>
          <IconBell />
          <span>{dataStale ? "Data may be stale" : "Data up to date"}</span>
        </div>
        <p>For Victor & Berta. Not financial advice.</p>
      </div>
    </aside>
  );
}
