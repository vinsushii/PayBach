// controller/client/specific_category.js

// Get current user ID from localStorage (set after login)
const CURRENT_USER_ID = localStorage.getItem("user_id") || null;
console.log("CURRENT_USER_ID:", CURRENT_USER_ID);

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "";

  const titleEl = document.getElementById("category-title");
  const container = document.getElementById("items-container");

  titleEl.textContent = category;

  if (!category) {
    container.innerHTML = `<p class="no-results">No category selected.</p>`;
    return;
  }

  container.innerHTML = `<p>Loading items...</p>`;

  const url = `../../../model/api/client/filter_items.php?category=${encodeURIComponent(category)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data || data.status !== "success" || !Array.isArray(data.items)) {
        const msg = (data && data.message) ? data.message : "No items found.";
        container.innerHTML = `<p class="no-results">${msg}</p>`;
        return;
      }

      container.innerHTML = "";

      data.items.forEach(item => {
        // Add is_owner flag
        item.is_owner = CURRENT_USER_ID && String(item.owner_id) === String(CURRENT_USER_ID);

        const div = document.createElement("div");
        div.className = "item-card";

        const imgUrl = item.image_url || "../../images/default.png";

        div.innerHTML = `
          <img src="${imgUrl}" alt="${escapeHtml(item.name)}" class="item-img" onerror="this.src='../../images/default.png'">
          <div>
            <h3 class="item-title">${escapeHtml(item.name)}</h3>
            <p class="item-meta">Condition: ${escapeHtml(item.item_condition || 'N/A')}</p>
            <p class="item-meta">Listing: ${escapeHtml(item.description || '')}</p>
          </div>
        `;

        // Click redirect with ownership check
        div.onclick = () => {
          const lid = encodeURIComponent(item.listing_id || "");
          if (!lid) return;

          if (item.is_owner) {
            window.location.href = `item_details.html?listing_id=${lid}`;
          } else {
            window.location.href = `buy_item.html?listing_id=${lid}`;
          }
        };

        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p class="no-results">Error loading items.</p>`;
    });
});

// Escape HTML
function escapeHtml(text) {
  if (!text && text !== 0) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
