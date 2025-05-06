const form = document.getElementById("cardForm");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

let cards = [];

const emojiMap = {
  jack_o_lantern: "🎃",
  christmas_tree: "🎄",
  maidbow: "🎀",
};

const rarityHeaders = {
  UR: "<a:UltraRare:1342208044351623199>",
  SSR: "<a:SuperSuperRare:1342208039918370857>",
  SR: "<a:SuperRare:1342208034482425936>",
  R: "<a:Rare:1342208028342091857>",
  C: "<a:Common:1342208021853634781>",
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
  copyBtn.classList.add("animate-pulse");
  setTimeout(() => copyBtn.classList.remove("animate-pulse"), 500);
});

clearBtn.addEventListener("click", () => {
  cards = [];
  output.value = "";
  document.getElementById("preview").innerHTML = "";
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
  const grouped = { UR: [], SSR: [], SR: [], R: [], C: [] };
  const mode = document.getElementById("mode").value;

  cards.forEach(card => {
    const emote = getEventEmote(card.event);
    const entry = `[${card.rarity} ${card.name} ${card.version}](${card.link})${emote}`;
    grouped[card.rarity]?.push(entry);
  });

  let result = mode === "embed" ? "`#0`\n\n" : "#0\n\n";

  for (const rarity of ["UR", "SSR", "SR", "R", "C"]) {
    if (grouped[rarity].length) {
      if (mode === "embed") {
        result += `# ${rarityHeaders[rarity]}\n${grouped[rarity].join("\n")}\n\n`;
      } else {
        result += `__**${rarity}:**__\n${grouped[rarity].join("\n")}\n\n`;
      }
    }
  }

  output.value = result.trim();
  output.classList.add("ring", "ring-green-400");
  setTimeout(() => output.classList.remove("ring", "ring-green-400"), 500);

  updatePreview(output.value);
}

function updatePreview(text) {
  const preview = document.getElementById("preview");

  let formatted = text.replace(/\(:([a-zA-Z0-9_]+):\)/g, (match, name) => {
    return `(${emojiMap[name] || match})`;
  });

  formatted = formatted
    .replace(/^__(.*?)__$/gm, '<u>$1</u>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
    .replace(/<a:(\w+):(\d+)>/g, (_, name, id) =>
      `<img src="https://cdn.discordapp.com/emojis/${id}.gif?size=32&quality=lossless" alt="${name}" style="display:inline;height:1em;" />`
    );

  preview.innerHTML = formatted;
}
