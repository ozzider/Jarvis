/**
 * One-time helper to obtain a Google OAuth refresh token for a personal
 * Google Calendar. Run with `npm run token`, follow the printed URL,
 * authorize, then paste the redirected "code" value back into the prompt.
 */
import "dotenv/config";
import * as readline from "node:readline/promises";
import { google } from "googleapis";

const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env first.");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("Open this URL, sign in, and authorize access:\n");
  console.log(authUrl);
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = (await rl.question("Paste the authorization code here: ")).trim();
  rl.close();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    console.error(
      "No refresh token was returned. Revoke prior access at https://myaccount.google.com/permissions and try again.",
    );
    process.exit(1);
  }

  console.log("\nAdd this to your .env file:\n");
  console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
