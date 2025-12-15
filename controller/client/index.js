document.addEventListener("DOMContentLoaded", () => {



  const loginForm = document.getElementById("loginForm");
  const loginFormSection = document.getElementById('login-form');
  const registerFormSection = document.getElementById('register-form');
  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');

  // Notification helper
  function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
    notif.textContent = message;
    notif.className = type;
    notif.style.display = "block";
    setTimeout(() => notif.style.display = "none", 3000);
  }

  // Switch forms
  registerLink?.addEventListener('click', e => {
    e.preventDefault();
    loginFormSection.classList.remove('active');
    registerFormSection.classList.add('active');
  });

  loginLink?.addEventListener('click', e => {
    e.preventDefault();
    registerFormSection.classList.remove('active');
    loginFormSection.classList.add('active');
  });

  // Forward to PHP for clients
  async function forwardToPHP(email, password) {
    try {
      const response = await fetch("/PayBach/model/api/client/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      console.log("PHP LOGIN RESPONSE:", result);

      if (result.success) {
        // Store user ID to localStorage
        localStorage.setItem("user_id", result.user_idnum);

        console.log("STORED USER ID:", localStorage.getItem("user_id"));

        // Delay redirect slightly so storage is saved
        setTimeout(() => {
          window.location.href = result.redirect;
        }, 300);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("PHP login error:", err);
    }
  }

  // Login form submit
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        //  Try Node.js login first (admins only)
        const response = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        // Admin login successful
        if (result.success && result.role === "admin") {
          localStorage.setItem("user_idnum", result.user_idnum);
          showNotification("Admin login successful!", "success");
          setTimeout(() => window.location.href = result.redirect, 800);
          return;
        }

        // Otherwise, forward to PHP (clients)
        forwardToPHP(email, password);

      } catch (error) {
        console.error("Error:", error);
        showNotification("Server error. Try again later.", "error");
      }
    });
  }

});
