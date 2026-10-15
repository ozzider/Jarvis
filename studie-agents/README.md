# Studie Agents

Een pixel-art kantoor met drie AI-collega's die je helpen met studeren:

- **Onderzoeker**: deskresearch met APA-bronnen
- **Schrijver**: schrijfcoach die feedback geeft op je verslagen
- **Designer**: maakt UI-prototypes in HTML/CSS

## Starten

1. Installeer [Node.js](https://nodejs.org) (versie 20 of hoger).
2. Open een terminal in deze map (`studie-agents`) en typ:
   ```bash
   npm install
   ```
3. Kopieer `.env.example` naar een nieuw bestand `.env` en zet je API-key erin:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   Een key maak je aan op https://platform.claude.com. Het `.env`-bestand komt niet op GitHub.
4. Start de app:
   ```bash
   npm run dev
   ```
5. Ga in je browser naar http://localhost:3000

## Hoe zit het in elkaar?

| Bestand / map | Wat doet het? |
|---|---|
| `prompts/` | De systeemprompt van elke agent: hier beschrijf je hoe een agent zich gedraagt. Pas ze gerust aan. |
| `agents.js` | De lijst met agents: naam, rol en welk promptbestand ze gebruiken. |
| `server.js` | De server: toont de website en stuurt je berichten door naar Claude. |
| `public/` | De website die je in de browser ziet (HTML, CSS, JavaScript). |
| `.env` | Je geheime API-key (alleen op jouw computer). |

Een prompt aanpassen? Wijzig het `.md`-bestand in `prompts/` en stuur een nieuw bericht. Je hoeft de server niet opnieuw te starten.
