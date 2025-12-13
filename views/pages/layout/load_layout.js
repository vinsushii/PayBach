// Load header
fetch('../layout/header.html')
    .then(res => res.text())
    .then(data => document.getElementById('header').innerHTML = data);

// Load navigation
fetch('../layout/client_nav.html')
    .then(res => res.text())
    .then(data => document.getElementById('client-nav').innerHTML = data);

// Load footer
fetch('../layout/footer.html')
    .then(res => res.text())
    .then(data => document.getElementById('footer').innerHTML = data);

// Load sidebar (admin)
const sidebarEl = document.getElementById('sidebar');
if (sidebarEl) {
    fetch('../layout/admin_sidebar.html')
        .then(res => res.text())
        .then(data => {
            sidebarEl.innerHTML = data;

            // Highlight based on current page
            const currentPage = window.location.pathname.split("/").pop().toLowerCase();
            const sidebarLinks = sidebarEl.querySelectorAll("a");

            sidebarLinks.forEach(link => {
                link.classList.remove("active");
                const linkPage = link.getAttribute("href").split("/").pop().toLowerCase();
                if (linkPage === currentPage) {
                    link.classList.add("active");
                }
            });
        });
}
