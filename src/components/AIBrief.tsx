import { useDashboard } from "../context/DashboardContext";
import { CardTitle } from "./CardTitle";
import { IconCoffee } from "./icons";

export function AIBrief() {
  const { brief } = useDashboard();

  if (!brief) {
    return (
      <div className="card brief-card">
        <CardTitle icon={IconCoffee} tone="amber">Today's FX Brief</CardTitle>
        <p className="empty-state">The daily brief hasn't been generated yet. Everything else on this dashboard is unaffected.</p>
      </div>
    );
  }

  if (!brief.ok) {
    return (
      <div className="card brief-card">
        <CardTitle icon={IconCoffee} tone="amber">Today's FX Brief</CardTitle>
        <p className="empty-state">{brief.summary || "The daily brief is temporarily unavailable."}</p>
      </div>
    );
  }

  return (
    <div className="card brief-card">
      <CardTitle icon={IconCoffee} tone="amber">Today's FX Brief</CardTitle>
      <div className="brief-headline">{brief.headline}</div>
      <p className="brief-summary">{brief.summary}</p>

      {brief.forYou && <div className="brief-for-you">💶 For you: {brief.forYou}</div>}

      {brief.whatMattersNext.length > 0 && (
        <div className="brief-next">
          <div className="card-sub" style={{ marginBottom: "0.4rem" }}>
            What matters next
          </div>
          {brief.whatMattersNext.map((item, i) => (
            <div className="brief-next-item" key={i}>
              <span className="bn-date">{item.date}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="brief-meta">
        Generated automatically{brief.generatedAt ? ` on ${new Date(brief.generatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : ""} using AI + current web
        search. Not financial advice, and never a prediction of future rates.
      </div>
    </div>
  );
}
