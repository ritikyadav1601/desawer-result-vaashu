import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { chartShortNames, chartTitle, getHomeData } from "@/lib/data";
import { formatBoardDay, formatBoardTitleDate, formatFullDate, formatSeoDate, getIndiaDateParts, monthNames } from "@/lib/date";
import { getKhaiwalSettings, type KhaiwalSettings } from "@/lib/site-settings";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateMetadata(): Metadata {
  const date = formatSeoDate(new Date());
  const title = `Desawer Satta Result ${date} | Live Satta King Chart`;
  const description = `Today ${date} Live Desawer Satta Result & Satta King chart updates. Get fast results for Desawer, Gali, Faridabad & Ghaziabad.`;

  return {
    title,
    description,
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
  const [data, khaiwal] = await Promise.all([getHomeData(today), getKhaiwalSettings()]);
  const chartMonth = monthNames[data.selectedMonth];
  const { year: currentYear } = getIndiaDateParts(today);

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
          <p>
            Daily Superfast Desawer Satta Result of {chartMonth} {data.selectedYear} And Leak Numbers for Gali, Desawar,
            Ghaziabad and Faridabad With Complete Old Satta King Chart of 2015, 2016, 2017, 2018, 2019, 2020, 2021,
            2023, 2024, 2025 From Satta King Fast, Satta King Ghaziabad, Satta King Desawar, Satta King Gali, Satta King
            Faridabad.
          </p>
        </div>

        <h1 className="text-center">Satta Desawer Live Result Of {formatFullDate(today)}</h1>
        <div className="text-center" style={{ margin: "8px 1% 2px 1%", color: "#339966" }}>
          Updated: <time dateTime={data.updatedAt.toISOString()}>{data.updatedAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</time> IST.
        </div>

        <div className="main-content" id="live-results">
          <table className="quick-result-board">
            <tbody>
              <tr className="board-title">
                <th colSpan={3}>
                  <h1 style={{ fontSize: "100%" }}>Satta King Fast Results of {formatBoardTitleDate(today)} &amp; {formatBoardTitleDate(yesterday)}</h1>
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
              {data.boardRows.slice(0, 12).map((game) => (
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
              {data.boardRows.slice(12).map((game) => (
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
          <h1 className="nav-text">Click here to view the latest chart for Gali, Desawar, Ghaziabad, and Faridabad for {chartMonth}-{data.selectedYear}</h1>
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
      <SeoContent today={today} currentYear={currentYear} />
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

function SeoContent({ today, currentYear }: { today: Date; currentYear: number }) {
  const date = formatSeoDate(today);
  const desawerChartHref = "/DESAWER-satta-result-chart";

  return (
    <section className="content">
      <h1>Desawer Satta Result {date} | Live Chart</h1>
      <p className="content-lead"><strong>Superfast Live Desawer Satta Result &amp; Daily Satta King Updates</strong></p>
      <p>Welcome to Desawerresult.com, India&apos;s primary portal for real-time Desawer Satta Result updates, daily record charts, and instant number declarations. Experience zero-delay live updates for Desawer, Satta King, Gali, Faridabad, Ghaziabad, Shri Ganesh, and Delhi Bazaar on an ultra-fast, mobile-friendly platform built for seamless daily tracking.</p>
      <ul>
        <li><strong>Desawer Result Declaration:</strong> Live daily at 05:00 AM IST</li>
        <li><strong>Zero Delay Live Updates:</strong> Direct result refresh</li>
        <li><strong>Coverage:</strong> Desawer, Gali, Faridabad, Ghaziabad, Delhi Bazaar &amp; Shri Ganesh</li>
      </ul>
      <p className="content-actions"><a href="#live-results">Check Today&apos;s Desawer Live Result</a> <Link href={desawerChartHref}>View Desawer Chart {currentYear}</Link></p>

      <h2>Your Premier Source for Live Desawer Results &amp; Historical Charts</h2>
      <p>At Desawerresult.com, we specialize in providing dedicated, ultra-fast tracking for the Desawer Satta Result alongside every major market in the national Satta King network. Built with a responsive, user-first approach, our portal helps users across India receive result declarations without connectivity disruptions or lag.</p>
      <p>We maintain organized record charts for Desawer Satta King, Gali, Faridabad, and Ghaziabad. Whether you are searching for early morning Desawer updates, reviewing past monthly trends, or analyzing jodi variations, Desawerresult.com offers an accessible tracking environment designed for fast mobile access.</p>

      <h2>Comprehensive Desawer Tracking &amp; Multi-Market Results</h2>
      <h3>Real-Time Live Result Dashboard</h3>
      <p>Our scoreboard refreshes at scheduled game times to bring you number declarations without delay:</p>
      <ul>
        <li>Desawer Satta Result: 05:00 AM IST</li><li>Delhi Bazaar Result: 03:00 PM IST</li>
        <li>Shri Ganesh Result: 04:30 PM IST</li><li>Faridabad Satta Result: 06:00 PM IST</li>
        <li>Ghaziabad Satta Result: 09:25 PM IST</li><li>Gali Satta Result: 11:25 PM IST</li>
      </ul>
      <h3>Interactive Desawer Record Charts ({currentYear})</h3>
      <p>Access complete monthly and yearly historical data tables formatted for rapid readability. Track historical number patterns, cross-reference monthly outcomes, and review archival records across all featured markets.</p>
      <h3>Daily Single Jodi &amp; Harup Insights</h3>
      <p>Explore daily statistical combinations, single jodi tracking tables, and Harup number analysis to examine historical trends across top game variations.</p>

      <h2>Why Users Prefer Desawerresult.com for Live Updates</h2>
      <ul>
        <li><strong>Dedicated Desawer Speed:</strong> Low-latency delivery for early morning results.</li>
        <li><strong>Organized Historical Data:</strong> Easy-to-read result archives and record tables.</li>
        <li><strong>Mobile-First Interface:</strong> Fast loading without heavy code or intrusive pop-ups.</li>
        <li><strong>Unified Market Tracking:</strong> Desawer, Gali, Faridabad, Ghaziabad, and Delhi Bazaar in one dashboard.</li>
        <li><strong>Free Public Access:</strong> Live numbers and historical charts with no registration.</li>
      </ul>

      <h2>How to Check Your Desawer Satta Result in 3 Easy Steps</h2>
      <ol>
        <li><strong>Visit the portal:</strong> Open Desawerresult.com on your phone or computer.</li>
        <li><strong>Select your game table:</strong> Use the Live Result Dashboard or open the <Link href={desawerChartHref}>Desawer Chart</Link>.</li>
        <li><strong>View real-time updates:</strong> Keep the page open around declaration time to see refreshed results.</li>
      </ol>

      <h2>Everything You Need to Know About Daily Result Updates</h2>
      <h3>What time is the Desawer Satta Result declared?</h3>
      <p>The Desawer Satta Result is declared daily in the early morning at 05:00 AM IST.</p>
      <h3>How do I check previous monthly Desawer charts?</h3>
      <p>Open the <Link href={desawerChartHref}>Desawer Chart {currentYear}</Link> to access date-wise record archives.</p>
      <h3>Is Desawerresult.com free to use?</h3>
      <p>Yes. Live result scoreboards, historical monthly tables, and daily market updates are available without registration.</p>
      <h3>Which other games are tracked?</h3>
      <p>In addition to Desawer, the website tracks Gali, Faridabad, Ghaziabad, Shri Ganesh, and Delhi Bazaar.</p>

      <h2>Get Instant Live Desawer Results Every Morning</h2>
      <p>Bookmark Desawerresult.com to check superfast Desawer Satta Results, daily Satta King updates, and full {currentYear} charts directly on your phone.</p>

      <h2>Disclaimer</h2>

      <p>
        <strong>Important:</strong> DesawerResult.com is an informational
        platform only. We do not organize, operate, promote, or facilitate
        betting, gambling, or wagering activities. The information is provided
        solely for informational purposes. Users are responsible for complying
        with applicable laws.
      </p>
      <SeoSchema currentYear={currentYear} />
    </section>
  );
}

function SeoSchema({ currentYear }: { currentYear: number }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": "https://desawerresult.com/#website", url: "https://desawerresult.com/", name: "Desawer Result", description: `Superfast Live Desawer Satta Result & Satta King Record Charts ${currentYear}` },
      { "@type": "FAQPage", "@id": "https://desawerresult.com/#faq", mainEntity: [
        { "@type": "Question", name: "What time is the Desawer Satta Result declared?", acceptedAnswer: { "@type": "Answer", text: "The Desawer Satta Result is declared daily in the early morning at 05:00 AM IST." } },
        { "@type": "Question", name: "How do I check previous monthly Desawer charts?", acceptedAnswer: { "@type": "Answer", text: "Open the Desawer Chart section to access date-wise record archives." } }
      ] }
    ]
  };
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
