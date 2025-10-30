document.addEventListener("DOMContentLoaded", () => {
  const mainImage = document.querySelector(".main-image img");
  const thumbnails = document.querySelectorAll(".thumbnail-row .thumb");
  const leftArrow = document.querySelector(".arrow.left");
  const rightArrow = document.querySelector(".arrow.right");

  let currentIndex = 0;

  // Function to update main image
  function updateImage(index) {
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });
    mainImage.src = thumbnails[index].src;
    currentIndex = index;
  }

  // Left arrow click
  leftArrow.addEventListener("click", () => {
    const newIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    updateImage(newIndex);
  });

  // Right arrow click
  rightArrow.addEventListener("click", () => {
    const newIndex = (currentIndex + 1) % thumbnails.length;
    updateImage(newIndex);
  });

  // Clicking a thumbnail directly
  thumbnails.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      updateImage(index);
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("topupModal");
  const closeBtn = document.querySelector(".modal-content .close");
  const confirmBtn = document.getElementById("confirmTopup");
  const topupBtn = document.querySelector(".topup");
  const priceText = document.querySelector(".price");
  const input = document.getElementById("topupInput");

  // Open modal
  topupBtn.addEventListener("click", () => {
    input.value = "";
    modal.style.display = "flex";
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close when clicking outside modal
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Confirm top up
  confirmBtn.addEventListener("click", () => {
    const currentPrice = parseFloat(priceText.textContent.replace(/[₱,]/g, ""));
    const newPrice = parseFloat(input.value);

    if (isNaN(newPrice)) {
      alert("Please enter a valid number.");
      return;
    }

    if (newPrice > currentPrice) {
      priceText.textContent = `₱${newPrice.toLocaleString()}`;
      modal.style.display = "none";
    } else {
      alert("Top up price must be higher than the current bid.");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const reportModal = document.getElementById("reportModal");
  const reportBtn = document.querySelector(".report");
  const reportClose = reportModal.querySelector(".close");
  const confirmReport = document.getElementById("confirmReport");
  const reportForm = document.getElementById("reportForm");

  // Open modal
  reportBtn.addEventListener("click", () => {
    reportModal.style.display = "flex";
  });

  // Close modal
  reportClose.addEventListener("click", () => {
    reportModal.style.display = "none";
  });

  // Close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === reportModal) {
      reportModal.style.display = "none";
    }
  });

  // Confirm report
  confirmReport.addEventListener("click", () => {
    const checked = Array.from(reportForm.querySelectorAll("input[type='checkbox']:checked"))
                         .map(cb => cb.value);
    if (checked.length === 0) {
      alert("Please select at least one reason before submitting.");
      return;
    }
    alert("Report submitted successfully for: " + checked.join(", "));
    reportModal.style.display = "none";
    reportForm.reset();
  });
});
