import cron from "node-cron";
import { env } from "../config/env";
import { listEventsForDay } from "./googleCalendar";
import { sendWhatsAppMessage } from "./whatsapp";
import { dailyDigest } from "../persona/jarvis";

export function startDailyDigestScheduler(): void {
  cron.schedule(
    env.dailyDigestCron,
    async () => {
      try {
        const events = await listEventsForDay(new Date());
        await sendWhatsAppMessage(dailyDigest(events, env.timezone));
        console.log(`Daily digest sent (${events.length} events).`);
      } catch (err) {
        console.error("Failed to send daily digest:", err);
      }
    },
    { timezone: env.timezone },
  );

  console.log(`Daily digest scheduled: "${env.dailyDigestCron}" (${env.timezone})`);
}
