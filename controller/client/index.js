// Toggle between forms
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Register & Login link switches
document.getElementById("register-link").onclick = (e) => {
  e.preventDefault();
  switchForm(registerForm);
};

document.getElementById("login-link").onclick = (e) => {
  e.preventDefault();
  switchForm(loginForm);
};

// Only switch between existing forms
function switchForm(formToShow) {
  [loginForm, registerForm].forEach(f => f.classList.remove("active"));
  formToShow.classList.add("active");
}

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});
