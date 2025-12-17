// ongoing_bids.js - Main bid loading functionality

document.addEventListener("DOMContentLoaded", () => {
  loadBidListings();

  const addBtn = document.getElementById("add-bid-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      window.location.href = "../client/post_item.html";
    });
  }
});

const yourContainer = document.getElementById("your-bids");
const availableContainer = document.getElementById("available-bids");

const CURRENT_USER_ID = localStorage.getItem("user_id");

async function loadBidListings() {
  try {
    showLoading();

    const res = await fetch("../../../model/api/client/fetch_listings.php");
    const json = await res.json();

    if (!json.success) throw new Error(json.message);

    const bids = json.data.filter(l => l.listing_type === "bid");

    yourContainer.innerHTML = "";
    availableContainer.innerHTML = "";

    bids.forEach(bid => {
      const ownerId =
        bid.user_idnum ||
        bid.user_id ||
        bid.seller_id ||
        bid.owner_id;

      bid.is_owner = String(ownerId) === String(CURRENT_USER_ID);
    
      const card = createBidCard(bid);

      if (bid.is_owner) {
        yourContainer.appendChild(card);
      } else {
        availableContainer.appendChild(card);
      }
    });

    handleEmpty();

  } catch (err) {
    console.error(err);
    showError("Failed to load bids");
  }
}

function createBidCard(bid) {
  const card = document.createElement("div");
  card.className = "bid-card";

  const title = bid.items?.[0]?.name || bid.description || "Untitled";
  const price = formatPeso(bid.current_amount || bid.start_bid || 0);

  // image
  let imageUrl = "/PayBach/uploads/default-item.png";
  if (bid.images && bid.images.length > 0) {
    const filename = bid.images[0].split("/").pop();
    imageUrl = `/PayBach/uploads/${filename}`;
  }

  card.innerHTML = `
    <div class="bid-image">
      <img src="${imageUrl}" onerror="this.src='/PayBach/uploads/default-item.png'">
    </div>
    <div class="bid-content">
      <p class="bid-title">${truncate(title)}</p>
      <p class="bid-price">${price}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    if (bid.is_owner) {
      window.location.href = `../client/item_details.html?listing_id=${bid.listing_id}`;
    } else {
      window.location.href = `../client/buy_item.html?listing_id=${bid.listing_id}`;
    }
  });

  return card;
}

/* ================= HELPERS ================= */

function formatPeso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(amount);
}

function truncate(text, len = 20) {
  return text.length > len ? text.substring(0, len) + "..." : text;
}

function showLoading() {
  [yourContainer, availableContainer].forEach(c => {
    c.innerHTML = `<div class="loading-spinner"></div>`;
  });
}

function handleEmpty() {
  if (!yourContainer.children.length)
    yourContainer.innerHTML = empty("No bids created");

  if (!availableContainer.children.length)
    availableContainer.innerHTML = empty("No available bids");
}

function empty(msg) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <p>${msg}</p>
    </div>
  `;
}

function showError(msg) {
  alert(msg);
}

// Make loadBidListings available globally for bid_filters.js
window.loadBidListings = loadBidListings;
window.createBidCard = createBidCard;
