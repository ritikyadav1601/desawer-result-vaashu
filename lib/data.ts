import { ObjectId, type Document } from "mongodb";
import { getDb } from "./mongodb";
import { daysInMonth, monthNames, toDateKey } from "./date";

export type Game = {
  id: string;
  name: string;
  shortName: string;
  resultTime: string;
  chartSlug: string;
  sortOrder: number;
};

export type BoardRow = Game & {
  yesterday: string;
  today: string;
};

export type MonthlyRow = {
  day: string;
  values: Record<string, string>;
};

export type RecordRow = {
  date: string;
  result: string;
};

export type HomeData = {
  games: Game[];
  boardRows: BoardRow[];
  monthlyRows: MonthlyRow[];
  updatedAt: Date;
  selectedMonth: number;
  selectedYear: number;
};

const fallbackGames: Game[] = [
  { id: "sadar-bazar", name: "SADAR BAZAR", shortName: "SB", resultTime: "01:30 PM", chartSlug: "SADAR-BAZAR-satta-result-chart", sortOrder: 1 },
  { id: "gwalior", name: "GWALIOR", shortName: "GW", resultTime: "02:30 PM", chartSlug: "GWALIOR-satta-result-chart", sortOrder: 2 },
  { id: "delhi-bazar", name: "Delhi Bazar", shortName: "DB", resultTime: "03:05 PM", chartSlug: "Delhi-Bazar-satta-result-chart", sortOrder: 3 },
  { id: "delhi-matka", name: "Delhi Matka", shortName: "DM", resultTime: "03:40 PM", chartSlug: "Delhi-Matka-satta-result-chart", sortOrder: 4 },
  { id: "shree-ganesh", name: "Shree Ganesh", shortName: "SG", resultTime: "04:40 PM", chartSlug: "Shree-Ganesh-satta-result-chart", sortOrder: 5 },
  { id: "agra", name: "Agra", shortName: "AG", resultTime: "05:30 PM", chartSlug: "Agra-satta-result-chart", sortOrder: 6 },
  { id: "faridabad", name: "FARIDABAD", shortName: "FB", resultTime: "06:10 PM", chartSlug: "FARIDABAD-satta-result-chart", sortOrder: 7 },
  { id: "alwar", name: "Alwar", shortName: "AL", resultTime: "07:30 PM", chartSlug: "Alwar-satta-result-chart", sortOrder: 8 },
  { id: "ghaziabad", name: "GHAZIABAD", shortName: "GB", resultTime: "09:10 PM", chartSlug: "GHAZIABAD-satta-result-chart", sortOrder: 9 },
  { id: "dwarka", name: "Dwarka", shortName: "DW", resultTime: "10:20 PM", chartSlug: "Dwarka-satta-result-chart", sortOrder: 10 },
  { id: "gali", name: "GALI", shortName: "GL", resultTime: "11:40 PM", chartSlug: "GALI-satta-result-chart", sortOrder: 11 },
  { id: "desawer", name: "DESAWER", shortName: "DS", resultTime: "05:15 AM", chartSlug: "DESAWER-satta-result-chart", sortOrder: 12 }
];

const chartShortNames = ["DS", "FB", "GB", "GL"];
const requestedGameAliases = new Map([
  ["sadar-bazar", ["sadar bazar", "sadar-bazar", "sbzr"]],
  ["gwalior", ["gwalior", "glr"]],
  ["delhi-bazar", ["delhi bazar", "delhi-bazar", "delhi bazaar", "db", "dl"]],
  ["delhi-matka", ["delhi matka", "delhi-matka"]],
  ["shree-ganesh", ["shree ganesh", "shree-ganesh", "shri ganesh", "shri-ganesh", "sg"]],
  ["agra", ["agra", "agr"]],
  ["faridabad", ["faridabad", "fb"]],
  ["alwar", ["alwar", "alw"]],
  ["ghaziabad", ["ghaziabad", "gaziabad", "gzbd", "gb"]],
  ["dwarka", ["dwarka", "dw"]],
  ["gali", ["gali", "gl"]],
  ["desawer", ["desawer", "desawar", "ds"]]
]);
const knownShortNames = new Map([
  ["desawer", "DS"],
  ["faridabad", "FB"],
  ["ghaziabad", "GB"],
  ["gali", "GL"]
]);

function slugify(value: string) {
  return value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/-+/g, "-");
}

