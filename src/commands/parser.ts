export type ParsedCommand =
  | { type: "agenda" }
  | { type: "help" }
  | { type: "add"; title: string; start: Date; durationMinutes?: number }
  | { type: "unknown" };

const AGENDA_TRIGGERS = ["agenda", "wat staat er vandaag", "vandaag", "afspraken"];
const HELP_TRIGGERS = ["help", "hulp", "wat kun je"];
const ADD_PATTERN =
  /^(?:voeg toe|nieuwe afspraak|toevoegen)\s*:?\s*(.+?)\s+op\s+(.+?)\s+om\s+(\d{1,2}[:.]\d{2})\s*$/i;

/**
 * Parses a Dutch date expression ("vandaag", "morgen", "5-9", "05-09-2026", "5/9")
 * relative to `now`. Returns null if it can't be parsed.
 */
function parseDutchDate(text: string, now: Date): Date | null {
  const normalized = text.trim().toLowerCase();

  if (normalized === "vandaag") {
    return new Date(now);
  }
  if (normalized === "morgen") {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }

  const match = normalized.match(/^(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]) - 1;
  let year = now.getFullYear();
  if (match[3]) {
    year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
  }

  const date = new Date(year, month, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  // If the date without an explicit year has already passed, assume next year.
  if (!match[3] && date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    date.setFullYear(year + 1);
  }

  return date;
}

function parseTime(text: string): { hours: number; minutes: number } | null {
  const match = text.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function parseCommand(rawBody: string, now: Date = new Date()): ParsedCommand {
  const body = rawBody.trim();
  const lower = body.toLowerCase();

  if (HELP_TRIGGERS.some((t) => lower === t)) {
    return { type: "help" };
  }

  if (AGENDA_TRIGGERS.some((t) => lower === t || lower.includes(t))) {
    return { type: "agenda" };
  }

  const addMatch = body.match(ADD_PATTERN);
  if (addMatch) {
    const [, title, dateText, timeText] = addMatch;
    const date = parseDutchDate(dateText, now);
    const time = parseTime(timeText.replace(".", ":"));
    if (date && time) {
      const start = new Date(date);
      start.setHours(time.hours, time.minutes, 0, 0);
      return { type: "add", title: title.trim(), start };
    }
  }

  return { type: "unknown" };
}
