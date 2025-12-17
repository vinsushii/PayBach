document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const barterId = params.get('barter_id') || '';
  
  console.log('Trade item page loaded with barter_id:', barterId);

  if (!barterId) {
    alert("Missing trade ID. Redirecting to trades page.");
    window.location.href = "ongoing_trades.html";
    return;
  }

  // Initialize modals
  initModals();
  
  // Load trade data from backend
  await loadTradeData(barterId);
});

// API Endpoints
const API_ENDPOINTS = {
  getTradeDetails: "/PayBach/model/api/client/trade_item.php",
};

// Global variables
let currentTrade = null;
let currentUserRole = null;
let existingOffers = [];

// Initialize modal functionality
function initModals() {
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

// Load trade data from backend API
async function loadTradeData(barterId) {
  try {
    console.log('Fetching trade details for barter_id:', barterId);
    
    const response = await fetch(`${API_ENDPOINTS.getTradeDetails}?barter_id=${barterId}`);
    
    console.log('Response status:', response.status);
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      throw new Error('Invalid JSON response: ' + text.substring(0, 100));
    }
    
    console.log('Parsed data:', data);
    
    if (data.success && data.trade) {
      currentTrade = data.trade;
      existingOffers = data.offers || [];
      currentUserRole = data.user_role || 'viewer';
      currentUserIdnum = data.current_user_id; // Store current user ID
      
      // Log the perspective
      console.log('Current user role:', currentUserRole);
      console.log('Current user ID:', currentUserIdnum);
      console.log('Trade data for this perspective:', currentTrade);
      
      // Hide loading state, show content
      const loadingState = document.getElementById('loading-state');
      const tradeContent = document.getElementById('trade-content');
      
      if (loadingState && tradeContent) {
        loadingState.style.display = 'none';
        tradeContent.style.display = 'flex';
      }
      
      renderTradeDetails();
      renderActionButtons();
      renderExistingOffers();
    } else {
      throw new Error(data.error || data.message || 'Trade not found');
    }
    
  } catch (error) {
    console.error('Failed to load trade:', error);
    showErrorState('Failed to load trade details: ' + error.message);
  }
}

// Render trade details to the page
function renderTradeDetails() {
  if (!currentTrade) return;
  
  console.log('Rendering trade from perspective:', currentUserRole);
  console.log('Trade data:', currentTrade);
  
  // Set page title based on perspective
  const tradeTitle = document.getElementById('trade-title');
  if (tradeTitle) {
    if (currentUserRole === 'offerer') {
      // For offerer: show "Your Offer → owner's item"
      const lookingForName = currentTrade.listing_item_name || currentTrade.requested_items_text || 'Trade Item';
      tradeTitle.textContent = `${currentTrade.offered_item_name} → ${lookingForName}`;
    } else {
      // For owner/viewer: show "Owner's Item → What owner wants"
      const lookingForName = currentTrade.requested_items_text || currentTrade.listing_description || 'Trade Item';
      tradeTitle.textContent = `${currentTrade.offered_item_name} → ${lookingForName}`;
    }
  }
  
  // Offered Item - depends on perspective
  setElementText('offered-item-name', currentTrade.offered_item_name);
  setElementText('offered-item-condition', currentTrade.offered_item_condition || 'N/A');
  setElementText('offered-item-description', currentTrade.offered_item_description || 'No description provided.');
  
  // Requested Item - depends on perspective
  if (currentUserRole === 'offerer') {
    // For offerer: Looking for the owner's item
    const lookingForName = currentTrade.listing_item_name || currentTrade.requested_items_text || 'Trade Item';
    setElementText('requested-item-name', lookingForName);
    setElementText('requested-item-condition', currentTrade.listing_item_condition || 'N/A');
    setElementText('requested-item-description', currentTrade.listing_description || currentTrade.offered_item_description || 'No description provided.');
  } else {
    // For owner/viewer: Looking for what the owner requested
    const lookingForName = currentTrade.requested_items_text || currentTrade.listing_description || 'Trade Item';
    setElementText('requested-item-name', lookingForName);
    setElementText('requested-item-condition', currentTrade.listing_item_condition || 'N/A');
    
    // Use requested_items_text or listing_description for description
    const requestedText = currentTrade.requested_items_text || currentTrade.listing_description || 'No description provided.';
    setElementText('requested-item-description', requestedText);
  }

  // Trade Meta Info
  setElementText('exchange-method', currentTrade.exchange_method || 'N/A');
  setElementText('payment-method', currentTrade.payment_method || 'N/A');
  setElementText('additional-cash', 
    currentTrade.max_additional_cash > 0 ? `₱${parseFloat(currentTrade.max_additional_cash).toFixed(2)}` : 'None');
  
  // Dates
  if (currentTrade.created_at) {
    const postDate = new Date(currentTrade.created_at);
    setElementText('posted-date', postDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }));
  }
  
  if (currentTrade.updated_at) {
    const updateDate = new Date(currentTrade.updated_at);
    setElementText('updated-date', updateDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }));
  }
  
  // Owner Info 
  if (currentTrade.owner_name) {
    setElementText('owner-name', currentTrade.owner_name);
    setElementText('owner-email', currentTrade.owner_email || 'Email not available');
  }
  
  // Show accepted by info if available
  const acceptedByInfo = document.getElementById('accepted-by-info');
  const acceptedByName = document.getElementById('accepted-by-name');
  const acceptedByEmail = document.getElementById('accepted-by-email');

  if (currentTrade.accepted_by_name || currentTrade.accepted_by_email) {
      acceptedByInfo.style.display = 'block';
      if (currentTrade.accepted_by_name) {
          acceptedByName.textContent = currentTrade.accepted_by_name;
      }
      if (currentTrade.accepted_by_email) {
          acceptedByEmail.textContent = currentTrade.accepted_by_email;
      }
  } else {
      acceptedByInfo.style.display = 'none';
  }
  
  // Process images
  processTradeImages();
  
  // Process tags
  processTradeTags();
  
  // Update status badge
  updateStatusBadge();
}

