document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get('listing_id');

  if (!listingId) {
    alert("Missing listing ID");
    return;
  }

  /* =========================
     FETCH ITEM DETAILS
  ========================= */
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

  const { listing, items, categories, images, currentPrice } = data;

  /* =========================
     RENDER ITEM DETAILS
  ========================= */

  // Title
  const item = items?.[0] || {};
  document.querySelector("main h2").textContent =
    item.name || listing.description || "Unnamed Item";

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
    imageList = images.map(p => "../" + p.replace("../", ""));
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
    thumbnails.forEach((t, i) => t.classList.toggle("active", i === index));
    mainImage.src = thumbnails[index].src;
    currentIndex = index;
  }

  if (thumbnails.length) {
    document.querySelector(".arrow.left").onclick = () =>
      updateImage((currentIndex - 1 + thumbnails.length) % thumbnails.length);

    document.querySelector(".arrow.right").onclick = () =>
      updateImage((currentIndex + 1) % thumbnails.length);

    thumbnails.forEach((t, i) =>
      t.onclick = () => updateImage(i)
    );
  }

  // Price & Details
  document.querySelector(".price").textContent =
    "₱" + Number(currentPrice).toLocaleString();
  document.getElementById("meetup-location").textContent =
    listing.exchange_method || "N/A";
  document.getElementById("payment-method").textContent =
    listing.payment_method || "N/A";

  // Seller Info
  document.querySelector(".meetup p:nth-of-type(2)").innerHTML =
    `👤 ${listing.first_name} ${listing.last_name}<br>` +
    `📧 ${listing.email}`;

  /* =========================
     BID HISTORY (LIVE)
  ========================= */

  async function loadBidHistory() {
    try {
      const res = await fetch(
        `../../../model/api/client/fetch_bid_history.php?listing_id=${listingId}`
      );
      const result = await res.json();

      const container = document.querySelector(".bid-offers-container");
      container.innerHTML = "";

      //if (!result.success || result.data.length === 0) {
      //  container.innerHTML = "<p>No bids yet.</p>";
      //  return;
      //}

      const table = document.createElement("table");

      const headerRow = document.createElement("tr");
      ["User", "Bid Offer", "Time"].forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      const tbody = document.createElement("tbody");

      result.data.forEach(bid => {
        const row = document.createElement("tr");

        const userCell = document.createElement("td");
        userCell.textContent = bid.user_idnum;
        row.appendChild(userCell);

        const amountCell = document.createElement("td");
        amountCell.textContent =
          "₱" + Number(bid.bid_amount).toLocaleString();
        row.appendChild(amountCell);

        const timeCell = document.createElement("td");
        timeCell.textContent =
          new Date(bid.bid_time).toLocaleString();
        row.appendChild(timeCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      container.appendChild(table);

    } catch (err) {
      console.error("Failed to load bid history", err);
    }
  }

  // Initial load 
  loadBidHistory();

  // Auto refresh every 3 seconds
  setInterval(loadBidHistory, 3000);
});
