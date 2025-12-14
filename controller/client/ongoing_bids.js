const columns = document.querySelectorAll(".bids-container");
const yourContainer = columns[0];
const completedContainer = columns[1];
const availableContainer = columns[2];

// Replace with PHP session user ID
const CURRENT_USER_ID = localStorage.getItem("user_id");

// ADD BUTTON LOGIC
const addBtn = document.getElementById("add-bid-btn");
if (addBtn) {
  addBtn.addEventListener("click", () => {
    window.location.href = "../client/post_item.html";
  });
}

async function loadListings() {
  try {
    const res = await fetch("../../../model/api/client/fetch_listings.php");
    const json = await res.json();

    console.log("API response:", json);

    if (!json.success) {
      console.error("Fetch failed:", json.message);
      return;
    }

    const listings = json.data;

    yourContainer.innerHTML = "";
    completedContainer.innerHTML = "";
    availableContainer.innerHTML = "";

    const pesoFormatter = new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    });

    listings.forEach((l) => {
      const title = l.items?.[0]?.name ?? l.description ?? "Untitled";
      const price = l.start_bid ? pesoFormatter.format(l.start_bid) : "N/A";

      const imagesHtml =
        l.images && l.images.length > 0
          ? l.images.map((path) => `<img src="${path}" alt="${title}" />`).join("")
          : `<img src="../../images/default.png" alt="${title}" />`;

      const card = document.createElement("a");
      card.className = "bid-link";
      card.href = "../client/buy_item.html?listing_id=" + l.listing_id;

      card.innerHTML = `
        <div class="bid-card">
          <div class="image-gallery">${imagesHtml}</div>
          <p>${title}</p>
          <span class="price">${price}</span>
        </div>
      `;

      // SORTING LOGIC
      if (l.is_completed) {
        completedContainer.appendChild(card);
      } else if (l.user_idnum == CURRENT_USER_ID) {
        yourContainer.appendChild(card);
      } else {
        availableContainer.appendChild(card);
      }
    });

    // Empty state messages
    if (!yourContainer.children.length)
      yourContainer.innerHTML = `<p class="empty">None</p>`;
    if (!completedContainer.children.length)
      completedContainer.innerHTML = `<p class="empty">None</p>`;
    if (!availableContainer.children.length)
      availableContainer.innerHTML = `<p class="empty">None</p>`;
  } catch (err) {
    console.error("Error:", err);
  }
}

loadListings();