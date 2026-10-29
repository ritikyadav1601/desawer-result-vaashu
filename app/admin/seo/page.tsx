import AdminShell from "@/components/admin/AdminShell";
import { resetHomepageSeo, updateHomepageSeo } from "@/app/admin/actions";
import { faqsToText, fillSeoPlaceholders, getHomepageSeo, SEO_PLACEHOLDERS, SITE_DOMAIN } from "@/lib/homepage-seo";
import { siteName, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminHomepageSeoPage({ searchParams }: { searchParams: Promise<{ saved?: string; reset?: string; error?: string }> }) {
  const params = await searchParams;
  const seo = await getHomepageSeo();
  const previewTitle = fillSeoPlaceholders(seo.metaTitle);
  const previewDescription = fillSeoPlaceholders(seo.metaDescription);

  return (
    <AdminShell>
      <div className="admin-heading">
        <h1>Homepage SEO</h1>
        <p>Edit the meta tags, headings, content and FAQs shown on the homepage of <strong>{SITE_DOMAIN}</strong>.</p>
      </div>
      {params.saved && <p className="admin-alert">Homepage SEO saved successfully.</p>}
      {params.reset && <p className="admin-alert">Homepage SEO reset to the default content.</p>}
      {params.error === "mongodb" && (
        <p className="admin-alert error">Could not save because the MongoDB connection is unavailable. Check <code>KHAIWAL_MONGODB_URI</code>, then restart the server.</p>
      )}

      <section className="admin-card">
        <h2>Database record</h2>
        <p className="admin-selected-site">
          Collection <code>homepage_seo</code> · domain <code>{SITE_DOMAIN}</code> · {siteName} ({siteUrl})
        </p>
        <p>
          {seo.fromDatabase
            ? `Loaded from database${seo.updatedAt ? `, last updated ${seo.updatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST` : ""}.`
            : "No record saved yet for this website — the homepage is using the default content below. Click Save to store it in the database."}
        </p>
        <p className="admin-help">
          Placeholders you can use in any field: {SEO_PLACEHOLDERS.map((item) => <code key={item}>{item}</code>)} — they are replaced with live values on every page load.
        </p>
      </section>

      <section className="admin-card">
        <h2>Google preview</h2>
        <div className="admin-serp">
          <span className="admin-serp-url">{siteUrl}</span>
          <span className="admin-serp-title">{previewTitle}</span>
          <span className="admin-serp-desc">{previewDescription}</span>
        </div>
        <p className="admin-help">Title: {previewTitle.length} characters (aim for 50–60). Description: {previewDescription.length} characters (aim for 140–160).</p>
      </section>

      <section className="admin-card">
        <form action={updateHomepageSeo} className="admin-form">
          <h2>Meta tags</h2>
          <label>Meta Title<input name="metaTitle" defaultValue={seo.metaTitle} maxLength={200} required /></label>
          <label>Meta Description<textarea name="metaDescription" defaultValue={seo.metaDescription} rows={3} maxLength={400} required /></label>
          <label>Keywords (comma separated)<input name="keywords" defaultValue={seo.keywords} /></label>

          <h2>Top of page</h2>
          <label>Red Notice Bar Text<textarea name="topNotice" defaultValue={seo.topNotice} rows={3} /></label>
          <label>Main H1 Heading (the only H1 on the homepage)<input name="pageHeading" defaultValue={seo.pageHeading} /></label>

          <h2>SEO content section (bottom of homepage)</h2>
          <label>Content Heading (H2)<input name="contentHeading" defaultValue={seo.contentHeading} /></label>
          <label>Lead Line (bold intro)<input name="contentLead" defaultValue={seo.contentLead} /></label>
          <label>
            Content (HTML — use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;a href=&quot;/...&quot;&gt;)
            <textarea name="contentHtml" defaultValue={seo.contentHtml} rows={24} className="admin-code" />
          </label>
          <label>
            FAQs (one FAQ per block: first line = question, next line = answer, blank line between FAQs). Also used for FAQ schema.
            <textarea name="faqs" defaultValue={faqsToText(seo.faqs)} rows={12} />
          </label>
          <label>Disclaimer<textarea name="disclaimer" defaultValue={seo.disclaimer} rows={4} /></label>
          <button>Save Homepage SEO for {SITE_DOMAIN}</button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Reset</h2>
        <p>Replace the saved content with the original default homepage content.</p>
        <form action={resetHomepageSeo} className="admin-form"><button className="danger">Reset to default</button></form>
      </section>
    </AdminShell>
  );
}
