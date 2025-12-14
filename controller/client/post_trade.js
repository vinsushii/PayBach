// post_trade.js - Controller for posting trade items
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const form = document.getElementById('postTradeForm');
    const imageInput = document.querySelector('input[name="images[]"]');
    const imagePreview = document.getElementById('imagePreview');
    const paymentBtns = document.querySelectorAll('.payment-btn');
    const paymentMethodInput = document.getElementById('payment_method');
    const tagButtons = document.querySelectorAll('.tag-selection .tag');
    const categoriesInput = document.getElementById('categoriesInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagInput = document.getElementById('tagInput');
    const requestedTags = document.getElementById('requestedTags');
    const tradeTagsInput = document.getElementById('tradeTagsInput');

    // Store selected categories and tags
    let selectedCategories = [];
    let selectedTradeTags = [];

    // ========================
    // 1. PAYMENT BUTTONS HANDLING
    // ========================
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            paymentBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            paymentMethodInput.value = this.dataset.type;
        });
    });

    // ========================
    // 2. CATEGORY SELECTION
    // ========================
    tagButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;
            const index = selectedCategories.indexOf(category);
            
            if (index === -1) {
                // Add category
                selectedCategories.push(category);
                this.classList.add('selected');
            } else {
                // Remove category
                selectedCategories.splice(index, 1);
                this.classList.remove('selected');
            }
            
            // Update hidden input
            categoriesInput.value = JSON.stringify(selectedCategories);
        });
    });

    // ========================
    // 3. TRADE TAGS MANAGEMENT
    // ========================
    addTagBtn.addEventListener('click', function () {
        addTradeTag();
    });

    tagInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTradeTag();
        }
    });

    function addTradeTag() {
        const tag = tagInput.value.trim();
        if (tag && !selectedTradeTags.includes(tag.toLowerCase())) {
            selectedTradeTags.push(tag.toLowerCase());
            updateTradeTagsDisplay();
            tagInput.value = '';
        }
    }

    function updateTradeTagsDisplay() {
        requestedTags.innerHTML = '';
        selectedTradeTags.forEach((tag, index) => {
            const tagElement = document.createElement('div');
            tagElement.className = 'item-tag';
            tagElement.innerHTML = `
                ${tag}
                <button type="button" class="remove-tag" data-index="${index}">×</button>
            `;
            requestedTags.appendChild(tagElement);
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', function () {
                const index = parseInt(this.getAttribute('data-index'));
                selectedTradeTags.splice(index, 1);
                updateTradeTagsDisplay();
            });
        });

        // Update hidden input
        tradeTagsInput.value = JSON.stringify(selectedTradeTags);
    }

    // ========================
    // 4. IMAGE PREVIEW HANDLING
    // ========================
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function (event) {
            imagePreview.innerHTML = '';
            const files = event.target.files;
            
            if (files.length > 0) {
                for (let i = 0; i < Math.min(files.length, 5); i++) {
                    const file = files[i];
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const imgContainer = document.createElement('div');
                            imgContainer.className = 'image-preview-item';
                            imgContainer.innerHTML = `
                                <img src="${e.target.result}" alt="Preview ${i + 1}">
                                <span class="image-index">${i + 1}</span>
                            `;
                            imagePreview.appendChild(imgContainer);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            } else {
                imagePreview.innerHTML = '<p class="no-images">No images selected</p>';
            }
        });
    }

    // ========================
    // 5. FORM VALIDATION & SUBMISSION
    // ========================
    if (form) {
        form.addEventListener('submit', async function (event) {
            event.preventDefault();

            // Basic validation
            const itemName = document.getElementById('item_name').value.trim();
            const condition = document.getElementById('condition').value;
            const description = document.getElementById('description').value.trim();
            const requestedItems = document.getElementById('requested_items').value.trim();
            const exchangeMethod = document.getElementById('exchange_method').value;
            const images = imageInput.files;

            if (!itemName) {
                alert('Please enter an item name.');
                return;
            }
            if (!condition) {
                alert('Please select the item condition.');
                return;
            }
            if (!description) {
                alert('Please enter a description.');
                return;
            }
            if (!requestedItems) {
                alert('Please describe what you are looking for in trade.');
                return;
            }
            if (!exchangeMethod) {
                alert('Please select an exchange method.');
                return;
            }
            if (selectedCategories.length === 0) {
                alert('Please select at least one category.');
                return;
            }
            if (!images || images.length === 0) {
                alert('Please upload at least one image.');
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            
            // Add categories as array
            selectedCategories.forEach(cat => {
                formData.append('categories[]', cat);
            });

            // Add trade tags
            formData.append('trade_tags', JSON.stringify(selectedTradeTags));

            try {
                const submitBtn = form.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Posting...';

                const response = await fetch('/PayBach/model/api/client/insert_listing.php', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    alert('Trade item posted successfully!');
                    window.location.href = '/PayBach/views/pages/client/homepage.html';
                } else {
                    alert('Error: ' + (result.message || 'Failed to post trade item.'));
                }
            } catch (error) {
                console.error('Error posting trade:', error);
                alert('Network error. Please try again.');
            } finally {
                const submitBtn = form.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post Trade Item';
            }
        });
    }
    // ========================
    // 6. PRICE INPUT VALIDATION
    // ========================
    const maxPriceInput = document.getElementById('max_price');
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', function () {
            let value = this.value;
            // Allow only numbers and two decimal places
            value = value.replace(/[^\d.]/g, '');
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + '.' + parts[1].substring(0, 2);
            }
            this.value = value;
        });
    }
});