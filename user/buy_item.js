document.addEventListener("DOMContentLoaded", () => {

  /* ===== IMAGE GALLERY ===== */
  const mainImage = document.getElementById("mainImg");
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
  
  function updatePrice(listing_id) {
    let newPrice = document.getElementById("newPrice").value;

    fetch("../database/update_price.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            listing_id: listing_id,
            new_price: newPrice
        })
    })
    .then(r => r.json())
    .then(res => {
        if (res.success) {
            document.getElementById("currentPrice").textContent = newPrice;
            alert("Bid updated!");
        } else {
            alert("Error updating bid.");
        }
    });
}

// swap images
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("thumb")) {
        document.getElementById("mainImg").src = e.target.src;
    }
});


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

  /* ===== TOP UP ===== */
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

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  confirmBtn.addEventListener("click", () => {
    const currentPrice = parseFloat(priceText.textContent.replace(/[₱,]/g, ""));
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice)) {
      alert("Enter valid number");
      return;
    }

    if (newPrice <= currentPrice) {
      alert("New bid must be higher");
      return;
    }

    // ✅ Update database
    fetch("../api/update_price.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${itemId}&price=${newPrice}`
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        priceText.textContent = "₱" + newPrice.toLocaleString();
        modal.style.display = "none";
      } else {
        alert("Server error updating price");
      }
    });
  });

});
