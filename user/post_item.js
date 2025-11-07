// ====================
// UI Click Handlers
// ====================

// Payment button toggle
const paymentButtons = document.querySelectorAll('.payment-btn');
let selectedPayment = null;

paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    paymentButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPayment = btn.dataset.type;
  });
});

// Tag selection (multiple)
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('selected');
  });
});

// Add new image input
const addImageBtn = document.getElementById('add-image-btn');
const imageUpload = document.getElementById('image-upload');

addImageBtn.addEventListener('click', () => {
  const inputs = imageUpload.querySelectorAll('input[type="file"]');
  const lastInput = inputs[inputs.length - 1];

  if (lastInput && !lastInput.value) {
    alert('Upload the previous image first.');
    return;
  }

  const newInput = document.createElement('input');
  newInput.type = 'file';
  newInput.name = 'images[]';
  newInput.accept = 'image/*';
  imageUpload.appendChild(newInput);
});

// ====================
// Form Submit Handler
// ====================
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemName     = document.querySelector("[name='item_name']").value;
  const condition    = document.querySelector("[name='condition']").value;
  const description  = document.querySelector("[name='description']").value;
  const meetup       = document.querySelector("[name='meetup']").value;
  const bid          = document.querySelector("[name='bid']").value;

  const selectedTags = Array.from(document.querySelectorAll('.tag.selected'))
                            .map(tag => tag.textContent.trim());

  const user_idnum = localStorage.getItem("user_idnum") || "2241389";

  // Build FormData instead of JSON
  const formData = new FormData();
  formData.append("user_idnum", user_idnum);
  formData.append("quantity", parseInt(bid) || 1);
  formData.append("start_date", new Date().toISOString().slice(0,19).replace("T"," "));
  formData.append("end_date", new Date().toISOString().slice(0,19).replace("T"," "));
  formData.append("description", description);
  formData.append("exchange_method", meetup);
  formData.append("payment_method", selectedPayment ?? "onsite");

  // Items
  formData.append("items[0][name]", itemName);
  formData.append("items[0][item_condition]", condition);

  // Categories
  selectedTags.forEach((tag, i) => {
    formData.append(`categories[${i}]`, tag);
  });

  // Images
  document.querySelectorAll("#image-upload input[type='file']").forEach((input, i) => {
    if (input.files[0]) {
      formData.append(`images[]`, input.files[0]);
    }
  });

  try {
    const res = await fetch("../database/insert_listing.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    console.log("Response:", data);

    if (data.success) {
      alert("Listing successfully submitted!");
      window.location.href = "../user/homepage.php";
    } else {
      alert("Failed to submit listing.\n" + (data.error || data.message));
    }

  } catch (err) {
    console.error("Fetch error:", err);
    alert("Server error: " + err.message);
  }
});
