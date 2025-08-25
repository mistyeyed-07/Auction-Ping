const form = document.getElementById("cardForm");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const modeSelect = document.getElementById("mode");
const preview = document.getElementById("preview");
const successMessage = document.getElementById("successMessage");
const cardManagement = document.getElementById("cardManagement");
const cardsList = document.getElementById("cardsList");
const searchCards = document.getElementById("searchCards");
const filterRarity = document.getElementById("filterRarity");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let cards = [];
let cardHistory = [];
let filteredCards = [];

const emojiMap = {
  "jack_o_lantern": "🎃",
  "christmas_tree": "🎄",
  "umbrella~1": "🏖️",
  "maidbow": "<a:maidbow:1381313481411792976>",
};

const rarityHeaders = {
  CM: "CM",
  UR: "<a:UltraRare:1342208044351623199>",
  SSR: "<a:SuperSuperRare:1342208039918370857>",
  SR: "<a:SuperRare:1342208034482425936>",
  R: "<a:Rare:1342208028342091857>",
  C: "<a:Common:1342208021853634781>",
};

// Load saved data
const savedCards = localStorage.getItem("cards");
const savedMode = localStorage.getItem("mode");

if (savedCards) {
  cards = JSON.parse(savedCards);
  modeSelect.value = savedMode || "markdown";
  updateCardManagement();
  generateOutput();
}

// Form validation
function validateField(field, errorMessage) {
  const errorDiv = field.parentElement.querySelector('.error-message');
  const isValid = field.checkValidity() && field.value.trim() !== '';
  
  if (!isValid) {
    field.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/20');
    field.classList.remove('border-gray-300', 'dark:border-gray-600');
    errorDiv.textContent = errorMessage;
    errorDiv.classList.remove('hidden');
  } else {
    field.classList.remove('border-red-500', 'bg-red-50', 'dark:bg-red-900/20');
    field.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
    errorDiv.classList.add('hidden');
  }
  
  return isValid;
}

function validateForm() {
  const rarity = document.getElementById("rarity");
  const name = document.getElementById("name");
  const version = document.getElementById("version");
  const link = document.getElementById("link");

  const validations = [
    validateField(rarity, "Please select a rarity"),
    validateField(name, "Card name is required"),
    validateField(version, "Version is required"),
    validateField(link, "Valid Discord link is required")
  ];

  return validations.every(v => v);
}

// Real-time validation
['rarity', 'name', 'version', 'link'].forEach(id => {
  const field = document.getElementById(id);
  field.addEventListener('blur', () => {
    validateField(field, field.getAttribute('data-error') || 'This field is required');
  });
  
  field.addEventListener('input', () => {
    if (field.classList.contains('border-red-500')) {
      validateField(field, field.getAttribute('data-error') || 'This field is required');
    }
  });
});

// Check for duplicates
function isDuplicate(newCard) {
  return cards.some(card => 
    card.rarity === newCard.rarity && 
    card.name.toLowerCase() === newCard.name.toLowerCase() && 
    card.version === newCard.version
  );
}

// Show success message
function showSuccessMessage(message = "Card added successfully!") {
  successMessage.querySelector('span').textContent = `✓ ${message}`;
  successMessage.classList.remove('hidden');
  setTimeout(() => {
    successMessage.classList.add('hidden');
  }, 3000);
}

// Save state for undo
function saveState() {
  cardHistory.push(JSON.stringify(cards));
  if (cardHistory.length > 10) {
    cardHistory.shift(); // Keep only last 10 states
  }
  undoBtn.disabled = cardHistory.length === 0;
}

