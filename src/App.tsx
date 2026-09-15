import { lazy, Suspense, useMemo } from "react";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { RateHero } from "./components/RateHero";
import { TimeComparison } from "./components/TimeComparison";
import { BenchmarkCard } from "./components/BenchmarkCard";
import { WhatIfTool } from "./components/WhatIfTool";
import { DecisionCard } from "./components/DecisionCard";
import { AIBrief } from "./components/AIBrief";
import { ConversionLog } from "./components/ConversionLog";
import { FeesToggle } from "./components/FeesToggle";
import { SmartMetrics } from "./components/SmartMetrics";
import { HodlCounter } from "./components/HodlCounter";
import { YearlyBenchmark } from "./components/YearlyBenchmark";
import { Footer } from "./components/Footer";

const HistoryChart = lazy(() => import("./components/HistoryChart").then((m) => ({ default: m.HistoryChart })));

const STALE_MS = 36 * 3600 * 1000;

function DashboardBody() {
  const { loading, error, fetchedAt, brief } = useDashboard();

  const dataStale = useMemo(
    () => (!!fetchedAt && Date.now() - new Date(fetchedAt).getTime() > STALE_MS) || brief?.ok === false,
    [fetchedAt, brief],
  );

  if (loading) {
    return (
      <div className="loading-state">
        <div className="hero-eyebrow">Loading rates…</div>
        <p>Fetching the latest USD → EUR data.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Something went wrong</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <Sidebar dataStale={dataStale} />

      <div className="main">
        <Header dataStale={dataStale} />

        <div className="container">
          <section id="overview" className="section">
            <RateHero />
          </section>

          <section id="benchmark" className="section grid grid-3">
            <BenchmarkCard />
            <DecisionCard />
            <HodlCounter />
          </section>

          <section id="history" className="section">
            <Suspense fallback={<div className="card chart-card">Loading chart…</div>}>
              <HistoryChart />
            </Suspense>
          </section>

          <section id="yearly" className="section">
            <YearlyBenchmark />
          </section>

          <section id="timing" className="section grid grid-2">
            <TimeComparison />
            <WhatIfTool />
          </section>

          <section id="brief" className="section">
            <AIBrief />
          </section>

          <section id="fees" className="section">
            <FeesToggle />
          </section>

          <section id="metrics" className="section">
            <SmartMetrics />
          </section>

          <section id="log" className="section">
            <ConversionLog />
          </section>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardBody />
    </DashboardProvider>
  );
}