// Helper function to safely set element text
function setElementText(id, text) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = text;
  }
}

// Process and display trade images
function processTradeImages() {
  const offeredImage = document.getElementById('offered-item-image');
  const requestedImage = document.getElementById('requested-item-image');
  
  if (!offeredImage || !requestedImage) return;
  
  // Reset both images to default first
  offeredImage.src = '../../images/default-item.png';
  requestedImage.src = '../../images/default-item.png';
  
  if (currentUserRole === 'offerer') {
    // For offerer: 
    // - Offered image = user's offer image
    // - Requested image = owner's item image
    
    // Offered item image (user's offer)
    if (currentTrade.offered_images && currentTrade.offered_images.length > 0) {
      const imagePath = processImagePath(currentTrade.offered_images[0]);
      offeredImage.src = imagePath;
    }
    
    // Requested item image (owner's item)
    if (currentTrade.listing_images && currentTrade.listing_images.length > 0) {
      const imagePath = processImagePath(currentTrade.listing_images[0]);
      requestedImage.src = imagePath;
    } else if (currentTrade.accepted_offer_image) {
      // Fallback to accepted offer image if available
      const imagePath = processImagePath(currentTrade.accepted_offer_image);
      requestedImage.src = imagePath;
    }
    
  } else {
    // For owner/viewer:
    // - Offered image = owner's item image
    // - Requested image = accepted offer image OR listing image
    
    // Offered item image (owner's item)
    if (currentTrade.offered_images && currentTrade.offered_images.length > 0) {
      const imagePath = processImagePath(currentTrade.offered_images[0]);
      offeredImage.src = imagePath;
    }
    
    // Requested item image
    // First check if there's an accepted offer image
    if (currentTrade.accepted_offer_image) {
      const imagePath = processImagePath(currentTrade.accepted_offer_image);
      requestedImage.src = imagePath;
    }
    // Then check for listing images
    else if (currentTrade.listing_images && currentTrade.listing_images.length > 0) {
      const imagePath = processImagePath(currentTrade.listing_images[0]);
      requestedImage.src = imagePath;
    }
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
  
  // If it's already a full URL or path, return as is
  if (rawPath.startsWith('http') || rawPath.startsWith('/')) {
    return rawPath;
  }
  
  let cleanPath = rawPath.replace(/^(\.\.\/)+/, '');
  
  // Check if path contains uploads/offer_images/ (for offer images)
  if (cleanPath.includes('uploads/offer_images/')) {
    // It's an offer image, return full path
    return `/PayBach/${cleanPath}`;
  }
  
  // Check if path contains uploads/ (for regular listing images)
  if (cleanPath.includes('uploads/')) {
    // Extract just the filename
    const filename = cleanPath.split('/').pop();
    return `/PayBach/uploads/${filename}`;
  }
  
  return `/PayBach/uploads/${cleanPath}`;
}

// Process and display trade tags
function processTradeTags() {
  const offeredTagsContainer = document.getElementById('offered-item-tags');
  const requestedTagsContainer = document.getElementById('requested-item-tags');
  
  if (!offeredTagsContainer || !requestedTagsContainer) return;
  
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
  if (currentTrade.offered_item_condition) {
    const conditionTag = document.createElement('span');
    conditionTag.className = 'trade-tag';
    conditionTag.textContent = currentTrade.offered_item_condition;
    offeredTagsContainer.appendChild(conditionTag);
  }
}

// status badge based on trade state
function updateStatusBadge() {
  const statusBadge = document.getElementById('trade-status');
  
  if (!statusBadge || !currentTrade) return;
  
  let statusText = 'Active';
  let statusClass = 'active';
  
  // Use the database status 
  if (currentTrade.status) {
    switch(currentTrade.status) {
      case 'completed':
        statusText = 'Completed';
        statusClass = 'completed';
        break;
      case 'canceled':
        statusText = 'Canceled';
        statusClass = 'canceled';
        break;
      case 'accepted':
        statusText = 'Accepted';
        statusClass = 'accepted';
        break;
      case 'active':
      default:
        // For active trades, check if they have offers
        if (currentTrade.barter_status === 'has_offers') {
          statusText = 'Has Offers';
          statusClass = 'pending';
        } else {
          statusText = 'Active';
          statusClass = 'active';
        }
    }
  } else {
    // Fallback to old logic
    switch(currentTrade.barter_status) {
      case 'completed':
        statusText = 'Completed';
        statusClass = 'completed';
        break;
      case 'has_offers':
        statusText = 'Has Offers';
        statusClass = 'pending';
        break;
      case 'accepted':
        statusText = 'Accepted';
        statusClass = 'pending';
        break;
      default:
        statusText = 'Active';
        statusClass = 'active';
    }
  }
  
  statusBadge.className = `trade-status-badge ${statusClass}`;
  statusBadge.innerHTML = `<span>●</span> ${statusText}`;
}

// Render action buttons based on user role and trade state
function renderActionButtons() {
  const actionsContainer = document.getElementById('trade-actions');
  if (!actionsContainer) return;
  
  actionsContainer.innerHTML = '';
  
  if (currentUserRole === 'owner') {

    // OWNER ACTIONS
    if (currentTrade.status === 'completed' || currentTrade.status === 'canceled') {
      // Trade is already completed or canceled
      const statusMsg = document.createElement('div');
      statusMsg.className = 'trade-status-message';
      if (currentTrade.status === 'completed') {
        statusMsg.innerHTML = `
          <p>✓ Trade Completed</p>
          <p><small>Trade has been successfully completed</small></p>
        `;
      } else {
        statusMsg.innerHTML = `
          <p>✗ Trade Canceled</p>
          <p><small>Trade has been canceled</small></p>
        `;
      }
      actionsContainer.appendChild(statusMsg);
    } else {
      // Trade is active or accepted - show owner buttons
      
      // 1. View Offers button 
      if (existingOffers && existingOffers.length > 0) {
        const viewOffersBtn = document.createElement('button');
        viewOffersBtn.className = 'action-btn primary';
        viewOffersBtn.textContent = `View Offers (${existingOffers.length})`;
        viewOffersBtn.addEventListener('click', () => showViewOffersModal());
        actionsContainer.appendChild(viewOffersBtn);
      } else {
        const noOffersMsg = document.createElement('p');
        noOffersMsg.className = 'trade-inactive';
        noOffersMsg.textContent = 'No offers yet. Share this trade to get offers!';
        actionsContainer.appendChild(noOffersMsg);
      }
      
      // 2. Action buttons container for Cancel/Complete
      const actionButtons = document.createElement('div');
      actionButtons.className = 'action-buttons-row';
      actionButtons.style.display = 'flex';
      actionButtons.style.gap = '10px';
      actionButtons.style.marginTop = '15px';
      
      // 3. Cancel Trade button (always available for active trades)
      if (currentTrade.status !== 'completed' && currentTrade.status !== 'canceled') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'action-btn secondary';
        cancelBtn.textContent = 'Cancel Trade';
        cancelBtn.addEventListener('click', () => cancelTrade());
        actionButtons.appendChild(cancelBtn);
      }
      
      // 4. Complete Trade button (only if trade is accepted)
      if (currentTrade.status === 'accepted') {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'action-btn primary';
        completeBtn.textContent = 'Complete Trade';
        completeBtn.addEventListener('click', () => completeTrade());
        actionButtons.appendChild(completeBtn);
      }
      
      if (actionButtons.children.length > 0) {
        actionsContainer.appendChild(actionButtons);
      }
    }
    
  } else if (currentUserRole === 'viewer' || 
             (currentUserRole === 'offerer' && currentTrade.user_offer_status === 'rejected')) {
    // VIEWER or OFFERER with REJECTED offer
    if (currentTrade.is_active !== false && currentTrade.status !== 'completed' && currentTrade.status !== 'canceled') {
      const makeOfferBtn = document.createElement('button');
      makeOfferBtn.className = 'action-btn primary';
      
      if (currentTrade.user_offer_status === 'rejected') {
        makeOfferBtn.textContent = 'Make a New Offer';
        makeOfferBtn.title = 'Your previous offer was rejected. You can make a new offer.';
        
        // Add rejected message
        const rejectedMsg = document.createElement('div');
        rejectedMsg.className = 'rejected-offer-message';
        rejectedMsg.innerHTML = `
          <p style="color: #dc3545; margin-top: 10px;">
            <small>Your previous offer was rejected. You can submit a new one.</small>
          </p>
        `;
        actionsContainer.appendChild(makeOfferBtn);
        actionsContainer.appendChild(rejectedMsg);
      } else {
        makeOfferBtn.textContent = 'Make an Offer';
        actionsContainer.appendChild(makeOfferBtn);
      }
      
      makeOfferBtn.addEventListener('click', () => showMakeOfferModal());
      
    } else {
      const inactiveMsg = document.createElement('p');
      inactiveMsg.className = 'trade-inactive';
      
      if (currentTrade.status === 'completed') {
        inactiveMsg.textContent = 'This trade has been completed';
      } else if (currentTrade.status === 'canceled') {
        inactiveMsg.textContent = 'This trade has been canceled';
      } else {
        inactiveMsg.textContent = 'This trade is no longer active';
      }
      
      actionsContainer.appendChild(inactiveMsg);
    }
    
  } else if (currentUserRole === 'offerer') {
    // OFFERER with ACTIVE offer (pending or accepted)
    const offerStatus = currentTrade.user_offer_status || 'pending';
    
    const statusMsg = document.createElement('div');
    statusMsg.className = 'offer-status-message';
    
    if (offerStatus === 'pending') {
      statusMsg.innerHTML = `
        <p>⏳ Your offer is pending review</p>
        <p><small>The trade owner will review your offer soon</small></p>
      `;
    } else if (offerStatus === 'accepted') {
      if (currentTrade.status === 'completed') {
        statusMsg.innerHTML = `
          <p>✓ Trade Completed!</p>
          <p><small>This trade has been completed</small></p>
        `;
      } else {
        statusMsg.innerHTML = `
          <p>✓ Your offer was accepted!</p>
          <p><small>Contact the owner to complete the trade</small></p>
        `;
      }
    }
    
    actionsContainer.appendChild(statusMsg);
  }
}

