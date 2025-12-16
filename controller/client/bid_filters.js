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
    if (typeof window.loadBidListings === 'function') await window.loadBidListings();
  } else {
    await filterBidsByCategories(selectedCategories);
  }
}

function clearFilter() {
  localStorage.removeItem("bidFilterCategories");
  currentFilterCategories = [];
  
  const allCheckbox = document.querySelector('#filter-dropdown input[value="all"]');
  if (allCheckbox) allCheckbox.checked = true;

  if (typeof window.loadBidListings === 'function') window.loadBidListings();
}

async function filterBidsByCategories(categories) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  availableContainer.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const allFilteredItems = [];

    for (const category of categories) {
      const response = await fetch(`../../../model/api/client/filter_item.php?category=${encodeURIComponent(category)}`);
      const data = await response.json();

      if (data.status === "success" && data.items) {
        data.items.forEach(item => {
          item.category = category;
          allFilteredItems.push(item);
        });
      }
    }

    displayFilteredItems(allFilteredItems);

  } catch (error) {
    console.error("Filter error:", error);
    showFilterError();
  }
}

function displayFilteredItems(items) {
  const availableContainer = document.getElementById("available-bids");
  if (!availableContainer) return;

  if (items.length === 0) {
    availableContainer.innerHTML = `
      <div class="no-results-message">
        <div class="no-results-icon">🔍</div>
        <p>No bids found for selected categories</p>
        <button onclick="clearFilter()" class="show-all-btn">Show All Bids</button>
      </div>
    `;
    return;
  }

  availableContainer.innerHTML = '';

  items.forEach(item => {
    const card = createFilteredBidCard(item);
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
      <div class="no-results-icon">⚠️</div>
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
    setTimeout(() => {
      applyFilter();
    }, 1000);
  }
}

// Make functions globally available
window.clearFilter = clearFilter;
window.applyFilter = applyFilter;
