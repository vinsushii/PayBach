// ongoing_trades.js - UPDATED with correct uploads path
document.addEventListener("DOMContentLoaded", () => {
    loadAllTrades();
    
    // ADD BUTTON
    const addBtn = document.getElementById("add-trade-btn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            window.location.href = "../client/post_trade.html";
        });
    }
});

// API Endpoints
const API_ENDPOINTS = {
    yourTrades: "/PayBach/model/api/client/get_your_trades.php",
    ongoingTrades: "/PayBach/model/api/client/get_ongoing_trades.php",
    completedTrades: "/PayBach/model/api/client/get_completed_trades.php",
    availableTrades: "/PayBach/model/api/client/get_available_trades.php"
};

async function loadAllTrades() {
    try {
        // Show loading state
        showLoadingState();
        
        // Load all 4 types of trades
        await Promise.all([
            loadYourTrades(),
            loadOngoingTrades(),
            loadCompletedTrades(),
            loadAvailableTrades()
        ]);
        
    } catch (err) {
        console.error("Failed to load trades:", err);
        showErrorMessage("Failed to load trades. Please refresh the page.");
    }
}

async function loadYourTrades() {
    try {
        const response = await fetch(API_ENDPOINTS.yourTrades);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Your trades data:", data);
        
        if (data.success && data.trades && data.trades.length > 0) {
            renderTrades("your", data.trades);
        } else {
            document.getElementById("your-trades-container").innerHTML = "";
            showEmptyState("your-trades-container", "No trades created yet");
        }
    } catch (err) {
        console.error("Failed to load your trades:", err);
        document.getElementById("your-trades-container").innerHTML = "";
        showEmptyState("your-trades-container", "Failed to load trades");
    }
}

async function loadOngoingTrades() {
    try {
        const response = await fetch(API_ENDPOINTS.ongoingTrades);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Ongoing trades data:", data);
        
        if (data.success && data.trades && data.trades.length > 0) {
            renderTrades("ongoing", data.trades);
        } else {
            document.getElementById("ongoing-trades-container").innerHTML = "";
            showEmptyState("ongoing-trades-container", "No ongoing trades");
        }
    } catch (err) {
        console.error("Failed to load ongoing trades:", err);
        document.getElementById("ongoing-trades-container").innerHTML = "";
        showEmptyState("ongoing-trades-container", "Failed to load trades");
    }
}

async function loadCompletedTrades() {
    try {
        const response = await fetch(API_ENDPOINTS.completedTrades);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Completed trades data:", data);
        
        if (data.success && data.trades && data.trades.length > 0) {
            renderTrades("completed", data.trades);
        } else {
            document.getElementById("completed-trades-container").innerHTML = "";
            showEmptyState("completed-trades-container", "No completed trades");
        }
    } catch (err) {
        console.error("Failed to load completed trades:", err);
        document.getElementById("completed-trades-container").innerHTML = "";
        showEmptyState("completed-trades-container", "Failed to load trades");
    }
}

async function loadAvailableTrades() {
    try {
        const response = await fetch(API_ENDPOINTS.availableTrades);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Available trades data:", data);
        
        if (data.success && data.trades && data.trades.length > 0) {
            renderTrades("available", data.trades);
        } else {
            document.getElementById("available-trades-container").innerHTML = "";
            showEmptyState("available-trades-container", "No available trades");
        }
    } catch (err) {
        console.error("Failed to load available trades:", err);
        document.getElementById("available-trades-container").innerHTML = "";
        showEmptyState("available-trades-container", "Failed to load trades");
    }
}

function renderTrades(type, trades) {
    const container = document.getElementById(`${type}-trades-container`);
    container.innerHTML = "";
    
    console.log(`Rendering ${trades.length} ${type} trades`);
    
    trades.forEach(trade => {
        const tradeCard = createTradeCard(trade, type);
        container.appendChild(tradeCard);
    });
}

