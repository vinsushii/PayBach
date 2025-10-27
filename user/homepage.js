// Simple auto-carousel
let index = 0;
const slides = document.querySelectorAll(".slides img");

function showSlides() {
  slides.forEach(slide => slide.classList.remove("active"));
  index = (index + 1) % slides.length;
  slides[index].classList.add("active");
}

setInterval(showSlides, 3000);
