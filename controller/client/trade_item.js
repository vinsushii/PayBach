
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const barterId = params.get('barter_id') || '';
  const listingId = params.get('listing_id') || '';
  
  console.log('Trade item page loaded with:', { barterId, listingId });

  /*
  if (!barterId && !listingId) {
    alert("Missing trade ID. Redirecting to trades page.");
    window.location.href = "ongoing_trades.html";
    return;
  }*/
    

  //temporary 
  if (!barterId && !listingId && !window.location.href.includes('test')) {
  // Load demo data for testing
  console.log("Test mode: Loading demo data");
  await loadDemoData();
  initModals();
  return;
}

  // Initialize modals
  initModals();
  
  // Load trade data
  await loadTradeData(barterId, listingId);
});

// API Endpoints
const API_ENDPOINTS = {
  getTradeDetails: "/PayBach/model/api/client/get_trade_details.php",
  //getTradeOffers: "/PayBach/model/api/client/get_trade_offers.php",
  //submitOffer: "/PayBach/model/api/client/submit_offer.php",
  //respondToOffer: "/PayBach/model/api/client/respond_to_offer.php",
  completeTrade: "/PayBach/model/api/client/get_complete_trade.php",
  //cancelTrade: "/PayBach/model/api/client/cancel_trade.php"
};

// Global variables
let currentTrade = null;
let currentUserRole = null; // 'owner', 'viewer', 'offerer'
let existingOffers = [];

// Initialize modal functionality
function initModals() {
  // Make Offer Modal
  const makeOfferModal = document.getElementById("makeOfferModal");
  const viewOffersModal = document.getElementById("viewOffersModal");
  
  // Close buttons
  document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      makeOfferModal.style.display = 'none';
      viewOffersModal.style.display = 'none';
    });
  });
  
  // Close on outside click
  window.addEventListener('click', (e) => {
    if (e.target === makeOfferModal) makeOfferModal.style.display = 'none';
    if (e.target === viewOffersModal) viewOffersModal.style.display = 'none';
  });
}

