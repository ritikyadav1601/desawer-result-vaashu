import AdminShell from "@/components/admin/AdminShell";
import { updateKhaiwalSettings } from "@/app/admin/actions";
import { getKhaiwalSettings, KHAIWAL_WEBSITES, validSiteId } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ site?: string; saved?: string; error?: string }> }) {
  const params = await searchParams;
  const siteId = validSiteId(params.site);
  const website = KHAIWAL_WEBSITES.find((item) => item.id === siteId)!;
  const settings = await getKhaiwalSettings(siteId);
  return (
    <AdminShell>
      <div className="admin-heading">
        <h1>Khaiwal Chart Settings</h1>
        <p>Select the website whose Khaiwal name and phone number you want to change.</p>
      </div>
      <section className="admin-website-boxes">
        {KHAIWAL_WEBSITES.map((item) => (
          <a className={`admin-website-box ${item.id === siteId ? "selected" : ""}`} href={`/admin/dashboard?site=${item.id}`} key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.url}</span>
          </a>
        ))}
      </section>
      {params.saved && <p className="admin-alert">Settings saved successfully.</p>}
      {params.error === "mongodb" && (
        <p className="admin-alert error">
          Settings could not be saved because the Khaiwal MongoDB connection is unavailable. Check
          <code>KHAIWAL_MONGODB_URI</code>, then restart the server.
        </p>
      )}
      <section className="admin-card">
        <h2>{website.name}</h2>
        <p className="admin-selected-site">{website.url}</p>
        <form action={updateKhaiwalSettings} className="admin-form">
          <input type="hidden" name="siteId" value={siteId} />
          <input type="hidden" name="heading" value={settings.heading} />
          <input type="hidden" name="schedule" value={settings.schedule} />
          <input type="hidden" name="jodiRate" value={settings.jodiRate} />
          <input type="hidden" name="harufRate" value={settings.harufRate} />
          <input type="hidden" name="callToAction" value={settings.callToAction} />
          <div className="admin-grid">
            <label>Khaiwal Name<input name="name" defaultValue={settings.name} required /></label>
            <label>Phone Number<input name="whatsapp" defaultValue={settings.whatsapp} required /></label>
          </div>
          <button>Save Settings for {website.name}</button>
        </form>
      </section>
    </AdminShell>
  );
}