function renderExistingOffers() {
  const offersContainer = document.getElementById('existing-offers');
  const offersSection = document.getElementById('existing-offers-section');
  
  if (!offersContainer || !offersSection) return;
  
  // Filter offers based on user role
  let displayOffers = [];
  
  if (currentUserRole === 'owner') {
    // For owner: only show pending offers in sidebar
    displayOffers = existingOffers.filter(offer => offer.status === 'pending');
  } else if (currentUserRole === 'offerer' || currentUserRole === 'viewer') {
    // For offerer/viewer: show their own offer regardless of status
    displayOffers = existingOffers.filter(offer => 
      offer.offerer_idnum === currentUserIdnum
    );
  }
  
  // If user has a rejected offer, add a note about making a new offer
  if (currentUserRole === 'offerer' && currentTrade.user_offer_status === 'rejected') {
    const rejectedOffer = displayOffers.find(o => o.status === 'rejected');
    if (rejectedOffer) {
      const rejectedNote = document.createElement('div');
      rejectedNote.className = 'rejected-offer-note';
      rejectedNote.innerHTML = `
        <p style="color: #dc3545; font-size: 14px; margin-top: 10px;">
          <small>Your offer was rejected. You can make a new offer.</small>
        </p>
      `;
      if (offersContainer.parentNode) {
        offersContainer.parentNode.insertBefore(rejectedNote, offersContainer.nextSibling);
      }
    }
  }
  
  if (!displayOffers || displayOffers.length === 0) {
    offersSection.style.display = 'none';
    return;
  }
  
  offersSection.style.display = 'block';
  offersContainer.innerHTML = '';
  
  // Show only first 3 offers in sidebar
  const limitedOffers = displayOffers.slice(0, 3);
  
  limitedOffers.forEach(offer => {
    const offerElement = document.createElement('div');
    offerElement.className = `offer-item ${offer.status}`;
    
    // Use item_condition (from barter_offers table) or offered_item_condition as fallback
    const condition = offer.item_condition || offer.offered_item_condition || 'N/A';
    const cash = offer.additional_cash > 0 ? `+₱${parseFloat(offer.additional_cash).toFixed(2)}` : '';
    
    // Add status badge 
    let statusBadge = '';
    if (offer.status === 'rejected') {
      statusBadge = '<span class="rejected-badge">Rejected</span>';
    } else if (offer.status === 'accepted') {
      statusBadge = '<span class="accepted-badge">Accepted</span>';
    } else if (offer.status === 'pending') {
      statusBadge = '<span class="pending-badge">Pending</span>';
    }
    
    offerElement.innerHTML = `
      <h5>${offer.offered_item_name || 'Unnamed Item'}</h5>
      <p>Condition: ${condition}</p>
      ${cash ? `<p>Additional: ${cash}</p>` : ''}
      <p><small>${statusBadge}</small></p>
    `;
    
    offersContainer.appendChild(offerElement);
  });
  
  // Show "view more" if there are more offers
  if (displayOffers.length > 3 && currentUserRole === 'owner') {
    const viewMore = document.createElement('div');
    viewMore.className = 'view-more-offers';
    viewMore.innerHTML = `<p><small>+${displayOffers.length - 3} more offers</small></p>`;
    viewMore.addEventListener('click', () => showViewOffersModal());
    offersContainer.appendChild(viewMore);
  }
}

