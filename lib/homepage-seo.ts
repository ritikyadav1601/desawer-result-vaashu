import { getKhaiwalDb } from "./khaiwal-mongodb";
import { SITE_ID } from "./site-settings";
import { siteName, siteUrl } from "./seo";
import { formatFullDate, formatSeoDate, getIndiaDateParts, monthNames } from "./date";

/**
 * Homepage SEO content stored in MongoDB (collection: "homepage_seo").
 * Every document is tied to ONE website by its `domain` (e.g. "desawerresult.com"),
 * so other sites sharing the same database never read or overwrite this content.
 *
 * Text fields support placeholders that are replaced on every request:
 * {date} {fullDate} {month} {year} {siteName} {siteUrl} {domain}
 */
export type HomepageFaq = { question: string; answer: string };

export type HomepageSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  topNotice: string;
  pageHeading: string;
  contentHeading: string;
  contentLead: string;
  contentHtml: string;
  faqs: HomepageFaq[];
  disclaimer: string;
};

export type HomepageSeoDocument = HomepageSeo & {
  domain: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  updatedAt?: Date;
};

const COLLECTION = "homepage_seo";
export const SITE_DOMAIN = new URL(siteUrl).hostname.replace(/^www\./, "");
export const SEO_PLACEHOLDERS = ["{date}", "{fullDate}", "{month}", "{year}", "{siteName}", "{siteUrl}", "{domain}"];

export const defaultHomepageSeo: HomepageSeo = {
  metaTitle: "Desawer Satta Result {date} | Live Satta King Chart",
  metaDescription:
    "Today {date} Live Desawer Satta Result & Satta King chart updates. Get fast results for Desawer, Gali, Faridabad & Ghaziabad.",
  keywords: "Desawer Result, Desawer Satta Result, Satta King, Gali Result, Faridabad Result, Ghaziabad Result, Desawer Chart {year}",
  topNotice:
    "Daily Superfast Desawer Satta Result of {month} {year} And Leak Numbers for Gali, Desawar, Ghaziabad and Faridabad With Complete Old Satta King Chart of 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2023, 2024, 2025 From Satta King Fast, Satta King Ghaziabad, Satta King Desawar, Satta King Gali, Satta King Faridabad.",
  pageHeading: "Satta Desawer Live Result Of {fullDate}",
  contentHeading: "Desawer Satta Result {date} | Live Chart",
  contentLead: "Superfast Live Desawer Satta Result & Daily Satta King Updates",
  contentHtml: `<p>Welcome to {siteName} ({domain}), India's primary portal for real-time Desawer Satta Result updates, daily record charts, and instant number declarations. Experience zero-delay live updates for Desawer, Satta King, Gali, Faridabad, Ghaziabad, Shri Ganesh, and Delhi Bazaar on an ultra-fast, mobile-friendly platform built for seamless daily tracking.</p>
<ul>
<li><strong>Desawer Result Declaration:</strong> Live daily at 05:00 AM IST</li>
<li><strong>Zero Delay Live Updates:</strong> Direct result refresh</li>
<li><strong>Coverage:</strong> Desawer, Gali, Faridabad, Ghaziabad, Delhi Bazaar &amp; Shri Ganesh</li>
</ul>
<p class="content-actions"><a href="#live-results">Check Today's Desawer Live Result</a> <a href="/DESAWER-satta-result-chart">View Desawer Chart {year}</a></p>

<h2>Your Premier Source for Live Desawer Results &amp; Historical Charts</h2>
<p>At {domain}, we specialize in providing dedicated, ultra-fast tracking for the Desawer Satta Result alongside every major market in the national Satta King network. Built with a responsive, user-first approach, our portal helps users across India receive result declarations without connectivity disruptions or lag.</p>
<p>We maintain organized record charts for Desawer Satta King, Gali, Faridabad, and Ghaziabad. Whether you are searching for early morning Desawer updates, reviewing past monthly trends, or analyzing jodi variations, {domain} offers an accessible tracking environment designed for fast mobile access.</p>

<h2>Comprehensive Desawer Tracking &amp; Multi-Market Results</h2>
<h3>Real-Time Live Result Dashboard</h3>
<p>Our scoreboard refreshes at scheduled game times to bring you number declarations without delay:</p>
<ul>
<li>Desawer Satta Result: 05:00 AM IST</li><li>Delhi Bazaar Result: 03:00 PM IST</li>
<li>Shri Ganesh Result: 04:30 PM IST</li><li>Faridabad Satta Result: 06:00 PM IST</li>
<li>Ghaziabad Satta Result: 09:25 PM IST</li><li>Gali Satta Result: 11:25 PM IST</li>
</ul>
<h3>Interactive Desawer Record Charts ({year})</h3>
<p>Access complete monthly and yearly historical data tables formatted for rapid readability. Track historical number patterns, cross-reference monthly outcomes, and review archival records across all featured markets.</p>
<h3>Daily Single Jodi &amp; Harup Insights</h3>
<p>Explore daily statistical combinations, single jodi tracking tables, and Harup number analysis to examine historical trends across top game variations.</p>

<h2>Why Users Prefer {domain} for Live Updates</h2>
<ul>
<li><strong>Dedicated Desawer Speed:</strong> Low-latency delivery for early morning results.</li>
<li><strong>Organized Historical Data:</strong> Easy-to-read result archives and record tables.</li>
<li><strong>Mobile-First Interface:</strong> Fast loading without heavy code or intrusive pop-ups.</li>
<li><strong>Unified Market Tracking:</strong> Desawer, Gali, Faridabad, Ghaziabad, and Delhi Bazaar in one dashboard.</li>
<li><strong>Free Public Access:</strong> Live numbers and historical charts with no registration.</li>
</ul>

<h2>How to Check Your Desawer Satta Result in 3 Easy Steps</h2>
<ol>
<li><strong>Visit the portal:</strong> Open {domain} on your phone or computer.</li>
<li><strong>Select your game table:</strong> Use the Live Result Dashboard or open the <a href="/DESAWER-satta-result-chart">Desawer Chart</a>.</li>
<li><strong>View real-time updates:</strong> Keep the page open around declaration time to see refreshed results.</li>
</ol>

<h2>Get Instant Live Desawer Results Every Morning</h2>
<p>Bookmark {domain} to check superfast Desawer Satta Results, daily Satta King updates, and full {year} charts directly on your phone.</p>`,
  faqs: [
    { question: "What time is the Desawer Satta Result declared?", answer: "The Desawer Satta Result is declared daily in the early morning at 05:00 AM IST." },
    { question: "How do I check previous monthly Desawer charts?", answer: "Open the Desawer Chart {year} section to access date-wise record archives." },
    { question: "Is {domain} free to use?", answer: "Yes. Live result scoreboards, historical monthly tables, and daily market updates are available without registration." },
    { question: "Which other games are tracked?", answer: "In addition to Desawer, the website tracks Gali, Faridabad, Ghaziabad, Shri Ganesh, and Delhi Bazaar." }
  ],
  disclaimer:
    "{domain} is an informational platform only. We do not organize, operate, promote, or facilitate betting, gambling, or wagering activities. The information is provided solely for informational purposes. Users are responsible for complying with applicable laws."
};