function normalizeKey(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatResultTime(value: unknown) {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) return raw;

  const hour = Number(match[1]);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${match[2]} ${suffix}`;
}

function normalizeGame(doc: Document, index: number): Game {
  const name = String(doc.name ?? doc.gameName ?? doc.title ?? "Game");
  const knownShortName = knownShortNames.get(name.trim().toLowerCase());
  const shortName = String(knownShortName ?? doc.shortName ?? doc.code ?? name.slice(0, 2)).toUpperCase();
  const slug = String(doc.chartSlug ?? `${slugify(name)}-satta-result-chart`);

  return {
    id: String(doc._id ?? doc.id ?? slugify(name).toLowerCase()),
    name,
    shortName,
    resultTime: formatResultTime(doc.resultTime ?? doc.time),
    chartSlug: slug,
    sortOrder: Number(doc.sortOrder ?? doc.showIndex ?? doc.order ?? index)
  };
}

function mergeRequestedGames(dbGames: Game[]) {
  return fallbackGames.map((requestedGame) => {
    const aliases = requestedGameAliases.get(requestedGame.id) ?? [requestedGame.name, requestedGame.shortName];
    const aliasKeys = new Set(aliases.map(normalizeKey));
    const match = dbGames.find((game) => [game.name, game.shortName, game.chartSlug].some((value) => aliasKeys.has(normalizeKey(value))));

    return {
      ...requestedGame,
      id: match?.id ?? requestedGame.id
    };
  });
}

function normalizeResult(doc: Document) {
  const rawGame = doc.game ?? doc.gameId ?? doc.gameName ?? doc.market ?? doc.name;
  const rawDate = doc.resultDate ?? doc.date ?? doc.day;
  const result = String(doc.result ?? doc.resultNumber ?? doc.number ?? doc.value ?? "XX").padStart(2, "0");

  return {
    game: rawGame instanceof ObjectId ? rawGame.toString() : String(rawGame ?? ""),
    date: rawDate instanceof Date ? toDateKey(rawDate) : String(rawDate ?? ""),
    result
  };
}

function gameResultValues(games: Game[]) {
  const values = new Map<string, string | ObjectId>();

  games.forEach((game) => {
    [game.id, game.name, game.shortName].forEach((value) => {
      if (value) {
        values.set(value, value);
      }
    });

    if (ObjectId.isValid(game.id)) {
      values.set(`object-id:${game.id}`, new ObjectId(game.id));
    }
  });

  return Array.from(values.values());
}

function gameResultFilter(games: Game[]) {
  const values = gameResultValues(games);

  return {
    $or: [{ game: { $in: values } }, { gameId: { $in: values } }, { gameName: { $in: values } }, { market: { $in: values } }]
  };
}

function resultFor(results: ReturnType<typeof normalizeResult>[], game: Game, dateKey: string) {
  const match = results.find((result) => {
    const resultGame = result.game.toLowerCase();
    return result.date === dateKey && [game.id, game.name, game.shortName].some((key) => resultGame === key.toLowerCase());
  });

  return match?.result ?? "XX";
}

export async function getHomeData(date = new Date()): Promise<HomeData> {
  const todayKey = toDateKey(date);
  const yesterday = new Date(date);
  yesterday.setDate(date.getDate() - 1);
  const yesterdayKey = toDateKey(yesterday);
  let db;

  try {
    db = await getDb();
  } catch {
    const boardRows = fallbackGames.map((game, index) => ({
      ...game,
      yesterday: ["72", "85", "13", "16", "92", "08", "97", "93", "69", "48", "78", "XX"][index] ?? "XX",
      today: ["64", "30", "12", "96", "27", "82", "69", "51", "XX", "XX", "XX", "24"][index] ?? "XX"
    }));

    return {
      games: fallbackGames,
      boardRows,
      monthlyRows: [
        { day: "01", values: { DS: "XX", FB: "97", GB: "69", GL: "78" } },
        { day: "02", values: { DS: "24", FB: "69", GB: "XX", GL: "XX" } }
      ],
      updatedAt: date,
      selectedMonth: date.getMonth(),
      selectedYear: date.getFullYear()
    };
  }

  const gameDocs = await db
    .collection("games")
    .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
    .sort({ sortOrder: 1, resultTime: 1 })
    .toArray()
    .catch(() => []);

  const dbGames = gameDocs.map(normalizeGame);
  const games = gameDocs.length ? mergeRequestedGames(dbGames) : fallbackGames;
  const onlyKnownGames = gameResultFilter(games);
  const resultDocs = await db
    .collection("gameresults")
    .find({
      $and: [
        { $or: [{ resultDate: { $in: [todayKey, yesterdayKey] } }, { date: { $in: [todayKey, yesterdayKey] } }] },
        onlyKnownGames
      ]
    })
    .toArray()
    .catch(() => []);

  const fallbackResultDocs = resultDocs.length
    ? resultDocs
    : await db
        .collection("results")
        .find({
          $and: [
            { $or: [{ resultDate: { $in: [todayKey, yesterdayKey] } }, { date: { $in: [todayKey, yesterdayKey] } }] },
            onlyKnownGames
          ]
        })
        .toArray()
        .catch(() => []);

  const results = fallbackResultDocs.map(normalizeResult);
  const boardRows = games.map((game) => ({
    ...game,
    yesterday: resultFor(results, game, yesterdayKey),
    today: resultFor(results, game, todayKey)
  }));

  const selectedMonth = date.getMonth();
  const selectedYear = date.getFullYear();
  const monthlyRows = await getMonthlyRows(selectedYear, selectedMonth, games);
  const latestUpdate = fallbackResultDocs
    .map((doc) => doc.updatedAt ?? doc.createdAt)
    .filter(Boolean)
    .sort((a, b) => Number(new Date(b)) - Number(new Date(a)))[0];

  return {
    games,
    boardRows,
    monthlyRows,
    updatedAt: latestUpdate ? new Date(latestUpdate) : date,
    selectedMonth,
    selectedYear
  };
}

export async function getMonthlyRows(year: number, monthIndex: number, games: Game[] = fallbackGames) {
  let db;
  try {
    db = await getDb();
  } catch {
    return [
      { day: "01", values: { DS: "XX", FB: "97", GB: "69", GL: "78" } },
      { day: "02", values: { DS: "24", FB: "69", GB: "XX", GL: "XX" } }
    ];
  }
  const month = String(monthIndex + 1).padStart(2, "0");
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-${String(daysInMonth(year, monthIndex)).padStart(2, "0")}`;
  const gameSource = games === fallbackGames
    ? mergeRequestedGames(
        await db
          .collection("games")
          .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
          .toArray()
          .then((docs) => docs.map(normalizeGame))
          .catch(() => [])
      )
    : games;
  const chartGames = gameSource.filter((game) => chartShortNames.includes(game.shortName));
  const docs = await db
    .collection("gameresults")
    .find({
      $and: [{ $or: [{ resultDate: { $gte: start, $lte: end } }, { date: { $gte: start, $lte: end } }] }, gameResultFilter(chartGames)]
    })
    .toArray()
    .catch(() => []);
  const results = docs.map(normalizeResult);

  return Array.from({ length: daysInMonth(year, monthIndex) }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return {
      day,
      values: Object.fromEntries(chartGames.map((game) => [game.shortName, resultFor(results, game, dateKey)]))
    };
  }).filter((row) => Object.values(row.values).some((value) => value !== "XX"));
}

