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

    selectedPayment = btn.dataset.type;    // <-- save payment type
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


document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const condition     = document.querySelector("[name='condition']").value;
  const description   = document.querySelector("[name='description']").value;
  const meetup        = document.querySelector("[name='meetup']").value;
  const bid           = document.querySelector("[name='bid']").value;

  const selectedTags = Array.from(document.querySelectorAll('.tag.selected'))
                            .map(tag => tag.textContent.trim());


  const user_idnum = localStorage.getItem("user_idnum") || "2241389"; // fallback for testing

  const payload = {
    user_idnum: user_idnum,
    quantity: 1,
    start_date: new Date().toISOString().slice(0,19).replace("T"," "),
    end_date:   new Date().toISOString().slice(0,19).replace("T"," "),
    description: description,
    exchange_method: meetup,
    payment_method: selectedPayment ?? "onsite",
    
    // listing_items table
    items: [
      {
        name: "Item",
        item_condition: condition
      }
    ],

    categories: selectedTags
  };

  console.log("→ sending payload:", payload);

 try {
  const res = await fetch("../database/insert_listing.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

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
