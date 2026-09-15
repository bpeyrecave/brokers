// Fetches USD -> EUR daily reference rates from the Frankfurter API (ECB data,
// no API key required) and writes public/data/fx-history.json.
//
// Frankfurter docs: https://frankfurter.dev
//
// Run with: node scripts/fetch-fx.mjs

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "data");
const OUT_FILE = path.join(OUT_DIR, "fx-history.json");

const LOOKBACK_DAYS = 760; // ~2 years, enough headroom for 1Y / YTD views + trailing stats

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - LOOKBACK_DAYS);

  const url = `https://api.frankfurter.dev/v1/${isoDate(start)}..${isoDate(end)}?base=USD&symbols=EUR`;
  console.log(`Fetching ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Frankfurter API request failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  const series = Object.entries(data.rates)
    .map(([date, rates]) => ({ date, rate: rates.EUR }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (series.length === 0) {
    throw new Error("Frankfurter API returned no rates — refusing to overwrite existing data.");
  }

  const payload = {
    base: "USD",
    quote: "EUR",
    source: "Frankfurter API (ECB reference rates)",
    fetchedAt: new Date().toISOString(),
    series,
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${series.length} daily rates to ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log(`Latest point: ${series[series.length - 1].date} -> ${series[series.length - 1].rate}`);
}

main().catch((err) => {
  console.error("fetch-fx.mjs failed:", err);
  process.exit(1);
});