// Show make offer modal
function showMakeOfferModal() {
  const modal = document.getElementById('makeOfferModal');
  if (!modal) return;
  
  // Reset form
  document.getElementById('offer-item-name').value = '';
  document.getElementById('offer-item-description').value = '';
  document.getElementById('offer-item-condition').value = 'good';
  document.getElementById('offer-additional-cash').value = '0';
  document.getElementById('offer-notes').value = '';
  
  // Set up submit handler
  const submitBtn = document.getElementById('submit-offer');
  if (submitBtn) {
    submitBtn.onclick = submitOffer;
  }
  
  modal.style.display = 'flex';
}

// Submit offer to API
async function submitOffer() {
  const itemName = document.getElementById('offer-item-name')?.value.trim();
  const description = document.getElementById('offer-item-description')?.value.trim();
  const condition = document.getElementById('offer-item-condition')?.value;
  const additionalCash = document.getElementById('offer-additional-cash')?.value;
  const notes = document.getElementById('offer-notes')?.value.trim();
  
  if (!itemName) {
    alert('Please enter an item name');
    return;
  }
  
  try {
    const params = new URLSearchParams({
      barter_id: currentTrade.barter_id,
      item_name: itemName,
      description: description,
      condition: condition,
      additional_cash: additionalCash
    });
    
    const response = await fetch('/PayBach/model/api/client/submit_offer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(' Offer submitted successfully!');
      document.getElementById('makeOfferModal').style.display = 'none';
      
      // Reload the page to update status
      window.location.reload();
    } else {
      alert(`Failed to submit offer: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Submit offer error:', error);
    alert('Network error. Please try again.');
  }
}

function showViewOffersModal() {
  const modal = document.getElementById('viewOffersModal');
  const offersList = document.getElementById('offers-list');
  
  if (!modal || !offersList) return;
  
  offersList.innerHTML = '';
  
  // For owner: show ALL offers including rejected from data.all_offers
  // For offerer: show only their own offer from data.offers
  let displayOffers = [];
  
  if (currentUserRole === 'owner') {
    // Use all_offers if available, otherwise use existingOffers
    displayOffers = window.allOffers || existingOffers;
  } else if (currentUserRole === 'offerer') {
    displayOffers = existingOffers.filter(offer => 
      offer.offerer_idnum === currentUserIdnum
    );
  }
  
  if (!displayOffers || displayOffers.length === 0) {
    offersList.innerHTML = `
      <div class="empty-offers">
        <p>📭 No offers yet</p>
        <p>Share this trade to get more offers!</p>
      </div>
    `;
  } else {
    // Group offers by status
    const acceptedOffers = displayOffers.filter(o => o.status === 'accepted');
    const pendingOffers = displayOffers.filter(o => o.status === 'pending');
    const rejectedOffers = displayOffers.filter(o => o.status === 'rejected');
    
    // Display accepted offers first
    if (acceptedOffers.length > 0) {
      const section = document.createElement('div');
      section.className = 'offers-section';
      section.innerHTML = `<h3>✅ Accepted Offer</h3>`;
      offersList.appendChild(section);
      acceptedOffers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        section.appendChild(offerCard);
      });
    }
    
    // Display pending offers
    if (pendingOffers.length > 0) {
      const section = document.createElement('div');
      section.className = 'offers-section';
      section.innerHTML = `<h3>⏳ Pending Offers (${pendingOffers.length})</h3>`;
      offersList.appendChild(section);
      pendingOffers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        section.appendChild(offerCard);
      });
    }
    
    // Display rejected offers (only for owner)
    if (rejectedOffers.length > 0 && currentUserRole === 'owner') {
      const section = document.createElement('div');
      section.className = 'offers-section rejected-section';
      section.innerHTML = `<h3>❌ Rejected Offers (${rejectedOffers.length})</h3>`;
      offersList.appendChild(section);
      rejectedOffers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        section.appendChild(offerCard);
      });
    }
  }
  
  modal.style.display = 'flex';
}

//create offer
function createOfferCard(offer) {
  const card = document.createElement('div');
  card.className = `offer-card ${offer.status}`;
  
  const condition = offer.item_condition || offer.offered_item_condition || 'N/A';
  const cash = offer.additional_cash > 0 ? `+₱${parseFloat(offer.additional_cash).toFixed(2)}` : '';
  const date = new Date(offer.created_at).toLocaleDateString();
  
  // Get image path if available
  let imageHTML = '';
  if (offer.offered_item_image) {
    // Use the processImagePath function to get the correct URL
    const imagePath = processImagePath(offer.offered_item_image);
    imageHTML = `
      <div class="offer-image">
        <img src="${imagePath}" alt="Offer Item" 
             onerror="this.onerror=null; this.src='../../images/default-item.png'">
      </div>
    `;
  } else {
    // Show default image if no image uploaded
    imageHTML = `
      <div class="offer-image">
        <img src="../../images/default-item.png" alt="No Image Available">
      </div>
    `;
  }
  
  card.innerHTML = `
    ${imageHTML}
    <h4>
      ${offer.offered_item_name || 'Unnamed Item'}
      <span class="offer-status ${offer.status}">${offer.status.toUpperCase()}</span>
    </h4>
    
    <div class="offer-details">
      <p><strong>Description:</strong> ${offer.offered_item_description || offer.description || 'No description'}</p>
      <p><strong>Condition:</strong> ${condition}</p>
      ${cash ? `<p><strong>Additional Cash:</strong> ${cash}</p>` : ''}
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
  
  // event listeners for action buttons
  if (offer.status === 'pending' && currentUserRole === 'owner') {
    const acceptBtn = card.querySelector('.accept');
    const rejectBtn = card.querySelector('.reject');
    
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => respondToOffer(offer.offer_id, 'accept'));
    }
    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => respondToOffer(offer.offer_id, 'reject'));
    }
  }
  
  return card;
}

