document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginFormSection = document.getElementById("login-form");
  const registerFormSection = document.getElementById("register-form");
  const registerLink = document.getElementById("register-link");
  const loginLink = document.getElementById("login-link");

  // Notification helper
  function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.className = type;
    notif.style.display = "block";
    setTimeout(() => (notif.style.display = "none"), 3000);
  }

  // Switch forms
  registerLink?.addEventListener("click", e => {
    e.preventDefault();
    loginFormSection.classList.remove("active");
    registerFormSection.classList.add("active");
  });

  loginLink?.addEventListener("click", e => {
    e.preventDefault();
    registerFormSection.classList.remove("active");
    loginFormSection.classList.add("active");
  });

  // Forward to PHP for clients
  async function forwardToPHP(email, password) {
    try {
      const response = await fetch("/PayBach/model/api/client/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let result = await response.json();
      if (result.success) {
        //const { user_idnum } = result;
        localStorage.setItem("user_id", result.user_idnum);
        window.location.href = result.redirect;
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        // Try Node.js login first (admins only)
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
          return;
        }

        // Otherwise, forward to PHP (students/clients)
        forwardToPHP(email, password);
      } catch (error) {
        console.error("Error:", error);
        showNotification("Server error. Try again later.", "error");
      }
    });
  }
});
