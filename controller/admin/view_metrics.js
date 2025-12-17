document.addEventListener("DOMContentLoaded", () => {
    const filterDropdown = document.getElementById("itemFilter");
    const tableContainers = {
        SUMMARY: document.getElementById("SUMMARY"),
        USER: document.getElementById("USER"),
        TRANSACTION: document.getElementById("TRANSACTION")
    };

    if (!filterDropdown || Object.keys(tableContainers).length === 0) return;

    function filterTables() {
        const selected = filterDropdown.value;
        for (const key in tableContainers) {
            tableContainers[key].style.display = key === selected ? "block" : "none";
        }
    }

    filterTables();
    filterDropdown.addEventListener("change", filterTables);

    // ---------- Fetch and Populate Data ----------
    async function loadMetrics(type) {
        try {
            const res = await fetch(`/admin/metrics?type=${type}`);
            const data = await res.json();

            if (!data.success) {
                console.error("Failed to load metrics:", data);
                return;
            }

            if (type === "SUMMARY") {
                const tbody = tableContainers.SUMMARY.querySelector("tbody");
                tbody.innerHTML = ""; // Clear old rows
                const d = data.data;
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>MID00001</td>
                    <td>${new Date().toLocaleString()}</td>
                    <td>${d.total_users}</td>
                    <td>${d.active_users}</td>
                    <td>${d.new_users}</td>
                    <td>${d.total_listings}</td>
                    <td>${d.active_listings}</td>
                    <td>${d.completed_transactions}</td>
                    <td>${d.total_sales.toFixed(2)}</td>
                    <td>${d.average_transaction_value.toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            } else if (type === "USER") {
                const tbody = tableContainers.USER.querySelector("tbody");
                tbody.innerHTML = "";
                data.data.forEach(session => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${session.session_id}</td>
                        <td>${session.user_idnum}</td>
                        <td>${session.login_time}</td>
                        <td>${session.last_activity}</td>
                        <td>${session.logout_time || "-"}</td>
                    `;
                    tbody.appendChild(row);
                });
            } else if (type === "TRANSACTION") {
                const tbody = tableContainers.TRANSACTION.querySelector("tbody");
                tbody.innerHTML = "";
                data.data.forEach(tx => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${tx.transaction_id}</td>
                        <td>${tx.listing_id}</td>
                        <td>${tx.buyer_id}</td>
                        <td>${tx.transaction_type}</td>
                        <td>${tx.item_name}</td>
                        <td>${tx.starting_bid.toFixed(2)}</td>
                        <td>${tx.final_price.toFixed(2)}</td>
                        <td>${tx.transaction_date}</td>
                        <td>${tx.status}</td>
                        <td>${tx.created_at}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        } catch (err) {
            console.error("Error fetching metrics:", err);
        }
    }

    // Load initial table data
    loadMetrics(filterDropdown.value);

    // Load new data when dropdown changes
    filterDropdown.addEventListener("change", () => {
        loadMetrics(filterDropdown.value);
    });
});
