document.addEventListener("DOMContentLoaded", () => {
    const filterDropdown = document.getElementById("itemFilter");
    const countDisplay = document.getElementById("validateCount");

    function filterItems() {
        const selectedType = filterDropdown.value;
        const itemCards = document.querySelectorAll(".item-filter-card");

        let visibleCount = 0;

        itemCards.forEach(card => {
            const cardType = card.dataset.type;

            if (selectedType === "ALL" || cardType === selectedType) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (countDisplay) {
            countDisplay.textContent = visibleCount;
        }
    }

    if (filterDropdown) {
        filterDropdown.addEventListener("change", filterItems);
        filterItems();
    }
});
