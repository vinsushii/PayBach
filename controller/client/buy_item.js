document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get("listing_id");

  if (!listingId) {
    alert("Missing listing ID");
    return;
  }

  // ===== Fetch Listing Data (Async/Await) =====
  let data;
  try {
      const res = await fetch("../../../model/api/client/buy_item.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `listing_id=${listingId}`
      });
    if(!res.ok){
      alert("Server error: " + res.status);
      return;
    }
    data = await res.json();
  } catch (err) {
    alert("Failed to load listing. Check your connection.");
    return;
  }

  if (!data.success) {
    alert("Listing not found.");
    return;
  }

  const { listing, items, categories, images, currentPrice } = data;

  // ===== Structure Fallbacks =====
  const item = items?.[0] || {};
  const mainTitle = item.name || listing.description || "Unnamed Item";

  // ===== Set Title =====
  document.querySelector("main h2").textContent = mainTitle;

  // ===== Description =====
  document.querySelector(".description p.lorem").textContent =
    listing.description || "No description provided.";

  // ===== Condition =====
  document.querySelector(".description strong").textContent =
    "Condition: " + (item.item_condition || "N/A");

  // ===== Categories =====
  const catContainer = document.querySelector("#item-tags");
  catContainer.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tag";
    btn.textContent = cat.category;
    catContainer.appendChild(btn);
  });

  // ===== Images =====
  const mainImage = document.querySelector(".main-image img");
  const thumbRow = document.querySelector(".thumbnail-row");
  thumbRow.innerHTML = "";

  let imageList = [];

  if (images.length > 0) {
    imageList = images.map(path => "../../" + path.replace("../", ""));
    mainImage.src = imageList[0];

    imageList.forEach((img, i) => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.className = "thumb" + (i === 0 ? " active" : "");
      thumbRow.appendChild(thumb);
    });
  } else {
    mainImage.src = "../images/default.png";
  }

  const thumbnails = document.querySelectorAll(".thumb");
  let currentIndex = 0;

  function updateImage(index) {
    thumbnails.forEach((thumb, i) =>
      thumb.classList.toggle("active", i === index)
    );
    mainImage.src = thumbnails[index].src;
    currentIndex = index;
  }

  if (thumbnails.length > 0) {
    document.querySelector(".arrow.left").addEventListener("click", () => {
      const next = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
      updateImage(next);
    });

    document.querySelector(".arrow.right").addEventListener("click", () => {
      const next = (currentIndex + 1) % thumbnails.length;
      updateImage(next);
    });

    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener("click", () => updateImage(index));
    });
  }

  // ===== Pricing =====
  const priceText = document.querySelector(".price");
  priceText.textContent = "₱" + Number(currentPrice).toLocaleString();

  document.querySelector("#meetup-location").textContent =
    listing.exchange_method || "N/A";

  document.querySelector("#payment-method").textContent =
    listing.payment_method || "N/A";

  // ===== Seller Info =====
  const sellerBlock = document.querySelector(".meetup p:nth-of-type(3)");
  sellerBlock.innerHTML =
    `👤 ${listing.first_name} ${listing.last_name}<br>` +
    `📧 ${listing.email}`;

  // ===== Top Up Modal =====
  const modal = document.getElementById("topupModal");
  const closeBtn = modal.querySelector(".close");
  const confirmBtn = document.getElementById("confirmTopup");
  const topupBtn = document.querySelector(".topup");
  const input = document.getElementById("topupInput");

  topupBtn.addEventListener("click", () => {
    input.value = "";
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
  });

  confirmBtn.addEventListener("click", async () => {
    const oldPrice = parseFloat(priceText.textContent.replace(/[₱,]/g, ""));
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice)) return alert("Enter a valid number.");
    if (newPrice <= oldPrice) return alert("New bid must be higher.");

    try {
      const res = await fetch("../../../model/api/client/update_price.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${listingId}&price=${newPrice}`
      });

      const resp = await res.json();

      if (resp.success) {
        priceText.textContent = "₱" + newPrice.toLocaleString();
        modal.style.display = "none";
        alert("Bid updated!");
      } else {
        alert("Server error updating price.");
      }
    } catch (err) {
      alert("Network error updating price.");
    }
  });
});
