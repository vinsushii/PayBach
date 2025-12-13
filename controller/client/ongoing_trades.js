// Select the three container divs from your HTML
const yourContainer = document.querySelector("#your-bids");
const tradingContainer = document.querySelector("#bidding-for");
const availableContainer = document.querySelector("#available-bids");

// Get current user ID - using localStorage, sessionStorage, or fallback
const CURRENT_USER_ID = localStorage.getItem("user_id") || sessionStorage.getItem("user_id") || "2241389";

// Main function to load and display trades
async function loadTrades() {
  try {
    // Fetch trade listings from the API
    // Adjust the path according to your project structure
    const res = await fetch("../../../model/api/client/fetch_trade_listings.php");
    const json = await res.json();

    console.log("Trade API response:", json); // Debug logging

    // Check if API call was successful
    if (!json.success) {
      console.error("Fetch failed:", json.message);
      return;
    }

    const trades = json.data;

    // Clear all containers before adding new content
    yourContainer.innerHTML = "";
    tradingContainer.innerHTML = "";
    availableContainer.innerHTML = "";

    // If no trades returned, show empty state
    if (!trades || trades.length === 0) {
      showNoTradesMessage();
      return;
    }

    // Process each trade listing
    trades.forEach(trade => {
      // Create a card for this trade
      const tradeCard = createTradeCard(trade);

      
      if (trade.user_idnum === CURRENT_USER_ID) {
        yourContainer.appendChild(tradeCard);
      } else if (trade.user_participating === true) {
        tradingContainer.appendChild(tradeCard);
      } else {
        availableContainer.appendChild(tradeCard);
      }
    });

    // Show empty messages for any columns that have no content
    checkEmptyContainers();

  } catch (err) {
    console.error("Error loading trades:", err);
    showErrorMessage("Failed to load trades. Please try again.");
  }
}

// Function to create a trade card element
function createTradeCard(trade) {
  // Extract trade details with fallback values
  const title = trade.items?.[0]?.name || 
               trade.description || 
               "Untitled Trade";
  
  const condition = trade.items?.[0]?.item_condition || "Not specified";
  const categories = trade.categories || [];
  
  // Get the first image if available, otherwise use default
  const imagePath = trade.images && trade.images.length > 0 
    ? trade.images[0] 
    : "../../images/default.png";

  const categoriesHtml = categories.length > 0 
    ? `<div class="categories">
        ${categories.slice(0, 2).map(cat => 
          `<span class="category-badge">${cat}</span>`
        ).join("")}
        ${categories.length > 2 ? 
          `<span class="category-badge">+${categories.length - 2}</span>` : ''}
       </div>`
    : "";

  // Create the clickable card element
  const card = document.createElement("a");
  card.className = "bid-link";
  card.href = `../client/trade_view.html?listing_id=${trade.listing_id}`;

  // Build the card HTML
  card.innerHTML = `
    <div class="bid-card">
      <div class="image-container">
        <img src="${imagePath}" alt="${title}" class="trade-image" />
        <span class="trade-badge">TRADE</span>
      </div>
      <div class="trade-details">
        <p class="trade-title">${title}</p>
        <p class="trade-condition">Condition: ${condition}</p>
        ${categoriesHtml}
        <div class="trade-info">
          <span class="trade-user">${trade.seller_name || trade.user_idnum || "Unknown"}</span>
          ${trade.created_at ? 
            `<span class="trade-date">${formatDate(trade.created_at)}</span>` : ''}
        </div>
      </div>
    </div>
  `;

  return card;
}

// Helper function to format dates nicely
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

function checkEmptyContainers() {
  if (!yourContainer.children.length) {
    yourContainer.innerHTML = `<p class="empty">None</p>`;
  }
  if (!tradingContainer.children.length) {
    tradingContainer.innerHTML = `<p class="empty">None</p>`;
  }
  if (!availableContainer.children.length) {
    availableContainer.innerHTML = `<p class="empty">None</p>`;
  }
}

// Show error message when API fails
function showErrorMessage(message) {
  const mainSection = document.querySelector('.bids-section');
  if (mainSection) {
    mainSection.innerHTML += `
      <div class="error-message">
        <p>${message}</p>
        <button onclick="loadTrades()">Try Again</button>
      </div>
    `;
  }
}

// Show message when no trades exist at all
function showNoTradesMessage() {
  const mainSection = document.querySelector('.bids-section');
  if (mainSection) {
    mainSection.innerHTML += `
      <div class="no-trades">
        <p>No trades available. Be the first to create one!</p>
        <a href="../client/create_listing.html" class="create-btn">Create Trade</a>
      </div>
    `;
  }
}

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", loadTrades);