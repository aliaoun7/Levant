/**
 * Levant Digital Marketing — Premium Effects
 * ─────────────────────────────────────────
 * 1. Theme persistence   — dark/light mode across all pages
 * 2. Loading screen      — branded LEVANT. intro on first visit
 * 3. Page transitions    — emerald wipe between pages
 * 4. Parallax depth      — hero elements move at different scroll speeds
 * 5. Text scramble       — headlines glitch-resolve on reveal
 * 6. Magnetic buttons    — buttons pull toward cursor on hover
 *
 * All DOM lookups are null-safe. Safe to include on every page.
 */

(function () {
  'use strict';

  /* ── Utilities ── */
  const $   = (sel, ctx = document) => ctx.querySelector(sel);
  const $$  = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const isMobile      = () => window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ══════════════════════════════════════════
     1. THEME PERSISTENCE
     Restores saved dark/light preference and
     keeps toggle icon in sync on every page.
  ══════════════════════════════════════════ */
  function initThemePersist() {
    const saved = localStorage.getItem('levant-theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light');
    }

    const btn  = document.getElementById('theme-btn');
    const icon = document.getElementById('theme-icon');
    if (!btn || !icon) return;

    const MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    const SUN  = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';

    function applyTheme(mode) {
      if (mode === 'light') {
        document.documentElement.classList.add('light');
        icon.innerHTML = MOON;
        localStorage.setItem('levant-theme', 'light');
      } else {
        document.documentElement.classList.remove('light');
        icon.innerHTML = SUN;
        localStorage.setItem('levant-theme', 'dark');
      }
    }

    // Set icon to match current state
    applyTheme(saved === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light');
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  /* ══════════════════════════════════════════
     2. LOADING SCREEN
     Shows a brief LEVANT. intro on first page
     load, then fades out smoothly.
  ══════════════════════════════════════════ */
  function initLoader() {
    if (sessionStorage.getItem('levant_loaded')) return;
    sessionStorage.setItem('levant_loaded', '1');

    const loader = document.createElement('div');
    loader.id = 'levant-loader';
    loader.innerHTML = `
      <div class="loader-inner">
        <div class="loader-logo">
          <span class="loader-text" id="loaderText">LEVANT</span><span class="loader-dot">.</span>
        </div>
        <div class="loader-bar-wrap">
          <div class="loader-bar" id="loaderBar"></div>
        </div>
        <div class="loader-sub">Digital Marketing</div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #levant-loader {
        position:fixed; inset:0; z-index:99999;
        background:#050505;
        display:flex; align-items:center; justify-content:center;
        transition:opacity .6s cubic-bezier(.76,0,.24,1), transform .6s cubic-bezier(.76,0,.24,1);
      }
      #levant-loader.out { opacity:0; transform:translateY(-8px); pointer-events:none; }
      .loader-inner { text-align:center; }
      .loader-logo {
        font-family:'Bebas Neue',sans-serif;
        font-size:clamp(3.5rem,10vw,7rem);
        letter-spacing:.04em; color:#f0f0f0;
        line-height:1; display:flex; align-items:baseline; justify-content:center; overflow:hidden;
      }
      .loader-text {
        display:inline-block;
        clip-path:inset(0 100% 0 0);
        animation:loader-reveal .9s cubic-bezier(.76,0,.24,1) .15s forwards;
      }
      @keyframes loader-reveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
      .loader-dot { color:#10b981; opacity:0; animation:loader-dot-in .3s ease .95s forwards; }
      @keyframes loader-dot-in { to{opacity:1} }
      .loader-bar-wrap { width:160px; height:1px; background:rgba(16,185,129,.15); margin:1.4rem auto 1rem; overflow:hidden; }
      .loader-bar { height:100%; width:0; background:linear-gradient(90deg,#10b981,#34d399); animation:loader-progress 1.1s cubic-bezier(.76,0,.24,1) .1s forwards; }
      @keyframes loader-progress { to{width:100%} }
      .loader-sub { font-family:'JetBrains Mono',monospace; font-size:.62rem; letter-spacing:.25em; text-transform:uppercase; color:#6b7280; opacity:0; animation:loader-sub-in .4s ease 1.05s forwards; }
      @keyframes loader-sub-in { to{opacity:1} }
    `;

    document.head.appendChild(style);
    document.body.prepend(loader);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      loader.classList.add('out');
      document.body.style.overflow = '';
      setTimeout(() => loader.remove(), 650);
    }, 1800);
  }

  /* ══════════════════════════════════════════
     3. PAGE TRANSITIONS
     Emerald wipe overlay on internal navigation.
  ══════════════════════════════════════════ */
  function initTransitions() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition';

    const style = document.createElement('style');
    style.textContent = `
      #page-transition {
        position:fixed; inset:0; z-index:99998;
        background:#10b981; transform:translateX(-100%);
        pointer-events:none; will-change:transform;
      }
      #page-transition.enter { animation:pt-enter .45s cubic-bezier(.76,0,.24,1) forwards; }
      #page-transition.exit  { animation:pt-exit  .45s cubic-bezier(.76,0,.24,1) forwards; }
      @keyframes pt-enter { from{transform:translateX(-100%)} to{transform:translateX(0%)} }
      @keyframes pt-exit  { from{transform:translateX(0%)}    to{transform:translateX(100%)} }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    window.addEventListener('pageshow', () => {
      overlay.classList.remove('enter');
      overlay.classList.add('exit');
      setTimeout(() => {
        overlay.classList.remove('exit');
        overlay.style.transform = 'translateX(-100%)';
      }, 500);
    });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === '_blank') return;

      const href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('http') && !href.includes(location.hostname)) return;

      try {
        const dest = new URL(href, location.href);
        if (dest.pathname === location.pathname && dest.search === location.search) return;
      } catch (err) { return; }

      e.preventDefault();
      overlay.classList.remove('exit');
      overlay.classList.add('enter');
      setTimeout(() => { window.location.href = href; }, 440);
    });
  }

  /* ══════════════════════════════════════════
     4. PARALLAX DEPTH
     Stopped on mobile/reduced-motion.
  ══════════════════════════════════════════ */
  function initParallax() {
    if (isMobile() || prefersReduced()) return;

    const grid     = $('.hero-grid, .grid-bg');
    const blobs    = $$('.blob, .aurora-blob');
    const heroText = $('.hero-inner');

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const sy = window.scrollY;
        if (grid)     grid.style.transform = `translateY(${sy * 0.3}px)`;
        blobs.forEach((b, i) => { b.style.transform = `translateY(${sy * (0.12 + i * 0.07)}px)`; });
        if (heroText && sy < window.innerHeight) {
          heroText.style.transform = `translateY(${sy * 0.12}px)`;
          heroText.style.opacity   = String(1 - sy / (window.innerHeight * 0.85));
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ══════════════════════════════════════════
     5. TEXT SCRAMBLE
     Glitches through random chars on reveal.
  ══════════════════════════════════════════ */
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';

  function scrambleElement(el) {
    if (!el || el._scrambling) return;
    el._scrambling = true;
    const original = el.textContent;
    const len = original.length;
    let frame = 0;
    const totalFrames = len * 2.2;
    const resolveStart = Math.floor(totalFrames * 0.25);

    const tick = () => {
      let out = '';
      for (let i = 0; i < len; i++) {
        if (original[i] === ' ' || original[i] === '\n') {
          out += original[i];
        } else if (frame > resolveStart + i * 1.4) {
          out += original[i];
        } else {
          out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      el.textContent = out;
      frame++;
      if (frame < totalFrames) requestAnimationFrame(tick);
      else { el.textContent = original; el._scrambling = false; }
    };
    tick();
  }

  function initScramble() {
    if (prefersReduced()) return;

    const targets = $$('h1, h2, [data-scramble]');
    targets.forEach(el => {
      if (el.children.length > 0) {
        el._spans = $$('span', el).filter(s => s.children.length === 0 && s.textContent.trim());
      }
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el._spans && el._spans.length) {
          el._spans.forEach((span, i) => setTimeout(() => scrambleElement(span), i * 80));
        } else if (el.children.length === 0) {
          scrambleElement(el);
        }
        io.unobserve(el);
      });
    }, { threshold: 0.3 });

    targets.forEach(el => io.observe(el));
  }

  /* ══════════════════════════════════════════
     6. MAGNETIC BUTTONS
     Buttons pull toward cursor on hover.
  ══════════════════════════════════════════ */
  function initMagnetic() {
    if (isMobile() || prefersReduced()) return;

    const STRENGTH = 0.38;
    const RADIUS   = 80;

    const buttons = $$(
      '.btn-primary, .btn-ghost, .btn-pill-solid, .btn-pill-out, .glow, [class*="glow-btn"], .nav-cta, .nav-audit'
    );

    buttons.forEach(btn => {
      let animId = null;
      let cx = 0, cy = 0, tx = 0, ty = 0;

      const animate = () => {
        cx = lerp(cx, tx, 0.14);
        cy = lerp(cy, ty, 0.14);
        btn.style.transform = `translate(${cx}px,${cy}px)`;
        if (Math.abs(cx - tx) > 0.05 || Math.abs(cy - ty) > 0.05) {
          animId = requestAnimationFrame(animate);
        } else { animId = null; }
      };

      document.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top  + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        tx = dist < RADIUS ? dx * STRENGTH : 0;
        ty = dist < RADIUS ? dy * STRENGTH : 0;
        if (!animId) animId = requestAnimationFrame(animate);
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!animId) animId = requestAnimationFrame(animate);
      });

      btn.style.willChange = 'transform';
    });
  }

  /* ── Init ── */
  function init() {
    initThemePersist();
    initLoader();
    initTransitions();
    initParallax();
    initScramble();
    initMagnetic();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
