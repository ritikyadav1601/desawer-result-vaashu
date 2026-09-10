import { daysInMonth, getIndiaDateParts, monthNames, toDateKey } from "./date";
import { getGameHistory, getGamesAndResults, type MongoGame, type ResultSource } from "./results-mongodb";

export type Game = { id: string; name: string; shortName: string; resultTime: string; chartSlug: string; sortOrder: number; source: ResultSource; mongoId: string };
export type BoardRow = Game & { yesterday: string; today: string };
export type MonthlyRow = { day: string; values: Record<string, string> };
export type RecordRow = { date: string; result: string };
export type HomeData = {
  games: Game[]; boardRows: BoardRow[]; mainGameRows: BoardRow[]; otherGameRows: BoardRow[];
  monthlyRows: MonthlyRow[]; updatedAt: Date; selectedMonth: number; selectedYear: number;
};

// The homepage now receives its game list and results directly from MongoDB.
export const fallbackGames: Game[] = [];
export const chartShortNames = ["DS", "FB", "GB", "GL"];

function key(value: unknown) { return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function twoDigits(value: unknown) { const result = String(value ?? "").trim(); return /^\d{1,3}$/.test(result) ? result.padStart(2, "0") : "XX"; }
function slugify(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

// The "MAIN GAMES" board is a fixed, curated lineup shown in this exact order
// regardless of which MongoDB source (main/extra) a game actually lives in.
// Everything else falls through to "ALL OTHER GAMES" in its existing order.
const mainGameOrder: { names: string[]; time?: string }[] = [
  { names: ["Sadar Bazar"], time: "01:39 PM" },
  { names: ["Gwalior"], time: "02:39 PM" },
  { names: ["Delhi Bazar"], time: "03:00 PM" },
  { names: ["Delhi Matka"], time: "03:39 PM" },
  { names: ["Shri Ganesh"], time: "04:30 PM" },
  { names: ["Agra"], time: "05:29 PM" },
  { names: ["Faridabad"], time: "06:00 PM" },
  { names: ["Alwar"], time: "07:34 PM" },
  { names: ["Gaziabad", "Ghaziabad"], time: "09:25 PM" },
  { names: ["Dwarka"], time: "10:34 PM" },
  { names: ["Gali"], time: "11:25 PM" },
  { names: ["Desawar", "Desawer"], time: "05:00 AM" }
];

function matchesMainGame(game: { name: string; resultTime: string }, spec: { names: string[]; time?: string }) {
  if (spec.names.some((name) => key(name) === key(game.name))) return true;
  if (spec.time && game.resultTime === spec.time) return true;
  return false;
}

function formatTime(value: string | undefined) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const hours = Number(match[1]);
  return `${String(hours % 12 || 12).padStart(2, "0")}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
}

function gameFromMongo(game: MongoGame, source: ResultSource, sortOrder: number): Game {
  const name = String(game.name || "Game").trim();
  return {
    id: `${source}:${game._id.toString()}`,
    name,
    shortName: String(game.code || name.split(/\s+/).map((word) => word[0]).join("")).slice(0, 4).toUpperCase(),
    resultTime: formatTime(game.resultTime),
    chartSlug: `${slugify(name)}-satta-result-chart`,
    sortOrder,
    source,
    mongoId: game._id.toString()
  };
}

function yesterdayKey(date: Date) {
  const parts = getIndiaDateParts(date);
  return toDateKey(new Date(Date.UTC(parts.year, parts.monthIndex, parts.day - 1, 12)));
}

async function rowsForSource(source: ResultSource, dates: [string, string]) {
  const { games, results } = await getGamesAndResults(source, dates);
  const byGameAndDate = new Map(results.map((result) => [`${result.game.toString()}:${result.resultDate}`, result]));
  return games.map((mongoGame, index) => {
    const game = gameFromMongo(mongoGame, source, index + 1);
    return {
      ...game,
      yesterday: twoDigits(byGameAndDate.get(`${game.mongoId}:${dates[0]}`)?.result),
      today: twoDigits(byGameAndDate.get(`${game.mongoId}:${dates[1]}`)?.result)
    };
  });
}

export async function getHomeData(date = new Date()): Promise<HomeData> {
  const { monthIndex, year } = getIndiaDateParts(date);
  const today = toDateKey(date);
  const yesterday = yesterdayKey(date);
  const [mainSourceRows, extraSourceRows] = await Promise.all([rowsForSource("main", [yesterday, today]), rowsForSource("extra", [yesterday, today])]);
  const pool = [...mainSourceRows, ...extraSourceRows];

  const usedIds = new Set<string>();
  const mainGameRows = mainGameOrder.flatMap((spec) => {
    const match = pool.find((row) => !usedIds.has(row.id) && matchesMainGame(row, spec));
    if (!match) return [];
    usedIds.add(match.id);
    return [match];
  });
  const otherGameRows = pool.filter((row) => !usedIds.has(row.id));

  const boardRows = [...mainGameRows, ...otherGameRows];
  return {
    games: boardRows.map(({ yesterday: _yesterday, today: _today, ...game }) => game),
    boardRows, mainGameRows, otherGameRows,
    monthlyRows: await getMonthlyRows(year, monthIndex),
    updatedAt: new Date(), selectedMonth: monthIndex, selectedYear: year
  };
}

export async function getMonthlyRows(year: number, monthIndex: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-${String(daysInMonth(year, monthIndex)).padStart(2, "0")}`;
  const { games } = await getGamesAndResults("main", []);
  const expected = new Map([["DS", "desawer"], ["FB", "faridabad"], ["GB", "ghaziabad"], ["GL", "gali"]]);
  const selected = games.flatMap((game) => {
    const code = [...expected.entries()].find(([expectedCode, name]) => key(game.code) === key(expectedCode) || key(game.name) === key(name))?.[0];
    return code ? [[code, game] as const] : [];
  });
  const histories = await Promise.all(selected.map(async ([code, game]) => [code, await getGameHistory("main", game._id, start, end)] as const));
  const results = new Map<string, Record<string, string>>();
  for (const [code, history] of histories) for (const item of history) results.set(item.resultDate, { ...(results.get(item.resultDate) || {}), [code]: twoDigits(item.result) });
  return Array.from({ length: daysInMonth(year, monthIndex) }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    return { day, values: results.get(`${year}-${month}-${day}`) || {} };
  });
}

