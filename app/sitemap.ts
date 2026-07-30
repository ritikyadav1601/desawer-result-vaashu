import type { MetadataRoute } from "next";
import { fallbackGames } from "@/lib/data";
import { getIndiaDateParts, monthNames } from "@/lib/date";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const { year: currentYear, monthIndex: currentMonth } = getIndiaDateParts(now);
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    ...fallbackGames.map((game) => ({
      url: absoluteUrl(`/${game.chartSlug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: game.id === "desawer" ? 0.9 : 0.8
    }))
  ];

  for (let year = 2015; year <= currentYear; year += 1) {
    const lastMonth = year === currentYear ? currentMonth : 11;
    for (let monthIndex = 0; monthIndex <= lastMonth; monthIndex += 1) {
      entries.push({
        url: absoluteUrl(`/${monthNames[monthIndex]}-${year}`),
        lastModified:
          year === currentYear && monthIndex === currentMonth
            ? now
            : new Date(Date.UTC(year, monthIndex + 1, 0)),
        changeFrequency: year === currentYear && monthIndex === currentMonth ? "daily" : "yearly",
        priority: year === currentYear && monthIndex === currentMonth ? 0.8 : 0.5
      });
    }
  }

  return entries;
}
