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
      const response = await fetch("model/api/client/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("user_id", result.user_idnum);
        window.location.href = result.redirect;
      } else {
        showNotification(result.error || "Login failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Server error. Try again later.", "error");
    }
  }

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      // Forward to PHP backend for students/clients
      forwardToPHP(email, password);
    });
  }
});
