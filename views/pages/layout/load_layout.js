// load_layout.js

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.querySelector(".logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // prevent default link behavior

      try {
        const res = await fetch("/api/logout", {
          method: "POST",
          credentials: "include" // important for session cookie
        });

        const data = await res.json();
        if (data.success) {
          // Redirect to index.html after successful logout
          window.location.href = "/index.html";
        } else {
          alert("Logout failed. Please try again.");
        }
      } catch (err) {
        console.error("Logout error:", err);
        alert("Something went wrong during logout.");
      }
    });
  }
});
const sidebarEl = document.getElementById('sidebar');
if (sidebarEl) {
    fetch('../layout/admin_sidebar.html')
        .then(res => res.text())
        .then(data => {
            sidebarEl.innerHTML = data;

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