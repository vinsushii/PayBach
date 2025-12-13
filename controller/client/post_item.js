// ====================
// SAFE QUERY HELPER
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

  const formData = new FormData();

  // Basic data
  formData.append("item_name", qs("[name='item_name']").value);
  formData.append("condition", qs("[name='condition']").value);
  formData.append("description", qs("[name='description']").value);
  formData.append("exchange_method", qs("[name='exchange_method']").value);
  formData.append("payment_method", selectedPayment);

  // Type of listing
  formData.append("listing_type", listingType);

  if (listingType === "bid") {
    formData.append("bid", qs("[name='bid']").value);
  } else {
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

  console.log("Data added to formData object.")

  // Submit to backend (FIXED PATH)
  try {
    const res = fetch("/PayBach/model/api/client/insert_listing.php", {
      method: "POST",
      body: formData,
    })

    console.log("Fetch insert_listing.php successful")
    console.log(res)
    const data = res.json();

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
