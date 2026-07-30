export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function getIndiaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: value("year"), monthIndex: value("month") - 1, day: value("day") };
}

export function toDateKey(date: Date) {
  const { year, monthIndex, day } = getIndiaDateParts(date);
  const month = String(monthIndex + 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatFullDate(date: Date) {
  const { year, monthIndex, day } = getIndiaDateParts(date);
  return `${monthNames[monthIndex]} ${String(day).padStart(2, "0")} ${year}`;
}

export function formatBoardTitleDate(date: Date) {
  const { year, monthIndex, day } = getIndiaDateParts(date);
  return `${monthNames[monthIndex]} ${String(day).padStart(2, "0")}, ${year}`;
}

export function formatBoardDay(date: Date) {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Asia/Kolkata" }).format(date);
  const { day } = getIndiaDateParts(date);
  const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${weekday}. ${day}${suffix}`;
}

export function formatSeoDate(date: Date) {
  const { year, monthIndex, day } = getIndiaDateParts(date);
  return `${day} ${monthNames[monthIndex]} ${year}`;
}

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}
