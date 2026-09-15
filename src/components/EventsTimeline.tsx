import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
}

export function EventsTimeline() {
  const { events } = useDashboard();

  const upcoming = useMemo(() => {
    const cutoff = Date.now() - 12 * 3600 * 1000;
    return (events?.events ?? []).filter((e) => new Date(e.date).getTime() >= cutoff).slice(0, 8);
  }, [events]);

  return (
    <div className="card">
      <h2 className="card-title">What to watch</h2>
      <div className="card-sub">Upcoming USD/EUR-relevant releases and central bank events.</div>

      {upcoming.length === 0 ? (
        <p className="empty-state">
          {events?.ok === false ? "The events calendar couldn't be refreshed — check back soon." : "No major USD/EUR events in the next few days."}
        </p>
      ) : (
        <div className="events-list">
          {upcoming.map((e, i) => (
            <div className="event-row" key={i}>
              <div className="event-date">{formatEventDate(e.date)}</div>
              <span className={`impact-badge impact-${e.impact.toLowerCase()}`}>{e.impact}</span>
              <div className="event-body">
                <div className="event-title">
                  {e.country} — {e.title}
                </div>
                <div className="event-note">{e.note}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
