import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { chartShortNames, chartTitle, fallbackGames, getGameRecord, getMonthlyRows } from "@/lib/data";
import { getIndiaDateParts, monthNames } from "@/lib/date";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function parseMonthYear(slug: string) {
  const match = slug.match(/^([A-Za-z]+)-(\d{4})$/);
  if (!match) return null;

  const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === match[1].toLowerCase());
  if (monthIndex === -1) return null;

  return { monthIndex, year: Number(match[2]) };
}

function monthLink(monthIndex: number, year: number) {
  return `/${monthNames[monthIndex]}-${year}`;
}

function adjacentMonth(monthIndex: number, year: number, direction: -1 | 1) {
  const nextMonth = monthIndex + direction;

  if (nextMonth < 0) {
    return { monthIndex: 11, year: year - 1 };
  }

  if (nextMonth > 11) {
    return { monthIndex: 0, year: year + 1 };
  }

  return { monthIndex: nextMonth, year };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/${slug}`;
  const monthYear = parseMonthYear(slug);

  if (monthYear) {
    const label = `${monthNames[monthYear.monthIndex]} ${monthYear.year}`;
    const title = `${label} Satta Result Chart: Desawer, Gali, Faridabad & Ghaziabad`;
    const description = `View the ${label} Satta King result chart with date-wise records for Desawer, Gali, Faridabad, and Ghaziabad.`;
    const current = getIndiaDateParts();
    const isFuture =
      monthYear.year > current.year ||
      (monthYear.year === current.year && monthYear.monthIndex > current.monthIndex);

    return {
      title,
      description,
      alternates: { canonical },
      robots: isFuture ? { index: false, follow: true } : undefined,
      openGraph: { title, description, url: canonical, type: "article" },
      twitter: { title, description }
    };
  }

  const game = fallbackGames.find(
    (item) => item.chartSlug.toLowerCase() === slug.toLowerCase()
  );
  if (!game) {
    return { title: "Result Chart Not Found", robots: { index: false, follow: false } };
  }

  const title = `${game.name} Satta Result Record Chart`;
  const description = `Check the latest ${game.name} result and browse its date-wise Satta King record chart and previous results.`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { title, description }
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const monthYear = parseMonthYear(slug);

  if (monthYear) {
    const rows = await getMonthlyRows(monthYear.year, monthYear.monthIndex);
    const previousMonth = adjacentMonth(monthYear.monthIndex, monthYear.year, -1);
    const nextMonth = adjacentMonth(monthYear.monthIndex, monthYear.year, 1);
    const previousLabel = `${monthNames[previousMonth.monthIndex]} ${previousMonth.year}`;
    const nextLabel = `${monthNames[nextMonth.monthIndex]} ${nextMonth.year}`;

    return (
      <>
        <ChartSchema
          title={`${monthNames[monthYear.monthIndex]} ${monthYear.year} Satta Result Chart`}
          path={`/${slug}`}
        />
        <Link className="navbar-brand" href="/" title="Home Page">
          <div className="text-center">
            <Image src="/images/logo.png" width={879} height={87} alt="brand Logo" priority />
          </div>
        </Link>
        <main className="container standalone">
          <table className="table chart-table">
            <tbody>
              <tr className="chart-head">
                <td colSpan={chartShortNames.length + 1} className="month">
                  <h1 className="heading">{chartTitle(monthYear.monthIndex, monthYear.year)}</h1>
                </td>
              </tr>
              <tr className="date-name">
                <td className="date">DATE</td>
                {chartShortNames.map((name) => (
                  <th className="name" key={name}>{name}</th>
                ))}
              </tr>
              {rows.map((row) => (
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
          <div className="cmbtn month-nav">
            <Link href={monthLink(previousMonth.monthIndex, previousMonth.year)}>{previousLabel}</Link>
            <Link href={monthLink(nextMonth.monthIndex, nextMonth.year)}>{nextLabel}</Link>
          </div>
          <p className="back-link">
            <Link href="/">Back to live result</Link>
          </p>
        </main>
      </>
    );
  }

  if (!slug.endsWith("-satta-result-chart")) {
    notFound();
  }

  const record = await getGameRecord(slug);

  return (
    <>
      <ChartSchema title={`${record.game.name} Satta Result Record Chart`} path={`/${slug}`} />
      <Link className="navbar-brand" href="/" title="Home Page">
        <div className="text-center">
          <Image src="/images/logo.png" width={879} height={87} alt="brand Logo" priority />
        </div>
      </Link>
      <main className="container standalone">
        <table className="table chart-table">
          <tbody>
            <tr className="chart-head">
              <td colSpan={2} className="month">
                <h1 className="heading">{record.game.name} Satta Result Record Chart</h1>
              </td>
            </tr>
            <tr className="date-name">
              <td className="date">DATE</td>
              <th className="name">RESULT</th>
            </tr>
            {record.rows.map((row) => (
              <tr className="day-number" key={`${row.date}-${row.result}`}>
                <td className="day">{row.date}</td>
                <td className="number">{row.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="back-link">
          <Link href="/">Back to live result</Link>
        </p>
      </main>
    </>
  );
}

function ChartSchema({ title, path }: { title: string; path: string }) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://desawerresult.com").replace(/\/+$/, "");
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: title, item: `${baseUrl}${path}` }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