export function chartTitle(monthIndex: number, year: number) {
  return `Monthly Satta Matka King Result Chart of ${monthNames[monthIndex]} ${year} for Gali, Desawer, Gaziabad and Faridabad`;
}

export async function getGameRecord(slug: string): Promise<{ game: Game; rows: RecordRow[] }> {
  const normalizedSlug = slug.toLowerCase();
  let db;

  try {
    db = await getDb();
  } catch {
    const game = fallbackGames.find((item) => item.chartSlug.toLowerCase() === normalizedSlug) ?? fallbackGames[0];
    return {
      game,
      rows: [
        { date: "2026-07-01", result: game.shortName === "DS" ? "XX" : "69" },
        { date: "2026-07-02", result: game.shortName === "DS" ? "24" : "XX" }
      ]
    };
  }

  const gameDocs = await db
    .collection("games")
    .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
    .toArray()
    .catch(() => []);
  const requestedGames = mergeRequestedGames(gameDocs.map(normalizeGame));
  const game = requestedGames.find((item) => item.chartSlug.toLowerCase() === normalizedSlug) ?? fallbackGames.find((item) => item.chartSlug.toLowerCase() === normalizedSlug) ?? fallbackGames[0];
  const docs = await db
    .collection("gameresults")
    .find(gameResultFilter([game]))
    .sort({ resultDate: -1, date: -1 })
    .limit(365)
    .toArray()
    .catch(() => []);

  return {
    game,
    rows: docs.map(normalizeResult).map((result) => ({ date: result.date, result: result.result }))
  };
}

export { chartShortNames, fallbackGames };
