
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const barterId = params.get('barter_id') || '';
  const listingId = params.get('listing_id') || '';
  const goBackBtn = document.querySelector(".go-back");

  console.log('Trade item page loaded with:', { barterId, listingId });

  // Handle back button
  if (goBackBtn) {
    goBackBtn.addEventListener("click", (e) => {
      e.preventDefault();
      
      if (document.referrer && document.referrer !== window.location.href) {
        window.history.back();
      } else {
        window.location.href = "ongoing_trades.html";
      }
    });
  }

  // Initialize modals
  initModals();

  if (!barterId && !listingId) {
    showErrorState("Missing trade ID. Please select a trade.");
    return;
  }

  // We'll fetch data from trade_item.php when it's created
  console.log("Ready to fetch from trade_item.php with:", { barterId, listingId });
  
  // For now, show a message that backend is not ready
  showLoadingState();

});

// =============== MODAL FUNCTIONS ===============

function initModals() {
  const makeOfferModal = document.getElementById("makeOfferModal");
  const viewOffersModal = document.getElementById("viewOffersModal");
  
  if (!makeOfferModal || !viewOffersModal) return;
  
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
  
  // Submit offer button
  const submitBtn = document.getElementById('submit-offer');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitOffer);
  }
}

// =============== LOAD TRADE DATA ===============
// This will be implemented when trade_item.php is ready

async function loadTradeData(barterId, listingId) {
  try {
    showLoadingState();
    
    const requestData = new URLSearchParams();
    if (barterId) requestData.append('barter_id', barterId);
    if (listingId) requestData.append('listing_id', listingId);
    
    console.log('Fetching from trade_item.php...');
    
  
    
  } catch (error) {
    console.error('Failed to load trade:', error);
    showErrorState('Failed to load trade details. Please try again.');
  }
}
//loadTradeData(barterId, listingId)

// =============== RENDER FUNCTIONS ===============

let currentTrade = null;
let currentUserRole = null;
let existingOffers = [];

function renderTradeDetails() {
  if (!currentTrade) return;
  
  document.getElementById('trade-title').textContent = 
    `${currentTrade.offered_item_name} → ${currentTrade.listing_item_name || 'Trade Item'}`;
  
  // Offered Item
  document.getElementById('offered-item-name').textContent = currentTrade.offered_item_name;
  document.getElementById('offered-item-condition').textContent = currentTrade.offered_item_condition || 'N/A';
  document.getElementById('offered-item-description').textContent = currentTrade.offered_item_description || 'No description provided.';
  
  // Requested Item
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

function processTradeImages() {
  const offeredImage = document.getElementById('offered-item-image');
  const requestedImage = document.getElementById('requested-item-image');
  
  // These will be populated from trade_item.php
  offeredImage.onerror = () => {
    offeredImage.src = '../../images/default-item.png';
  };
  
  requestedImage.onerror = () => {
    requestedImage.src = '../../images/default-item.png';
  };
}

function processTradeTags() {
  const offeredTagsContainer = document.getElementById('offered-item-tags');
  const requestedTagsContainer = document.getElementById('requested-item-tags');
  
  offeredTagsContainer.innerHTML = '';
  requestedTagsContainer.innerHTML = '';
  
  // Add offered item tags
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
  
  // Add offered item condition as a tag
  const offeredConditionTag = document.createElement('span');
  offeredConditionTag.className = 'trade-tag';
  offeredConditionTag.textContent = currentTrade.offered_item_condition || 'Unknown';
  offeredTagsContainer.appendChild(offeredConditionTag);
  
  // Add requested item tags
  if (currentTrade.listing_tags) {
    try {
      const tags = JSON.parse(currentTrade.listing_tags);
      tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'trade-tag';
        tagElement.textContent = tag;
        requestedTagsContainer.appendChild(tagElement);
      });
    } catch (e) {
      console.log('Could not parse listing tags:', e);
    }
  }
  
  // Add requested item condition as a tag
  const requestedConditionTag = document.createElement('span');
  requestedConditionTag.className = 'trade-tag';
  requestedConditionTag.textContent = currentTrade.listing_item_condition || 'Unknown';
  requestedTagsContainer.appendChild(requestedConditionTag);
}

