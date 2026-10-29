import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { chartShortNames, chartTitle, getHomeData } from "@/lib/data";
import { formatBoardDay, formatBoardTitleDate, getIndiaDateParts, monthNames } from "@/lib/date";
import { fillSeoPlaceholders, getHomepageSeo, type HomepageSeo } from "@/lib/homepage-seo";
import { siteName, siteUrl } from "@/lib/seo";
import { getKhaiwalSettings, type KhaiwalSettings } from "@/lib/site-settings";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getHomepageSeo();
  const title = fillSeoPlaceholders(seo.metaTitle);
  const description = fillSeoPlaceholders(seo.metaDescription);
  const keywords = fillSeoPlaceholders(seo.keywords).split(",").map((item) => item.trim()).filter(Boolean);

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", type: "website" },
    twitter: { title, description }
  };
}

function getWhatsAppHref(number?: string) {
  return `https://wa.me/${number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918708328760"}`;
}

export default async function Home() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const [data, khaiwal, seo] = await Promise.all([getHomeData(today), getKhaiwalSettings(), getHomepageSeo()]);
  const chartMonth = monthNames[data.selectedMonth];

  return (
    <>
      <AutoRefresh />
      <Link className="navbar-brand" href="/" title="Home Page">
        <div className="text-center">
          <Image src="/images/logo.png" width={879} height={87} alt="brand Logo" priority />
        </div>
      </Link>

      <main className="container">
        <div className="news text-center" style={{ background: "#FF5252", color: "#fff", fontWeight: "bold" }}>
          <p>{fillSeoPlaceholders(seo.topNotice, today)}</p>
        </div>

        <h1 className="text-center">{fillSeoPlaceholders(seo.pageHeading, today)}</h1>
        <div className="text-center" style={{ margin: "8px 1% 2px 1%", color: "#339966" }}>
          Updated: <time dateTime={data.updatedAt.toISOString()}>{data.updatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</time> IST.
        </div>

        <div className="main-content" id="live-results">
          <table className="quick-result-board">
            <tbody>
              <tr className="board-title">
                <th colSpan={3}>
                  <h2 style={{ fontSize: "100%", margin: 0 }}>Satta King Fast Results of {formatBoardTitleDate(today)} &amp; {formatBoardTitleDate(yesterday)}</h2>
                </th>
              </tr>
              <tr className="board-head">
                <th className="games-name">
                  <h2 style={{ fontSize: "100%" }}>Regional Offline Draw Results</h2>
                </th>
                <th className="yesterday-date">
                  <h2 style={{ fontSize: "100%" }}>{formatBoardDay(yesterday)}</h2>
                </th>
                <th className="today-date">
                  <h2 style={{ fontSize: "100%" }}>{formatBoardDay(today)}</h2>
                </th>
              </tr>
              <tr className="board-section">
                <td className="games-name" colSpan={3}>
                  <h3>MAIN GAMES</h3>
                </td>
              </tr>
              {data.mainGameRows.map((game) => (
                <tr className="game-result" key={game.id}>
                  <td className="game-details">
                    <h3 className="game-name">{game.name}</h3>
                    <h3 className="game-time"> at {game.resultTime}</h3>
                    <h3 className="game-link">
                      <Link href={`/${game.chartSlug}`}>Record Chart</Link>
                    </h3>
                  </td>
                  <td className="yesterday-number">
                    <h3>{game.yesterday}</h3>
                  </td>
                  <td className="today-number">
                    <h3>{game.today}</h3>
                  </td>
                </tr>
              ))}
              <tr className="khaiwal-board-row">
                <td colSpan={3}>
                  <KhaiwalChart settings={khaiwal} />
                </td>
              </tr>
              <tr className="board-section">
                <td className="games-name" colSpan={3}>
                  <h3>ALL OTHER GAMES</h3>
                </td>
              </tr>
              {data.otherGameRows.map((game) => (
                <tr className="game-result" key={game.id}>
                  <td className="game-details">
                    <h3 className="game-name">{game.name}</h3>
                    <h3 className="game-time"> at {game.resultTime}</h3>
                    <h3 className="game-link">
                      <Link href={`/${game.chartSlug}`}>Record Chart</Link>
                    </h3>
                  </td>
                  <td className="yesterday-number">
                    <h3>{game.yesterday}</h3>
                  </td>
                  <td className="today-number">
                    <h3>{game.today}</h3>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <table className="table chart-table">
          <tbody>
            <tr className="chart-head">
              <td colSpan={chartShortNames.length + 1} className="month">
                <h2 className="heading">{chartTitle(data.selectedMonth, data.selectedYear)}</h2>
              </td>
            </tr>
            <tr className="date-name">
              <td className="date">DATE</td>
              {chartShortNames.map((name) => (
                <th className="name" key={name}>{name}</th>
              ))}
            </tr>
            {data.monthlyRows.map((row) => (
              <tr className="day-number" key={row.day}>
                <td className="day">{row.day}</td>
                {chartShortNames.map((name) => (
                  <td className="number" key={name}>
                    {row.values[name] ?? "XX"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cmbtn">
          <Link href={`/${monthNames[(data.selectedMonth + 11) % 12]}-${data.selectedMonth === 0 ? data.selectedYear - 1 : data.selectedYear}`}>
            <span aria-hidden>←</span>
            Previous Chart
          </Link>
        </div>
      </main>

      <div className="nav-link text-center" title={`${chartMonth}-${data.selectedYear} Satta Result Chart With Record`}>
        <Link href={`/${chartMonth}-${data.selectedYear}`}>
          <h2 className="nav-text">Click here to view the latest chart for Gali, Desawar, Ghaziabad, and Faridabad for {chartMonth}-{data.selectedYear}</h2>
        </Link>
      </div>

      <div id="footer">
        <ChartSelector />
        <div className="refresh-wrap">
          <form action="/">
            <input id="Refresh" name="Refresh" defaultValue="Refresh" type="submit" />
          </form>
        </div>
      </div>
      <SeoContent seo={seo} today={today} />
      <FloatingActions whatsapp={khaiwal.whatsapp} />
    </>
  );
}

function KhaiwalChart({ settings }: { settings: KhaiwalSettings }) {
  return (
    <div className="clsad">
      <h2>{settings.heading}</h2>
      <h3>{settings.name}</h3>
      <p>
        (Last Time)<br />
        <span className="khaiwal-schedule">{settings.schedule}</span><br />
        JODI Rate {settings.jodiRate}<br />
        HARUF Rate {settings.harufRate}<br />
        {settings.callToAction}
      </p>
      <a href={getWhatsAppHref(settings.whatsapp)}>
        <strong>
          <Image src="/images/whatsapp-footer.png" width={160} height={56} alt="Whatsapp to Play Game" />
        </strong>
      </a>
    </div>
  );
}

function ChartSelector() {
  const { year: currentYear, monthIndex } = getIndiaDateParts();
  const years = Array.from({ length: 12 }, (_, index) => currentYear - index);

  return (
    <div id="chart-form">
      <h2 id="chart-text">Select a month and year to view the combined chart for Gali, Desawar, Ghaziabad, and Faridabad.</h2>
      <form action="/chart" method="get">
        <select id="month" name="month" aria-label="Month" defaultValue={monthNames[monthIndex]}>
          {monthNames.map((month) => (
            <option value={month} key={month}>
              {month}
            </option>
          ))}
        </select>
        <select id="year" name="year" aria-label="Year">
          {years.map((year) => (
            <option value={year} key={year}>
              {year}
            </option>
          ))}
        </select>
        <input id="direct-chart" type="submit" value="Go" />
      </form>
    </div>
  );
}

function SeoContent({ seo, today }: { seo: HomepageSeo; today: Date }) {
  const fill = (value: string) => fillSeoPlaceholders(value, today);
  const faqs = seo.faqs.map((faq) => ({ question: fill(faq.question), answer: fill(faq.answer) }));

  return (
    <section className="content">
      <h2 className="content-title">{fill(seo.contentHeading)}</h2>
      {seo.contentLead && <p className="content-lead"><strong>{fill(seo.contentLead)}</strong></p>}
      <div dangerouslySetInnerHTML={{ __html: fill(seo.contentHtml) }} />

      {faqs.length > 0 && (
        <>
          <h2>Everything You Need to Know About Daily Result Updates</h2>
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </>
      )}

      <h2>Disclaimer</h2>
      <p><strong>Important:</strong> {fill(seo.disclaimer)}</p>
      <SeoSchema description={fill(seo.metaDescription)} faqs={faqs} />
    </section>
  );
}

function SeoSchema({ description, faqs }: { description: string; faqs: { question: string; answer: string }[] }) {
  const base = `${siteUrl}/`;
  const graph: Record<string, unknown>[] = [
    { "@type": "WebSite", "@id": `${base}#website`, url: base, name: siteName, description }
  ];
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${base}#faq`,
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } }))
    });
  }
  const schema = { "@context": "https://schema.org", "@graph": graph };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />;
}

function FloatingActions({ whatsapp }: { whatsapp: string }) {
  return (
    <>
      <a href={getWhatsAppHref(whatsapp)} className="floating" target="_blank" rel="noreferrer">
        <Image src="/img/whatsappicon.png" width={60} height={60} alt="WhatsApp" />
      </a>
    
    </>
  );
}
