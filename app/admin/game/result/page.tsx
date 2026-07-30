import AdminShell from "@/components/admin/AdminShell";
import { updateMainGameResult } from "@/app/admin/actions";
import { fallbackGames } from "@/lib/data";
import { getMainGameResultsForDates } from "@/lib/main-game-results";
import { toDateKey } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminGameResultPage({ searchParams }: { searchParams: Promise<{ date?: string; saved?: string; error?: string }> }) {
  const params = await searchParams;
  const date = params.date || toDateKey(new Date());
  const results = await getMainGameResultsForDates([date]);
  const gameNames = new Map(fallbackGames.map((game) => [game.id, game.name]));
  return (
    <AdminShell>
      <div className="admin-heading">
        <h1>Game Results</h1>
        <p>Add or update a result for one of the 12 main games.</p>
      </div>
      {params.saved && <p className="admin-alert">Game result saved successfully.</p>}
      {params.error && <p className="admin-alert error">{params.error === "invalid" ? "Select a valid game, date, and result." : "Firebase Admin credentials are missing or invalid."}</p>}
      <section className="admin-card">
        <form action={updateMainGameResult} className="admin-form admin-grid">
          <label>Game<select name="gameId" required><option value="">Select game</option>{fallbackGames.map((game) => <option value={game.id} key={game.id}>{game.name}</option>)}</select></label>
          <label>Date<input type="date" name="date" defaultValue={date} required /></label>
          <label>Result<input name="result" inputMode="numeric" maxLength={3} placeholder="e.g. 45 or XX" required /></label>
          <button>Save Result</button>
        </form>
      </section>
      <section className="admin-card">
        <form method="get" className="admin-filter"><label>Show date<input type="date" name="date" defaultValue={date} /></label><button>Load</button></form>
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Game</th><th>Date</th><th>Result</th></tr></thead>
          <tbody>{results.length ? results.map((item) => <tr key={`${item.date}-${item.gameId}`}><td>{gameNames.get(item.gameId) || item.gameId}</td><td>{item.date}</td><td>{item.result}</td></tr>) : <tr><td colSpan={3}>No manually entered results for this date.</td></tr>}</tbody>
        </table></div>
      </section>
    </AdminShell>
  );
}
