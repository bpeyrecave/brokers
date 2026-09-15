import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useDashboard } from "../context/DashboardContext";
import { conversionStore } from "../lib/storage";
import { convertWithFees, evaluateConversions, resolveTradingPoint } from "../lib/calculations";
import { formatEUR, formatSignedEUR, formatUSD } from "../lib/format";
import { formatLong, todayISO } from "../lib/dates";
import type { ConversionRecord, FeeSettings } from "../lib/types";
import { CardTitle } from "./CardTitle";
import { IconList } from "./icons";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

// The log always assumes a real Wise transfer, independent of the dashboard-wide
// market/Wise toggle elsewhere - these entries are meant to record what actually happened.
function autoFill(amountUsd: string, rate: string, wiseFees: FeeSettings) {
  const amt = Number(amountUsd) || 0;
  const r = Number(rate) || 0;
  if (amt <= 0 || r <= 0) return { eurReceived: "", feesUsd: "" };
  const result = convertWithFees(amt, r, wiseFees);
  return { eurReceived: result.eur.toFixed(2), feesUsd: result.feesUsd.toFixed(2) };
}

function emptyForm(defaultDate: string, defaultRate: number, defaultAmount: number, wiseFees: FeeSettings) {
  const amountUsd = String(defaultAmount || 5000);
  const rate = defaultRate ? defaultRate.toFixed(4) : "";
  return {
    amountUsd,
    date: defaultDate,
    rate,
    ...autoFill(amountUsd, rate, wiseFees),
    note: "",
  };
}

export function ConversionLog() {
  const { series, asOfIso, amount, fees } = useDashboard();
  const latestRate = series[series.length - 1]?.rate ?? 0;
  const wiseFees: FeeSettings = { ...fees, mode: "wise" };

  const [conversions, setConversions] = useState<ConversionRecord[]>(() => conversionStore.list());
  const [form, setForm] = useState(() => emptyForm(asOfIso, latestRate, amount, wiseFees));
  const [autoTouched, setAutoTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);

  const year = Number(asOfIso.slice(0, 4)) || new Date().getFullYear();
  const performance = useMemo(() => evaluateConversions(conversions, series, year), [conversions, series, year]);

  // Until the user edits the amount field directly, keep this form's amount in
  // sync with the "amount to exchange" picked elsewhere on the dashboard.
  useEffect(() => {
    if (amountTouched) return;
    setForm((f) => {
      const amountUsd = String(amount || 5000);
      const next = { ...f, amountUsd };
      if (!autoTouched) Object.assign(next, autoFill(amountUsd, next.rate, wiseFees));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, amountTouched, autoTouched, fees.feePercentBelow, fees.feePercentAbove, fees.tierThresholdUsd, fees.fixedFeeUsd]);

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (!autoTouched && (key === "amountUsd" || key === "rate")) {
        Object.assign(next, autoFill(next.amountUsd, next.rate, wiseFees));
      }
      return next;
    });
  }

  function handleDateChange(date: string) {
    const resolved = resolveTradingPoint(series, date);
    setForm((f) => {
      const rate = resolved ? resolved.point.rate.toFixed(4) : f.rate;
      const next = { ...f, date, rate };
      if (!autoTouched) Object.assign(next, autoFill(next.amountUsd, rate, wiseFees));
      return next;
    });
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
    setForm(emptyForm(asOfIso, latestRate, amount, wiseFees));
    setAutoTouched(false);
    setAmountTouched(false);
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
      <CardTitle icon={IconList} tone="violet">Was the headache worth it?</CardTitle>
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
          <input
            id="log-amount"
            type="number"
            min={0}
            value={form.amountUsd}
            onChange={(e) => {
              setAmountTouched(true);
              updateField("amountUsd", e.target.value);
            }}
            required
          />
          {!amountTouched && <span className="field-hint">Follows the amount picked above</span>}
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
              setAutoTouched(true);
              setForm((f) => ({ ...f, eurReceived: e.target.value }));
            }}
            required
          />
          {!autoTouched && <span className="field-hint">Amount × rate, minus the Wise fee</span>}
        </div>
        <div className="field">
          <label htmlFor="log-fees">Fees (USD)</label>
          <input
            id="log-fees"
            type="number"
            step="0.01"
            min={0}
            value={form.feesUsd}
            onChange={(e) => {
              setAutoTouched(true);
              setForm((f) => ({ ...f, feesUsd: e.target.value }));
            }}
          />
          {!autoTouched && <span className="field-hint">Auto-filled from your Wise fee settings above</span>}
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
