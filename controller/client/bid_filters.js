document.addEventListener("DOMContentLoaded", () => {
  initializeFilter();
});

let currentFilterCategories = [];

function initializeFilter() {
  const filterBtn = document.getElementById("filter-available-bid-btn");
  const applyBtn = document.getElementById("apply-filter-btn");
  const clearBtn = document.getElementById("clear-filter-btn");

  if (filterBtn) filterBtn.addEventListener("click", e => { e.stopPropagation(); toggleFilterDropdown(e.target); });
  if (applyBtn) applyBtn.addEventListener("click", e => { e.stopPropagation(); applyFilter(); });
  if (clearBtn) clearBtn.addEventListener("click", e => { e.stopPropagation(); clearFilter(); });

  document.addEventListener("click", closeFilterDropdown);
  const filterDropdown = document.getElementById("filter-dropdown");
  if (filterDropdown) filterDropdown.addEventListener("click", e => e.stopPropagation());

  loadSavedFilter();
}

function toggleFilterDropdown(buttonElement) {
  const filterDropdown = document.getElementById("filter-dropdown");
  if (!filterDropdown) return;
  filterDropdown.style.display = filterDropdown.style.display === "block" ? "none" : "block";
  if (filterDropdown.style.display === "block") loadCheckboxStates();
}

function loadCheckboxStates() {
  const savedCategories = getSavedFilterCategories();
  const allChecked = savedCategories.length === 0;

  const allCheckbox = document.querySelector('#filter-dropdown input[value="all"]');
  if (allCheckbox) allCheckbox.checked = allChecked;

  const categories = ["Fashion","School Supplies","Technology","Tools & Home Materials","Automotive","Hobbies & Toys","Decoration","Sports & Recreation","Pet Supplies","Beauty","Others"];
  categories.forEach(cat => {
    const cb = document.querySelector(`#filter-dropdown input[value="${cat}"]`);
    if (cb) cb.checked = !allChecked && savedCategories.includes(cat);
  });
}

function applyFilter() {
  const checkboxes = document.querySelectorAll('#filter-dropdown input[name="category"]:checked');
  const selectedCategories = Array.from(checkboxes).filter(cb => cb.value !== "all").map(cb => cb.value);

  currentFilterCategories = selectedCategories;
  saveFilterCategories(selectedCategories);

  // Call backend via ongoing_bids.js
  window.loadBidListings({ categories: selectedCategories });

  updateFilterIndicator();
  closeFilterDropdown();
}

function clearFilter() {
  currentFilterCategories = [];
  localStorage.removeItem("bidFilterCategories");

  document.querySelectorAll('#filter-dropdown input').forEach(cb => cb.checked = cb.value === "all");

  window.loadBidListings({}); // load all bids

  hideFilterIndicator();
  closeFilterDropdown();
}

function updateFilterIndicator() {
  hideFilterIndicator();
  if (currentFilterCategories.length === 0) return;

  const header = document.querySelector(".bids-column:nth-child(3) .bids-header");
  if (!header) return;

  const indicator = document.createElement("span");
  indicator.className = "active-filter-indicator";
  indicator.textContent = `Filtered (${currentFilterCategories.length})`;
  indicator.title = "Categories: " + currentFilterCategories.join(", ");
  header.appendChild(indicator);
}

function hideFilterIndicator() {
  const indicator = document.querySelector(".active-filter-indicator");
  if (indicator) indicator.remove();
}

function saveFilterCategories(categories) {
  localStorage.setItem("bidFilterCategories", JSON.stringify(categories));
}

function getSavedFilterCategories() {
  try { return JSON.parse(localStorage.getItem("bidFilterCategories")) || []; }
  catch(e){ return []; }
}

function loadSavedFilter() {
  const saved = getSavedFilterCategories();
  if (saved.length) {
    currentFilterCategories = saved;
    setTimeout(() => window.loadBidListings({ categories: saved }), 500);
    updateFilterIndicator();
  }
}

// Expose globally
window.clearFilter = clearFilter;
window.applyFilter = applyFilter;
