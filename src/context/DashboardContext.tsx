import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { FxBrief, FxHistory, FxPoint } from "../lib/types";
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
}

const DashboardContext = createContext<DashboardData | null>(null);

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
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardData {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider");
  return ctx;
}
