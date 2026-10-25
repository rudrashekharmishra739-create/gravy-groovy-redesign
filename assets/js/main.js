// Mobile nav toggle + small enhancements
(function () {
  "use strict";
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // close on link click (mobile)
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  // Mark active nav link based on current file
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
  });

  // Contact form: prevent real submit (demo) and show feedback
  const form = document.querySelector("form[data-demo]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      const msg = form.querySelector(".form-success");
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = "Send Message"; }
        if (msg) { msg.hidden = false; form.reset(); }
      }, 900);
    });
  }
})();
