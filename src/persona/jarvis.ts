import { AgendaEvent } from "../services/googleCalendar";

function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}

function formatEventLine(event: AgendaEvent, timezone: string): string {
  const time = event.allDay ? "de hele dag" : formatTime(event.start, timezone);
  const location = event.location ? ` (${event.location})` : "";
  return `- ${time}: ${event.title}${location}`;
}

export function dailyDigest(events: AgendaEvent[], timezone: string): string {
  const greeting = pick([
    "Goedemorgen. Systemen draaien naar behoren, net als uw agenda.",
    "Goedemorgen. Ik heb de nacht doorgebracht met het bewaken van uw kalender.",
    "Goedemorgen. Klaar om de dag te plannen, zoals altijd.",
  ]);

  if (events.length === 0) {
    const empty = pick([
      "Vandaag staat er niets gepland. Een zeldzaam moment van rust.",
      "Uw agenda is vandaag helemaal leeg. Geniet ervan, het duurt vast niet lang.",
      "Niets op de planning vandaag. Ik zou het vieren, als ik dat kon.",
    ]);
    return `${greeting}\n\n${empty}`;
  }

  const lines = events.map((e) => formatEventLine(e, timezone)).join("\n");
  const count = events.length === 1 ? "1 afspraak" : `${events.length} afspraken`;
  return `${greeting}\n\nVandaag heeft u ${count}:\n${lines}`;
}

export function eventAddedConfirmation(event: AgendaEvent, timezone: string): string {
  const line = formatEventLine(event, timezone);
  const reply = pick([
    `Toegevoegd aan uw agenda, zoals gevraagd.\n${line}`,
    `Genoteerd. Ik heb het aan uw kalender toegevoegd.\n${line}`,
    `Gedaan. Uw agenda is bijgewerkt.\n${line}`,
  ]);
  return reply;
}

export function helpMessage(): string {
  return [
    "Tot uw dienst. Dit kan ik voor u doen:",
    "",
    '• "agenda" of "wat staat er vandaag" → stuurt uw afspraken voor vandaag',
    '• "voeg toe: <titel> op <datum> om <tijd>" → voegt een afspraak toe',
    "  bijv. \"voeg toe: tandarts op morgen om 14:00\"",
    "  bijv. \"voeg toe: teamoverleg op 05-09 om 09:30\"",
    '• "help" → dit bericht',
  ].join("\n");
}

export function couldNotUnderstand(): string {
  return pick([
    "Dat heb ik niet helemaal kunnen plaatsen. Stuur \"help\" voor de mogelijkheden.",
    "Excuses, dat ontging me. Typ \"help\" en ik leg uit wat ik kan.",
    "Onbekend commando. \"help\" toont u wat ik begrijp.",
  ]);
}

export function errorMessage(): string {
  return "Er ging iets mis aan mijn kant. Probeer het straks nog eens.";
}
