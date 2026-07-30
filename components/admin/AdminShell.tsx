import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { SITE_ID } from "@/lib/site-settings";

export default async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-logo" href="/">DESAWER RESULT</Link>
        <p className="admin-site-id">Website: {SITE_ID}</p>
        <nav>
          <Link href="/admin/dashboard">Khaiwal Settings</Link>
          <Link href="/admin/games">Games</Link>
          <Link href="/admin/game/result">Game Results</Link>
          <Link href="/">View Website</Link>
        </nav>
        <form action="/api/admin/logout" method="post"><button className="admin-logout">Log out</button></form>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
