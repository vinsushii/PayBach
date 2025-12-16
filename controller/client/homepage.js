// controller/client/homepage.js

// Carousel (auto)
let index = 0;
const slidesContainer = document.querySelector(".slides");
let slides = [];
function initCarousel() {
  if (!slidesContainer) return;
  slides = slidesContainer.querySelectorAll("img");
  slides.forEach((s, i) => {
    if (i === 0) s.classList.add("active");
    else s.classList.remove("active");
  });
  setInterval(showSlides, 3000);
}
function showSlides() {
  if (!slides || slides.length === 0) return;
  slides.forEach(slide => slide.classList.remove("active"));
  index = (index + 1) % slides.length;
  slides[index].classList.add("active");
}

// ----------------------------
// Utility: escape HTML
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Get current user ID from localStorage (set after login)
const CURRENT_USER_ID = localStorage.getItem("user_id") || null;
console.log("CURRENT_USER_ID:", CURRENT_USER_ID);

// Store all listings globally for search filtering
let ALL_LISTINGS = [];
let ALL_BIDS = [];
let ALL_TRADES = [];


// ----------------------------
// Render cards into container
function createCardElement(item, showPrice = true) {
  console.log("Creating card for:", item.listing_id, "is_owner:", item.is_owner);

  const div = document.createElement("div");
  div.className = "card";

  // pick first image if any
  let imgSrc = "../../images/default.png"; // default
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    imgSrc = item.images[0];
  }

  // title
  let title;
  if (Array.isArray(item.items) && item.items.length > 0) {
    title = item.items[0].name || item.items[0].item_name || title;
  } else {
    title = item.description;
  }

  // price
  let price = item.start_bid || item.price || item.current_amount || "";
  if (price !== "" && typeof price !== "string") price = String(price);

  // determine card type for label
  let typeText = "";
  let typeClass = "";
  if (item.listing_type) {
    const ex = item.listing_type.toLowerCase();
    if (ex.includes("bid") || ex.includes("bidding") || ex.includes("auction")) {
      typeText = "for Bid";
      typeClass = "bid";
    } else {
      typeText = "for Trade";
      typeClass = "trade";
    }
  }

  const titleHtml = `<p>${escapeHtml(title || "Untitled")}</p>`;
  const priceHtml = (showPrice && price) ? `<p class="price">₱${escapeHtml(price)}</p>` : "";
  const typeLabelHtml = typeText ? `<p class="item-tag ${typeClass}">${typeText}</p>` : "";

  div.innerHTML = `
    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(title)}">
    ${titleHtml}
    ${priceHtml}
    ${typeLabelHtml}
  `;

  // click => details page, ownership check
  div.addEventListener("click", () => {
    const lid = encodeURIComponent(item.listing_id || "");
    console.log("Card clicked:", lid, "Owner:", item.user_idnum, "Current User:", CURRENT_USER_ID, "is_owner:", item.is_owner);
    if (!lid) return;

    if (item.is_owner) {
      // Use relative path assuming current page is inside views/pages/client/
      window.location.href = `item_details.html?listing_id=${lid}`;
    } else {
      window.location.href = `buy_item.html?listing_id=${lid}`;
    }
  });

  return div;
}

function renderCards(containerId, items, showPrice = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (!items || items.length === 0) {
    const no = document.createElement("p");
    no.className = "no-items";
    no.textContent = "No items to show.";
    container.appendChild(no);
    return;
  }

  items.forEach(item => {
    const card = createCardElement(item, showPrice);
    container.appendChild(card);
  });
}

// ----------------------------
// Fetch listings and separate bids/trades
async function loadListings(searchTerm = '') {
  try {
    // Build URL with search parameter
    let url = '../../../model/api/client/fetch_listings.php';
    if (searchTerm) {
      url += '?search=' + encodeURIComponent(searchTerm);
    }
    
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      throw new Error("Invalid payload");
    }

    const listings = payload.data;

    // Add is_owner flag comparing user_idnum to CURRENT_USER_ID
    listings.forEach(l => {
      console.log("Owner id:", l.owner_id, "Current user:", CURRENT_USER_ID);
      l.is_owner = CURRENT_USER_ID && String(l.owner_id) === String(CURRENT_USER_ID);
    });

    // Store all listings globally
    ALL_LISTINGS = listings;
    
    const bids = [];
    const trades = [];
    listings.forEach(l => {
      const listingType = (l.listing_type || "").toLowerCase();
      const exchange = (l.exchange_method || "").toLowerCase();
      
      if (listingType.includes("bid") || exchange.includes("bid") || exchange.includes("bidding") || exchange.includes("auction")) {
        bids.push(l);
      } else {
        trades.push(l);
      }
    });
    
    // Store separated listings globally
    ALL_BIDS = bids;
    ALL_TRADES = trades;

    renderCards('bargains-list', listings, true);
    renderCards('bids-list', bids, true);
    renderCards('trades-list', trades, false);

    console.log(`Loaded ${listings.length} listings (${bids.length} bids, ${trades.length} trades)` + (searchTerm ? ` for search: "${searchTerm}"` : ''));

  } catch (err) {
    console.warn("Failed to load listings:", err);

    // fallback demo cards (with no owner flag, since this is demo)
    const demoBids = [
      { listing_id: "demo-1", description: "IPhone 17 Pro Max", start_bid: "35000", current_amount: "35000", images: ["../images/iphone17.webp"], exchange_method: "bid", listing_type: "bid", items: [{ name: "IPhone 17 Pro Max" }] },
      { listing_id: "demo-2", description: "Leather Wallet", start_bid: "170", current_amount: "170", images: ["../images/Generic-profile.png"], exchange_method: "bid", listing_type: "bid", items: [{ name: "Leather Wallet" }] },
      { listing_id: "demo-3", description: "Swimming Goggles", start_bid: "50", current_amount: "50", images: ["../images/auto-image.jpg"], exchange_method: "bid", listing_type: "bid", items: [{ name: "Swimming Goggles" }] }
    ];
    const demoTrades = [
      { listing_id: "demo-4", description: "Coding for Dummies", images: ["../images/beauty-main.jpg"], exchange_method: "trade", listing_type: "trade", items: [{ name: "Coding for Dummies" }] },
      { listing_id: "demo-5", description: "Pliers", images: ["../images/tools-main.jpg"], exchange_method: "trade", listing_type: "trade", items: [{ name: "Pliers" }] },
      { listing_id: "demo-6", description: "Stanley Blue", images: ["../images/stanley.jpg"], exchange_method: "trade", listing_type: "trade", items: [{ name: "Stanley Blue" }] }
    ];
    
    // Store demo data globally
    ALL_LISTINGS = [...demoBids, ...demoTrades];
    ALL_BIDS = demoBids;
    ALL_TRADES = demoTrades;

    renderCards('bargains-list', [...demoBids, ...demoTrades], true);
    renderCards('bids-list', demoBids, true);
    renderCards('trades-list', demoTrades, false);
  }
}


// ----------------------------
// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  loadListings();
  //initSearch();
});