const text = (value: unknown, fallback: string) => {
  const result = typeof value === "string" ? value.trim() : "";
  return result || fallback;
};

/** Removes script/style/iframe tags and inline event handlers from admin HTML. */
export function sanitizeSeoHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

function cleanFaqs(value: unknown): HomepageFaq[] {
  if (!Array.isArray(value)) return defaultHomepageSeo.faqs;
  return value
    .map((item) => ({ question: String(item?.question || "").trim(), answer: String(item?.answer || "").trim() }))
    .filter((item) => item.question && item.answer)
    .slice(0, 30);
}

export function cleanHomepageSeo(data?: Partial<HomepageSeo>): HomepageSeo {
  const d = defaultHomepageSeo;
  return {
    metaTitle: text(data?.metaTitle, d.metaTitle).slice(0, 200),
    metaDescription: text(data?.metaDescription, d.metaDescription).slice(0, 400),
    keywords: text(data?.keywords, d.keywords),
    topNotice: text(data?.topNotice, d.topNotice),
    pageHeading: text(data?.pageHeading, d.pageHeading),
    contentHeading: text(data?.contentHeading, d.contentHeading),
    contentLead: text(data?.contentLead, d.contentLead),
    contentHtml: sanitizeSeoHtml(text(data?.contentHtml, d.contentHtml)),
    faqs: data?.faqs === undefined ? d.faqs : cleanFaqs(data.faqs),
    disclaimer: text(data?.disclaimer, d.disclaimer)
  };
}

/** Parses the admin FAQ textarea: blocks separated by a blank line, first line = question, rest = answer. */
export function parseFaqText(value: string): HomepageFaq[] {
  return value
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.trim().split("\n"))
    .map(([question = "", ...answer]) => ({
      question: question.replace(/^Q[:.]\s*/i, "").trim(),
      answer: answer.join(" ").replace(/^A[:.]\s*/i, "").trim()
    }))
    .filter((item) => item.question && item.answer);
}

export function faqsToText(faqs: HomepageFaq[]) {
  return faqs.map((faq) => `${faq.question}\n${faq.answer}`).join("\n\n");
}

/** Replaces {date}, {year}, ... with live values for this website. */
export function fillSeoPlaceholders(value: string, now = new Date()) {
  const { year, monthIndex } = getIndiaDateParts(now);
  const values: Record<string, string> = {
    "{date}": formatSeoDate(now),
    "{fullDate}": formatFullDate(now),
    "{month}": monthNames[monthIndex],
    "{year}": String(year),
    "{siteName}": siteName,
    "{siteUrl}": siteUrl,
    "{domain}": SITE_DOMAIN
  };
  return value.replace(/\{(date|fullDate|month|year|siteName|siteUrl|domain)\}/g, (match) => values[match] ?? match);
}

export async function getHomepageSeo(): Promise<HomepageSeo & { updatedAt?: Date; fromDatabase: boolean }> {
  try {
    const document = await (await getKhaiwalDb())
      .collection<HomepageSeoDocument>(COLLECTION)
      .findOne({ domain: SITE_DOMAIN });
    return { ...cleanHomepageSeo(document || undefined), updatedAt: document?.updatedAt, fromDatabase: Boolean(document) };
  } catch {
    return { ...defaultHomepageSeo, fromDatabase: false };
  }
}

export async function saveHomepageSeo(seo: HomepageSeo) {
  const collection = (await getKhaiwalDb()).collection<HomepageSeoDocument>(COLLECTION);
  await collection.createIndex({ domain: 1 }, { unique: true });
  await collection.updateOne(
    { domain: SITE_DOMAIN },
    {
      $set: {
        ...cleanHomepageSeo(seo),
        domain: SITE_DOMAIN,
        siteId: SITE_ID,
        siteName,
        siteUrl,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
}

export async function resetHomepageSeo() {
  await saveHomepageSeo(defaultHomepageSeo);
}
