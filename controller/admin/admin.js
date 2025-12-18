document.addEventListener("DOMContentLoaded", () => {
    const adminForm = document.getElementById("adminLoginForm");
  
    function showNotification(message, type = "success") {
      const notif = document.getElementById("notification");
      notif.textContent = message;
      notif.className = type;
      notif.style.display = "block";
      setTimeout(() => (notif.style.display = "none"), 3000);
    }
  
    if (adminForm) {
      adminForm.addEventListener("submit", async e => {
        e.preventDefault();
  
        const email = adminForm.email.value;
        const password = adminForm.password.value;
  
        try {
          const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
          });
  
          const result = await response.json();
  
          if (result.success && result.role === "admin") {
            showNotification("Admin login successful!", "success");
            setTimeout(() => (window.location.href = result.redirect), 800);
          } else {
            showNotification("Invalid credentials or not an admin.", "error");
          }
        } catch (err) {
          console.error(err);
          showNotification("Server error. Try again later.", "error");
        }
      });
    }
  });
  