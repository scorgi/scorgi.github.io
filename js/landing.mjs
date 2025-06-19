document.addEventListener("DOMContentLoaded", function () {
  // Existing intersection observer logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("come-in");
      }
    });
  });

  document.querySelectorAll(".banner-section .banner-image").forEach((img) => {
    observer.observe(img);
  });

  // Initialize AOS
  // @ts-expect-error - AOS is not defined in the global scope
  AOS.init({
    duration: 250,
    easing: "ease-in-out",
    once: false,
    mirror: true,
    offset: 120,
  });
});