function createTradeCard(trade, type) {
    const card = document.createElement("div");
    card.className = `trade-card trade-card-${type}`;
    
    // Get item name - prefer item_name, fall back to offered_item_name
    const itemName = trade.item_name || trade.offered_item_name || 'Unnamed Item';
    
    // Get image with proper path
    let imageUrl = "/PayBach/uploads/default-item.png"; 
    
    if (trade.images && trade.images.length > 0) {
        // Get first image
        let rawImagePath = trade.images[0];
        
        console.log("Original image path from DB:", rawImagePath);
        
        if (rawImagePath) {
            // Clean up the path
            // Remove any ../../../ prefixes
            rawImagePath = rawImagePath.replace(/^(\.\.\/)+/, '');
            
            // If the path already contains uploads/, use it as is
            if (rawImagePath.includes('uploads/')) {
                // Extract just the filename from the path
                const filename = rawImagePath.split('/').pop();
                imageUrl = `/PayBach/uploads/${filename}`;
            } else {
                // It's just a filename
                imageUrl = `/PayBach/uploads/${rawImagePath}`;
            }
            
            console.log("Processed image URL:", imageUrl);
        }
    }
    
    // Format date
    let formattedDate = "";
    if (trade.created_at) {
        try {
            const tradeDate = new Date(trade.created_at);
            formattedDate = tradeDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            formattedDate = "N/A";
        }
    }
    
    // Determine status text and class
    let statusText = "";
    let statusClass = "";
    
    switch(type) {
        case "your":
            const hasOffers = trade.barter_status === 'has_offers';
            statusText = hasOffers ? 'Has Offers' : 'Active';
            statusClass = hasOffers ? 'trade-status-offers' : 'trade-status-active';
            break;
        case "ongoing":
            if (trade.user_role === 'owner') {
                statusText = trade.barter_status === 'has_offers' ? 'Has Offers' : 'Waiting';
            } else {
                statusText = trade.barter_status === 'accepted' ? 'Accepted' : 'Pending';
            }
            statusClass = "trade-status-ongoing";
            break;
        case "completed":
            statusText = "Completed";
            statusClass = "trade-status-completed";
            break;
        case "available":
            statusText = "Available";
            statusClass = "trade-status-available";
            break;
    }
    
    // Truncate item name if too long
    const displayName = itemName.length > 20 ? itemName.substring(0, 20) + '...' : itemName;
    
    // Get condition
    const condition = trade.offered_item_condition || trade.item_condition || 'Condition: N/A';
    
    // Create card HTML
    card.innerHTML = `
        <div class="trade-image-container">
            <img src="${imageUrl}" 
                 alt="${itemName}"
                 onerror="this.src='/PayBach/uploads/default-item.png'; this.onerror=null;">
        </div>
        
        <div class="trade-content">
            <p class="trade-title">${displayName}</p>
            
            <p class="trade-condition">${condition}</p>
            
            ${trade.max_additional_cash && parseFloat(trade.max_additional_cash) > 0 ? 
                `<p class="trade-cash">+₱${parseFloat(trade.max_additional_cash).toFixed(2)}</p>` : ''}
            
            ${trade.owner_name && type === "available" ? 
                `<p class="trade-owner">By: ${trade.owner_name}</p>` : ''}
            
            <p class="trade-date">${formattedDate}</p>
            
            <div class="trade-status ${statusClass}">${statusText}</div>
        </div>
        
        ${type === "available" ? 
            `<button class="btn-make-offer" data-trade-id="${trade.barter_id}">
                Make Offer
            </button>` : ''}
        
        ${type === "your" && trade.barter_status === 'has_offers' ? 
            `<button class="btn-view-offers" data-trade-id="${trade.barter_id}">
                View Offers
            </button>` : ''}
    `;
    
    // Add click event to view details
    card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-make-offer") && 
            !e.target.classList.contains("btn-view-offers")) {
            viewTradeDetails(trade.barter_id, type);
        }
    });
    
    // Add event listeners for buttons
    if (type === "available") {
        const makeOfferBtn = card.querySelector(".btn-make-offer");
        if (makeOfferBtn) {
            makeOfferBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                makeOffer(trade.barter_id);
            });
        }
    }
    
    if (type === "your" && trade.barter_status === 'has_offers') {
        const viewOffersBtn = card.querySelector(".btn-view-offers");
        if (viewOffersBtn) {
            viewOffersBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                viewOffers(trade.barter_id);
            });
        }
    }
    
    return card;
}

// Helper functions
function showLoadingState() {
    const containers = [
        "your-trades-container", 
        "ongoing-trades-container", 
        "completed-trades-container", 
        "available-trades-container"
    ];
    
    containers.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = '<div class="loading-spinner"></div>';
        }
    });
}

function showEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p class="empty-state-message">${message}</p>
            </div>
        `;
    }
}

function showErrorMessage(message) {
    const existingAlerts = document.querySelectorAll('.alert-error, .alert-success');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-error";
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = "slideOut 0.3s ease";
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Navigation functions
function makeOffer(tradeId) {
    alert(`Make offer for trade #${tradeId}`);
}

function viewOffers(tradeId) {
    alert(`View offers for trade #${tradeId}`);
}

function viewTradeDetails(tradeId, type) {
 window.location.href = `trade_item.html?barter_id=${tradeId}`;
}

// Auto-refresh every 30 seconds (optional)
setInterval(() => {
    loadAllTrades();
}, 30000);