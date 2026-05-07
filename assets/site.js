/* Levant Digital Marketing — site.js */
(function () {
  'use strict';

  /* --- Nav scroll shadow --- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const tick = () => nav.classList.toggle('scrolled', window.scrollY > 4);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* --- Mobile menu toggle --- */
  const toggle = document.querySelector('.nav__toggle');
  const drawer = document.querySelector('.nav__drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --- Scroll reveal (respects prefers-reduced-motion) --- */
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && !mq.matches) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -32px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item = btn.closest('.faq__item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item.open').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* --- Form submission (Formspree-compatible) --- */
  document.querySelectorAll('.js-form').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = form.querySelector('[data-submit]');
      const errorEl   = form.querySelector('.form-error');
      const successEl = form.querySelector('.form-success');
      if (!submitBtn) return;

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (errorEl)   errorEl.style.display   = 'none';
      if (successEl) successEl.style.display = 'none';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (successEl) successEl.style.display = 'block';
        } else {
          throw new Error('server');
        }
      } catch (_) {
        if (errorEl) errorEl.style.display = 'block';
        submitBtn.disabled    = false;
        submitBtn.textContent = originalText;
      }
    });
  });

})();