// Form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  const rarity = document.getElementById("rarity").value;
  const name = document.getElementById("name").value.trim();
  const version = document.getElementById("version").value.trim();
  const link = document.getElementById("link").value.trim();
  const event = document.getElementById("event").value;

  const newCard = { rarity, name, version, link, event };

  if (isDuplicate(newCard)) {
    alert("This card already exists in your list!");
    return;
  }

  saveState();
  cards.push(newCard);
  form.reset();
  
  // Reset field styles
  ['rarity', 'name', 'version', 'link'].forEach(id => {
    const field = document.getElementById(id);
    field.classList.remove('border-green-500', 'bg-green-50', 'dark:bg-green-900/20');
  });

  updateCardManagement();
  generateOutput();
  showSuccessMessage();
});

// Update card management section
function updateCardManagement() {
  if (cards.length === 0) {
    cardManagement.classList.add('hidden');
    return;
  }

  cardManagement.classList.remove('hidden');
  updateRarityCounts();
  renderCardsList();
}

// Update rarity counters
function updateRarityCounts() {
  const counts = { CM: 0, UR: 0, SSR: 0, SR: 0, R: 0, C: 0 };
  cards.forEach(card => counts[card.rarity]++);
  
  Object.keys(counts).forEach(rarity => {
    document.getElementById(`count-${rarity}`).textContent = counts[rarity];
  });
}

// Render cards list
function renderCardsList() {
  const searchTerm = searchCards.value.toLowerCase();
  const rarityFilter = filterRarity.value;

  filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchTerm) || 
                         card.version.toLowerCase().includes(searchTerm);
    const matchesRarity = !rarityFilter || card.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  cardsList.innerHTML = filteredCards.map((card, index) => {
    const originalIndex = cards.indexOf(card);
    const eventEmoji = getEventEmoji(card.event);
    
    return `
      <div class="bg-white/50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-1 text-xs font-bold rounded ${getRarityColor(card.rarity)}">${card.rarity}</span>
              <span class="font-semibold">${card.name}</span>
              <span class="text-sm text-gray-600 dark:text-gray-400">${card.version}</span>
              ${eventEmoji ? `<span class="text-sm">${eventEmoji}</span>` : ''}
            </div>
            <a href="${card.link}" target="_blank" class="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block">
              ${card.link}
            </a>
          </div>
          <div class="flex gap-1 ml-2">
            <button onclick="editCard(${originalIndex})" class="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors">
              Edit
            </button>
            <button onclick="removeCard(${originalIndex})" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Get rarity color classes
function getRarityColor(rarity) {
  const colors = {
    CM: 'bg-yellow-500 text-white',
    UR: 'bg-purple-600 text-white',
    SSR: 'bg-red-600 text-white',
    SR: 'bg-blue-600 text-white',
    R: 'bg-green-600 text-white',
    C: 'bg-gray-600 text-white'
  };
  return colors[rarity] || 'bg-gray-500 text-white';
}

// Get event emoji for display
function getEventEmoji(event) {
  switch (event) {
    case "Halloween🎃": return "🎃";
    case "Christmas🎄": return "🎄";
    case "Maid🎀": return "🎀";
    case "Summer🏖️": return "🏖️";
    default: return "";
  }
}

// Remove card
function removeCard(index) {
  if (confirm("Are you sure you want to remove this card?")) {
    saveState();
    cards.splice(index, 1);
    updateCardManagement();
    generateOutput();
    showSuccessMessage("Card removed successfully!");
  }
}

// Edit card
function editCard(index) {
  const card = cards[index];
  
  // Fill form with card data
  document.getElementById("rarity").value = card.rarity;
  document.getElementById("name").value = card.name;
  document.getElementById("version").value = card.version;
  document.getElementById("link").value = card.link;
  document.getElementById("event").value = card.event;

  // Remove the card and let user re-add it
  saveState();
  cards.splice(index, 1);
  updateCardManagement();
  generateOutput();
  
  // Scroll to form
  form.scrollIntoView({ behavior: 'smooth' });
  document.getElementById("name").focus();
}

// Search and filter functionality
searchCards.addEventListener('input', renderCardsList);
filterRarity.addEventListener('change', renderCardsList);

// Export functionality
exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(cards, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `auction-cards-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showSuccessMessage("Cards exported successfully!");
});

