import express from "express";
import { env } from "./config/env";
import { webhookRouter } from "./routes/webhook";
import { startDailyDigestScheduler } from "./services/scheduler";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(webhookRouter);

app.listen(env.port, () => {
  console.log(`Jarvis is online, listening on port ${env.port}.`);
  startDailyDigestScheduler();
});
