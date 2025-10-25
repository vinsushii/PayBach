// Toggle between forms
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const forgotForm = document.getElementById("forgot-form");
const changeForm = document.getElementById("change-form");

document.getElementById("register-link").onclick = () => switchForm(registerForm);
document.getElementById("login-link").onclick = () => switchForm(loginForm);
document.getElementById("login-link2").onclick = () => switchForm(loginForm);
document.getElementById("login-link3").onclick = () => switchForm(loginForm);
document.getElementById("forgot-password-link").onclick = () => switchForm(forgotForm);

function switchForm(formToShow) {
  [loginForm, registerForm, forgotForm, changeForm].forEach(f => f.classList.remove("active"));
  formToShow.classList.add("active");
}

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});
