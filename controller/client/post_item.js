// ====================
// SAFE QUERY HELPERS
// ====================
function qs(selector) {
  return document.querySelector(selector);
}
function qsa(selector) {
  return document.querySelectorAll(selector);
}

// ====================
// LISTING TYPE SWITCH
// ====================
const typeButtons = qsa('.type-btn');
let listingType = "bid";

const bidSection = qs("#bid-section");
const tradeSection = qs("#trade-section");

// Default state
bidSection.style.display = "block";
tradeSection.style.display = "none";

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
const paymentButtons = qsa('.payment-btn');
let selectedPayment = "onsite"; // default

paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    paymentButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPayment = btn.dataset.type;
  });
});

// Activate default payment
qs('.payment-btn[data-type="onsite"]').classList.add('active');

// ====================
// TAG SELECTION
// ====================
const tags = qsa('.tag');
tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('selected');
  });
});

// ====================
// ADD IMAGE INPUT
// ====================
const addImageBtn = qs('#add-image-btn');
const imageUpload = qs('#image-upload');

addImageBtn.addEventListener('click', () => {
  const inputs = imageUpload.querySelectorAll('input[type="file"]');
  const last = inputs[inputs.length - 1];

  if (!last.value) {
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
qs("#postForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // ====================
  // VALIDATIONS START
  // ====================
  const itemPrice = qs("[name='item_price']").value.trim();
  const maxPrice = qs("[name='max_price']").value.trim();
  const startingBid = qs("[name='bid']").value.trim();
  const maxBid = qs("[name='max_bid']").value.trim();

  // ONLY DECIMALS: 00, 25, 50, 75
  const decimalCheck = val => {
    if (!val.includes(".")) return true;
    const dec = val.split(".")[1];
    return ["00", "25", "50", "75"].includes(dec);
  };

  // RULE 1: No empty inputs allowed
  if (!itemPrice || !maxPrice || !startingBid || !maxBid) {
    alert("All fields must be filled. Whitespaces are not allowed.");
    return;
  }

  // RULE 2: Decimal format validation
  if (!decimalCheck(itemPrice) || !decimalCheck(maxPrice) || !decimalCheck(startingBid) || !decimalCheck(maxBid)) {
    alert("Decimal values must be only 00, 25, 50, or 75.");
    return;
  }

  const itemP = parseFloat(itemPrice);
  const maxP = parseFloat(maxPrice);
  const startB = parseFloat(startingBid);
  const maxBVal = parseFloat(maxBid);

  // RULE 3: Item Price ≤ Max Price
  if (itemP > maxP) {
    alert("Item Price must not be greater than Max Price.");
    return;
  }

  // RULE 4: Starting bid ≤ max price AND Max bid ≤ max price
  if (startB > maxP || maxBVal > maxP) {
    alert("Starting Bid and Max Bid must NOT exceed Max Price.");
    return;
  }

  // RULE 5: Max bid must not equal starting bid
  if (startB === maxBVal) {
    alert("Max Bid must not be equal to Starting Bid.");
    return;
  }
  // ====================
  // VALIDATIONS END
  // ====================

  const formData = new FormData();

  // Basic Data
  formData.append("item_name", qs("[name='item_name']").value);
  formData.append("condition", qs("[name='condition']").value);
  formData.append("description", qs("[name='description']").value);
  formData.append("exchange_method", qs("[name='exchange_method']").value);
  formData.append("payment_method", selectedPayment);

  // Listing type
  formData.append("listing_type", listingType);

  // BID FIELDS
  if (listingType === "bid") {
    formData.append("item_price", itemPrice);
    formData.append("max_price", maxPrice);
    formData.append("max_bid", maxBid);

    formData.append("bid", qs("[name='bid']").value);
  } 
  // TRADE FIELDS
  else {
    formData.append("trade_item", qs("[name='trade_item']").value);
    formData.append("trade_value", qs("[name='trade_value']").value);
    formData.append("desired_barter_item", qs("[name='desired_barter_item']").value);
  }

  // Tags
  const selectedTags = [...qsa('.tag.selected')].map(t => t.textContent.trim());
  selectedTags.forEach((tag, i) => formData.append(`categories[${i}]`, tag));

  // Images
  imageUpload.querySelectorAll("input[type='file']").forEach(input => {
    if (input.files.length > 0) formData.append("images[]", input.files[0]);
  });

  // Submit to backend
  try {
    const res = await fetch("/PayBach/model/api/client/insert_listing.php", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      alert("Listing submitted!");
      window.location.href = "../../../model/api/client/homepage.php";
    } else {
      alert("Failed: " + data.message);
    }
  } catch (err) {
    alert("Server error: " + err.message);
  }
});