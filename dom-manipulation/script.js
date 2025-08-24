// =========================
        // Dynamic Quote Generator
        // =========================

        // Load quotes from localStorage or use default quotes
        let quotes = JSON.parse(localStorage.getItem("quotes")) || [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" }
        ];

        // Store last viewed quote in sessionStorage
        let lastViewedQuote = sessionStorage.getItem("lastViewedQuote") || null;

        // ========== DOM ELEMENTS ==========
        const quoteContainer = document.getElementById("quote-container");
        const categoryFilter = document.getElementById("categoryFilter");
        const addQuoteBtn = document.getElementById("addQuoteBtn");

        // ========== INITIALIZATION ==========
        document.addEventListener("DOMContentLoaded", () => {
            // Set up event listeners
            addQuoteBtn.addEventListener("click", addQuote);
            
            // Initialize UI
            populateCategories();
            filterQuotes();
            
            // Show last viewed quote if exists
            if (lastViewedQuote) {
                const quote = JSON.parse(lastViewedQuote);
                quoteContainer.innerHTML = `
                    <div class="quote-item">
                        <p class="quote-text">"${quote.text}"</p>
                        <p class="quote-category">— ${quote.category}</p>
                    </div>
                    <p><em>Last viewed quote (from session storage)</em></p>
                `;
            }
        });

        // ========== UTILS ==========
        function saveQuotes() {
            localStorage.setItem("quotes", JSON.stringify(quotes));
        }

        // ========== DISPLAY FUNCTIONS ==========
        function showRandomQuote() {
            if (quotes.length === 0) {
                quoteContainer.innerHTML = "<p>No quotes available.</p>";
                return;
            }
            
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const q = quotes[randomIndex];
            
            // Store in sessionStorage
            sessionStorage.setItem("lastViewedQuote", JSON.stringify(q));
            
            quoteContainer.innerHTML = `
                <div class="quote-item">
                    <p class="quote-text">"${q.text}"</p>
                    <p class="quote-category">— ${q.category}</p>
                </div>
            `;
        }

        function addQuote() {
            const textInput = document.getElementById("newQuoteText");
            const categoryInput = document.getElementById("newQuoteCategory");
            const newQuote = { 
                text: textInput.value.trim(), 
                category: categoryInput.value.trim() || "General" 
            };

            if (!newQuote.text) {
                alert("Please enter a quote");
                return;
            }

            // Save locally
            quotes.push(newQuote);
            saveQuotes();
            populateCategories();
            filterQuotes();
            
            // Clear inputs
            textInput.value = "";
            categoryInput.value = "";
            
            alert("Quote added successfully!");
        }

        // ========== CATEGORY FILTERING ==========
        function populateCategories() {
            const uniqueCategories = ["all", ...new Set(quotes.map(q => q.category))];
            categoryFilter.innerHTML = uniqueCategories
                .map(cat => `<option value="${cat}">${cat}</option>`)
                .join("");

            // Restore last selected category if exists
            const savedCategory = localStorage.getItem("selectedCategory");
            if (savedCategory && uniqueCategories.includes(savedCategory)) {
                categoryFilter.value = savedCategory;
            }
        }

        function filterQuotes() {
            const selectedCategory = categoryFilter.value;

            // Save selected category in localStorage
            localStorage.setItem("selectedCategory", selectedCategory);

            // Clear container
            quoteContainer.innerHTML = "";

            // Filter quotes
            const filteredQuotes = selectedCategory === "all"
                ? quotes
                : quotes.filter(q => q.category === selectedCategory);

            if (filteredQuotes.length === 0) {
                quoteContainer.innerHTML = "<p>No quotes available for this category.</p>";
                return;
            }

            // Display filtered quotes
            filteredQuotes.forEach(q => {
                const quoteEl = document.createElement("div");
                quoteEl.classList.add("quote-item");
                quoteEl.innerHTML = `
                    <p class="quote-text">"${q.text}"</p>
                    <p class="quote-category">— ${q.category}</p>
                `;
                quoteContainer.appendChild(quoteEl);
            });
        }

        // ========== JSON IMPORT/EXPORT ==========
        function exportToJson() {
            if (quotes.length === 0) {
                alert("No quotes to export!");
                return;
            }
            
            const dataStr = JSON.stringify(quotes, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'quotes.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        }

        function importFromJsonFile(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const fileReader = new FileReader();
            fileReader.onload = function(e) {
                try {
                    const importedQuotes = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(importedQuotes)) {
                        throw new Error("Imported file should contain an array of quotes");
                    }
                    
                    // Validate each quote has required fields
                    for (const quote of importedQuotes) {
                        if (!quote.text || typeof quote.text !== 'string') {
                            throw new Error("Each quote must have a text property");
                        }
                        if (!quote.category || typeof quote.category !== 'string') {
                            quote.category = "General"; // Default category
                        }
                    }
                    
                    quotes.push(...importedQuotes);
                    saveQuotes();
                    populateCategories();
                    filterQuotes();
                    
                    alert('Quotes imported successfully!');
                    
                    // Reset file input
                    event.target.value = '';
                } catch (error) {
                    alert('Error importing quotes: ' + error.message);
                    console.error(error);
                }
            };
            fileReader.readAsText(file);
        }