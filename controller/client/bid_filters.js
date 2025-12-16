// bid_filters.js - Backend filtering only (UPDATED)
document.addEventListener("DOMContentLoaded", () => {
  initializeFilter();
});

let currentFilterCategories = [];

function initializeFilter() {
  const filterBtn = document.getElementById("filter-available-bid-btn");
  const applyBtn = document.getElementById("apply-filter-btn");
  const clearBtn = document.getElementById("clear-filter-btn");

  if (filterBtn) {
    filterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFilterDropdown(e.target);
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFilter();
      closeFilterDropdown();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearFilter();
      closeFilterDropdown();
    });
  }

  document.addEventListener("click", () => closeFilterDropdown());
  
  const filterDropdown = document.getElementById("filter-dropdown");
  if (filterDropdown) {
    filterDropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  // Load saved filter
  loadSavedFilter();
}

function toggleFilterDropdown(buttonElement) {
  const filterDropdown = document.getElementById("filter-dropdown");
  if (!filterDropdown) return;
  
  if (filterDropdown.style.display === "block") {
    closeFilterDropdown();
  } else {
    openFilterDropdown(buttonElement);
  }
}

function openFilterDropdown(buttonElement) {
  const filterDropdown = document.getElementById("filter-dropdown");
  if (!filterDropdown) return;
  
  const rect = buttonElement.getBoundingClientRect();
  filterDropdown.style.top = (rect.bottom + window.scrollY + 5) + "px";
  filterDropdown.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 260) + "px";
  filterDropdown.style.display = "block";
}

function closeFilterDropdown() {
  const filterDropdown = document.getElementById("filter-dropdown");
  if (filterDropdown) filterDropdown.style.display = "none";
}

async function applyFilter() {
  const checkboxes = document.querySelectorAll('#filter-dropdown input[name="category"]:checked');
  const selectedCategories = Array.from(checkboxes)
    .filter(cb => cb.value !== "all")
    .map(cb => cb.value);

  saveFilterCategories(selectedCategories);
  currentFilterCategories = selectedCategories;

  if (selectedCategories.length === 0) {
    // No filter - show all bids using the existing function
    if (typeof window.loadBidListings === 'function') {
      await window.loadBidListings();
    }
  } else {
    // Use backend filtering
    await filterBidsByCategoriesBackend(selectedCategories);
  }
  
  closeFilterDropdown();
}

async function clearFilter() {
  localStorage.removeItem("bidFilterCategories");
  currentFilterCategories = [];
  
  // Reset checkboxes
  const allCheckbox = document.querySelector('#filter-dropdown input[value="all"]');
  if (allCheckbox) allCheckbox.checked = true;
  
  // Show all bids using existing function
  if (typeof window.loadBidListings === 'function') {
    await window.loadBidListings();
  }
  
  closeFilterDropdown();
}

// BACKEND FILTERING FUNCTION - UPDATED
async function filterBidsByCategoriesBackend(categories) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  // Show loading
  availableContainer.innerHTML = '<div class="loading-spinner">Filtering...</div>';

  try {
    // Call backend filter API - categories are comma-separated
    const categoriesParam = categories.join(',');
    const response = await fetch(
      `../../../model/api/client/filter_listings.php?type=bid&categories=${encodeURIComponent(categoriesParam)}`
    );
    
    const data = await response.json();

    if (!data.success) {
      console.error("Backend filter error:", data);
      throw new Error(data.message || "Filter failed");
    }

    console.log(`Backend filtered ${data.count} bids for categories:`, categories);
    
    // Use existing function to display bids
    displayFilteredBidsFromBackend(data.data);

  } catch (error) {
    console.error("Filter error:", error);
    showFilterError();
  }
}

function displayFilteredBidsFromBackend(bids) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  if (!bids || bids.length === 0) {
    availableContainer.innerHTML = `
      <div class="no-results-message">
        <div class="no-results-icon">?</div>
        <p>No bids found for selected categories</p>
        <button onclick="clearFilter()" class="show-all-btn">Show All Bids</button>
      </div>
    `;
    return;
  }

  // Clear container
  availableContainer.innerHTML = '';

  // Get current user ID for ownership check
  const CURRENT_USER_ID = localStorage.getItem("user_id") || null;

  // Use the SAME card creation as ongoing_bids.js
  bids.forEach(bid => {
    // Check ownership (same logic as ongoing_bids.js)
    const ownerId = bid.owner_id || bid.user_idnum;
    bid.is_owner = CURRENT_USER_ID && String(ownerId) === String(CURRENT_USER_ID);
    
    // Create card - using the EXACT SAME createBidCard function
    const card = createBidCard(bid);
    availableContainer.appendChild(card);
  });
}

// COPY OF createBidCard from ongoing_bids.js (for consistency)
function createBidCard(bid) {
  const card = document.createElement("div");
  card.className = "bid-card";

  const title = bid.items?.[0]?.name || bid.description || "Untitled";
  const price = formatPeso(bid.current_amount || bid.start_bid || 0);

  // Image - using same logic as ongoing_bids.js
  let imageUrl = "/PayBach/uploads/default-item.png";
  if (bid.images && bid.images.length > 0) {
    const filename = bid.images[0].split("/").pop();
    imageUrl = `/PayBach/uploads/${filename}`;
  }

  card.innerHTML = `
    <div class="bid-image">
      <img src="${imageUrl}" onerror="this.src='/PayBach/uploads/default-item.png'">
    </div>
    <div class="bid-content">
      <p class="bid-title">${truncate(title)}</p>
      <p class="bid-price">${price}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    if (bid.is_owner) {
      window.location.href = `../client/item_details.html?listing_id=${bid.listing_id}`;
    } else {
      window.location.href = `../client/buy_item.html?listing_id=${bid.listing_id}`;
    }
  });

  return card;
}

// Helper functions (same as ongoing_bids.js)
function formatPeso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function truncate(text, len = 20) {
  return text.length > len ? text.substring(0, len) + "..." : text;
}

function showFilterError() {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  availableContainer.innerHTML = `
    <div class="no-results-message">
      <div class="no-results-icon">!</div>
      <p>Error loading filtered bids</p>
      <button onclick="clearFilter()" class="show-all-btn">Show All Bids</button>
    </div>
  `;
}

// Local storage
function saveFilterCategories(categories) {
  localStorage.setItem("bidFilterCategories", JSON.stringify(categories));
}

function getSavedFilterCategories() {
  try {
    const saved = localStorage.getItem("bidFilterCategories");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function loadSavedFilter() {
  const savedCategories = getSavedFilterCategories();
  if (savedCategories.length > 0) {
    currentFilterCategories = savedCategories;
    // Apply saved filter after a short delay
    setTimeout(() => {
      applyFilter();
    }, 1000);
  }
}

// Make functions globally available
window.clearFilter = clearFilter;
window.applyFilter = applyFilter;
window.filterBidsByCategoriesBackend = filterBidsByCategoriesBackend;