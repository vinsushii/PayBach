// controller/client/homepage.js

// ----------------------------
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
  let imgSrc = "../../images/auto-image.jpg"; // default
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    imgSrc = item.images[0];
    if (imgSrc.startsWith("../")) imgSrc = imgSrc.replace("../", "../../");
  } else if (item.image_path) {
    imgSrc = item.image_path.startsWith("../") ? item.image_path.replace("../", "../../") : item.image_path;
  }

  // title: try items[] name, then description
  let title = item.title || item.description || "";
  if ((!title || title.trim() === "") && Array.isArray(item.items) && item.items.length > 0) {
    title = item.items[0].name || item.items[0].item_name || title;
  }

  // price: try start_bid alias, or price fields
  let price = item.start_bid || item.price || item.current_amount || "";
  if (price !== "" && typeof price !== "string") price = String(price);

  const titleHtml = `<p>${escapeHtml(title || "Untitled")}</p>`;
  const priceHtml = (showPrice && price) ? `<span>₱${escapeHtml(price)}</span>` : "";

  div.innerHTML = `
    <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(title)}">
    ${titleHtml}
    ${priceHtml}
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
    // Path from views/pages/client/homepage.html -> model/api/fetch_listing.php
    const res = await fetch('../../../model/api/client/fetch_listings.php', { cache: "no-store" });
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

    renderCards('bids-list', bids, true);
    renderCards('trades-list', trades, false);

  } catch (err) {
    console.warn("Failed to load listings:", err);
    // fallback demo cards
    const demoBids = [
      { listing_id: "demo-1", description: "IPhone 17 Pro Max", start_bid: "35000", images: ["../images/iphone17.webp"] },
      { listing_id: "demo-2", description: "Leather Wallet", start_bid: "170", images: ["../images/Generic-profile.png"] },
      { listing_id: "demo-3", description: "Swimming Goggles", start_bid: "50", images: ["../images/auto-image.jpg"] }
    ];
    const demoTrades = [
      { listing_id: "demo-4", description: "Coding for Dummies", images: ["../images/beauty-main.jpg"] },
      { listing_id: "demo-5", description: "Pliers", images: ["../images/tools-main.jpg"] },
      { listing_id: "demo-6", description: "Stanley Blue", images: ["../images/stanley.jpg"] }
    ];
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
