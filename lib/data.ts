import { daysInMonth, getIndiaDateParts, monthNames } from "./date";
import { getMainGameResultsForDates, getMainGameResultsForMonth } from "./main-game-results";

export type Game = {
  id: string;
  name: string;
  shortName: string;
  resultTime: string;
  chartSlug: string;
  sortOrder: number;
};

export type BoardRow = Game & { yesterday: string; today: string };
export type MonthlyRow = { day: string; values: Record<string, string> };
export type RecordRow = { date: string; result: string };
export type HomeData = {
  games: Game[];
  boardRows: BoardRow[];
  monthlyRows: MonthlyRow[];
  updatedAt: Date;
  selectedMonth: number;
  selectedYear: number;
};

const FIRESTORE_PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "today-satta-results";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents`;

export const fallbackGames: Game[] = [
  { id: "sadar-bazar", name: "SADAR BAZAR", shortName: "SB", resultTime: "01:39 PM", chartSlug: "SADAR-BAZAR-satta-result-chart", sortOrder: 1 },
  { id: "gwalior", name: "GWALIOR", shortName: "GW", resultTime: "02:39 PM", chartSlug: "GWALIOR-satta-result-chart", sortOrder: 2 },
  { id: "delhi-bazar", name: "DELHI BAZAR", shortName: "DB", resultTime: "03:00 PM", chartSlug: "Delhi-Bazar-satta-result-chart", sortOrder: 3 },
  { id: "delhi-matka", name: "DELHI MATKA", shortName: "DM", resultTime: "03:39 PM", chartSlug: "Delhi-Matka-satta-result-chart", sortOrder: 4 },
  { id: "shree-ganesh", name: "SHRI GANESH", shortName: "SG", resultTime: "04:30 PM", chartSlug: "Shree-Ganesh-satta-result-chart", sortOrder: 5 },
  { id: "agra", name: "AGRA", shortName: "AG", resultTime: "05:29 PM", chartSlug: "Agra-satta-result-chart", sortOrder: 6 },
  { id: "faridabad", name: "FARIDABAD", shortName: "FB", resultTime: "06:00 PM", chartSlug: "FARIDABAD-satta-result-chart", sortOrder: 7 },
  { id: "alwar", name: "ALWAR", shortName: "AL", resultTime: "07:34 PM", chartSlug: "Alwar-satta-result-chart", sortOrder: 8 },
  { id: "ghaziabad", name: "GAZIABAD", shortName: "GB", resultTime: "09:25 PM", chartSlug: "GHAZIABAD-satta-result-chart", sortOrder: 9 },
  { id: "dwarka", name: "DWARKA", shortName: "DW", resultTime: "10:34 PM", chartSlug: "Dwarka-satta-result-chart", sortOrder: 10 },
  { id: "gali", name: "GALI", shortName: "GL", resultTime: "11:25 PM", chartSlug: "GALI-satta-result-chart", sortOrder: 11 },
  { id: "desawer", name: "DESAWAR", shortName: "DS", resultTime: "05:00 AM", chartSlug: "DESAWER-satta-result-chart", sortOrder: 12 }
];

export const chartShortNames = ["DS", "FB", "GB", "GL"];

type FirestoreValue = Record<string, unknown>;

function decodeValue(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    const array = value.arrayValue as { values?: FirestoreValue[] };
    return (array.values || []).map(decodeValue);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, FirestoreValue> };
    return decodeFields(map.fields || {});
  }
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function firestoreDocument<T>(
  collection: string,
  document: string,
  options: { fresh?: boolean } = {}
): Promise<T | null> {
  try {
    const response = await fetch(
      `${FIRESTORE_BASE}/${collection}/${document}`,
      options.fresh ? { cache: "no-store" } : { next: { revalidate: 30 } }
    );
    if (!response.ok) return null;
    const json = (await response.json()) as { fields?: Record<string, FirestoreValue> };
    return decodeFields(json.fields || {}) as T;
  } catch {
    return null;
  }
}

function key(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function twoDigits(value: unknown) {
  const result = String(value ?? "").trim();
  return result && result !== "-" ? result.padStart(2, "0") : "XX";
}

function chartDate(rawDate: unknown, year: number, monthIndex: number) {
  const raw = String(rawDate ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{1,2}$/.test(raw)) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${raw.padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return raw;
}

function istDateKey(date: Date, offsetDays = 0) {
  const shifted = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(shifted);
}

type A7Result = { name?: string; time?: string; yesterday?: string; today?: string };
type A7Homepage = { live?: A7Result[]; next?: A7Result[]; rest?: A7Result[]; scrapedAt?: number };
type A7SK24Games = { games?: A7Result[]; scrapedAt?: number };
type A7ChartRow = { date?: string; dswr?: string; frbd?: string; gzbd?: string; gali?: string };
type A7Chart = { results?: A7ChartRow[]; scrapedAt?: number };
type A7GameChart = {
  gameName?: string;
  month?: string;
  year?: string | number;
  results?: Array<{ date?: string; day?: string; result?: string }>;
};

async function gameChartResultForDate(gameId: string, dateKey: string) {
  const [yearText, monthText] = dateKey.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const chart = await firestoreDocument<A7GameChart>(
    "scraped_cache",
    `game_${gameId}_${monthNames[monthIndex].toLowerCase()}_${year}`
  );
  const row = chart?.results?.find((item) => chartDate(item.date, year, monthIndex) === dateKey);
  return twoDigits(row?.result);
}

function aliases(game: Game) {
  const values: Record<string, string[]> = {
    "sadar-bazar": ["sadarbazar"],
    gwalior: ["gwalior", "gwaliorbazar"],
    "delhi-bazar": ["delhibazar", "delhibazaar"],
    "delhi-matka": ["delhimatka"],
    "shree-ganesh": ["shreeganesh", "shriganesh"],
    agra: ["agra", "agrabazar"],
    faridabad: ["faridabad", "fridabad", "faridabazar"],
    ghaziabad: ["ghaziabad", "gaziabad"],
    desawer: ["desawer", "desawar", "disawar"]
  };
  return new Set([key(game.name), key(game.shortName), ...(values[game.id] || [])]);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gameFromA7(item: A7Result, index: number): Game {
  const name = String(item.name || `Game ${index + 1}`).trim();
  const normalized = key(name);
  const known = fallbackGames.find((game) => aliases(game).has(normalized));
  if (known) {
    return { ...known, resultTime: item.time || known.resultTime, sortOrder: index + 1 };
  }

  const specialCodes: Record<string, string> = {
    desawar: "DS",
    desawer: "DS",
    disawar: "DS",
    faridabad: "FB",
    ghaziabad: "GB",
    gaziabad: "GB",
    gali: "GL"
  };
  const id = slugify(name);
  const initials = name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return {
    id,
    name,
    shortName: specialCodes[normalized] || initials || "GM",
    resultTime: item.time || "",
    chartSlug: `${id}-satta-result-chart`,
    sortOrder: index + 1
  };
}

function monthlyValues(row: A7ChartRow): Record<string, string> {
  return {
    DS: twoDigits(row.dswr),
    FB: twoDigits(row.frbd),
    GB: twoDigits(row.gzbd),
    GL: twoDigits(row.gali)
  };
}

export async function getHomeData(date = new Date()): Promise<HomeData> {
  const { monthIndex, year } = getIndiaDateParts(date);
  const month = monthNames[monthIndex].toLowerCase();
  const [homepage, sk24, chart] = await Promise.all([
    firestoreDocument<A7Homepage>("scraped_cache", "homepage", { fresh: true }),
    firestoreDocument<A7SK24Games>("scraped_cache", "sk24_games", { fresh: true }),
    firestoreDocument<A7Chart>("scraped_cache", `chart_${month}_${year}`, { fresh: true })
  ]);
  // Match a7-satta.co: its fixed result section searches both the primary
  // homepage cache and the SK24 cache. Several regional games only exist in
  // sk24_games, so using homepage alone left otherwise available values as XX.
  const incoming = [
    ...(sk24?.games || []),
    ...(homepage?.live || []),
    ...(homepage?.next || []),
    ...(homepage?.rest || [])
  ]
    .filter((item) => item.name && !String(item.name).includes("SHOW YOUR GAME HERE"));
  const missingPriorityGames = fallbackGames.filter(
    (game) => !incoming.some((item) => aliases(game).has(key(item.name)))
  );
  const todayKey = istDateKey(date);
  const yesterdayKey = istDateKey(date, -1);
  const chartFallbacks = new Map(
    await Promise.all(
      missingPriorityGames.map(async (game) => [
        game.id,
        {
          yesterday: await gameChartResultForDate(game.id, yesterdayKey),
          today: await gameChartResultForDate(game.id, todayKey)
        }
      ] as const)
    )
  );
  const manualResults = await getMainGameResultsForDates([yesterdayKey, todayKey]);
  const usedIncoming = new Set<number>();
  const priorityRows = fallbackGames.map((game) => {
    const matchIndex = incoming.findIndex((item, index) => !usedIncoming.has(index) && aliases(game).has(key(item.name)));
    const match = matchIndex >= 0 ? incoming[matchIndex] : undefined;
    const fallback = chartFallbacks.get(game.id);
    const manualYesterday = manualResults.find((item) => item.gameId === game.id && item.date === yesterdayKey);
    const manualToday = manualResults.find((item) => item.gameId === game.id && item.date === todayKey);
    if (matchIndex >= 0) usedIncoming.add(matchIndex);
    return {
      ...game,
      yesterday: manualYesterday?.result ?? (match ? twoDigits(match.yesterday) : fallback?.yesterday ?? "XX"),
      today: manualToday?.result ?? (match ? twoDigits(match.today) : fallback?.today ?? "XX")
    };
  });

  const seen = new Set(priorityRows.map((game) => key(game.name)));
  const remainingRows = incoming.flatMap((item, index) => {
    if (usedIncoming.has(index)) return [];
    const normalized = key(item.name);
    if (!normalized || seen.has(normalized)) return [];
    seen.add(normalized);
    const game = gameFromA7(item, index);
    return {
      ...game,
      yesterday: twoDigits(item.yesterday),
      today: twoDigits(item.today)
    };
  });
  const boardRows = [...priorityRows, ...remainingRows];
  const monthlyRows = (chart?.results || []).map((row, index) => ({
    day: String(row.date || index + 1).replace(/^.*-/, "").padStart(2, "0"),
    values: monthlyValues(row)
  }));

  return {
    games: boardRows.map(({ yesterday: _yesterday, today: _today, ...game }) => game),
    boardRows,
    monthlyRows,
    updatedAt: new Date(Math.max(homepage?.scrapedAt || 0, sk24?.scrapedAt || 0, chart?.scrapedAt || 0) || Date.now()),
    selectedMonth: monthIndex,
    selectedYear: year
  };
}

export async function getMonthlyRows(year: number, monthIndex: number) {
  const month = monthNames[monthIndex].toLowerCase();
  const chart = await firestoreDocument<A7Chart>("scraped_cache", `chart_${month}_${year}`);
  if (!chart?.results) return [];
  return chart.results.slice(0, daysInMonth(year, monthIndex)).map((row, index) => ({
    day: String(row.date || index + 1).replace(/^.*-/, "").padStart(2, "0"),
    values: monthlyValues(row)
  }));
}

export function chartTitle(monthIndex: number, year: number) {
  return `Monthly Satta Matka King Result Chart of ${monthNames[monthIndex]} ${year} for Gali, Desawer, Gaziabad and Faridabad`;
}

export async function getGameRecord(slug: string): Promise<{ game: Game; rows: RecordRow[] }> {
  const suffix = "-satta-result-chart";
  const rawId = slug.toLowerCase().endsWith(suffix) ? slug.toLowerCase().slice(0, -suffix.length) : slug.toLowerCase();
  const chartAliases: Record<string, string> = {
    desawer: "desawar",
    disawar: "desawar",
    fridabad: "faridabad",
    gaziabad: "ghaziabad",
    "shree-ganesh": "shri-ganesh"
  };
  const chartId = chartAliases[rawId] || rawId;
  const knownGame = fallbackGames.find((item) => item.chartSlug.toLowerCase() === slug.toLowerCase());
  const now = new Date();
  const { monthIndex: currentMonth, year: currentYear } = getIndiaDateParts(now);
  const monthName = monthNames[currentMonth].toLowerCase();
  const chart = await firestoreDocument<A7GameChart>(
    "scraped_cache",
    `game_${chartId}_${monthName}_${currentYear}`
  );
  const game: Game = knownGame || {
    id: chartId,
    name: chart?.gameName || chartId.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    shortName: chartId.slice(0, 3).toUpperCase(),
    resultTime: "",
    chartSlug: slug,
    sortOrder: 0
  };

  if (chart?.results?.length) {
    const year = Number(chart.year || currentYear);
    const monthIndex = Math.max(
      0,
      monthNames.findIndex((month) => month.toLowerCase() === String(chart.month || monthName).toLowerCase())
    );
    const manualResults = await getMainGameResultsForMonth(year, monthIndex, game.id);
    const manualByDate = new Map(manualResults.map((item) => [item.date, item.result]));
    const chartRows = chart.results.map((row) => {
      const date = chartDate(row.date, year, monthIndex);
      return { date, result: manualByDate.get(date) ?? twoDigits(row.result) };
    });
    manualResults.forEach((item) => {
      if (!chartRows.some((row) => row.date === item.date)) chartRows.push({ date: item.date, result: item.result });
    });
    chartRows.sort((a, b) => a.date.localeCompare(b.date));
    return {
      game,
      rows: chartRows
    };
  }

  const monthly = await getMonthlyRows(currentYear, currentMonth);
  return {
    game,
    rows: monthly.map((row) => ({
      date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${row.day}`,
      result: row.values[game.shortName] || "XX"
    }))
  };
}
