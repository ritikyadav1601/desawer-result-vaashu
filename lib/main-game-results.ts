import { getAdminDb } from "./firebase-admin";

const COLLECTION = "main_game_results";

export type StoredGameResult = {
  gameId: string;
  date: string;
  result: string;
};

export async function saveMainGameResult(entry: StoredGameResult) {
  await getAdminDb().collection(COLLECTION).doc(`${entry.date}_${entry.gameId}`).set(
    { ...entry, updatedAt: Date.now() },
    { merge: true }
  );
}

export async function getMainGameResultsForDates(dates: string[]) {
  try {
    if (!dates.length) return [];
    const snapshot = await getAdminDb().collection(COLLECTION).where("date", "in", dates.slice(0, 10)).get();
    return snapshot.docs.map((doc) => doc.data() as StoredGameResult);
  } catch {
    return [];
  }
}

export async function getMainGameResultsForMonth(year: number, monthIndex: number, gameId: string) {
  try {
    const month = String(monthIndex + 1).padStart(2, "0");
    const start = `${year}-${month}-01`;
    const end = `${year}-${month}-31`;
    const snapshot = await getAdminDb()
      .collection(COLLECTION)
      .where("gameId", "==", gameId)
      .get();
    return snapshot.docs
      .map((doc) => doc.data() as StoredGameResult)
      .filter((item) => item.date >= start && item.date <= end);
  } catch {
    return [];
  }
}
