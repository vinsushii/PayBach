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

// ----------------------------
// Render cards into container
function createCardElement(item, showPrice = true) {
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

  // click => details page
  div.addEventListener("click", () => {
    const lid = encodeURIComponent(item.listing_id || "");
    if (lid) {
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
async function loadListings() {
  try {
    // FIXED PATH ✔
    const res = await fetch("../../../model/api/client/fetch_listings.php", { cache: "no-store" });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
      throw new Error("Invalid payload");
    }

    const listings = payload.data;

    const bids = [];
    const trades = [];
    listings.forEach(l => {
      const exchange = (l.exchange_method || "").toLowerCase();
      if (exchange.includes("bid") || exchange.includes("bidding") || exchange.includes("auction")) {
        bids.push(l);
      } else {
        trades.push(l);
      }
    });

    renderCards('bargains-list', listings, true);
    renderCards('bids-list', bids, true);
    renderCards('trades-list', trades, false);

  } catch (err) {
    console.warn("Failed to load listings:", err);

    // fallback demo cards
    const demoBids = [
      { listing_id: "demo-1", description: "IPhone 17 Pro Max", start_bid: "35000", images: ["../images/iphone17.webp"], exchange_method: "bid" },
      { listing_id: "demo-2", description: "Leather Wallet", start_bid: "170", images: ["../images/Generic-profile.png"], exchange_method: "bid"},
      { listing_id: "demo-3", description: "Swimming Goggles", start_bid: "50", images: ["../images/auto-image.jpg"], exchange_method: "bid" }
    ];
    const demoTrades = [
      { listing_id: "demo-4", description: "Coding for Dummies", images: ["../images/beauty-main.jpg"], exchange_method: "trade" },
      { listing_id: "demo-5", description: "Pliers", images: ["../images/tools-main.jpg"], exchange_method: "trade" },
      { listing_id: "demo-6", description: "Stanley Blue", images: ["../images/stanley.jpg"], exchange_method: "trade" }
    ];

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
});
