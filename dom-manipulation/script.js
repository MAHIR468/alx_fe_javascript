let quotes = [];

// Load quotes from localStorage or set defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote and save it to sessionStorage
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `
    <p><strong>${quote.category}</strong>: ${quote.text}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add a new quote from form
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// Create the form dynamically
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

// Export quotes to JSON file
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

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
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

// On load
window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
};
