// ongoing_bids.js

const container = document.querySelector(".bids-container");

async function loadListings() {
  try {
    const res = await fetch("../api/fetch_listings.php");
    const json = await res.json();

    if (!json.success) {
      console.error("Fetch failed:", json.message);
      return;
    }

    const listings = json.data;

    container.innerHTML = ""; 
    listings.forEach(l => {
      const title = l.items?.[0]?.name ?? "Untitled";
      const price = l.start_bid ?? "N/A";
      const img = l.items?.[0]?.image_path ?? "../images/default.png";

      const card = document.createElement("a");
      card.className = "bid-link";
      card.href = "buy_item.html?id=" + l.listing_id;

      card.innerHTML = `
        <div class="bid-card">
          <img src="${img}" alt="${title}" />
          <p>${title}</p>
          <span class="price">${price}</span>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

loadListings();
