import { google } from "googleapis";
import { env } from "../config/env";

const oauth2Client = new google.auth.OAuth2(env.googleClientId, env.googleClientSecret);
oauth2Client.setCredentials({ refresh_token: env.googleRefreshToken });

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export interface AgendaEvent {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function listEventsForDay(day: Date): Promise<AgendaEvent[]> {
  const res = await calendar.events.list({
    calendarId: env.googleCalendarId,
    timeMin: startOfDay(day).toISOString(),
    timeMax: endOfDay(day).toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    timeZone: env.timezone,
  });

  const items = res.data.items ?? [];
  return items.map((item) => {
    const allDay = Boolean(item.start?.date && !item.start?.dateTime);
    const start = new Date(item.start?.dateTime ?? item.start?.date ?? day);
    const end = new Date(item.end?.dateTime ?? item.end?.date ?? day);
    return {
      title: item.summary ?? "(zonder titel)",
      start,
      end,
      allDay,
      location: item.location ?? undefined,
    };
  });
}

export async function createEvent(params: {
  title: string;
  start: Date;
  end: Date;
}): Promise<AgendaEvent> {
  const res = await calendar.events.insert({
    calendarId: env.googleCalendarId,
    requestBody: {
      summary: params.title,
      start: { dateTime: params.start.toISOString(), timeZone: env.timezone },
      end: { dateTime: params.end.toISOString(), timeZone: env.timezone },
    },
  });

  return {
    title: res.data.summary ?? params.title,
    start: new Date(res.data.start?.dateTime ?? params.start),
    end: new Date(res.data.end?.dateTime ?? params.end),
    allDay: false,
  };
}
