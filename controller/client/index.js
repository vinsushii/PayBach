document.addEventListener("DOMContentLoaded", () => {

  const loginFormSection = document.getElementById('login-form');
  const registerFormSection = document.getElementById('register-form');

  const registerLink = document.getElementById('register-link');
  const loginLink = document.getElementById('login-link');

  // SWITCH TO REGISTER
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormSection.classList.remove('active');
      registerFormSection.classList.add('active');
    });
  }

  // SWITCH TO LOGIN
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerFormSection.classList.remove('active');
      loginFormSection.classList.add('active');
    });
  }

  // LOGIN AJAX
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        email: loginForm.email.value,
        password: loginForm.password.value
      };

      try {
        const response = await fetch("model/api/client/login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          alert("Login successful!");
          window.location.href = result.redirect;
        } else {
          alert(result.error);
        }

      } catch (error) {
        console.error("Error:", error);
        alert("Server error. Try again later.");
      }
    });
  }

});
