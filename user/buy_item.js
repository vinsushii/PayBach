document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");

  // ===== FETCH LISTING DATA =====
  fetch(`../api/buy_item.php?id=${itemId}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("Listing not found");
        return;
      }

      const { listing, items, categories, images, currentPrice } = data;

      // Title
      document.querySelector("main h2").textContent =
        items[0]?.name || listing.description || "Unnamed Item";

      // Description
      document.querySelector(".description p.lorem").textContent =
        listing.description || "";

      // Condition
      const condEl = document.querySelector(".description strong");
      condEl.textContent = "Condition: " + (items[0]?.item_condition || "N/A");

      // Categories
      const descBlock = document.querySelector(".description");
      categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = "tag";
        btn.textContent = cat;
        descBlock.appendChild(btn);
      });

      // Images
      const mainImage = document.querySelector(".main-image img");
      const thumbRow = document.querySelector(".thumbnail-row");
      thumbRow.innerHTML = "";
      if (images.length > 0) {
        mainImage.src = images[0];
        images.forEach((img, i) => {
          const thumb = document.createElement("img");
          thumb.src = img;
          thumb.className = "thumb" + (i === 0 ? " active" : "");
          thumbRow.appendChild(thumb);
        });
      } else {
        mainImage.src = "../images/default.png";
      }

      // Current bid
      document.querySelector(".price").textContent =
        "₱" + currentPrice.toLocaleString();

      // Seller info
      const sellerBlock = document.querySelector(".meetup p:nth-of-type(3)");
      sellerBlock.innerHTML =
        "👤 " + listing.seller_name + "<br>📧 " + listing.email;

      // ===== IMAGE GALLERY BEHAVIOR =====
      const thumbnails = document.querySelectorAll(".thumb");
      const leftArrow = document.querySelector(".arrow.left");
      const rightArrow = document.querySelector(".arrow.right");
      let currentIndex = 0;

      function updateImage(index) {
        thumbnails.forEach((thumb, i) => {
          thumb.classList.toggle("active", i === index);
        });
        mainImage.src = thumbnails[index].src;
        currentIndex = index;
      }

      leftArrow.addEventListener("click", () => {
        const next = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        updateImage(next);
      });

      rightArrow.addEventListener("click", () => {
        const next = (currentIndex + 1) % thumbnails.length;
        updateImage(next);
      });

      thumbnails.forEach((thumb, index) => {
        thumb.addEventListener("click", () => {
          updateImage(index);
        });
      });

      // ===== TOP UP MODAL =====
      const modal = document.getElementById("topupModal");
      const closeBtn = modal.querySelector(".close");
      const confirmBtn = document.getElementById("confirmTopup");
      const topupBtn = document.querySelector(".topup");
      const priceText = document.querySelector(".price");
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

      confirmBtn.addEventListener("click", () => {
        const currentPriceVal = parseFloat(
          priceText.textContent.replace(/[₱,]/g, "")
        );
        const newPrice = parseFloat(input.value);

        if (isNaN(newPrice)) {
          alert("Enter valid number");
          return;
        }
        if (newPrice <= currentPriceVal) {
          alert("New bid must be higher");
          return;
        }

        fetch("../database/update_price.php", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `id=${itemId}&price=${newPrice}`
        })
          .then(res => res.json())
          .then(resp => {
            if (resp.success) {
              priceText.textContent = "₱" + newPrice.toLocaleString();
              modal.style.display = "none";
              alert("Bid updated!");
            } else {
              alert("Server error updating price");
            }
          });
      });
    });
});
