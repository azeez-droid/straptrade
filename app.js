(() => {
  const body = document.body;
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.header nav');
  const progress = document.querySelector('.reading-progress');
  const motionButton = document.querySelector('.motion-toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
    body.classList.remove('menu-open');
  };

  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('open', !open);
    body.classList.toggle('menu-open', !open);
  });
  nav?.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  const updateProgress = () => {
    if (!progress) return;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = range > 0 ? `${Math.min(100, Math.max(0, scrollY / range * 100))}%` : '0%';
  };
  updateProgress();
  addEventListener('scroll', updateProgress, { passive: true });
  addEventListener('resize', updateProgress);

  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  let paused = reduce || localStorage.getItem('straptrade-motion') === 'paused';
  const syncMotion = () => {
    body.classList.toggle('motion-paused', paused);
    document.querySelectorAll('.reveal').forEach(el => {
      if (paused) el.classList.add('is-visible');
    });
    if (motionButton) {
      motionButton.textContent = paused ? 'Play motion' : 'Pause motion';
      motionButton.setAttribute('aria-pressed', String(paused));
    }
  };
  syncMotion();
  motionButton?.addEventListener('click', () => {
    paused = !paused;
    localStorage.setItem('straptrade-motion', paused ? 'paused' : 'playing');
    syncMotion();
  });

  // Gentle, bounded gallery movement on fine pointers only.
  const gallery = document.querySelector('.hero-gallery');
  if (gallery && !reduce && matchMedia('(pointer:fine)').matches) {
    const cards = [...gallery.querySelectorAll('.gallery-card')];
    let raf = 0;
    const move = () => {
      raf = 0;
      if (paused) return;
      const rect = gallery.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const p = Math.max(-1, Math.min(1, (innerHeight / 2 - (rect.top + rect.height / 2)) / innerHeight));
      cards.forEach((card, i) => {
        const base = (i % 2 === 1) ? 34 : 0;
        const drift = p * (i % 2 === 0 ? 5 : -5);
        card.style.transform = `translateY(${base + drift}px)`;
      });
    };
    const request = () => { if (!raf) raf = requestAnimationFrame(move); };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    request();
  }

  // Protocol tabs: keyboard-operable tablist, content remains in one panel.
  const steps = [...document.querySelectorAll('.protocol-step')];
  const panel = document.querySelector('.protocol-panel-inner');
  if (steps.length && panel) {
    const content = [
      {
        label: '01 / Collection data',
        title: 'Aggregate the market.',
        copy: 'The whitepaper describes a multi-source oracle layer drawing from NFT marketplaces, aggregated orderflow, and decentralized base-asset feeds to produce validated collection inputs.',
        nodes: ['Marketplaces', 'Validation', 'Collection data']
      },
      {
        label: '02 / NFT index',
        title: 'Turn the collection into an index.',
        copy: 'Validated floor, depth, volatility and TWAP inputs feed a deterministic collection valuation model. That index becomes the reference for synthetic exposure.',
        nodes: ['Validated data', 'NFT index', 'Synthetic unit']
      },
      {
        label: '03 / Position',
        title: 'Express a direction.',
        copy: 'Traders open synthetic long or short positions against the collection index. The design separates market exposure from ownership of an individual NFT.',
        nodes: ['Collateral', 'Long / short', 'Position state']
      },
      {
        label: '04 / Risk & settlement',
        title: 'Keep risk deterministic.',
        copy: 'Margin, funding, liquidation and settlement modules use the canonical index and account equity to manage position health and protocol solvency.',
        nodes: ['Margin', 'Risk engine', 'Settlement']
      }
    ];
    const render = index => {
      const c = content[index];
      panel.innerHTML = `<span class="panel-label">${c.label}</span><h3>${c.title}</h3><p>${c.copy}</p><div class="flow-diagram" aria-label="Illustrative protocol flow"><div class="flow-node">${c.nodes[0]}</div><span class="flow-arrow" aria-hidden="true">→</span><div class="flow-node">${c.nodes[1]}</div><span class="flow-arrow" aria-hidden="true">→</span><div class="flow-node">${c.nodes[2]}</div></div><p class="meta" style="margin-top:22px">Illustrative system flow. See the whitepaper for the protocol description.</p>`;
      steps.forEach((btn, i) => {
        btn.setAttribute('aria-selected', String(i === index));
        btn.tabIndex = i === index ? 0 : -1;
      });
    };
    steps.forEach((btn, index) => {
      btn.addEventListener('click', () => render(index));
      btn.addEventListener('keydown', e => {
        if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
        e.preventDefault();
        let next = index;
        if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = steps.length - 1;
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % steps.length;
        else next = (index - 1 + steps.length) % steps.length;
        steps[next].focus();
        render(next);
      });
    });
    render(0);
  }

  // Accessible enlarged product concept.
  const dialog = document.querySelector('#terminal-dialog');
  const openDialog = document.querySelector('.terminal-open');
  const closeDialog = document.querySelector('.dialog-close');
  let dialogOpener = null;
  openDialog?.addEventListener('click', () => {
    dialogOpener = document.activeElement;
    if (dialog?.showModal) dialog.showModal();
  });
  closeDialog?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', e => {
    const box = dialog.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
  });
  dialog?.addEventListener('close', () => dialogOpener?.focus?.());
})();
