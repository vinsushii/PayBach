document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get('listing_id') || '';

  if (!listingId) {
    alert("Missing listing ID");
    return;
  }

  // Fetch Listing Data
  let data;
  try {
    const res = await fetch("../../../model/api/client/buy_item.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `listing_id=${listingId}`
    });

    if (!res.ok) {
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

  const { listing, items, categories, images, currentPrice, offers } = data;

  // Title
  const item = items?.[0] || {};
  const mainTitle = item.name || listing.description || "Unnamed Item";
  document.querySelector("main h2").textContent = mainTitle;

  // Description
  document.querySelector(".description p.lorem").textContent =
    listing.description || "No description provided.";
  document.querySelector(".description strong").nextElementSibling.textContent =
    item.item_condition || "N/A";

  // Categories
  const catContainer = document.getElementById("item-tags");
  catContainer.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tag";
    btn.textContent = cat;
    catContainer.appendChild(btn);
  });

  // Images
  const mainImage = document.querySelector(".main-image img");
  const thumbRow = document.querySelector(".thumbnail-row");
  thumbRow.innerHTML = "";

  let imageList = [];
  if (images.length > 0) {
    imageList = images.map(path => "../" + path.replace("../", ""));
    mainImage.src = imageList[0];

    imageList.forEach((img, i) => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.className = "thumb" + (i === 0 ? " active" : "");
      thumbRow.appendChild(thumb);
    });
  } else {
    mainImage.src = "../../images/default.png";
  }

  const thumbnails = document.querySelectorAll(".thumb");
  let currentIndex = 0;
  function updateImage(index) {
    thumbnails.forEach((thumb, i) => thumb.classList.toggle("active", i === index));
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
    thumbnails.forEach((thumb, i) => thumb.addEventListener("click", () => updateImage(i)));
  }

  // Price & Details
  document.querySelector(".price").textContent = "₱" + Number(currentPrice).toLocaleString();
  document.getElementById("meetup-location").textContent = listing.exchange_method || "N/A";
  document.getElementById("payment-method").textContent = listing.payment_method || "N/A";

  // Seller Info
  const sellerBlock = document.querySelector(".meetup p:nth-of-type(2)");
  sellerBlock.innerHTML =
    `👤 ${listing.first_name} ${listing.last_name}<br>` +
    `📧 ${listing.email}`;

  // Bid / Transaction History Table
  const container = document.querySelector(".bid-offers-container");
  container.innerHTML = "";

  if (offers.length === 0) {
    container.innerHTML = "<p>No bids yet.</p>";
  } else {
    const table = document.createElement("table");
    const headerRow = document.createElement("tr");
    ["User", "Bid Offer"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    const tbody = document.createElement("tbody");
    offers.forEach(offer => {
      const row = document.createElement("tr");
      const userCell = document.createElement("td");
      userCell.textContent = offer.user_id;
      const bidCell = document.createElement("td");
      bidCell.textContent = "₱" + Number(offer.price_offered).toLocaleString();
      row.appendChild(userCell);
      row.appendChild(bidCell);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }
});