// Load trade data from API
async function loadTradeData(barterId, listingId) {
  try {
    showLoadingState();
    
    // Build request data
    const requestData = new URLSearchParams();
    if (barterId) requestData.append('barter_id', barterId);
    if (listingId) requestData.append('listing_id', listingId);
    
    console.log('Fetching trade details with:', { barterId, listingId });
    
    const response = await fetch(API_ENDPOINTS.getTradeDetails, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Trade details response:', data);
    
    if (data.success && data.trade) {
      currentTrade = data.trade;
      existingOffers = data.offers || [];
      currentUserRole = data.user_role || 'viewer';
      
      renderTradeDetails();
      renderActionButtons();
      renderExistingOffers();
      
      // Load offers if user is owner
      if (currentUserRole === 'owner') {
        await loadTradeOffers();
      }
    } else {
      throw new Error(data.error || 'Trade not found');
    }
    
  } catch (error) {
    console.error('Failed to load trade:', error);
    showErrorState('Failed to load trade details. Please try again.');
  }
}

// Render trade details to the page
function renderTradeDetails() {
  if (!currentTrade) return;
  
  console.log('Rendering trade:', currentTrade);
  
  // Set page title
  document.getElementById('trade-title').textContent = 
    `${currentTrade.offered_item_name} → ${currentTrade.listing_item_name || 'Trade Item'}`;
  
  // Offered Item (Left Column)
  document.getElementById('offered-item-name').textContent = currentTrade.offered_item_name;
  document.getElementById('offered-item-condition').textContent = currentTrade.offered_item_condition || 'N/A';
  document.getElementById('offered-item-description').textContent = currentTrade.offered_item_description || 'No description provided.';
  
  // Requested Item (Right Column)
  document.getElementById('requested-item-name').textContent = currentTrade.listing_item_name || 'Trade Item';
  document.getElementById('requested-item-condition').textContent = currentTrade.listing_item_condition || 'N/A';
  document.getElementById('requested-item-description').textContent = currentTrade.listing_description || 'No description provided.';
  
  // Trade Meta Info
  document.getElementById('exchange-method').textContent = currentTrade.exchange_method || 'N/A';
  document.getElementById('payment-method').textContent = currentTrade.payment_method || 'N/A';
  document.getElementById('additional-cash').textContent = 
    currentTrade.max_additional_cash > 0 ? `₱${parseFloat(currentTrade.max_additional_cash).toFixed(2)}` : 'None';
  
  // Dates
  if (currentTrade.created_at) {
    const postDate = new Date(currentTrade.created_at);
    document.getElementById('posted-date').textContent = postDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (currentTrade.updated_at) {
    const updateDate = new Date(currentTrade.updated_at);
    document.getElementById('updated-date').textContent = updateDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Owner Info
  if (currentTrade.owner_name) {
    document.getElementById('owner-name').textContent = currentTrade.owner_name;
    document.getElementById('owner-email').textContent = currentTrade.owner_email || 'Email not available';
  }
  
  // Process images
  processTradeImages();
  
  // Process tags
  processTradeTags();
  
  // Update status badge
  updateStatusBadge();
}

// Process and display trade images
function processTradeImages() {
  // Offered item image
  const offeredImage = document.getElementById('offered-item-image');
  const requestedImage = document.getElementById('requested-item-image');
  
  // Check if trade has images
  if (currentTrade.images && currentTrade.images.length > 0) {
    const imagePath = processImagePath(currentTrade.images[0]);
    offeredImage.src = imagePath;
    requestedImage.src = imagePath; // Using same image for requested item (adjust as needed)
  }
  
  // Fallback for requested item if it has separate images
  if (currentTrade.listing_images && currentTrade.listing_images.length > 0) {
    const listingImagePath = processImagePath(currentTrade.listing_images[0]);
    requestedImage.src = listingImagePath;
  }
  
  // Add error handlers
  offeredImage.onerror = () => {
    offeredImage.src = '../../images/default-item.png';
  };
  
  requestedImage.onerror = () => {
    requestedImage.src = '../../images/default-item.png';
  };
}

// Process image path from database
function processImagePath(rawPath) {
  if (!rawPath) return '../../images/default-item.png';
  
  let cleanPath = rawPath.replace(/^(\.\.\/)+/, '');
  
  // If path contains uploads/, make it absolute
  if (cleanPath.includes('uploads/')) {
    const filename = cleanPath.split('/').pop();
    return `/PayBach/uploads/${filename}`;
  }
  
  // If it's just a filename
  return `/PayBach/uploads/${cleanPath}`;
}

// Process and display trade tags
function processTradeTags() {
  // Offered item tags
  const offeredTagsContainer = document.getElementById('offered-item-tags');
  const requestedTagsContainer = document.getElementById('requested-item-tags');
  
  offeredTagsContainer.innerHTML = '';
  requestedTagsContainer.innerHTML = '';
  
  // Add trade_tags if available
  if (currentTrade.trade_tags) {
    try {
      const tags = JSON.parse(currentTrade.trade_tags);
      tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'trade-tag';
        tagElement.textContent = tag;
        offeredTagsContainer.appendChild(tagElement);
      });
    } catch (e) {
      console.log('Could not parse trade tags:', e);
    }
  }
  
  // Add item condition as a tag
  const conditionTag = document.createElement('span');
  conditionTag.className = 'trade-tag';
  conditionTag.textContent = currentTrade.offered_item_condition || 'Unknown';
  offeredTagsContainer.appendChild(conditionTag);
}

// Update status badge based on trade state
function updateStatusBadge() {
  const statusBadge = document.getElementById('trade-status');
  const statusSpan = statusBadge.querySelector('span');
  
  let statusText = 'Active';
  let statusClass = 'active';
  let statusColor = '#2e7d32';
  
  if (currentTrade.barter_status === 'completed' || currentTrade.is_active === 0) {
    statusText = 'Completed';
    statusClass = 'completed';
    statusColor = '#7b1fa2';
  } else if (currentTrade.has_offers) {
    statusText = 'Has Offers';
    statusClass = 'pending';
    statusColor = '#ef6c00';
  }
  
  statusBadge.className = `trade-status-badge ${statusClass}`;
  statusBadge.textContent = `● ${statusText}`;
  statusSpan.style.color = statusColor;
}

// Render action buttons based on user role and trade state
function renderActionButtons() {
  const actionsContainer = document.getElementById('trade-actions');
  actionsContainer.innerHTML = '';
  
  if (currentUserRole === 'owner') {
    // Owner actions
    if (currentTrade.barter_status === 'has_offers' || existingOffers.length > 0) {
      // Has offers - can view and manage them
      const viewOffersBtn = document.createElement('button');
      viewOffersBtn.className = 'action-btn primary';
      viewOffersBtn.innerHTML = '📬 View Offers';
      viewOffersBtn.addEventListener('click', () => showViewOffersModal());
      actionsContainer.appendChild(viewOffersBtn);
    }
    
    if (currentTrade.is_active === 1) {
      // Trade is active - can cancel
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'action-btn danger';
      cancelBtn.textContent = 'Cancel Trade';
      cancelBtn.addEventListener('click', () => cancelTrade());
      actionsContainer.appendChild(cancelBtn);
    }
    
    // Always show complete button (but might be disabled)
    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn success';
    completeBtn.textContent = 'Mark as Complete';
    completeBtn.disabled = !currentTrade.has_accepted_offer;
    completeBtn.title = currentTrade.has_accepted_offer 
      ? 'Complete this trade' 
      : 'You need to accept an offer first';
    completeBtn.addEventListener('click', () => completeTrade());
    actionsContainer.appendChild(completeBtn);
    
  } else if (currentUserRole === 'viewer') {
    // Viewer (not owner, hasn't made an offer)
    if (currentTrade.is_active === 1) {
      const makeOfferBtn = document.createElement('button');
      makeOfferBtn.className = 'action-btn primary';
      makeOfferBtn.textContent = 'Make an Offer';
      makeOfferBtn.addEventListener('click', () => showMakeOfferModal());
      actionsContainer.appendChild(makeOfferBtn);
    } else {
      const inactiveMsg = document.createElement('p');
      inactiveMsg.className = 'trade-inactive';
      inactiveMsg.textContent = 'This trade is no longer active';
      actionsContainer.appendChild(inactiveMsg);
    }
    
  } else if (currentUserRole === 'offerer') {
    // User has already made an offer
    const offerStatus = currentTrade.user_offer_status || 'pending';
    
    const statusMsg = document.createElement('div');
    statusMsg.className = 'offer-status-message';
    
    if (offerStatus === 'pending') {
      statusMsg.innerHTML = `
        <p> Your offer is pending review</p>
        <p><small>The trade owner will review your offer soon</small></p>
      `;
    } else if (offerStatus === 'accepted') {
      statusMsg.innerHTML = `
        <p> Your offer was accepted!</p>
        <p><small>Contact the owner to complete the trade</small></p>
      `;
    } else if (offerStatus === 'rejected') {
      statusMsg.innerHTML = `
        <p> Your offer was not accepted</p>
        <p><small>Feel free to browse other trades</small></p>
      `;
    }
    
    actionsContainer.appendChild(statusMsg);
  }
}

// Render existing offers in the sidebar
function renderExistingOffers() {
  const offersContainer = document.getElementById('existing-offers');
  const offersSection = document.getElementById('existing-offers-section');
  
  if (!existingOffers || existingOffers.length === 0) {
    offersSection.style.display = 'none';
    return;
  }
  
  offersSection.style.display = 'block';
  offersContainer.innerHTML = '';
  
  // Show only first 3 offers in sidebar
  const displayOffers = existingOffers.slice(0, 3);
  
  displayOffers.forEach(offer => {
    const offerElement = document.createElement('div');
    offerElement.className = 'offer-item';
    
    const condition = offer.offered_item_condition || 'N/A';
    const cash = offer.additional_cash > 0 ? `+₱${offer.additional_cash}` : '';
    
    offerElement.innerHTML = `
      <h5>${offer.offered_item_name || 'Unnamed Item'}</h5>
      <p>Condition: ${condition}</p>
      ${cash ? `<p>Additional: ${cash}</p>` : ''}
      <p><small>Status: ${offer.status}</small></p>
    `;
    
    offersContainer.appendChild(offerElement);
  });
  
  // Show "view more" if there are more offers
  if (existingOffers.length > 3 && currentUserRole === 'owner') {
    const viewMore = document.createElement('div');
    viewMore.className = 'view-more-offers';
    viewMore.innerHTML = `<p><small>+${existingOffers.length - 3} more offers</small></p>`;
    viewMore.addEventListener('click', () => showViewOffersModal());
    offersContainer.appendChild(viewMore);
  }
}

// Load detailed offers for the trade
async function loadTradeOffers() {
  try {
    const response = await fetch(API_ENDPOINTS.getTradeOffers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `barter_id=${currentTrade.barter_id}`
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        existingOffers = data.offers || [];
        renderExistingOffers();
      }
    }
  } catch (error) {
    console.error('Failed to load offers:', error);
  }
}

