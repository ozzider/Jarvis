// De webserver van Studie Agents.
// Hij doet twee dingen:
//   1. De website tonen (alles in de map "public").
//   2. Chatberichten doorsturen naar Claude, met de systeemprompt van de gekozen agent.
// Je API-key blijft hier op de server; de browser krijgt hem nooit te zien.

import "dotenv/config";
import fs from "node:fs/promises";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { agents } from "./agents.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Geen ANTHROPIC_API_KEY gevonden. Kopieer .env.example naar .env en vul je sleutel in.",
  );
  process.exit(1);
}

const client = new Anthropic(); // leest ANTHROPIC_API_KEY uit .env
const model = process.env.CLAUDE_MODEL || "claude-opus-5-5";
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

// De browser vraagt hier welke agents er zijn.
app.get("/api/agents", (req, res) => {
  const lijst = Object.entries(agents).map(([id, agent]) => ({
    id,
    naam: agent.naam,
    rol: agent.rol,
  }));
  res.json(lijst);
});

// De browser stuurt hier het hele gesprek naartoe en krijgt het antwoord terug.
app.post("/api/chat/:agentId", async (req, res) => {
  const agent = agents[req.params.agentId];
  if (!agent) {
    return res.status(404).json({ fout: "Deze agent bestaat niet." });
  }

  const berichten = req.body.berichten;
  if (!Array.isArray(berichten) || berichten.length === 0) {
    return res.status(400).json({ fout: "Er zijn geen berichten meegestuurd." });
  }

  try {
    // Het promptbestand wordt bij elk bericht opnieuw gelezen,
    // dus als je een prompt aanpast hoef je de server niet te herstarten.
    const systeemprompt = await fs.readFile(agent.promptBestand, "utf8");

    const antwoord = await client.beta.messages.create({
      model,
      max_tokens: 16000,
      system: systeemprompt,
      messages: berichten.map((b) => ({ role: b.rol, content: b.tekst })),
      // Als Claude een vraag weigert, probeert de API het automatisch met een ander model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (antwoord.stop_reason === "refusal") {
      return res.json({ tekst: "Sorry, op deze vraag kan ik geen antwoord geven." });
    }

    const tekst = antwoord.content
      .filter((blok) => blok.type === "text")
      .map((blok) => blok.text)
      .join("\n");

    res.json({ tekst });
  } catch (fout) {
    console.error(fout);
    let melding = "Er ging iets mis bij het praten met Claude.";
    if (fout instanceof Anthropic.AuthenticationError) {
      melding = "Je API-key klopt niet. Controleer het .env-bestand.";
    } else if (fout instanceof Anthropic.RateLimitError) {
      melding = "Te veel verzoeken tegelijk. Wacht even en probeer het opnieuw.";
    } else if (fout instanceof Anthropic.APIError) {
      melding = `Claude gaf een fout (${fout.status}): ${fout.message}`;
    }
    res.status(500).json({ fout: melding });
  }
});

app.listen(port, () => {
  console.log(`Studie Agents draait op http://localhost:${port}`);
});
