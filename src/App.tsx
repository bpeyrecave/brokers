import { lazy, Suspense } from "react";
import { DashboardProvider, useDashboard } from "./context/DashboardContext";
import { Header } from "./components/Header";
import { RateHero } from "./components/RateHero";
import { Calculator } from "./components/Calculator";
import { TimeComparison } from "./components/TimeComparison";
import { BenchmarkCard } from "./components/BenchmarkCard";
import { WhatIfTool } from "./components/WhatIfTool";
import { DecisionCard } from "./components/DecisionCard";
import { AIBrief } from "./components/AIBrief";
import { EventsTimeline } from "./components/EventsTimeline";
import { ConversionLog } from "./components/ConversionLog";
import { FeesToggle } from "./components/FeesToggle";
import { SmartMetrics } from "./components/SmartMetrics";
import { HodlCounter } from "./components/HodlCounter";
import { Footer } from "./components/Footer";

const HistoryChart = lazy(() => import("./components/HistoryChart").then((m) => ({ default: m.HistoryChart })));

function DashboardBody() {
  const { loading, error } = useDashboard();

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
    <div className="page">
      <div className="container">
        <Header />

        <div className="grid grid-hero">
          <RateHero />
          <Calculator />
        </div>

        <div className="section grid grid-3">
          <BenchmarkCard />
          <DecisionCard />
          <HodlCounter />
        </div>

        <div className="section">
          <Suspense fallback={<div className="card chart-card">Loading chart…</div>}>
            <HistoryChart />
          </Suspense>
        </div>

        <div className="section grid grid-2">
          <TimeComparison />
          <WhatIfTool />
        </div>

        <div className="section grid grid-2">
          <AIBrief />
          <EventsTimeline />
        </div>

        <div className="section">
          <FeesToggle />
        </div>

        <div className="section">
          <SmartMetrics />
        </div>

        <div className="section">
          <ConversionLog />
        </div>

        <Footer />
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
