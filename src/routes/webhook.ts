import { Router } from "express";
import { twiml as Twiml } from "twilio";
import { env } from "../config/env";
import { parseCommand } from "../commands/parser";
import { listEventsForDay, createEvent } from "../services/googleCalendar";
import {
  dailyDigest,
  eventAddedConfirmation,
  helpMessage,
  couldNotUnderstand,
  errorMessage,
} from "../persona/jarvis";

export const webhookRouter = Router();

webhookRouter.post("/webhook/whatsapp", async (req, res) => {
  const body: string = req.body?.Body ?? "";
  const response = new Twiml.MessagingResponse();

  try {
    const command = parseCommand(body);

    switch (command.type) {
      case "help": {
        response.message(helpMessage());
        break;
      }
      case "agenda": {
        const events = await listEventsForDay(new Date());
        response.message(dailyDigest(events, env.timezone));
        break;
      }
      case "add": {
        const end = new Date(command.start);
        end.setMinutes(end.getMinutes() + (command.durationMinutes ?? env.defaultEventDurationMinutes));
        const created = await createEvent({ title: command.title, start: command.start, end });
        response.message(eventAddedConfirmation({ ...created, allDay: false }, env.timezone));
        break;
      }
      default: {
        response.message(couldNotUnderstand());
      }
    }
  } catch (err) {
    console.error("Error handling incoming WhatsApp message:", err);
    response.message(errorMessage());
  }

  res.type("text/xml").send(response.toString());
});
