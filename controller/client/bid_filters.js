// bid_filters.js - Filtering functionality using filter_items.php

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
  
  loadCheckboxStates();
}

function closeFilterDropdown() {
  const filterDropdown = document.getElementById("filter-dropdown");
  if (filterDropdown) filterDropdown.style.display = "none";
}

function loadCheckboxStates() {
  const savedCategories = getSavedFilterCategories();
  const allChecked = savedCategories.length === 0;
  
  const allCheckbox = document.querySelector('#filter-dropdown input[value="all"]');
  if (allCheckbox) allCheckbox.checked = allChecked;
  
  // Update individual checkboxes
  const categories = ["Fashion", "School Supplies", "Technology", "Tools & Home Materials", 
                      "Automotive", "Hobbies & Toys", "Decoration", "Sports & Recreation", 
                      "Pet Supplies", "Beauty", "Others"];
  
  categories.forEach(category => {
    const checkbox = document.querySelector(`#filter-dropdown input[value="${category}"]`);
    if (checkbox) checkbox.checked = !allChecked && savedCategories.includes(category);
  });
}

async function applyFilter() {
  const checkboxes = document.querySelectorAll('#filter-dropdown input[name="category"]:checked');
  const selectedCategories = Array.from(checkboxes)
    .filter(cb => cb.value !== "all")
    .map(cb => cb.value);
  
  console.log("Applying filter for:", selectedCategories);
  
  saveFilterCategories(selectedCategories);
  currentFilterCategories = selectedCategories;
  
  if (selectedCategories.length === 0) {
    // Show all bids by calling the main load function
    if (typeof window.loadBidListings === 'function') {
      await window.loadBidListings();
    }
  } else {
    // Use filter_items.php to get filtered bids
    await filterBidsByCategories(selectedCategories);
  }
  
  updateFilterIndicator();
}

function clearFilter() {
  localStorage.removeItem("bidFilterCategories");
  currentFilterCategories = [];
  
  // Reset checkboxes to show all
  const allCheckbox = document.querySelector('#filter-dropdown input[value="all"]');
  if (allCheckbox) allCheckbox.checked = true;
  
  document.querySelectorAll('#filter-dropdown input[name="category"]:not([value="all"])')
    .forEach(cb => cb.checked = false);
  
  // Load all bids
  if (typeof window.loadBidListings === 'function') {
    window.loadBidListings();
  }
  
  hideFilterIndicator();
}

// MAIN FILTER FUNCTION - Uses filter_items.php
async function filterBidsByCategories(categories) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;
  
  // Show loading
  availableContainer.innerHTML = '<div class="loading-spinner"></div>';
  
  try {
    // Fetch filtered items from each category
    const allFilteredItems = [];
    
    for (const category of categories) {
      try {
        const response = await fetch(`../../../model/api/client/filter_item.php?category=${encodeURIComponent(category)}`);
        const data = await response.json();
        
        if (data.status === "success" && data.items) {
          data.items.forEach(item => {
            item.category = category; // Add category for reference
            allFilteredItems.push(item);
          });
        }
      } catch (error) {
        console.warn(`Error fetching ${category}:`, error);
      }
    }
    
    // Display filtered items
    displayFilteredItems(allFilteredItems);
    
  } catch (error) {
    console.error("Filter error:", error);
    showFilterError();
  }
}

function displayFilteredItems(items) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  availableContainer.innerHTML = "";

  if (items.length === 0) {
    availableContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">?</div>
        <p>No bids found for selected categories</p>
        <button onclick="clearFilter()" class="show-all-btn">Show All Bids</button>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    //  Adapt item → bid (NO backend changes)
    const bid = {
      listing_id: item.listing_id,

      // used by title
      description: item.name || item.description || "Untitled",

      // used by price
      start_bid: 0,
      current_amount: 0,

      // used by image logic
      images: item.image_url ? [item.image_url] : [],

      // used by click logic
      is_owner: false
    };

    const card = createBidCard(bid);
    availableContainer.appendChild(card);
  });
}


function createFilteredBidCard(item) {
  const card = document.createElement("div");
  card.className = "bid-card";
  
  const title = item.name || item.description || "Untitled";
  const shortTitle = title.length > 20 ? title.substring(0, 20) + "..." : title;
  const imageUrl = item.image_url || "/PayBach/uploads/default-item.png";
  
  card.innerHTML = `
    <div class="bid-image">
      <img src="${imageUrl}" onerror="this.src='/PayBach/uploads/default-item.png'" alt="${title}">
    </div>
    <div class="bid-content">
      <p class="bid-title">${shortTitle}</p>
      <p class="bid-price">₱0.00</p>
      <span class="bid-category">${item.category || ""}</span>
    </div>
  `;
  
  if (item.listing_id) {
    card.addEventListener("click", () => {
      window.location.href = `../client/buy_item.html?listing_id=${item.listing_id}`;
    });
  }
  
  return card;
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

// Filter indicator
function updateFilterIndicator() {
  hideFilterIndicator();
  
  if (currentFilterCategories.length === 0) return;
  
  const header = document.querySelector(".bids-column:nth-child(3) .bids-header");
  if (!header) return;
  
  const indicator = document.createElement("span");
  indicator.className = "active-filter-indicator";
  indicator.textContent = `Filtered: ${currentFilterCategories.length} cat`;
  header.appendChild(indicator);
}

function hideFilterIndicator() {
  const indicator = document.querySelector(".active-filter-indicator");
  if (indicator) indicator.remove();
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
    // Apply saved filter after page loads
    setTimeout(() => {
      if (typeof filterBidsByCategories === 'function') {
        filterBidsByCategories(savedCategories);
        updateFilterIndicator();
      }
    }, 1000);
  }
}

// Make clearFilter available globally
window.clearFilter = clearFilter;