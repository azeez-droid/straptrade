(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;
  try { paused = localStorage.getItem('straptrade-motion') === 'paused'; } catch {}
  const motionOff = () => paused || reduced.matches || document.hidden;
  function syncMotion() {
    document.body.classList.toggle('motion-paused', motionOff());
    document.documentElement.classList.toggle('motion-paused', motionOff());
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused || reduced.matches));
      toggle.textContent = reduced.matches ? 'Reduced motion enabled' : paused ? 'Resume motion' : 'Pause motion';
      toggle.disabled = reduced.matches;
    }
  }
  syncMotion();
  toggle?.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('straptrade-motion', paused ? 'paused' : 'enabled'); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);

  if (!motionOff() && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => {
      // Already visible content never disappears after initial paint.
      if (element.getBoundingClientRect().top >= innerHeight) {
        observer.observe(element);
        element.classList.add('reveal-pending');
      }
    });
    document.querySelectorAll('.hero-art').forEach((element, index) => {
      element.style.setProperty('--entry-delay', `${index * 80}ms`);
      element.classList.add('gallery-enter');
    });
  }

  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  function updateProgress() {
    scrollFrame = 0;
    const range = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0})`;
  }
  function scheduleProgress() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
  }
  addEventListener('scroll', scheduleProgress, { passive: true });
  addEventListener('resize', scheduleProgress, { passive: true });
  addEventListener('load', scheduleProgress);
  updateProgress();

  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    nav?.classList.remove('open');
  }
  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

  const steps = [...document.querySelectorAll('details.protocol-step')];
  steps.forEach(step => step.addEventListener('toggle', () => {
    if (step.open) steps.forEach(other => { if (other !== step) other.open = false; });
    scheduleProgress();
  }));

  const dialog = document.querySelector('.preview-dialog');
  const preview = document.querySelector('[data-open-preview]');
  const imageArea = document.querySelector('.dialog-image-area');
  const zoom = document.getElementById('zoom-preview');
  function resetZoom() {
    imageArea?.classList.remove('zoomed');
    zoom?.setAttribute('aria-pressed', 'false');
    if (zoom) zoom.textContent = 'Zoom in';
    if (imageArea) { imageArea.scrollTop = 0; imageArea.scrollLeft = 0; }
  }
  if (dialog && typeof dialog.showModal === 'function') {
    preview?.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      resetZoom();
      dialog.showModal();
      document.body.classList.add('dialog-open');
      document.getElementById('close-preview')?.focus();
    });
    document.getElementById('close-preview')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      resetZoom();
      preview?.focus();
    });
    zoom?.addEventListener('click', () => {
      const enlarged = imageArea.classList.toggle('zoomed');
      zoom.setAttribute('aria-pressed', String(enlarged));
      zoom.textContent = enlarged ? 'Fit image' : 'Zoom in';
      if (enlarged) imageArea.focus();
      else { imageArea.scrollTop = 0; imageArea.scrollLeft = 0; }
    });
  }
})();
