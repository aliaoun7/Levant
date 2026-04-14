(() => {
  function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const update = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initMobileMenu() {
    const menuBtn = document.getElementById('mob-btn');
    const closeBtn = document.getElementById('mob-close');
    const mobileMenu = document.getElementById('mob-menu');
    if (!menuBtn || !closeBtn || !mobileMenu) return;

    const setOpen = (open) => {
      mobileMenu.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.classList.toggle('menu-open', open);
    };

    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'mob-menu');
    mobileMenu.setAttribute('aria-hidden', 'true');

    menuBtn.addEventListener('click', () => setOpen(true));
    closeBtn.addEventListener('click', () => setOpen(false));
    document.querySelectorAll('#mob-menu a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setOpen(false);
        menuBtn.focus();
      }
    });
  }

  function initReveal() {
    const items = document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .stagger');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  function initImageDefaults() {
    document.querySelectorAll('img').forEach((img) => {
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }

      const isHeroImage = Boolean(img.closest('.hero'));
      if (!isHeroImage && !img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  function init() {
    initNavScroll();
    initMobileMenu();
    initReveal();
    initImageDefaults();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
