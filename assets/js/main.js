// Mobile nav toggle + scroll reveals + parallax + enhancements
(function () {
  "use strict";
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  const form = document.querySelector("form[data-demo]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const msg = form.querySelector(".form-success");
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Send Message"; }
        if (msg) { msg.hidden = false; form.reset(); }
      }, 900);
    });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  // Hero parallax
  const hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        hero.style.backgroundPosition = `center ${y * 0.35}px`;
        ticking = false;
      });
    }, { passive: true });
  }

  // Logo spin on hover
  document.querySelectorAll(".logo img").forEach((img) => {
    img.addEventListener("mouseenter", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      img.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 900, easing: "cubic-bezier(.65,0,.25,1)" });
    });
  });
})();
