import Link from "next/link";
import Image from "next/image";
import { chartShortNames, chartTitle, getHomeData } from "@/lib/data";
import { formatBoardDay, formatBoardTitleDate, formatFullDate, monthNames } from "@/lib/date";

export const revalidate = 60;

function getWhatsAppHref() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "918708328760";
  return `https://wa.me/${number}`;
}

export default async function Home() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const data = await getHomeData(today);
  const chartMonth = monthNames[data.selectedMonth];

  return (
    <>
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

        <div className="main-content">
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
                  <h3>LIVE</h3>
                </td>
              </tr>
              {data.boardRows.map((game) => (
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

        <div className="row">
          <div className="col-md-12">
            <div className="clsad">
              <h2>Direct Company सबसे भरोसेमंद खाईवाल </h2>
              <h3>Arun bhai khaiwal</h3>
              <p>
                (Last Time)
                <br />
                ⏰ दिल्ली बाजार ----------- 03:00 PM
                <br />
                ⏰ श्री गणेश --------------- 04:20PM
                <br />
                ⏰ फरीदाबाद -------------- 05:50 PM
                <br />
                ⏰ गाज़ियाबाद ------------- 08:50 PM
                <br />
                ⏰ गली ------------------ 11:20 PM
                <br />
                ⏰ दिसावर --------------- 02:00 AM
                <br />
                JODI Rate 10 के 960
                <br />
                HRUF rate 100 के 960
                <br />
                गेम लगाने के लिए whatsapp पर क्लिक करें
                <br />
              </p>
              <a href={getWhatsAppHref()}>
                <strong>
                  <Image src="/images/whatsapp-footer.png" width={160} height={56} alt="Whatsapp to Play Game" />
                </strong>
              </a>
            </div>
          </div>
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

      <div className="nav-link text-center" title="January-2026 Satta Result Chart With Record">
        <Link href="/">
          <h1 className="nav-text">Click here to view the latest chart for Gali, Desawar, Ghaziabad, and Faridabad for January-2026</h1>
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
      <SeoContent />
      <FloatingActions />
    </>
  );
}

function ChartSelector() {
  const years = Array.from({ length: 12 }, (_, index) => 2026 - index);

  return (
    <div id="chart-form">
      <h2 id="chart-text">Select a month and year to view the combined chart for Gali, Desawar, Ghaziabad, and Faridabad.</h2>
      <form action="/chart" method="get">
        <select id="month" name="month" aria-label="Month">
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

function SeoContent() {
  return (
    <section className="content">
      <h1>Desawer Result - Fast Satta Result &amp; Chart Updates</h1>
      <p>
        Welcome to Desawer Result, where visitors can check latest results and record charts in one place. The page keeps
        daily market updates and monthly history easy to scan on mobile and desktop.
      </p>
      <h2>Today Desawer Result and Other Market Updates</h2>
      <p>
        Results for Desawer, Gali, Faridabad, Ghaziabad and other markets appear in the live table as soon as they are
        available from the database.
      </p>
      <h2>Desawer Record Chart and Old Results</h2>
      <p>
        Record charts show previous daily numbers by month and year, helping users compare today&apos;s result with past
        entries.
      </p>
      <h2>Frequently Asked Questions</h2>
      <h3>What is Desawer Result?</h3>
      <p>Desawer Result is the announced number for the Desawer market.</p>
      <h3>Where can I check today&apos;s result?</h3>
      <p>The latest result is shown at the top of this page and refreshes from MongoDB.</p>
    </section>
  );
}

function FloatingActions() {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/mahakalgesser";

  return (
    <>
      <a href={getWhatsAppHref()} className="floating" target="_blank" rel="noreferrer">
        <Image src="/img/whatsappicon.png" width={60} height={60} alt="WhatsApp" />
      </a>
      <a href={telegramUrl} className="floatingtelegram" target="_blank" rel="noreferrer">
        <Image src="/img/telegramChannel.png" width={61} height={60} alt="Telegram" />
      </a>
    </>
  );
}
