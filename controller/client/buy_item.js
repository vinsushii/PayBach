document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const listingId = params.get("listing_id") || params.get("id");
  const goBackBtn = document.getElementById("goBackBtn");

  if (goBackBtn) {
    goBackBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // If browser has history → go back
      if (document.referrer && document.referrer !== window.location.href) {
        window.location.href = document.referrer;
      } else {
        // Fallback (homepage or listings page)
        window.location.href = "../../pages/client/homepage.html";
      }
    });
  }

  if (!listingId) {
    alert("Missing listing ID");
    return;
  }

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
    alert(data.message || "Listing not found.");
    return;
  }

  const {
    listing,
    items,
    categories,
    images,
    currentPrice,
    increment,
    offers
  } = data;

  const CURRENT_USER_ID = localStorage.getItem("user_id");
  const isOwner = listing.user_idnum === CURRENT_USER_ID;

  /* ================= BASIC INFO ================= */

  const item = items?.[0] || {};
  const title =
    item.name || listing.description || "Unnamed Item";

  document.querySelector("main h2").textContent = title;
  document.querySelector(".description p.lorem").textContent =
    listing.description || "No description provided.";

  document.querySelector(".description strong").textContent =
    "Condition: " + (item.item_condition || "N/A");

  /* ================= CATEGORIES ================= */

  const tagBox = document.getElementById("item-tags");
  tagBox.innerHTML = "";
  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tag";
    btn.textContent = cat;
    tagBox.appendChild(btn);
  });

  /* ================= IMAGES ================= */

  const mainImage = document.querySelector(".main-image img");
  const thumbRow = document.querySelector(".thumbnail-row");
  thumbRow.innerHTML = "";

  let imageList = [];

  if (images.length > 0) {
    imageList = images.map(path => {
      // Force absolute path from project root
      return "/PayBach/uploads/" + path.split("/uploads/")[1];
    });
  
    mainImage.src = imageList[0];
  
    imageList.forEach((img, i) => {
      const thumb = document.createElement("img");
      thumb.src = img;
      thumb.className = "thumb" + (i === 0 ? " active" : "");
      thumbRow.appendChild(thumb);
    });
  } else {
    mainImage.src = "/PayBach/uploads/default.png";
  }

  const thumbs = document.querySelectorAll(".thumb");
  let index = 0;

  function updateImage(i) {
    thumbs.forEach((t, n) => t.classList.toggle("active", n === i));
    mainImage.src = thumbs[i].src;
    index = i;
  }

  if (thumbs.length) {
    document.querySelector(".arrow.left").onclick = () =>
      updateImage((index - 1 + thumbs.length) % thumbs.length);

    document.querySelector(".arrow.right").onclick = () =>
      updateImage((index + 1) % thumbs.length);

    thumbs.forEach((t, i) =>
      t.addEventListener("click", () => updateImage(i))
    );
  }

  /* ================= PRICE & DETAILS ================= */

  const priceText = document.querySelector(".price");
  priceText.textContent = "₱" + Number(currentPrice).toLocaleString();

  document.getElementById("meetup-location").textContent =
    listing.exchange_method || "N/A";

  document.getElementById("payment-method").textContent =
    listing.payment_method || "N/A";

  /* ================= SELLER ================= */

  const seller = document.querySelector(".meetup p:nth-of-type(2)");
  seller.innerHTML = `
    👤 ${listing.first_name} ${listing.last_name}<br>
    📧 ${listing.email}
  `;

  /* ================= BID HISTORY ================= */

  const container = document.querySelector(".bid-offers-container");
  container.innerHTML = "";

  if (!offers.length) {
    container.innerHTML = "<p>No bids yet.</p>";
  } else {
    const table = document.createElement("table");
    table.innerHTML = `
      <tr>
        <th>User</th>
        <th>Bid Offer</th>
      </tr>
    `;

    offers.forEach(o => {
      const r = document.createElement("tr");
      r.innerHTML = `
        <td>${o.user_id}</td>
        <td>₱${Number(o.price_offered).toLocaleString()}</td>
      `;
      table.appendChild(r);
    });

    container.appendChild(table);
  }

  /* ================= BID ACTION ================= */

  const bidBox = document.querySelector(".bid-box");
  if (!bidBox) return;

  const topupBtn = document.createElement("button");
  topupBtn.className = "topup";

  if (isOwner) {
    topupBtn.textContent = "You own this item";
    topupBtn.disabled = true;
    topupBtn.classList.add("disabled");
  } else {
    topupBtn.textContent = "TOP UP";
  }

  bidBox.appendChild(topupBtn);

  if (isOwner) return;

  const modal = document.getElementById("topupModal");
  const closeBtn = modal.querySelector(".close");
  const confirmBtn = document.getElementById("confirmTopup");
  const input = document.getElementById("topupInput");

  topupBtn.onclick = () => {
    input.value = currentPrice;
    modal.style.display = "flex";
  };

  closeBtn.onclick = () => (modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  confirmBtn.onclick = async () => {
    const newPrice = parseFloat(input.value);
    if (isNaN(newPrice)) return alert("Invalid amount");
    if (newPrice <= currentPrice + increment)
      return alert("Bid must be higher.");

    const res = await fetch(
      "../../../model/api/client/update_price.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${listingId}&price=${newPrice}`
      }
    );

    const r = await res.json();
    if (r.success) location.reload();
    else alert("Failed to update bid.");
  };
});