// Import functionality
importBtn.addEventListener('click', () => {
  importFile.click();
});

importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedCards = JSON.parse(e.target.result);
      if (Array.isArray(importedCards)) {
        saveState();
        cards = importedCards;
        updateCardManagement();
        generateOutput();
        showSuccessMessage(`${importedCards.length} cards imported successfully!`);
      } else {
        alert("Invalid file format. Please select a valid JSON file.");
      }
    } catch (error) {
      alert("Error reading file. Please make sure it's a valid JSON file.");
    }
  };
  reader.readAsText(file);
  importFile.value = ''; // Reset file input
});

// Undo functionality
undoBtn.addEventListener('click', () => {
  if (cardHistory.length > 0) {
    const previousState = cardHistory.pop();
    cards = JSON.parse(previousState);
    updateCardManagement();
    generateOutput();
    undoBtn.disabled = cardHistory.length === 0;
    showSuccessMessage("Action undone!");
  }
});

// Copy button
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.value).then(() => {
    copyBtn.classList.add("animate-pulse");
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.classList.remove("animate-pulse");
      copyBtn.textContent = "Copy to Clipboard";
    }, 1000);
  });
});

// Clear button
clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved cards?")) return;
  saveState();
  cards = [];
  output.value = "";
  preview.innerHTML = "";
  updateCardManagement();
  localStorage.removeItem("cards");
  localStorage.removeItem("mode");
  showSuccessMessage("All cards cleared!");
});

// Mode change
modeSelect.addEventListener("change", generateOutput);

// Auto-save
window.addEventListener("beforeunload", () => {
  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("mode", modeSelect.value);
});

// Generate output
function generateOutput() {
  const grouped = { CM: [], UR: [], SSR: [], SR: [], R: [], C: [] };
  const mode = modeSelect.value;

  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("mode", mode);

  cards.forEach(card => {
    const emote = getEventEmote(card.event);
    const entry = `[${card.rarity} ${card.name} ${card.version}](${card.link})${emote}`;
    grouped[card.rarity]?.push(entry);
  });

  let result = mode === "embed" ? "`#0`\n\n" : "`#0`\n\n";

  for (const rarity of ["CM", "UR", "SSR", "SR", "R", "C"]) {
    if (grouped[rarity].length) {
      if (mode === "embed") {
        result += rarity === "CM"
          ? `# CM\n${grouped[rarity].join("\n")}\n\n`
          : `# ${rarityHeaders[rarity]}\n${grouped[rarity].join("\n")}\n\n`;
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

function getEventEmote(event) {
  switch (event) {
    case "Halloween🎃": return " **(:jack_o_lantern:)**";
    case "Christmas🎄": return " **(:christmas_tree:)**";
    case "Maid🎀":      return " **(:maidbow:)**";
    case "Summer🏖️":    return " **(:umbrella~1:)**";
    default: return "";
  }
}

function updatePreview(text) {
  let formatted = text.replace(/\(:([a-zA-Z0-9_]+):\)/g, (match, name) => {
    return `(${emojiMap[name] || match})`;
  });

  formatted = formatted
    .replace(/^# (.+)$/gm, '<h3 class="font-bold text-lg mb-1">$1</h3>')
    .replace(/^__(.*?)__$/gm, '<u>$1</u>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-400 underline" target="_blank">$1</a>')
    .replace(/\n/g, '<br>')
    .replace(/<a:(\w+):(\d+)>/g, (_, name, id) =>
      `<img src="https://cdn.discordapp.com/emojis/${id}.gif?size=32&quality=lossless" alt="${name}" style="display:inline;height:1em;" />`
    );

  preview.innerHTML = formatted;
}

// Make functions global for onclick handlers
window.removeCard = removeCard;
window.editCard = editCard;