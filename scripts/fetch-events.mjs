// Fetches this week's / next week's economic calendar and filters it down to
// events plausibly relevant to USD/EUR, writing public/data/events.json.
//
// Data source: the ForexFactory calendar mirror published at
// https://nfs.faireconomy.media/ff_calendar_thisweek.json — a free, no-key
// feed that is widely used by hobby trading tools. It is NOT an official or
// contractually supported API, so this script fails soft: if the request
// fails or returns something unexpected, the previous public/data/events.json
// is left untouched instead of the site losing this section entirely.
//
// Run with: node scripts/fetch-events.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "data");
const OUT_FILE = path.join(OUT_DIR, "events.json");

// Only "thisweek" is a reliably-live endpoint on this mirror; other variants
// (e.g. "nextweek") have been observed to 404. Keep a single source but fetch
// it defensively in case that changes.
const FEED_URLS = ["https://nfs.faireconomy.media/ff_calendar_thisweek.json"];

// Countries/regions whose releases move USD/EUR. "All" covers global items
// (e.g. summits) that the feed itself already tags as broad.
const RELEVANT = new Set(["USD", "EUR"]);

const IMPACT_MAP = { High: "HIGH", Medium: "MEDIUM", Low: "LOW" };

function explain(title, country) {
  const t = title.toLowerCase();
  if (t.includes("fed") || t.includes("fomc")) return "Federal Reserve action or commentary — a direct USD rate driver.";
  if (t.includes("ecb") || t.includes("lagarde")) return "ECB action or commentary — a direct EUR rate driver.";
  if (t.includes("cpi") || t.includes("inflation") || t.includes("ppi")) return `${country} inflation data — shapes rate-cut/hike expectations.`;
  if (t.includes("nonfarm") || t.includes("employment") || t.includes("unemployment") || t.includes("jobless") || t.includes("payroll")) return `${country} labor market data — a key input to central bank decisions.`;
  if (t.includes("gdp")) return `${country} growth data — signals economic momentum.`;
  if (t.includes("retail sales")) return `${country} consumer spending data — a growth and inflation signal.`;
  if (t.includes("pmi") || t.includes("ism")) return `${country} business activity survey — an early growth signal.`;
  if (t.includes("bond") || t.includes("yield") || t.includes("auction")) return "Bond market event — moves the rate-differential that drives FX.";
  if (t.includes("speaks") || t.includes("speech") || t.includes("testimony")) return "Central bank speaker — can move rate expectations without a formal decision.";
  return `${country} economic release that can shift USD/EUR expectations.`;
}

async function fetchOne(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; EveryDayImHodling/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Calendar feed request failed for ${url}: ${res.status} ${res.statusText}`);
  const raw = await res.json();
  if (!Array.isArray(raw)) throw new Error(`Calendar feed returned an unexpected shape from ${url}`);
  return raw;
}

async function fetchFeed() {
  const settled = await Promise.allSettled(FEED_URLS.map(fetchOne));
  const ok = settled.filter((s) => s.status === "fulfilled").map((s) => s.value);
  if (ok.length === 0) {
    throw new Error(settled.map((s) => s.reason?.message).join("; "));
  }
  const merged = ok.flat();
  const seen = new Set();
  return merged.filter((e) => {
    const key = `${e.title}|${e.country}|${e.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  let raw;
  try {
    raw = await fetchFeed();
  } catch (err) {
    console.error("fetch-events.mjs: feed fetch failed, leaving existing events.json in place:", err.message);
    try {
      await readFile(OUT_FILE, "utf-8");
      console.log("Existing events.json kept as-is.");
      return;
    } catch {
      // No existing file either — write an empty-but-valid payload so the site still renders.
      const empty = { source: FEED_URLS, fetchedAt: new Date().toISOString(), ok: false, events: [] };
      await writeFile(OUT_FILE, JSON.stringify(empty, null, 2) + "\n", "utf-8");
      console.log("No prior events.json found; wrote an empty placeholder.");
      return;
    }
  }

  const events = raw
    .filter((e) => RELEVANT.has(e.country))
    .map((e) => ({
      title: e.title,
      country: e.country,
      date: e.date,
      impact: IMPACT_MAP[e.impact] ?? "LOW",
      forecast: e.forecast || null,
      previous: e.previous || null,
      note: explain(e.title, e.country),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const payload = {
    source: FEED_URLS,
    fetchedAt: new Date().toISOString(),
    ok: true,
    events,
  };

  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${events.length} USD/EUR-relevant events to ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