function updateStatusBadge() {
  const statusBadge = document.getElementById('trade-status');
  
  let statusText = 'Active';
  let statusClass = 'active';
  
  if (currentTrade.barter_status === 'completed' || currentTrade.is_active === 0) {
    statusText = 'Completed';
    statusClass = 'completed';
  } else if (existingOffers.length > 0) {
    statusText = 'Has Offers';
    statusClass = 'pending';
  }
  
  statusBadge.className = `trade-status-badge ${statusClass}`;
  statusBadge.innerHTML = `<span>●</span> ${statusText}`;
}

function renderActionButtons() {
  const actionsContainer = document.getElementById('trade-actions');
  if (!actionsContainer) return;
  
  actionsContainer.innerHTML = '';
  
  if (currentUserRole === 'owner') {
    // Owner actions
    if (existingOffers.length > 0) {
      const viewOffersBtn = document.createElement('button');
      viewOffersBtn.className = 'action-btn primary';
      viewOffersBtn.innerHTML = ` View Offers (${existingOffers.length})`;
      viewOffersBtn.addEventListener('click', () => showViewOffersModal());
      actionsContainer.appendChild(viewOffersBtn);
    }
    
    if (currentTrade.is_active === 1) {
      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'action-btn danger';
      cancelBtn.textContent = 'Cancel Trade';
      cancelBtn.addEventListener('click', () => cancelTrade());
      actionsContainer.appendChild(cancelBtn);
    }
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn success';
    completeBtn.textContent = 'Mark as Complete';
    completeBtn.disabled = existingOffers.filter(o => o.status === 'accepted').length === 0;
    completeBtn.title = existingOffers.filter(o => o.status === 'accepted').length > 0
      ? 'Complete this trade' 
      : 'You need to accept an offer first';
    completeBtn.addEventListener('click', () => completeTrade());
    actionsContainer.appendChild(completeBtn);
    
  } else {
    // Viewer (not owner)
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
  }
}

function renderExistingOffers() {
  const offersContainer = document.getElementById('existing-offers');
  const offersSection = document.getElementById('existing-offers-section');
  
  if (!offersContainer || !offersSection) return;
  
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
}

// =============== MODAL DISPLAY FUNCTIONS ===============

function showMakeOfferModal() {
  const modal = document.getElementById("makeOfferModal");
  if (!modal) return;
  
  // Reset form
  const itemName = document.getElementById('offer-item-name');
  const description = document.getElementById('offer-item-description');
  const condition = document.getElementById('offer-item-condition');
  const cash = document.getElementById('offer-additional-cash');
  const notes = document.getElementById('offer-notes');
  
  if (itemName) itemName.value = '';
  if (description) description.value = '';
  if (condition) condition.value = 'good';
  if (cash) cash.value = '0';
  if (notes) notes.value = '';
  
  modal.style.display = 'flex';
}

function showViewOffersModal() {
  const modal = document.getElementById("viewOffersModal");
  const offersList = document.getElementById('offers-list');
  
  if (!modal || !offersList) return;
  
  offersList.innerHTML = '';
  
  if (!existingOffers || existingOffers.length === 0) {
    offersList.innerHTML = `
      <div class="empty-offers">
        <p> No offers yet</p>
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
  `;
  
  return card;
}

// =============== ACTION FUNCTIONS ===============
// These will be implemented when backend is ready

async function submitOffer() {
  alert("Submit offer functionality will be implemented when backend is ready.");
}

async function cancelTrade() {
  if (!confirm('Cancel this trade?')) return;
  alert("Cancel trade functionality will be implemented when backend is ready.");
}

async function completeTrade() {
  if (!confirm('Mark this trade as completed?')) return;
  alert("Complete trade functionality will be implemented when backend is ready.");
}

// =============== UI HELPER FUNCTIONS ===============

function showLoadingState() {
  const main = document.querySelector('main');
  if (!main) return;
  
  main.innerHTML = `
    <div class="loading-trade">
      <div class="loading-spinner"></div>
      <p>Loading trade details...</p>
      <p><small>Backend API (trade_item.php) is not yet implemented</small></p>
    </div>
  `;
}

function showErrorState(message) {
  const main = document.querySelector('main');
  if (!main) return;
  
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