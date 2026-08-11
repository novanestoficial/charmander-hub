// Brasil não tem horário de verão desde 2019, então -03:00 é fixo o ano todo.
function brazilDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

export function startOfTodayBrazil(now = new Date()) {
  const { year, month, day } = brazilDateParts(now);
  return new Date(`${year}-${month}-${day}T00:00:00-03:00`);
}

export function startOfWeekBrazil(now = new Date()) {
  const todayStart = startOfTodayBrazil(now);
  const { weekday } = brazilDateParts(now);
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday];
  const daysSinceMonday = (weekdayIndex + 6) % 7;
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
  return weekStart;
}
