// Payment button toggle
const paymentButtons = document.querySelectorAll('.payment-btn');
paymentButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    paymentButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Tag selection (multiple)
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
  tag.addEventListener('click', () => {
    tag.classList.toggle('selected');
  });
});

// Image upload control
const addImageBtn = document.getElementById('add-image-btn');
const imageUpload = document.getElementById('image-upload');

addImageBtn.addEventListener('click', () => {
  const inputs = imageUpload.querySelectorAll('input[type="file"]');
  const lastInput = inputs[inputs.length - 1];

  if (lastInput && !lastInput.value) {
    alert('Please upload an image first before adding another field.');
    return;
  }

  const newInput = document.createElement('input');
  newInput.type = 'file';
  newInput.name = 'images[]';
  newInput.accept = 'image/*';
  imageUpload.appendChild(newInput);
});