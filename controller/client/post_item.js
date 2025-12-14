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
    alert("All bid fields must be filled. Whitespaces are not allowed.");
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

  // Validate required basic fields
  const itemName = qs("[name='item_name']").value.trim();
  const condition = qs("[name='condition']").value.trim();
  const description = qs("[name='description']").value.trim();
  const exchangeMethod = qs("[name='exchange_method']").value.trim();

  if (!itemName || !condition || !description || !exchangeMethod) {
    alert("Item Name, Condition, Description, and Exchange Method are required.");
    return;
  }

  // Validate tags
  const selectedTags = [...qsa('.tag.selected')].map(t => t.textContent.trim());
  if (selectedTags.length === 0) {
    alert("Please select at least one tag/category.");
    return;
  }

  // Validate images
  const imageInputs = imageUpload.querySelectorAll("input[type='file']");
  let hasImage = false;
  imageInputs.forEach(input => {
    if (input.files.length > 0) {
      hasImage = true;
    }
  });
  
  if (!hasImage) {
    alert("Please upload at least one image.");
    return;
  }

  const formData = new FormData();

  // Basic Data
  formData.append("item_name", itemName);
  formData.append("condition", condition);
  formData.append("description", description);
  formData.append("exchange_method", exchangeMethod);
  formData.append("payment_method", selectedPayment);

  // ALWAYS bid for this form (no type selection needed)
  formData.append("listing_type", "bid");

  // BID FIELDS
  formData.append("item_price", itemPrice);
  formData.append("max_price", maxPrice);
  formData.append("max_bid", maxBid);
  formData.append("bid", startingBid);

  // Tags
  selectedTags.forEach((tag, i) => formData.append(`categories[${i}]`, tag));

  // Images
  imageInputs.forEach(input => {
    if (input.files.length > 0) {
      formData.append("images[]", input.files[0]);
    }
  });

  console.log("FormData contents:");
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  // Submit to backend
  try {
    console.log("Submitting to server...");
    const res = await fetch("/PayBach/model/api/client/insert_listing.php", {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", res.status);
    
    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      console.error("Server returned non-JSON:", text.substring(0, 200));
      alert("Server error - check console for details");
      return;
    }

    const data = await res.json();
    console.log("Server response:", data);

    if (data.success) {
      alert(data.message || "Listing submitted successfully!");
      window.location.href = "/PayBach/views/pages/client/homepage.html";
    } else {
      alert("Failed: " + data.message);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Server error: " + err.message);
  }
});