export function chartTitle(monthIndex: number, year: number) {
  return `Monthly Satta Matka King Result Chart of ${monthNames[monthIndex]} ${year} for Gali, Desawer, Gaziabad and Faridabad`;
}

export async function getGameRecord(slug: string): Promise<{ game: Game; rows: RecordRow[] }> {
  const suffix = "-satta-result-chart";
  const target = slug.toLowerCase().endsWith(suffix) ? slug.slice(0, -suffix.length) : slug;
  const [main, extra] = await Promise.all([getGamesAndResults("main", []), getGamesAndResults("extra", [])]);
  const found = (["main", "extra"] as const).map((source) => ({ source, games: source === "main" ? main.games : extra.games })).find(({ games }) => games.some((item) => slugify(item.name) === target));
  const source = found?.source || "main";
  const mongoGame = found?.games.find((item) => slugify(item.name) === target) || main.games[0];
  if (!mongoGame) throw new Error("No games are configured in MongoDB.");
  const game = gameFromMongo(mongoGame, source, 0);
  const { monthIndex, year } = getIndiaDateParts(new Date());
  const month = String(monthIndex + 1).padStart(2, "0");
  const history = await getGameHistory(source, mongoGame._id, `${year}-${month}-01`, `${year}-${month}-${String(daysInMonth(year, monthIndex)).padStart(2, "0")}`);
  return { game, rows: history.map((item) => ({ date: item.resultDate, result: twoDigits(item.result) })) };
}
