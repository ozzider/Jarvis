# Jarvis 🇳🇱

A personal Dutch-speaking, Jarvis-style assistant that lives on WhatsApp. It:

- Sends you a daily WhatsApp message with today's agenda (from Google Calendar)
- Lets you reply on WhatsApp to ask for your agenda on demand, or add new appointments

## How it works

- **Node.js + TypeScript + Express** app
- **Google Calendar API** for reading/writing your appointments
- **Twilio WhatsApp API** for sending/receiving WhatsApp messages
- **node-cron** for the daily digest schedule
- Ships as a **Docker** container so it can run on any host (VPS, Fly.io, Render, a Raspberry Pi at home, etc.)

## 1. Set up Twilio WhatsApp

1. Create a free account at https://www.twilio.com/try-twilio.
2. In the console, go to **Messaging → Try it out → Send a WhatsApp message** to activate the sandbox.
3. Follow the instructions to join the sandbox from your own WhatsApp number (send the given `join <code>` message to the sandbox number).
4. Note your **Account SID** and **Auth Token** from the console dashboard.
5. (Later, for production) apply for your own WhatsApp Sender via Twilio to leave the sandbox.

## 2. Set up Google Calendar API access

1. Create a project at https://console.cloud.google.com and enable the **Google Calendar API**.
2. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**, application type **Desktop app**.
3. Note the generated **Client ID** and **Client Secret**.
4. If prompted, configure the OAuth consent screen (External, in "Testing" mode is fine — add your own Google account as a test user).

## 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `MY_PHONE_NUMBER` (E.164 format, e.g. `+316xxxxxxxx`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

Then generate your Google refresh token:

```bash
npm install
npm run token
```

Follow the printed URL, authorize, paste the code back in, and copy the resulting `GOOGLE_REFRESH_TOKEN` line into `.env`.

## 4. Run locally

```bash
npm run dev
```

The webhook endpoint is `POST /webhook/whatsapp`. To let Twilio reach it during local development, expose it with a tunnel, e.g.:

```bash
ngrok http 3000
```

Then in the Twilio console (Messaging → Sandbox settings, or your WhatsApp Sender settings), set **"When a message comes in"** to:

```
https://<your-ngrok-domain>/webhook/whatsapp
```

## 5. Try it

On WhatsApp, message your Twilio sandbox number:

- `agenda` — get today's appointments
- `help` — see what Jarvis understands
- `voeg toe: tandarts op morgen om 14:00` — add an appointment
- `voeg toe: teamoverleg op 05-09 om 09:30` — add an appointment on a specific date

Every day at the time set by `DAILY_DIGEST_CRON` (default `07:30`, Europe/Amsterdam), Jarvis proactively sends you the day's agenda.

## 6. Deploy

Build and run the container:

```bash
docker build -t jarvis .
docker run --env-file .env -p 3000:3000 jarvis
```

Deploy it anywhere that can run a long-lived container and receive inbound HTTPS (a small VPS, Fly.io, Render, Railway, etc.), then point the Twilio webhook at that public URL instead of ngrok.

## Notes

- The command parser is intentionally simple (pattern-based, in Dutch). Extend `src/commands/parser.ts` to support more phrasings.
- Jarvis's personality/voice lives in `src/persona/jarvis.ts` — tweak the phrasing there.
- This starts from the Twilio **sandbox**, which is rate-limited and requires re-joining periodically. For a permanent personal assistant, apply for your own Twilio WhatsApp Sender.