// Respond to an offer (accept/reject)
async function respondToOffer(offerId, action) {
  if (!confirm(`Are you sure you want to ${action} this offer?`)) {
    return;
  }
  
  try {
    const response = await fetch('/PayBach/model/api/client/respond_to_offer.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        offer_id: offerId,
        action: action
      })
    });
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.error('Raw response:', responseText);
      alert('Invalid response from server. Check console for details.');
      return;
    }
    
    if (data.success) {
      alert(`Offer ${action}ed successfully!`);
      
      // If accepted, the "Looking For" section should update
      // Reload the page to show updated trade info
      window.location.reload();
    } else {
      alert(`Failed to ${action} offer: ${data.error || data.message || 'Unknown error'}`);
      console.error('Server error details:', data);
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
    const response = await fetch('/PayBach/model/api/client/complete_trade.php', {
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
    const response = await fetch('/PayBach/model/api/client/cancel_trade.php', {
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

// Show error state
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
// Add this function to handle image preview
function setupImagePreview() {
  const imageInput = document.getElementById('offer-item-image');
  const preview = document.getElementById('image-preview');
  
  if (!imageInput || !preview) return;
  
  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
      // Check if file is an image
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        imageInput.value = '';
        preview.innerHTML = '<p>No image selected</p>';
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        imageInput.value = '';
        preview.innerHTML = '<p>No image selected</p>';
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      
      reader.onload = function(e) {
        preview.innerHTML = `
          <img src="${e.target.result}" alt="Preview">
          <p>${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
          <button type="button" class="remove-image" id="remove-image">Remove</button>
        `;
        
        // Add remove button functionality
        document.getElementById('remove-image').addEventListener('click', function() {
          imageInput.value = '';
          preview.innerHTML = '<p>No image selected</p>';
        });
      };
      
      reader.readAsDataURL(file);
    } else {
      preview.innerHTML = '<p>No image selected</p>';
    }
  });
}

// image preview setup
function initModals() {
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
  
  // Setup image preview
  setupImagePreview();
}

//reset the image preview
function showMakeOfferModal() {
  const modal = document.getElementById('makeOfferModal');
  if (!modal) return;
  
  // Reset form
  document.getElementById('offer-item-name').value = '';
  document.getElementById('offer-item-description').value = '';
  document.getElementById('offer-item-condition').value = 'good';
  document.getElementById('offer-additional-cash').value = '0';
  document.getElementById('offer-notes').value = '';
  
  // Reset image input
  document.getElementById('offer-item-image').value = '';
  const preview = document.getElementById('image-preview');
  if (preview) {
    preview.innerHTML = '<p>No image selected</p>';
  }
  
  // Set up submit handler
  const submitBtn = document.getElementById('submit-offer');
  if (submitBtn) {
    submitBtn.onclick = submitOffer;
  }
  
  modal.style.display = 'flex';
}

// Update the submitOffer function in trade_item.js
async function submitOffer() {
  const itemName = document.getElementById('offer-item-name')?.value.trim();
  const description = document.getElementById('offer-item-description')?.value.trim();
  const condition = document.getElementById('offer-item-condition')?.value;
  const additionalCash = document.getElementById('offer-additional-cash')?.value;
  const notes = document.getElementById('offer-notes')?.value.trim();
  const imageInput = document.getElementById('offer-item-image');
  const imageFile = imageInput?.files[0];
  
  console.log('Submitting offer with data:');
  console.log('Item Name:', itemName);
  console.log('Description:', description);
  console.log('Condition:', condition);
  console.log('Additional Cash:', additionalCash);
  console.log('Notes:', notes);
  console.log('Image File:', imageFile);
  
  if (!itemName) {
    alert('Please enter an item name');
    return;
  }
  
  // Validate image file if selected
  if (imageFile) {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.type)) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP)');
      return;
    }
    
    // Check file size (5MB limit)
    if (imageFile.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
  }
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('barter_id', currentTrade.barter_id);
  formData.append('item_name', itemName);
  formData.append('description', description || '');
  formData.append('condition', condition);
  formData.append('additional_cash', additionalCash || 0);
  formData.append('notes', notes || '');
  
  // Append image file if exists
  if (imageFile) {
    formData.append('item_image', imageFile);
  }
  
  console.log('FormData created, sending request...');
  
  try {
    // FormData for multipart/form-data upload
    const response = await fetch('/PayBach/model/api/client/submit_offer.php', {
      method: 'POST',
      body: formData
      
    });
    
    console.log('Response received:', response);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.error('Raw response:', responseText);
      alert('Invalid response from server. Check console for details.');
      return;
    }
    
    console.log('Parsed data:', data);
    
    if (data.success) {
      alert('Offer submitted successfully!');
      document.getElementById('makeOfferModal').style.display = 'none';
      
      // Reload the page to update status
      window.location.reload();
    } else {
      alert(`Failed to submit offer: ${data.error || data.message || 'Unknown error'}`);
      console.error('Server error details:', data);
    }
  } catch (error) {
    console.error('Submit offer error:', error);
    alert('Network error. Please check console for details.');
  }
}