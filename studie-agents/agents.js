// De lijst met agents in het kantoor.
// Wil je een agent toevoegen? Maak een nieuw bestand in de map "prompts"
// en voeg hieronder een regel toe.
export const agents = {
  onderzoeker: {
    naam: "Onderzoeker",
    rol: "Deskresearch met APA-bronnen",
    promptBestand: "prompts/onderzoeker.md",
  },
  schrijver: {
    naam: "Schrijver",
    rol: "Schrijfcoach voor je verslagen",
    promptBestand: "prompts/schrijver.md",
  },
  designer: {
    naam: "Designer",
    rol: "UI-prototypes in HTML/CSS",
    promptBestand: "prompts/designer.md",
  },
};
