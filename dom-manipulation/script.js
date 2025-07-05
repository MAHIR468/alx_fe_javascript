let quotes = [];
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Charger les citations depuis localStorage
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

// Sauvegarder les citations dans localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Remplir le menu des catégories
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restaurer catégorie sélectionnée
  const saved = localStorage.getItem("selectedCategory");
  if (saved) {
    select.value = saved;
    filterQuotes();
  }
}

// Filtrer les citations selon catégorie sélectionnée
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", category);
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    document.getElementById("quoteDisplay").innerHTML = `<p><strong>${quote.category}</strong>: ${quote.text}</p>`;
  } else {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
  }
}

// Afficher une citation aléatoire
function showRandomQuote() {
  filterQuotes();
}

// Ajouter une nouvelle citation via le formulaire
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  syncQuotes();
}

// Création du formulaire d'ajout dynamique
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const inputText = document.createElement("input");
  inputText.id = "newQuoteText";
  inputText.type = "text";
  inputText.placeholder = "Enter a new quote";

  const inputCategory = document.createElement("input");
  inputCategory.id = "newQuoteCategory";
  inputCategory.type = "text";
  inputCategory.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  container.appendChild(title);
  container.appendChild(inputText);
  container.appendChild(inputCategory);
  container.appendChild(addBtn);
}

// Exporter les citations au format JSON
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Importer les citations depuis un fichier JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported.filter(q => q.text && q.category));
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Error reading or invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Synchroniser les citations vers le serveur (POST)
async function syncQuotes() {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotes })
    });
    const data = await response.json();
    console.log("Synced to server:", data);
  } catch (err) {
    console.error("Sync error:", err);
  }
}

// Récupérer les citations du serveur (GET) et gérer conflits
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    const serverQuotes = Array.isArray(data)
      ? data.slice(0,5).map(post => ({ text: post.title, category: "Server" }))
      : [];

    let updated = false;
    serverQuotes.forEach(sq => {
      if (!quotes.find(q => q.text === sq.text)) {
        quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      alert("Quotes updated from server.");
      saveQuotes();
      populateCategories();
      filterQuotes();
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// Initialisation au chargement
window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  setInterval(fetchQuotesFromServer, 30000); // Sync toutes les 30 secondes
};
