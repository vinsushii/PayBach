document.addEventListener("DOMContentLoaded", () => {
    const filterDropdown = document.getElementById("itemFilter");
    const tableContainers = ["SUMMARY", "USER", "TRANSACTION"].map(id => document.getElementById(id));

    if (!filterDropdown || tableContainers.length === 0) return;

    function filterTables() {
        const selected = filterDropdown.value;

        tableContainers.forEach(table => {
            if (table.id === selected) {
                table.style.display = "block";
            } else {
                table.style.display = "none";
            }
        });
    }

    // Run once on page load
    filterTables();

    // Listen for dropdown changes
    filterDropdown.addEventListener("change", filterTables);
});
