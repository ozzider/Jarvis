import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  timezone: process.env.TIMEZONE ?? "Europe/Amsterdam",

  twilioAccountSid: required("TWILIO_ACCOUNT_SID"),
  twilioAuthToken: required("TWILIO_AUTH_TOKEN"),
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886",
  myPhoneNumber: required("MY_PHONE_NUMBER"),

  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  googleRefreshToken: required("GOOGLE_REFRESH_TOKEN"),
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "primary",

  dailyDigestCron: process.env.DAILY_DIGEST_CRON ?? "30 7 * * *",
  defaultEventDurationMinutes: Number(process.env.DEFAULT_EVENT_DURATION_MINUTES ?? 60),
};
