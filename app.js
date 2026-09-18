(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches;
  const toggle = document.getElementById('motion-toggle');
  const progress = document.querySelector('.reading-progress');
  const hero = document.querySelector('.hero-scroll');
  let scheduled = false;
  function updateScroll() {
    const y = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${Math.min(1, y / Math.max(total, 1))})`;
    const range = hero ? hero.offsetHeight - window.innerHeight : 0;
    const amount = window.innerWidth > 760 && range > 0 ? Math.min(1, Math.max(0, y / range)) : 0;
    document.documentElement.style.setProperty('--hero-progress', paused ? '0' : amount.toFixed(3));
    scheduled = false;
  }
  function schedule() { if (!scheduled) { requestAnimationFrame(updateScroll); scheduled = true; } }
  function setMotion(value) {
    paused = value;
    document.body.classList.toggle('paused', paused);
    if (toggle) {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
    toggle.querySelector('.motion-text').textContent = paused ? 'Resume motion' : 'Pause motion';
    toggle.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    }
    schedule();
  }
  setMotion(paused);
  toggle?.addEventListener('click', () => setMotion(!paused));
  reduced.addEventListener('change', e => setMotion(e.matches));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('reveal-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  const steps = [...document.querySelectorAll('.step')];
  const content = [
    ['COLLECTION DATA', 'Signals become<br>reference inputs.', '/assets/nft-cat.webp'],
    ['NFT INDEX', 'One collection.<br>One reference price.', '/assets/nft-arcade.webp'],
    ['LONG / SHORT', 'Your view.<br>Your position.', '/assets/nft-anime.webp'],
    ['RISK & SETTLEMENT', 'Margin. Funding.<br>Liquidation.', '/assets/nft-doodle.webp']
  ];
  function selectStep(index, focus = false) {
    steps.forEach((step, i) => {
      const active = index === i;
      step.classList.toggle('active', active);
      step.setAttribute('aria-selected', String(active)); step.tabIndex = active ? 0 : -1;
      step.querySelector('.step-plus').textContent = active ? '−' : '+';
    });
    document.getElementById('index-title').textContent = content[index][0];
    document.getElementById('index-value').innerHTML = content[index][1];
    const art = document.getElementById('protocol-image'); art.removeAttribute('srcset'); art.src = content[index][2]; art.alt = ['Hypurr collectible', 'RH Machines collectible', 'Azuki collectible', 'Doodles collectible'][index];
    const panel = document.getElementById('step-panel');
    panel.textContent = steps[index].querySelector('.step-detail').textContent;
    panel.setAttribute('aria-labelledby', steps[index].id);
    if (focus) steps[index].focus();
  }
  steps.forEach((step, index) => {
    step.addEventListener('click', () => selectStep(index));
    step.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowDown') next = (index + 1) % steps.length;
      if (event.key === 'ArrowUp') next = (index - 1 + steps.length) % steps.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = steps.length - 1;
      if (next !== undefined) { event.preventDefault(); selectStep(next, true); }
    });
  });
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
    nav.classList.toggle('open', open);
  });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', closeMenu);

  const terminalDialog = document.getElementById('terminal-dialog');
  const terminalOpeners = [...document.querySelectorAll('[data-terminal-open]')];
  const terminalClose = terminalDialog?.querySelector('[data-terminal-close]');
  let terminalReturnFocus = null;
  function openTerminalDialog(event) {
    if (!terminalDialog) return;
    terminalReturnFocus = event.currentTarget;
    terminalDialog.showModal();
    terminalClose?.focus();
  }
  function closeTerminalDialog() {
    if (!terminalDialog?.open) return;
    terminalDialog.close();
  }
  terminalOpeners.forEach(button => button.addEventListener('click', openTerminalDialog));
  terminalClose?.addEventListener('click', closeTerminalDialog);
  terminalDialog?.addEventListener('click', event => {
    if (event.target === terminalDialog) closeTerminalDialog();
  });
  terminalDialog?.addEventListener('close', () => terminalReturnFocus?.focus());
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('page-hidden', document.hidden);
  });
  updateScroll();
})();
