const form = document.getElementById("cardForm");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

let cards = [];

// Mapping Discord-style emote names to emojis
const emojiMap = {
  jack_o_lantern: "🎃",
  christmas_tree: "🎄",
  maidbow: "🎀",
  // Add more mappings as needed
};

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

  // Animate button
  copyBtn.classList.add("animate-pulse");
  setTimeout(() => copyBtn.classList.remove("animate-pulse"), 500);
});

clearBtn.addEventListener("click", () => {
  cards = [];
  output.value = "";
});

function getEventEmote(event) {
  switch (event) {
    case "Halloween🎃": return " **(:jack_o_lantern:)**";
    case "Christmas🎄": return " **(:christmas_tree:)**";
    case "Maid🎀"     : return " **(:maidbow:)**";
    default: return "";
  }
}

function generateOutput() {
  const grouped = {
    UR: [],
    SSR: [],
    SR: [],
    R: [],
    C: [],
  };

  cards.forEach(card => {
    const emote = getEventEmote(card.event);
    const entry = `[${card.rarity} ${card.name} ${card.version}](${card.link})${emote}`;
    grouped[card.rarity]?.push(entry);
  });

  let result = `#0\n\n`;
  for (const rarity of ["UR", "SSR", "SR", "R", "C"]) {
    if (grouped[rarity].length) {
      result += `__**${rarity}:**__\n${grouped[rarity].join("\n")}\n\n`;
    }
  }

  output.value = result.trim();

    // Glow effect on output
    output.classList.add("ring", "ring-green-400");
    setTimeout(() => output.classList.remove("ring", "ring-green-400"), 500);

  // Update Live Preview
  updatePreview(output.value);

}

function updatePreview(text) {
  const preview = document.getElementById("preview");

  // Replace (:emote:) with actual emojis in preview only
  let formatted = text.replace(/\(:([a-zA-Z0-9_]+):\)/g, (match, name) => {
    return `(${emojiMap[name] || match})`;
  });
  

  formatted = formatted
    .replace(/^__(.*?)__$/gm, '<u>$1</u>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');

  preview.innerHTML = formatted;
}