(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const isDesktopEffects = canHover && finePointer && !prefersReducedMotion;

  function initIcons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    } catch (_) {}
  }

  function initActiveNav() {
    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$(".nav-link").forEach((a) => {
      a.classList.remove("active");
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === file) a.classList.add("active");
    });
  }

  function initPageTransitions() {
    $$("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const external =
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.target === "_blank" ||
        a.hasAttribute("download") ||
        href.startsWith("#");

      if (external) return;

      a.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => (window.location.href = href), 180);
      });
    });
  }

  function initScrollReveal() {
    const els = $$(".reveal");
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  function initSpotlight() {
    if (!isDesktopEffects) return;
    $$(".spotlight-card").forEach((card) => {
      card.addEventListener(
        "mousemove",
        (e) => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          card.style.setProperty("--mouse-x", `${x}%`);
          card.style.setProperty("--mouse-y", `${y}%`);
        },
        { passive: true }
      );
      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--mouse-x", "50%");
        card.style.setProperty("--mouse-y", "50%");
      });
    });
  }

  function initCursor() {
    if (!isDesktopEffects) return;
    const dot = $(".cursor-dot");
    const outline = $(".cursor-outline");
    if (!dot || !outline) return;

    let x = 0, y = 0, ox = 0, oy = 0;

    function tick() {
      ox += (x - ox) * 0.12;
      oy += (y - oy) * 0.12;
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      outline.style.left = ox + "px";
      outline.style.top = oy + "px";
      requestAnimationFrame(tick);
    }

    window.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });

    const hoverTargets = ["a","button",".device-clickable","input","select","textarea"];
    $$(hoverTargets.join(",")).forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("hover-expand"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("hover-expand"));
    });

    requestAnimationFrame(tick);
  }

  function initMobileMenu() {
    const menuBtn = $("#menu-btn");
    const closeBtn = $("#close-menu");
    const menu = $("#mobile-menu");
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => menu.classList.remove("translate-x-full"));
    if (closeBtn) closeBtn.addEventListener("click", () => menu.classList.add("translate-x-full"));
    $$(".mobile-link").forEach((l) => l.addEventListener("click", () => menu.classList.add("translate-x-full")));
  }

  function initAuroraParallax() {
    if (!isDesktopEffects) return;
    const blobs = $$(".aurora-blob");
    if (!blobs.length) return;

    window.addEventListener("mousemove", (e) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 10;
      const my = (e.clientY / window.innerHeight - 0.5) * 10;
      blobs.forEach((b, i) => {
        const k = i + 1;
        b.style.transform = `translate(${mx * k}px, ${my * k}px)`;
      });
    }, { passive: true });
  }

  // optional helper: tag common blocks as reveal automatically
  function autoTagReveal() {
    ["section",".pro-card",".gradient-border","footer"].forEach((sel) => {
      $$(sel).forEach((el) => el.classList.add("reveal"));
    });
  }

  // Estimator page logic (simple + honest)
  function initEstimator() {
    const root = document.querySelector("[data-estimator]");
    if (!root) return;

    const visitors = $("#visitors");
    const aov = $("#aov");
    const cvr = $("#cvr");
    const trafficBoost = $("#trafficBoost");

    const outCurrent = $("#outCurrent");
    const outFuture = $("#outFuture");
    const outIncrease = $("#outIncrease");

    function fmt(n){ return "$" + Math.round(n).toLocaleString(); }

    function update() {
      const v = parseInt(visitors.value, 10);
      const val = parseInt(aov.value, 10);
      const rate = parseFloat(cvr.value) / 100;
      const boost = parseFloat(trafficBoost.value) / 100;

      $("#visitorsVal").textContent = v.toLocaleString();
      $("#aovVal").textContent = "$" + val.toLocaleString();
      $("#cvrVal").textContent = (rate * 100).toFixed(1) + "%";
      $("#boostVal").textContent = Math.round(boost * 100) + "%";

      const current = v * rate * val;
      const futureVisitors = v * (1 + boost);
      const futureRate = Math.min(rate * 1.5, 0.08); // cap for realism
      const future = futureVisitors * futureRate * val;

      outCurrent.textContent = fmt(current);
      outFuture.textContent = fmt(future);
      outIncrease.textContent = fmt(future - current);
    }

    [visitors,aov,cvr,trafficBoost].forEach((el) => el.addEventListener("input", update));
    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initActiveNav();
    initPageTransitions();
    autoTagReveal();
    initScrollReveal();
    initSpotlight();
    initCursor();
    initMobileMenu();
    initAuroraParallax();
    initEstimator();
  });
})();
