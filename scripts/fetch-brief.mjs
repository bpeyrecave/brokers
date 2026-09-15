// Generates the "Today's FX Brief" section by asking Claude (with web search)
// to summarize what's currently moving USD/EUR, in plain language.
//
// Requires the ANTHROPIC_API_KEY environment variable, which must be set as a
// GitHub Actions secret (Settings -> Secrets and variables -> Actions) and is
// never sent to, or bundled into, the client-side app. If the key is missing
// or the call fails for any reason, this script leaves the previous
// public/data/brief.json in place (or writes a clearly-marked "unavailable"
// placeholder) so the rest of the dashboard keeps working.
//
// Run with: ANTHROPIC_API_KEY=... node scripts/fetch-brief.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "data");
const OUT_FILE = path.join(OUT_DIR, "brief.json");

const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT = `You write a short daily "FX brief" for two friends who are paid in USD but spend in EUR, for a personal dashboard called "Every Day I'm HODLing". They are not traders and have no interest in becoming ones.

Rules:
- Use web search to check what is currently, plausibly moving the USD/EUR exchange rate: Federal Reserve decisions/signals, ECB decisions/signals, US and Eurozone inflation, US employment reports, growth data, bond yields, political/economic uncertainty, and major geopolitical developments.
- Explicitly separate: (1) what markets expected, (2) what actually happened/was said, and (3) how USD/EUR actually reacted. Do not claim a single headline "caused" a move without this context.
- NEVER predict future exchange rates or claim certainty about what will happen next. You may describe what markets are currently pricing in / expecting, clearly framed as expectations, not forecasts from you.
- Keep language simple — no trader jargon left unexplained.
- Be concise. This is a glance-and-go summary, not a research note.
- Respond with ONLY a single JSON object, no markdown fences, no commentary before or after, matching exactly this shape:

{
  "headline": "One short sentence, e.g. 'USD is a little stronger today.'",
  "summary": "2-4 short sentences in plain language covering what markets expected vs what happened vs how USD/EUR reacted. No certainty about the future.",
  "whatMattersNext": [
    { "date": "e.g. Wed Sep 17", "label": "e.g. Federal Reserve decision" }
  ],
  "forYou": "One sentence translating this into what it means for someone converting USD to EUR right now."
}

Include at most 4 items in whatMattersNext, ordered soonest first.`;

async function callClaude() {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content:
            "Write today's FX brief for USD/EUR based on current web search results. Respond with only the JSON object described in your instructions.",
        },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API request failed: ${res.status} ${res.statusText} ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const textBlocks = (data.content || []).filter((b) => b.type === "text").map((b) => b.text);
  const fullText = textBlocks.join("\n").trim();

  const match = fullText.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in model response: ${fullText.slice(0, 300)}`);

  const parsed = JSON.parse(match[0]);
  for (const field of ["headline", "summary", "forYou"]) {
    if (typeof parsed[field] !== "string" || !parsed[field].trim()) {
      throw new Error(`Model response missing required field: ${field}`);
    }
  }
  if (!Array.isArray(parsed.whatMattersNext)) parsed.whatMattersNext = [];

  return parsed;
}

async function keepExistingOrPlaceholder(reason) {
  console.error(`fetch-brief.mjs: ${reason}`);
  try {
    await readFile(OUT_FILE, "utf-8");
    console.log("Existing brief.json kept as-is.");
  } catch {
    const placeholder = {
      ok: false,
      generatedAt: new Date().toISOString(),
      headline: "Today's brief isn't available right now.",
      summary:
        "The automated FX news summary hasn't run yet, or the ANTHROPIC_API_KEY secret isn't configured for this repository. Everything else on the dashboard — rates, calculators, charts and history — uses live currency data and is unaffected.",
      whatMattersNext: [],
      forYou: "",
    };
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(OUT_FILE, JSON.stringify(placeholder, null, 2) + "\n", "utf-8");
    console.log("Wrote placeholder brief.json.");
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (!process.env.ANTHROPIC_API_KEY) {
    await keepExistingOrPlaceholder("ANTHROPIC_API_KEY is not set; skipping AI brief generation.");
    return;
  }

  try {
    const brief = await callClaude();
    const payload = { ok: true, generatedAt: new Date().toISOString(), model: MODEL, ...brief };
    await writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf-8");
    console.log(`Wrote brief.json: "${brief.headline}"`);
  } catch (err) {
    await keepExistingOrPlaceholder(`brief generation failed: ${err.message}`);
    // Non-fatal: exit 0 so the data-update workflow still commits fx/events data.
  }
}

main();