// Show make offer modal
function showMakeOfferModal() {
  const modal = document.getElementById('makeOfferModal');
  
  // Reset form
  document.getElementById('offer-item-name').value = '';
  document.getElementById('offer-item-description').value = '';
  document.getElementById('offer-item-condition').value = 'good';
  document.getElementById('offer-additional-cash').value = '0';
  document.getElementById('offer-notes').value = '';
  
  // Set up submit handler
  const submitBtn = document.getElementById('submit-offer');
  submitBtn.onclick = submitOffer;
  
  modal.style.display = 'flex';
}

// Submit offer to API
async function submitOffer() {
  const itemName = document.getElementById('offer-item-name').value.trim();
  const description = document.getElementById('offer-item-description').value.trim();
  const condition = document.getElementById('offer-item-condition').value;
  const additionalCash = document.getElementById('offer-additional-cash').value;
  const notes = document.getElementById('offer-notes').value.trim();
  
  if (!itemName) {
    alert('Please enter an item name');
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.submitOffer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        barter_id: currentTrade.barter_id,
        item_name: itemName,
        description: description,
        condition: condition,
        additional_cash: additionalCash,
        notes: notes
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(' Offer submitted successfully!');
      document.getElementById('makeOfferModal').style.display = 'none';
      
      // Update UI
      currentUserRole = 'offerer';
      renderActionButtons();
      
      // Refresh offers if owner views the page
      if (currentUserRole === 'owner') {
        await loadTradeOffers();
      }
    } else {
      alert(`Failed to submit offer: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Submit offer error:', error);
    alert('Network error. Please try again.');
  }
}

// Show view offers modal
function showViewOffersModal() {
  const modal = document.getElementById('viewOffersModal');
  const offersList = document.getElementById('offers-list');
  
  offersList.innerHTML = '';
  
  if (!existingOffers || existingOffers.length === 0) {
    offersList.innerHTML = `
      <div class="empty-offers">
        <p>📭 No offers yet</p>
        <p>Share this trade to get more offers!</p>
      </div>
    `;
  } else {
    existingOffers.forEach(offer => {
      const offerCard = createOfferCard(offer);
      offersList.appendChild(offerCard);
    });
  }
  
  modal.style.display = 'flex';
}

// Create offer card for modal
function createOfferCard(offer) {
  const card = document.createElement('div');
  card.className = `offer-card ${offer.status}`;
  
  const condition = offer.offered_item_condition || 'N/A';
  const cash = offer.additional_cash > 0 ? `+₱${offer.additional_cash}` : '';
  const date = new Date(offer.created_at).toLocaleDateString();
  
  card.innerHTML = `
    <h4>
      ${offer.offered_item_name || 'Unnamed Item'}
      <span class="offer-status ${offer.status}">${offer.status.toUpperCase()}</span>
    </h4>
    
    <div class="offer-details">
      <p><strong>Description:</strong> ${offer.description || 'No description'}</p>
      <p><strong>Condition:</strong> ${condition}</p>
      ${cash ? `<p><strong>Additional Cash:</strong> ${cash}</p>` : ''}
      ${offer.notes ? `<p><strong>Notes:</strong> ${offer.notes}</p>` : ''}
      <p><small>Offered on: ${date}</small></p>
      ${offer.offerer_name ? `<p><small>From: ${offer.offerer_name}</small></p>` : ''}
      ${offer.offerer_email ? `<p><small>Email: ${offer.offerer_email}</small></p>` : ''}
    </div>
    
    ${offer.status === 'pending' && currentUserRole === 'owner' ? `
      <div class="offer-actions">
        <button class="action-small-btn accept" data-offer-id="${offer.offer_id}">Accept</button>
        <button class="action-small-btn reject" data-offer-id="${offer.offer_id}">Reject</button>
      </div>
    ` : ''}
  `;
  
  // Add event listeners for action buttons
  if (offer.status === 'pending' && currentUserRole === 'owner') {
    const acceptBtn = card.querySelector('.accept');
    const rejectBtn = card.querySelector('.reject');
    
    acceptBtn.addEventListener('click', () => respondToOffer(offer.offer_id, 'accept'));
    rejectBtn.addEventListener('click', () => respondToOffer(offer.offer_id, 'reject'));
  }
  
  return card;
}

// Respond to an offer (accept/reject)
async function respondToOffer(offerId, action) {
  if (!confirm(`Are you sure you want to ${action} this offer?`)) {
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.respondToOffer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        offer_id: offerId,
        action: action
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(` Offer ${action}ed successfully!`);
      
      // Refresh the page to update status
      await loadTradeData(currentTrade.barter_id, currentTrade.listing_id);
      
      // Close modal
      document.getElementById('viewOffersModal').style.display = 'none';
    } else {
      alert(`Failed to ${action} offer: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error(`Respond to offer error:`, error);
    alert('Network error. Please try again.');
  }
}

// Complete trade
async function completeTrade() {
  if (!confirm('Mark this trade as completed? This cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.completeTrade, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        barter_id: currentTrade.barter_id
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(' Trade marked as completed!');
      window.location.reload();
    } else {
      alert(`Failed to complete trade: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Complete trade error:', error);
    alert('Network error. Please try again.');
  }
}

// Cancel trade
async function cancelTrade() {
  if (!confirm('Cancel this trade? All offers will be declined.')) {
    return;
  }
  
  try {
    const response = await fetch(API_ENDPOINTS.cancelTrade, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        barter_id: currentTrade.barter_id
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(' Trade cancelled!');
      window.location.href = 'ongoing_trades.html';
    } else {
      alert(`Failed to cancel trade: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Cancel trade error:', error);
    alert('Network error. Please try again.');
  }
}

// Helper functions
function showLoadingState() {
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="loading-trade">
      <div class="loading-spinner"></div>
      <p>Loading trade details...</p>
    </div>
  `;
}

function showErrorState(message) {
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="loading-trade">
      <p style="color: #dc3545; font-size: 18px;"> Error</p>
      <p>${message}</p>
      <button onclick="window.location.href='ongoing_trades.html'" 
              class="action-btn primary" 
              style="margin-top: 20px;">
        Back to Trades
      </button>
    </div>
  `;
}

// Update ongoing_trades.js to link to this page
// Add this to ongoing_trades.js in the viewTradeDetails function:
function viewTradeDetails(tradeId, type) {
  // Redirect to trade item page instead of alert
  window.location.href = `trade_item.html?barter_id=${tradeId}&type=${type}`;
}