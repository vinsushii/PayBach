const yourContainer = document.querySelector("#your-bids");
const biddingContainer = document.querySelector("#bidding-for");
const availableContainer = document.querySelector("#available-bids");

// to be replaced ng SESSION ID (from PHP)
const CURRENT_USER_ID = localStorage.getItem("user_id");
// ADD BUTTON LOGIC
const addBtn = document.getElementById("add-bid-btn"); // updated ID for bids
if (addBtn) {
    addBtn.addEventListener("click", () => {
        // Navigate to the page to post a new bid
        window.location.href = "../client/post_item.html";
    });
}
async function loadListings() {
  try {
    //relative path is calculated from ongoing_bids.html and not ongoing_bids.js
    const res = await fetch("../../../model/api/client/fetch_listings.php");
    const json = await res.json();

    console.log("API response:", json); // debug

    if (!json.success) {
      console.error("Fetch failed:", json.message);
      return;
    }

    const listings = json.data;

    yourContainer.innerHTML = "";
    biddingContainer.innerHTML = "";
    availableContainer.innerHTML = "";

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

      // Sorting logic
      if (l.user_id == CURRENT_USER_ID) {
        yourContainer.appendChild(card);
      } else if (l.user_participating == true) {
        biddingContainer.appendChild(card);
      } else {
        availableContainer.appendChild(card);
      }
    });

    // Empty state messages
    if (!yourContainer.children.length)
      yourContainer.innerHTML = `<p class="empty">None</p>`;
    if (!biddingContainer.children.length)
      biddingContainer.innerHTML = `<p class="empty">None</p>`;
    if (!availableContainer.children.length)
      availableContainer.innerHTML = `<p class="empty">None</p>`;

  } catch (err) {
    console.error("Error:", err);
  }
}

loadListings();