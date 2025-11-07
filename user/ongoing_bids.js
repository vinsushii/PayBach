const container = document.querySelector(".bids-container");

async function loadListings() {
  try {
    const res = await fetch("../database/fetch_listings.php");
    const json = await res.json();

    console.log("API response:", json); // Debug

    if (!json.success) {
      console.error("Fetch failed:", json.message);
      return;
    }

    const listings = json.data;
    container.innerHTML = ""; 

    const pesoFormatter = new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0
    });

    listings.forEach(l => {
      const title = l.items?.[0]?.name ?? l.description ?? "Untitled";
      const price = l.start_bid ? pesoFormatter.format(l.start_bid) : "N/A";

      const imagesHtml = (l.images && l.images.length > 0)
        ? l.images.map(path => `<img src="${path}" alt="${title}" />`).join("")
        : `<img src="../images/default.png" alt="${title}" />`;

      const card = document.createElement("a");
      card.className = "bid-link";
      card.href = "../user/buy_item.php?id=" + l.listing_id;


      card.innerHTML = `
        <div class="bid-card">
          <div class="image-gallery">
            ${imagesHtml}
          </div>
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
