// Reveal on scroll animation for premium effect
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', revealOnScroll); 