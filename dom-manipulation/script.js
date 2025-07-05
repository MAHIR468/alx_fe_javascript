let quotes = [];
let lastSyncTimestamp = null;
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Load from localStorage or set defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    filter.value = savedCategory;
    filterQuotes();
  }
}

function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length > 0) {
    const quote = filtered[Math.floor(Math.random() * filtered.length)];
    document.getElementById("quoteDisplay").innerHTML = `<p><strong>${quote.category}</strong>: ${quote.text}</p>`;
  } else {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
  }
}

function showRandomQuote() {
  filterQuotes();
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
    syncToServer();
  } else {
    alert("Please enter both quote and category.");
  }
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

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

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(title);
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (err) {
      alert("Error reading JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

function syncToServer() {
  fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quotes })
  })
  .then(response => response.json())
  .then(data => {
    console.log("Data synced to server:", data);
  })
  .catch(err => console.error("Sync failed:", err));
}

function fetchFromServer() {
  fetch(SERVER_URL)
    .then(response => response.json())
    .then(data => {
      const serverQuotes = Array.isArray(data)
        ? data.slice(0, 5).map(post => ({ text: post.title, category: "Server" }))
        : [];
      let hasConflict = false;
      serverQuotes.forEach(sq => {
        if (!quotes.find(q => q.text === sq.text)) {
          quotes.push(sq);
          hasConflict = true;
        }
      });
      if (hasConflict) {
        alert("Quotes updated from server.");
        saveQuotes();
        populateCategories();
        filterQuotes();
      }
    })
    .catch(err => console.error("Fetch failed:", err));
}

window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  setInterval(fetchFromServer, 30000); // sync every 30 seconds
};
