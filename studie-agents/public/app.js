// De code die in de browser draait.

let huidigeAgent = null; // welke agent is nu open
const gesprekken = {}; // per agent de lijst met berichten

const knoppen = document.getElementById("agent-knoppen");
const chat = document.getElementById("chat");
const chatTitel = document.getElementById("chat-titel");
const berichtenVak = document.getElementById("berichten");
const formulier = document.getElementById("chat-formulier");
const invoer = document.getElementById("invoer");

// 1. Haal de agents op en maak voor elke agent een knop.
async function laadAgents() {
  const antwoord = await fetch("/api/agents");
  const agents = await antwoord.json();
  for (const agent of agents) {
    const knop = document.createElement("button");
    knop.textContent = `${agent.naam} – ${agent.rol}`;
    knop.addEventListener("click", () => openChat(agent));
    knoppen.appendChild(knop);
  }
}

// 2. Open de chat met een agent.
function openChat(agent) {
  huidigeAgent = agent;
  gesprekken[agent.id] ??= [];
  chatTitel.textContent = `Chat met de ${agent.naam}`;
  chat.hidden = false;
  toonBerichten();
  invoer.focus();
}

function toonBerichten() {
  berichtenVak.innerHTML = "";
  for (const bericht of gesprekken[huidigeAgent.id]) {
    voegBerichtToe(bericht.rol, bericht.tekst);
  }
}

function voegBerichtToe(rol, tekst) {
  const div = document.createElement("div");
  div.className = `bericht ${rol}`;
  div.textContent = tekst;
  berichtenVak.appendChild(div);
  return div;
}

// 3. Verstuur een bericht en wacht op het antwoord.
formulier.addEventListener("submit", async (event) => {
  event.preventDefault();
  const tekst = invoer.value.trim();
  if (!tekst) return;

  const agent = huidigeAgent;
  const gesprek = gesprekken[agent.id];
  gesprek.push({ rol: "user", tekst });
  voegBerichtToe("user", tekst);
  invoer.value = "";

  const wacht = voegBerichtToe("assistant", "Even denken...");
  formulier.querySelector("button").disabled = true;

  try {
    const antwoord = await fetch(`/api/chat/${agent.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ berichten: gesprek }),
    });
    const data = await antwoord.json();
    if (!antwoord.ok) throw new Error(data.fout);

    gesprek.push({ rol: "assistant", tekst: data.tekst });
    wacht.textContent = data.tekst;
  } catch (fout) {
    gesprek.pop(); // haal je vraag weg, zodat je hem opnieuw kunt sturen
    wacht.className = "bericht fout";
    wacht.textContent = fout.message || "Er ging iets mis.";
  } finally {
    formulier.querySelector("button").disabled = false;
  }
});

laadAgents();
