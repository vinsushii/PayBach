// ====================
// LISTING TYPE SWITCH
// ====================
const typeButtons = document.querySelectorAll('.type-btn');
let listingType = "bid";

const bidSection = document.getElementById("bid-section");
const tradeSection = document.getElementById("trade-section");

typeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    typeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    listingType = btn.dataset.type;

    if (listingType === "bid") {
      bidSection.style.display = "block";
      tradeSection.style.display = "none";
    } else {
      bidSection.style.display = "none";
      tradeSection.style.display = "block";
    }
  });
});

// ====================
// PAYMENT BUTTONS
// ====================
const paymentButtons = document.querySelectorAll('.payment-btn');
let selectedPayment = null;

paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    paymentButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPayment = btn.dataset.type;
  });
});

// ====================
// TAG SELECTION
// ====================
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('selected');
  });
});

// ====================
// ADD IMAGE INPUT
// ====================
const addImageBtn = document.getElementById('add-image-btn');
const imageUpload = document.getElementById('image-upload');

addImageBtn.addEventListener('click', () => {
  const inputs = imageUpload.querySelectorAll('input[type="file"]');
  const lastInput = inputs[inputs.length - 1];

  if (!lastInput.value) {
    alert("Upload the previous image first.");
    return;
  }

  const newInput = document.createElement("input");
  newInput.type = "file";
  newInput.name = "images[]";
  newInput.accept = "image/*";
  imageUpload.appendChild(newInput);
});

// ====================
// FORM SUBMIT
// ====================
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemName = document.querySelector("[name='item_name']").value;
  const condition = document.querySelector("[name='condition']").value;
  const description = document.querySelector("[name='description']").value;
  const meetup = document.querySelector("[name='meetup']").value;

  const selectedTags = Array.from(document.querySelectorAll('.tag.selected'))
                            .map(tag => tag.textContent.trim());

  const formData = new FormData();

  // Basic data
  formData.append("item_name", itemName);
  formData.append("condition", condition);
  formData.append("description", description);
  formData.append("meetup", meetup);
  formData.append("payment_method", selectedPayment ?? "onsite");

  // Listing type
  formData.append("listing_type", listingType);

  // Bid
  if (listingType === "bid") {
    formData.append("bid", document.querySelector("[name='bid']").value);
  }

  // Trade
  if (listingType === "trade") {
    formData.append("trade_item", document.querySelector("[name='trade_item']").value);
    formData.append("trade_value", document.querySelector("[name='trade_value']").value);
    formData.append("desired_barter_item", document.querySelector("[name='desired_barter_item']").value);
  }

  // Tags
  selectedTags.forEach((tag, i) => {
    formData.append(`categories[${i}]`, tag);
  });

  // Images
  document.querySelectorAll("#image-upload input[type='file']").forEach((input) => {
    if (input.files[0]) {
      formData.append("images[]", input.files[0]);
    }
  });

  try {
    const res = await fetch("../database/insert_listing.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      alert("Listing submitted!");
      window.location.href = "../user/homepage.php";
    } else {
      alert("Failed: " + data.message);
    }

  } catch (err) {
    alert("Server error: " + err.message);
  }
});
