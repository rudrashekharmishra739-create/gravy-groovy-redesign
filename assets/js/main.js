// Gravy Groovy — nav, cart, animations
(function () {
  "use strict";

  // ---------- Mobile nav ----------
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

  // ---------- Cart state ----------
  const CART_KEY = "gg_cart";
  const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } };
  const saveCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));

  let cart = loadCart();

  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);

  // ---------- Inject cart button into header ----------
  // (already in HTML via replacement, but ensure badge sync)
  const updateBadges = () => {
    document.querySelectorAll(".cart-count").forEach((el) => { el.textContent = cartCount(); });
  };

  // ---------- Create overlay markup ----------
  const backdrop = document.createElement("div");
  backdrop.className = "cart-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  const cartPanel = document.createElement("div");
  cartPanel.className = "cart-panel";
  cartPanel.setAttribute("role", "dialog");
  cartPanel.setAttribute("aria-modal", "true");
  cartPanel.setAttribute("aria-label", "Shopping cart");
  cartPanel.innerHTML = `
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="cart-close" type="button" aria-label="Close cart">✕</button>
    </div>
    <div class="cart-items"></div>
    <div class="cart-footer">
      <div class="cart-total">Total: <strong>₹<span class="cart-total-val">0</span></strong></div>
      <button class="btn btn--primary cart-checkout" type="button">Order Now</button>
    </div>
  `;
  const checkoutPanel = document.createElement("div");
  checkoutPanel.className = "cart-panel checkout-panel";
  checkoutPanel.setAttribute("role", "dialog");
  checkoutPanel.setAttribute("aria-modal", "true");
  checkoutPanel.setAttribute("aria-label", "Checkout");
  checkoutPanel.innerHTML = `
    <div class="cart-header">
      <h2>Checkout</h2>
      <button class="cart-close" type="button" aria-label="Close checkout">✕</button>
    </div>
    <form class="form checkout-form" data-checkout>
      <div class="form-row">
        <div class="field"><label for="cname">Name</label><input id="cname" name="name" type="text" required autocomplete="name"></div>
        <div class="field"><label for="cphone">Phone</label><input id="cphone" name="phone" type="tel" required autocomplete="tel"></div>
      </div>
      <div class="field"><label for="caddr">Delivery address (or 'Pickup')</label><input id="caddr" name="address" type="text" required></div>
      <div class="field"><label for="cnotes">Notes</label><textarea id="cnotes" name="notes" placeholder="Any special instructions"></textarea></div>
      <div class="cart-summary"></div>
      <button type="submit" class="btn btn--primary">Place Order</button>
      <p class="form-success" hidden style="color:var(--color-success);font-weight:600;">Order placed! We'll call you to confirm. 🎉</p>
    </form>
  `;
  const overlayWrap = document.createElement("div");
  overlayWrap.className = "cart-overlay";
  overlayWrap.appendChild(backdrop);
  overlayWrap.appendChild(cartPanel);
  overlayWrap.appendChild(checkoutPanel);
  document.body.appendChild(overlayWrap);

  const cartItemsEl = cartPanel.querySelector(".cart-items");
  const totalEl = cartPanel.querySelector(".cart-total-val");
  const checkoutBtn = cartPanel.querySelector(".cart-checkout");

  function renderCart() {
    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="lead" style="text-align:center;padding:2rem;">Your cart is empty.</p>';
    } else {
      cartItemsEl.innerHTML = cart.map((item, idx) => `
        <div class="cart-line" data-idx="${idx}">
          <div class="cart-line__info">
            <strong>${item.name}</strong>
            <span class="cart-line__price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</span>
          </div>
          <div class="cart-line__controls">
            <button class="qty-btn" data-action="dec" data-idx="${idx}" type="button" aria-label="Decrease">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-idx="${idx}" type="button" aria-label="Increase">+</button>
            <button class="remove-btn" data-action="remove" data-idx="${idx}" type="button" aria-label="Remove">🗑</button>
          </div>
        </div>
      `).join("");
    }
    totalEl.textContent = cartTotal();
    updateBadges();
  }

  function openCart() {
    overlayWrap.classList.add("open", "cart-mode");
    overlayWrap.classList.remove("checkout-mode");
    renderCart();
    document.body.style.overflow = "hidden";
  }
  function openCheckout() {
    overlayWrap.classList.remove("cart-mode");
    overlayWrap.classList.add("open", "checkout-mode");
    // summary
    const summary = checkoutPanel.querySelector(".cart-summary");
    summary.innerHTML = `<p class="lead"><strong>Order total: ₹${cartTotal()}</strong> (${cartCount()} items)</p>`;
    document.body.style.overflow = "hidden";
  }
  function closeOverlay() {
    overlayWrap.classList.remove("open", "cart-mode", "checkout-mode");
    document.body.style.overflow = "";
  }
  window.openCart = openCart;
  window.closeCart = closeOverlay;

  backdrop.addEventListener("click", closeOverlay);
  cartPanel.querySelector(".cart-close").addEventListener("click", closeOverlay);
  checkoutPanel.querySelector(".cart-close").addEventListener("click", closeOverlay);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeOverlay(); });

  document.querySelectorAll("[data-open-cart]").forEach((el) => {
    el.addEventListener("click", (e) => { e.preventDefault(); openCart(); });
  });

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) { alert("Your cart is empty."); return; }
    openCheckout();
  });

  // qty / remove handlers (delegated)
  cartItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    const action = btn.dataset.action;
    if (action === "inc") cart[idx].qty += 1;
    else if (action === "dec") { cart[idx].qty -= 1; if (cart[idx].qty <= 0) cart.splice(idx, 1); }
    else if (action === "remove") cart.splice(idx, 1);
    saveCart(cart);
    renderCart();
  });

  // checkout submit
  const checkoutForm = checkoutPanel.querySelector("[data-checkout]");
  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = checkoutForm.querySelector("button[type=submit]");
    const msg = checkoutForm.querySelector(".form-success");
    if (btn) { btn.disabled = true; btn.textContent = "Placing..."; }
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.textContent = "Place Order"; }
      if (msg) { msg.hidden = false; checkoutForm.reset(); }
      cart = [];
      saveCart(cart);
      renderCart();
      setTimeout(() => { msg.hidden = true; closeOverlay(); }, 1800);
    }, 900);
  });

  // ---------- Add to cart from menu ----------
  function addToCart(name, price) {
    const existing = cart.find((i) => i.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });
    saveCart(cart);
    renderCart();
    updateBadges();
    // badge pulse
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.animate([{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }], { duration: 400, easing: "cubic-bezier(.34,1.56,.64,1)" });
    });
  }

  function flyToCart(btn) {
    const cartBtn = document.querySelector(".cart-btn");
    if (!cartBtn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = btn.getBoundingClientRect();
    const to = cartBtn.getBoundingClientRect();
    const clone = document.createElement("div");
    clone.className = "fly-item";
    clone.textContent = "🍽";
    clone.style.left = from.left + from.width / 2 + "px";
    clone.style.top = from.top + from.height / 2 + "px";
    document.body.appendChild(clone);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const anim = clone.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.2)`, opacity: 0 }
    ], { duration: 700, easing: "cubic-bezier(.22,1,.36,1)" });
    anim.onfinish = () => clone.remove();
  }

  // Enhance menu items
  document.querySelectorAll(".menu-item").forEach((item) => {
    const nameEl = item.querySelector(".menu-item__name");
    const priceEl = item.querySelector(".menu-item__price");
    if (!nameEl || !priceEl) return;
    const name = nameEl.textContent.trim();
    const priceMatch = priceEl.textContent.match(/[\d]+/);
    const price = priceMatch ? parseInt(priceMatch[0], 10) : 0;
    // add button
    const right = document.createElement("div");
    right.className = "menu-item__right";
    // move price into right
    const priceNode = priceEl;
    const btn = document.createElement("button");
    btn.className = "add-btn";
    btn.type = "button";
    btn.textContent = "+ Add";
    btn.setAttribute("aria-label", "Add " + name + " to cart");
    // wrap existing price
    if (!priceEl.parentElement.classList.contains("menu-item__right")) {
      const wrapper = document.createElement("div");
      wrapper.className = "menu-item__right";
      priceEl.parentNode.insertBefore(wrapper, priceEl);
      wrapper.appendChild(priceEl);
      wrapper.appendChild(btn);
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(name, price);
      flyToCart(btn);
      btn.textContent = "✓ Added";
      btn.classList.add("added");
      setTimeout(() => { btn.textContent = "+ Add"; btn.classList.remove("added"); }, 1200);
    });
    // click whole row also adds (except controls)
    item.style.cursor = "pointer";
    item.addEventListener("click", (e) => {
      if (e.target.closest(".add-btn")) return;
      addToCart(name, price);
      flyToCart(item);
    });
  });

  // ---------- Scroll reveal ----------
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

  // ---------- Hero parallax ----------
  const hero = document.querySelector(".hero");
  if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        hero.style.backgroundPosition = `center ${window.scrollY * 0.35}px`;
        ticking = false;
      });
    }, { passive: true });
  }

  // ---------- Logo spin ----------
  document.querySelectorAll(".logo img").forEach((img) => {
    img.addEventListener("mouseenter", () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      img.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 900, easing: "cubic-bezier(.65,0,.25,1)" });
    });
  });

  // init
  renderCart();
  updateBadges();
})();
