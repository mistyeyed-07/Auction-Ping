const form = document.getElementById("cardForm");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

let cards = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const rarity = document.getElementById("rarity").value;
  const name = document.getElementById("name").value.trim();
  const version = document.getElementById("version").value.trim();
  const link = document.getElementById("link").value.trim();
  const event = document.getElementById("event").value;

  if (!rarity || !name || !version || !link) return;

  cards.push({ rarity, name, version, link, event });
  form.reset();
  generateOutput();
});

copyBtn.addEventListener("click", () => {
  output.select();
  document.execCommand("copy");
  alert("Copied to clipboard!");
});

clearBtn.addEventListener("click", () => {
  cards = [];
  output.value = "";
});

function getEventEmote(event) {
  switch (event) {
    case "Halloween": return " **(:jack_o_lantern:)**";
    case "Christmas": return " **(:christmas_tree:)**";
    default: return "";
  }
}

function generateOutput() {
  const grouped = {
    UR: [],
    SSR: [],
    SR: [],
    Rare: [],
    Common: [],
  };

  cards.forEach(card => {
    const emote = getEventEmote(card.event);
    const entry = `[${card.rarity} ${card.name} ${card.version}](${card.link})${emote}`;
    grouped[card.rarity]?.push(entry);
  });

  let result = `#0\n\n`;
  for (const rarity of ["UR", "SSR", "SR", "Rare", "Common"]) {
    if (grouped[rarity].length) {
      result += `__**${rarity}:**__\n${grouped[rarity].join("\n")}\n\n`;
    }
  }

  output.value = result.trim();
}
