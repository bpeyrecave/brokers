import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FxBrief, FxHistory, FxPoint, FeeSettings } from "../lib/types";
import { todayOrLatest } from "../lib/calculations";

interface DashboardData {
  loading: boolean;
  error: string | null;
  series: FxPoint[];
  fetchedAt: string | null;
  brief: FxBrief | null;
  asOfIso: string;
  amount: number;
  setAmount: (n: number) => void;
  fees: FeeSettings;
  setFees: (f: FeeSettings) => void;
}

const DashboardContext = createContext<DashboardData | null>(null);

// Calibrated against a real Wise quote: sending a USD balance already held in
// Wise to an external EUR bank account, $5,000 -> $15.01 fee (0.30%), no rate
// markup. There's only one real data point to calibrate from, so both tiers
// default to the same percentage (effectively flat) - adjust feePercentAbove
// independently if you get a quote at a different amount showing it step down.
const DEFAULT_FEES: FeeSettings = {
  mode: "wise",
  feePercentBelow: 0.3,
  feePercentAbove: 0.3,
  tierThresholdUsd: 1000,
  fixedFeeUsd: 0,
};

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<FxPoint[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [brief, setBrief] = useState<FxBrief | null>(null);
  const [amount, setAmount] = useState(5000);
  const [fees, setFees] = useState<FeeSettings>(DEFAULT_FEES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [history, br] = await Promise.all([fetchJson<FxHistory>("fx-history.json"), fetchJson<FxBrief>("brief.json")]);
      if (cancelled) return;
      if (!history || history.series.length === 0) {
        setError("Could not load exchange rate data. Please try again later.");
      } else {
        setSeries(history.series);
        setFetchedAt(history.fetchedAt);
      }
      setBrief(br);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const asOfIso = useMemo(() => (series.length > 0 ? todayOrLatest(series) : ""), [series]);

  const value: DashboardData = {
    loading,
    error,
    series,
    fetchedAt,
    brief,
    asOfIso,
    amount,
    setAmount,
    fees,
    setFees,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardData {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}
