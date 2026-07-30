export const siteName = "Desawer Result";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://desawerresult.com").replace(/\/+$/, "");
export const defaultDescription =
  "Check today's Desawer result, live Satta King market updates, and date-wise charts for Gali, Faridabad, Ghaziabad, Delhi Bazar, and Shri Ganesh.";

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
