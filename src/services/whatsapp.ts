import twilio from "twilio";
import { env } from "../config/env";

const client = twilio(env.twilioAccountSid, env.twilioAuthToken);

export async function sendWhatsAppMessage(body: string, to: string = env.myPhoneNumber): Promise<void> {
  await client.messages.create({
    from: env.twilioWhatsappFrom,
    to: `whatsapp:${to.replace(/^whatsapp:/, "")}`,
    body,
  });
}
