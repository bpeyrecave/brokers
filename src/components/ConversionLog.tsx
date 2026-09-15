import { useMemo, useState, type FormEvent } from "react";
import { useDashboard } from "../context/DashboardContext";
import { conversionStore } from "../lib/storage";
import { evaluateConversions, resolveTradingPoint } from "../lib/calculations";
import { formatEUR, formatSignedEUR, formatUSD } from "../lib/format";
import { formatLong, todayISO } from "../lib/dates";
import type { ConversionRecord } from "../lib/types";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function emptyForm(defaultDate: string, defaultRate: number) {
  return {
    amountUsd: "5000",
    date: defaultDate,
    rate: defaultRate ? defaultRate.toFixed(4) : "",
    eurReceived: defaultRate ? (5000 * defaultRate).toFixed(2) : "",
    feesUsd: "0",
    note: "",
  };
}

export function ConversionLog() {
  const { series, asOfIso } = useDashboard();
  const latestRate = series[series.length - 1]?.rate ?? 0;

  const [conversions, setConversions] = useState<ConversionRecord[]>(() => conversionStore.list());
  const [form, setForm] = useState(() => emptyForm(asOfIso, latestRate));
  const [eurTouched, setEurTouched] = useState(false);

  const year = Number(asOfIso.slice(0, 4)) || new Date().getFullYear();
  const performance = useMemo(() => evaluateConversions(conversions, series, year), [conversions, series, year]);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (!eurTouched && (key === "amountUsd" || key === "rate")) {
        const amt = Number(next.amountUsd) || 0;
        const rate = Number(next.rate) || 0;
        next.eurReceived = amt > 0 && rate > 0 ? (amt * rate).toFixed(2) : "";
      }
      return next;
    });
  }

  function handleDateChange(date: string) {
    const resolved = resolveTradingPoint(series, date);
    setForm((f) => ({ ...f, date, rate: resolved ? resolved.point.rate.toFixed(4) : f.rate }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amountUsd = Number(form.amountUsd);
    const rate = Number(form.rate);
    const eurReceived = Number(form.eurReceived);
    const feesUsd = Number(form.feesUsd) || 0;
    if (!amountUsd || !rate || !eurReceived || !form.date) return;

    const record: ConversionRecord = {
      id: newId(),
      amountUsd,
      date: form.date,
      rate,
      eurReceived,
      feesUsd,
      note: form.note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    conversionStore.add(record);
    setConversions(conversionStore.list());
    setForm(emptyForm(asOfIso, latestRate));
    setEurTouched(false);
  }

  function handleRemove(id: string) {
    conversionStore.remove(id);
    setConversions(conversionStore.list());
  }

  const sorted = [...conversions].sort((a, b) => (a.date < b.date ? 1 : -1));

  const verdictCls = performance.advantageEur > 1 ? "delta-up" : performance.advantageEur < -1 ? "delta-down" : "delta-flat";
  const verdict =
    performance.count === 0
      ? "Log your first real conversion below to start tracking whether managing this yourself is actually paying off."
      : performance.advantageEur > 1
        ? `You've earned ${formatSignedEUR(performance.advantageEur)} by managing the exchange yourself in ${year}.`
        : performance.advantageEur < -1
          ? `The 13th benchmark has actually done ${formatSignedEUR(-performance.advantageEur)} better than your manual conversions in ${year} so far.`
          : `You're about even with the 13th benchmark in ${year} — the automatic option would have done roughly the same.`;

  return (
    <div className="card">
      <div className="card-title">Was the headache worth it?</div>
      <div className="card-sub">
        Log your real conversions and compare them against simply using the 13th-of-the-month benchmark every time.
      </div>

      <div className="log-summary">
        <div>
          <div className="stat-label">Conversions logged ({year})</div>
          <div className="stat-value num">{performance.count}</div>
        </div>
        <div>
          <div className="stat-label">Total converted</div>
          <div className="stat-value num">{formatUSD(performance.totalUsd)}</div>
        </div>
        <div>
          <div className="stat-label">EUR actually received</div>
          <div className="stat-value num">{formatEUR(performance.eurActual)}</div>
        </div>
        <div>
          <div className="stat-label">EUR if always on the 13th</div>
          <div className="stat-value num">{formatEUR(performance.eurIfAuto)}</div>
        </div>
      </div>

      <div className={`log-verdict ${verdictCls}`}>
        {verdict}
        {performance.count > 0 && (
          <>
            {" "}
            Average per conversion: <strong className="num">{formatSignedEUR(performance.avgAdvantagePerConversion)}</strong>.
          </>
        )}
      </div>

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="log-amount">Amount (USD)</label>
          <input id="log-amount" type="number" min={0} value={form.amountUsd} onChange={(e) => updateField("amountUsd", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="log-date">Date converted</label>
          <input id="log-date" type="date" max={todayISO()} value={form.date} onChange={(e) => handleDateChange(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="log-rate">Rate used (1 USD = ? EUR)</label>
          <input id="log-rate" type="number" step="0.0001" min={0} value={form.rate} onChange={(e) => updateField("rate", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="log-eur">EUR received</label>
          <input
            id="log-eur"
            type="number"
            step="0.01"
            min={0}
            value={form.eurReceived}
            onChange={(e) => {
              setEurTouched(true);
              setForm((f) => ({ ...f, eurReceived: e.target.value }));
            }}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="log-fees">Fees (USD)</label>
          <input id="log-fees" type="number" step="0.01" min={0} value={form.feesUsd} onChange={(e) => updateField("feesUsd", e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">
          Add conversion
        </button>
        <div className="field field-note">
          <label htmlFor="log-note">Note (optional)</label>
          <input id="log-note" type="text" placeholder="e.g. converted via Wise" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
        </div>
      </form>

      {sorted.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="log-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>EUR received</th>
                <th>Fees</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id}>
                  <td>{formatLong(c.date)}</td>
                  <td className="num">{formatUSD(c.amountUsd)}</td>
                  <td className="num">{c.rate.toFixed(4)}</td>
                  <td className="num">{formatEUR(c.eurReceived)}</td>
                  <td className="num">{formatUSD(c.feesUsd)}</td>
                  <td>{c.note ?? "—"}</td>
                  <td>
                    <button type="button" className="btn-danger-ghost" onClick={() => handleRemove(c.id)}>
                      remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="storage-note">
        📍 Saved only in this browser (localStorage) — Victor and Berta's entries won't sync between devices in this version. Add entries on
        each device you use, or plan a shared backend (e.g. Supabase) later if you want one combined log.
      </div>
    </div>
  );
}
