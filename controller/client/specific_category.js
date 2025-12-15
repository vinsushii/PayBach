// controller/client/specific_category.js
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
    .then(res => {
      console.log(res);
      return res.json()
    })
    .then(data => {
      // pangcheck
      if (!data || data.status !== "success" || !Array.isArray(data.items)) {
        const msg = (data && data.message) ? data.message : "No items found.";
        container.innerHTML = `<p class="no-results">${msg}</p>`;
        return;
      }

      container.innerHTML = "";
      data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "item-card";

        // pangcheck uli
        const imgUrl = item.image_url || "../../images/default.png";

        div.innerHTML = `
          <img src="${imgUrl}" alt="${escapeHtml(item.name)}" class="item-img" onerror="this.src='../../images/default.png'">
          <div>
            <h3 class="item-title">${escapeHtml(item.name)}</h3>
            <p class="item-meta">Condition: ${escapeHtml(item.item_condition || 'N/A')}</p>
            <p class="item-meta">Listing: ${escapeHtml(item.description || '')}</p>
          </div>
        `;
        div.onclick = () => {
          window.location.href = `buy_item.html?id=${encodeURIComponent(item.listing_id)}`;
        };
        container.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      container.innerHTML = `<p class="no-results">Error loading items.</p>`;
    });
});

// esc
function escapeHtml(text) {
  if (!text && text !== 0) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}