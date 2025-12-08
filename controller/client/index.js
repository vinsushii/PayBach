document.addEventListener("DOMContentLoaded", () => {
  // Toast Notificatoin
  function notify(message, type = "info"){
    const box = document.getElementById("notify");
    box.textContent = message;
    box.className = "notify ${type} show";

    setTimeout(() =>{
      box.classList.remove("show");
      setTimeout(() => {
        box.style.display = "none";
      }, 400);
    }, 3000);
  }

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
        const response = await fetch("/PayBach/model/api/client/login.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          notify("Login successful!", "success");
          setTimeout(() =>{
            // redirect from backend already has /PayBach now
          window.location.href = result.redirect;
          }, 800);
        } else {
          notify(result.error, "error");
        }

      } catch (error) {
        console.error("Error:", error);
        notify("Server error. Try again later.", "error");
      }
    });
  }
  
});
