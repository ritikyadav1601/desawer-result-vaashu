import AdminShell from "@/components/admin/AdminShell";
import { fallbackGames } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function AdminGamesPage() {
  return (
    <AdminShell>
      <div className="admin-heading">
        <h1>Games</h1>
        <p>The 12 main games shown at the top of the website.</p>
      </div>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Order</th><th>Game</th><th>Code</th><th>Result Time</th><th>Chart</th></tr></thead>
            <tbody>
              {fallbackGames.map((game) => (
                <tr key={game.id}>
                  <td>{game.sortOrder}</td>
                  <td>{game.name}</td>
                  <td>{game.shortName}</td>
                  <td>{game.resultTime}</td>
                  <td><a href={`/${game.chartSlug}`}>Record Chart</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
