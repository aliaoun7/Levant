/* Levant motion pack JS — services + why-us */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktopHover = window.matchMedia('(hover: hover) and (min-width: 1041px)').matches;

  /* ---------- Inject required DOM ---------- */
  function inject(html, target) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    target.appendChild(tpl.content.firstChild);
  }

  // Scroll progress
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.id = 'levantScrollProgress';
  document.body.insertBefore(progress, document.body.firstChild);

  // Cursor (desktop only)
  let cursorDot = null, cursorRing = null;
  if (isDesktopHover && !reduce) {
    cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorRing);
    document.body.appendChild(cursorDot);
  }

  // Hero aurora + canvas (auto-attach to .hero or .why-hero)
  const heroSection = document.querySelector('.hero, .why-hero');
  let canvas = null;
  if (heroSection) {
    const aurora = document.createElement('div');
    aurora.className = 'aurora';
    aurora.setAttribute('aria-hidden', 'true');
    aurora.innerHTML = '<span></span><span></span><span></span>';
    heroSection.insertBefore(aurora, heroSection.firstChild);

    canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.id = 'levantHeroParticles';
    canvas.setAttribute('aria-hidden', 'true');
    heroSection.insertBefore(canvas, heroSection.firstChild);
  }

  /* ---------- Scroll progress bar ---------- */
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Nav scrolled state ---------- */
  const nav = document.querySelector('.site-nav');
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---------- Mouse light ---------- */
  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      document.documentElement.style.setProperty('--mx', x + '%');
      document.documentElement.style.setProperty('--my', y + '%');
    }, { passive: true });
  }

  /* ---------- Custom cursor ---------- */
  if (cursorDot && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    ringLoop();
    const hoverSel = 'a, button, .btn, .service-card, .breakdown-card, .client-path-card, .engine-card, .step, .gap-row, .faq-q, .faq-question, .system-row';
    document.querySelectorAll(hoverSel).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hover-active');
        cursorRing.classList.add('hover-active');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hover-active');
        cursorRing.classList.remove('hover-active');
      });
    });
  }

  /* ---------- Mobile drawer ---------- */
  const mobBtn = document.querySelector('.mobile-btn');
  const navLinks = document.querySelector('.nav-links');
  if (mobBtn && navLinks) {
    const drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = '<button class="drawer-close" aria-label="Close menu" type="button">×</button>' + navLinks.innerHTML;
    document.body.appendChild(drawer);
    function openDrawer() {
      document.body.classList.add('drawer-open');
      drawer.setAttribute('aria-hidden', 'false');
      mobBtn.setAttribute('aria-expanded', 'true');
    }
    function closeDrawer() {
      document.body.classList.remove('drawer-open');
      drawer.setAttribute('aria-hidden', 'true');
      mobBtn.setAttribute('aria-expanded', 'false');
    }
    mobBtn.addEventListener('click', () => {
      if (document.body.classList.contains('drawer-open')) closeDrawer();
      else openDrawer();
    });
    drawer.querySelector('.drawer-close').addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1040) closeDrawer();
    });
  }

  /* ---------- Hero particles ---------- */
  const isMobile = window.matchMedia('(max-width: 1040px)').matches;
  if (canvas && !reduce && !isMobile) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [], W = 0, H = 0;
    function resize() {
      const r = heroSection.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      particles = [];
      const count = Math.min(60, Math.floor(W / 22));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - .5) * .3,
          vy: (Math.random() - .5) * .3,
          r: Math.random() * 2 + .6,
          a: Math.random() * .5 + .25
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,174,202,${p.a})`;
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            ctx.strokeStyle = `rgba(16,174,202,${(1 - d2 / 12000) * .18})`;
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    resize();
    init();
    draw();
    window.addEventListener('resize', () => { resize(); init(); });
  }

  /* ---------- Headline fade-up ---------- */
  const h1 = document.querySelector('.hero .h1, .why-hero .h1');
  if (h1 && !reduce) {
    h1.classList.add('headline-in');
  }

  /* ---------- Magnetic primary buttons ---------- */
  if (isDesktopHover && !reduce) {
    document.querySelectorAll('.btn.primary').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .18}px, ${y * .25}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (isDesktopHover && !reduce) {
    const tiltSel = '.service-card, .breakdown-card, .client-path-card, .engine-card, .step';
    document.querySelectorAll(tiltSel).forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - .5) * -7;
        const ry = (px - .5) * 9;
        card.classList.add('tilt-active');
        card.style.transform = `translateY(-6px) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
        card.classList.remove('tilt-active');
      });
    });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^([+\-]?[\d.]+)(.*)$/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const isInt = !raw.includes('.');
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = (isInt ? Math.round(val) : val.toFixed(1)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduce) {
    const counters = document.querySelectorAll('.stat b, .impact-stat b, .engine-metric b');
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: .4 });
    counters.forEach((c) => {
      // Skip non-numeric or step labels
      if (/^[+\-]?[\d.]/.test(c.textContent.trim())) co.observe(c);
    });
  }

  /* ---------- Auto-add reveal class to common blocks ---------- */
  function autoReveal() {
    const sel = [
      '.service-card', '.breakdown-card', '.client-path-card',
      '.system-row', '.engine-card', '.step', '.gap-column',
      '.feature', '.stat', '.impact-stat', '.engine-metric',
      '.hero-badge', '.faq-q', '.faq-question', '.faq-item',
      '.engine-main', '.mini-cta', '.proof-panel', '.trust-card',
      '.problem-card', '.quote'
    ].join(',');
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        if (!el.dataset.delay) {
          el.dataset.delay = String((i % 4) + 1);
        }
      }
    });
  }
  autoReveal();

  /* ---------- IntersectionObserver reveal ---------- */
  const revealItems = document.querySelectorAll('.reveal, [data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  /* ---------- Parallax hero art ---------- */
  if (!reduce) {
    const visual = document.querySelector('.hero-art, .hero-visual');
    if (visual) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y < 800) {
          visual.style.translate = `0 ${y * 0.10}px`;
        }
      }, { passive: true });
    }
  }

  /* ---------- FAQ accordion (why-us simple list) ---------- */
  document.querySelectorAll('.faq-q').forEach((q) => {
    if (q.dataset.bound) return;
    q.dataset.bound = '1';
    q.addEventListener('click', () => {
      const sign = q.querySelector('span:last-child');
      if (sign) sign.textContent = sign.textContent === '+' ? '−' : '+';
    });
  });
})();
