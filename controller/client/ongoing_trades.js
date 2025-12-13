document.addEventListener("DOMContentLoaded", () => {
    loadTrades();

    // ADD BUTTON
    const addBtn = document.getElementById("add-trade-btn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            window.location.href = "../client/post_item.html";
        });
    }
});

function loadTrades() {
    fetch("/api/client/get_ongoing_trades.php")
        .then(res => res.json())
        .then(data => renderTrades(data))
        .catch(err => console.error("Failed to load trades:", err));
}

function renderTrades(trades) {
    const container = document.querySelector(".bids-container");
    container.innerHTML = "";

    if (!trades.length) {
        container.innerHTML = "<p>No ongoing trades found.</p>";
        return;
    }

    trades.forEach(trade => {
        const link = document.createElement("a");
        link.href = `/app/views/pages/client/trade_view.html?trade_id=${trade.barter_id}`;
        link.classList.add("bid-link");

        const card = document.createElement("div");
        card.classList.add("bid-card");

        // IMAGE HANDLING
        let imagesHTML = ``;

        if (trade.images && trade.images.length > 1) {
            imagesHTML = `
                <div class="image-gallery">
                    ${trade.images
                        .slice(0, 3)
                        .map(img => `<img src="/uploads/barters/${img}" alt="Item Image">`)
                        .join("")}
                </div>`;
        } else {
            const img = trade.images && trade.images.length > 0
                ? trade.images[0]
                : "default.png";
            imagesHTML = `<img src="/uploads/barters/${img}" alt="Item Image">`;
        }

        card.innerHTML = `
            ${imagesHTML}
            <p><strong>${trade.item_name}</strong></p>
            <p class="price ${trade.barter_status === 'accepted' ? 'up' : ''}">
                Status: ${trade.barter_status.toUpperCase()}
            </p>
        `;

        link.appendChild(card);
        container.appendChild(link);
    });
}