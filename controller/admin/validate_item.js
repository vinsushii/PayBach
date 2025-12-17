const BASE_URL = "http://localhost:3000"; // Node server URL
const validateCountEl = document.getElementById("validateCount");
const itemRow = document.querySelector(".item-row");
const itemFilter = document.getElementById("itemFilter");

// Fetch and display counts
async function fetchCounts() {
  try {
    const res = await fetch(`${BASE_URL}/admin/validate/count`, { credentials: "include" });
    const data = await res.json();
    if (data.success) validateCountEl.textContent = data.total;
  } catch (err) {
    console.error("Error fetching counts:", err);
  }
}

// Fetch and display items
async function fetchItems(type = "ALL") {
  try {
    const res = await fetch(`${BASE_URL}/admin/validate/items?type=${type}`, { credentials: "include" });
    const data = await res.json();

    if (!data.success) {
      itemRow.innerHTML = "<p class='text-center'>Error loading items</p>";
      return;
    }

    itemRow.innerHTML = "";

    if (data.items.length === 0) {
      itemRow.innerHTML = "<p class='text-center'>No items to validate</p>";
      return;
    }

    data.items.forEach(item => {
      const col = document.createElement("div");
      col.classList.add("col-md-3", "col-sm-6", "item-filter-card");
      col.dataset.type = item.type;

      col.innerHTML = `
        <div class="dashboard-card item-card-content">
          <img src="${item.image || '../../images/default.png'}" alt="${item.name}" class="img-fluid item-image">
          <p class="item-name">${item.name}</p>
          ${item.type === "BID" ? `<p class="item-price">P${item.price || 0}</p>` : ""}
          <div class="mt-2">
            <button class="btn btn-success btn-sm approve-btn" data-id="${item.id}" data-type="${item.type}">Approve</button>
          </div>
        </div>
      `;

      itemRow.appendChild(col);
    });

    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const type = btn.dataset.type;

        try {
          const res = await fetch(`${BASE_URL}/admin/validate/${type}/${id}/approve`, { method: "POST", credentials: "include" });
          const result = await res.json();
          if (result.success) {
            fetchCounts();
            fetchItems(itemFilter.value);
          }
        } catch (err) {
          console.error("Approve error:", err);
        }
      });
    });

  } catch (err) {
    console.error("Error fetching items:", err);
    itemRow.innerHTML = "<p class='text-center'>Error loading items</p>";
  }
}

// Filter change
itemFilter.addEventListener("change", () => fetchItems(itemFilter.value));

// Initial load
fetchCounts();
fetchItems();
