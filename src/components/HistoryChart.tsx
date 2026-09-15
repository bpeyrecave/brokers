import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../context/DashboardContext";
import {
  type ChartRange,
  convertMarket,
  filterRange,
  resolveTradingPoint,
  thirteenthsWithin,
} from "../lib/calculations";
import { formatEUR, formatRate } from "../lib/format";
import { formatLong, formatShort } from "../lib/dates";
import type { FxPoint } from "../lib/types";
import { CardTitle } from "./CardTitle";
import { IconChart } from "./icons";

const RANGES: ChartRange[] = ["1W", "1M", "3M", "6M", "YTD", "1Y"];

interface TooltipPayloadItem {
  payload: FxPoint;
}

function ChartTooltip({ active, payload, amount }: { active?: boolean; payload?: TooltipPayloadItem[]; amount: number }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="tt-date">{formatLong(point.date)}</div>
      <div>$1 = €{formatRate(point.rate)}</div>
      <div>
        ${amount.toLocaleString("en-US")} = {formatEUR(convertMarket(amount, point.rate))}
      </div>
    </div>
  );
}

export function HistoryChart() {
  const { series, asOfIso, amount } = useDashboard();
  const [range, setRange] = useState<ChartRange>("3M");

  const points = useMemo(() => filterRange(series, asOfIso, range), [series, asOfIso, range]);

  const thirteenthMarkers = useMemo(() => {
    const ideal = thirteenthsWithin(points);
    const resolved = ideal
      .map((d) => resolveTradingPoint(series, d)?.point.date)
      .filter((d): d is string => !!d && points.some((p) => p.date === d));
    return Array.from(new Set(resolved));
  }, [points, series]);

  const { high, low } = useMemo(() => {
    if (points.length === 0) return { high: null as FxPoint | null, low: null as FxPoint | null };
    let high = points[0];
    let low = points[0];
    for (const p of points) {
      if (p.rate > high.rate) high = p;
      if (p.rate < low.rate) low = p;
    }
    return { high, low };
  }, [points]);

  const domain = useMemo((): [number, number] => {
    if (!high || !low) return [0, 1];
    const pad = Math.max((high.rate - low.rate) * 0.15, 0.001);
    return [low.rate - pad, high.rate + pad];
  }, [high, low]);

  if (points.length === 0) {
    return (
      <div className="card chart-card">
        <CardTitle icon={IconChart} tone="violet">Historical USD → EUR</CardTitle>
        <p className="empty-state">Not enough data yet for this range.</p>
      </div>
    );
  }

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <CardTitle icon={IconChart} tone="violet">Historical USD → EUR</CardTitle>
          <div className="card-sub" style={{ marginBottom: 0 }}>
            How many euros $1 has bought over time. Dashed lines mark the 13th of each month — the UNDP's rate.
          </div>
        </div>
        <div className="range-tabs">
          {RANGES.map((r) => (
            <button key={r} type="button" className={`range-tab${range === r ? " active" : ""}`} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-stats">
        <div>
          High <strong className="num">€{formatRate(high!.rate)}</strong> {formatShort(high!.date)}
        </div>
        <div>
          Low <strong className="num">€{formatRate(low!.rate)}</strong> {formatShort(low!.date)}
        </div>
        <div>
          For ${amount.toLocaleString("en-US")} <strong className="num">{formatEUR(convertMarket(amount, points[points.length - 1].rate))}</strong> today
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={points} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line-soft)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => formatShort(d)}
            tick={{ fontSize: 11, fill: "var(--ink-faint)" }}
            axisLine={{ stroke: "var(--line)" }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            domain={domain}
            tickFormatter={(v: number) => v.toFixed(3)}
            tick={{ fontSize: 11, fill: "var(--ink-faint)" }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<ChartTooltip amount={amount} />} />
          {thirteenthMarkers.map((d) => (
            <ReferenceLine key={d} x={d} stroke="var(--amber)" strokeDasharray="4 3" strokeOpacity={0.8} />
          ))}
          <Area type="monotone" dataKey="rate" stroke="var(--accent)" strokeWidth={2} fill="url(#fxFill)" dot={false} activeDot={{ r: 4 }} />
          <ReferenceDot
            x={points[points.length - 1].date}
            y={points[points.length - 1].rate}
            r={4}
            fill="var(--amber)"
            stroke="var(--card)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="chart-legend">
        <span>
          <span className="dot" style={{ background: "var(--accent)" }} /> USD → EUR rate
        </span>
        <span>
          <span className="dot" style={{ background: "var(--amber)" }} /> Current rate
        </span>
        <span style={{ color: "var(--amber)" }}>┄ 13th of each month (UNDP rate)</span>
      </div>
    </div>
  );
}
