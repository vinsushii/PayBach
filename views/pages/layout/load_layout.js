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

// Load sidebar
// added a check kasi not all pages have a sidebar. and apparently some errors caused by this going unchecked can cause promise runs to break?
const sidebarEl = document.getElementById('sidebar');
if (sidebarEl) {
    fetch('../layout/admin_sidebar.html')
        .then(res => res.text())
        .then(data => sidebarEl.innerHTML = data);
}