document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const thumbs = document.querySelectorAll(".thumb");
  const next = document.querySelector(".next");
  const prev = document.querySelector(".prev");
  let index = 0;

  function showSlide(i) {
    slides.forEach((slide, n) => {
      slide.classList.toggle("active", n === i);
    });
    thumbs.forEach((thumb, n) => {
      thumb.classList.toggle("active", n === i);
    });
    index = i;
  }

  next.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  prev.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => showSlide(i));
  });
}); // click smol thumbnail, show sa main img panel