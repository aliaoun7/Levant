/* =========================================
   Levant Digital Marketing — app.js
   Smooth motion + mobile-safe performance
   ========================================= */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const isDesktopEffects = canHover && finePointer && !prefersReducedMotion;

  // -----------------------------
  // Lucide icons (safe)
  // -----------------------------
  function initIcons() {
    try {
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    } catch (_) {}
  }

  // -----------------------------
  // Active nav link (auto)
  // Works across pages: index/services/work/estimator/contact
  // -----------------------------
  function initActiveNav() {
    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const map = {
      "": "index.html",
      "index.html": "index.html",
      "services.html": "services.html",
      "work.html": "work.html",
      "estimator.html": "estimator.html",
      "contact.html": "contact.html",
    };
    const current = map[path] || path;

    $$(".nav-link").forEach((link) => {
      link.classList.remove("active");
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (href === current) link.classList.add("active");
    });
  }

  // -----------------------------
  // Page transitions (multi-page)
  // -----------------------------
  function initPageTransitions() {
    $$("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;

      const isExternal =
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        a.target === "_blank" ||
        a.hasAttribute("download");

      const isAnchor = href.startsWith("#");

      if (isExternal || isAnchor) return;

      a.addEventListener("click", (e) => {
        // allow cmd/ctrl click
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        document.body.classList.add("is-leaving");
        setTimeout(() => {
          window.location.href = href;
        }, 180);
      });
    });
  }

  // -----------------------------
  // Scroll reveal (fast)
  // -----------------------------
  function initScrollReveal() {
    const els = $$(".reveal");
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  // -----------------------------
  // Spotlight hover (desktop only)
  // -----------------------------
  function initSpotlight() {
    if (!isDesktopEffects) return;

    $$(".spotlight-card").forEach((card) => {
      card.addEventListener(
        "mousemove",
        (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
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

  // -----------------------------
  // Custom cursor (desktop only)
  // -----------------------------
  function initCursor() {
    if (!isDesktopEffects) return;

    const dot = $(".cursor-dot");
    const outline = $(".cursor-outline");
    if (!dot || !outline) return;

    let x = 0, y = 0;
    let ox = 0, oy = 0;

    function tick() {
      ox += (x - ox) * 0.12;
      oy += (y - oy) * 0.12;

      dot.style.left = x + "px";
      dot.style.top = y + "px";
      outline.style.left = ox + "px";
      outline.style.top = oy + "px";

      requestAnimationFrame(tick);
    }

    window.addEventListener(
      "mousemove",
      (e) => {
        x = e.clientX;
        y = e.clientY;
      },
      { passive: true }
    );

    const hoverTargets = ["a", "button", ".device-clickable", "input", "select", "textarea"];
    $$(hoverTargets.join(",")).forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("hover-expand"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("hover-expand"));
    });

    requestAnimationFrame(tick);
  }

  // -----------------------------
  // Mobile menu (safe)
  // -----------------------------
  function initMobileMenu() {
    const menuBtn = $("#menu-btn");
    const closeBtn = $("#close-menu");
    const menu = $("#mobile-menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => menu.classList.remove("translate-x-full"));
    if (closeBtn) closeBtn.addEventListener("click", () => menu.classList.add("translate-x-full"));

    $$(".mobile-link").forEach((link) => {
      link.addEventListener("click", () => menu.classList.add("translate-x-full"));
    });
  }

  // -----------------------------
  // Aurora parallax (desktop only)
  // -----------------------------
  function initAuroraParallax() {
    if (!isDesktopEffects) return;

    const blobs = $$(".aurora-blob");
    if (!blobs.length) return;

    window.addEventListener(
      "mousemove",
      (e) => {
        const mx = (e.clientX / window.innerWidth - 0.5) * 10;
        const my = (e.clientY / window.innerHeight - 0.5) * 10;

        blobs.forEach((b, i) => {
          const k = i + 1;
          b.style.transform = `translate(${mx * k}px, ${my * k}px)`;
        });
      },
      { passive: true }
    );
  }

  // -----------------------------
  // Auto-add reveal to sections/cards (optional helper)
  // If you forget to add class="reveal", this helps.
  // -----------------------------
  function autoTagReveal() {
    const candidates = [
      "section",
      ".metric-card",
      ".soft-card",
      ".gradient-border",
      "footer"
    ];
    candidates.forEach((sel) => {
      $$(sel).forEach((el) => {
        if (!el.classList.contains("reveal")) el.classList.add("reveal");
      });
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initActiveNav();
    initPageTransitions();
    autoTagReveal();        // you can remove this if you want manual control
    initScrollReveal();
    initSpotlight();
    initCursor();
    initMobileMenu();
    initAuroraParallax();
  });
})();
