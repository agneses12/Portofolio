// Behaviour for the single-page portfolio.

// Mobile menu (closes again once a section is picked)
const menuBtn = document.getElementById('menu-btn');
const links = document.getElementById('links');
const setMenu = open => {
  links.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
};
if (menuBtn) {
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
}

// Nav gets a border once the page is scrolled, and highlights the section in view
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.links a[href^="#"]')];
const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
const onScroll = () => {
  nav.classList.toggle('solid', window.scrollY > 10);
  const line = nav.offsetHeight + 40;
  const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  let current = sections[0];
  sections.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s; });
  if (atEnd) current = sections[sections.length - 1];
  navLinks.forEach(a => {
    if (a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Tabs (experience page)
const tabs = document.querySelectorAll('[role="tab"][aria-controls]');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(o => {
    const on = o === t;
    o.setAttribute('aria-selected', on);
    document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
  });
}));

// Screenshot switcher + lightbox (projects page)
const shotImg = document.getElementById('shot-img');
if (shotImg) {
  const shotUrl = document.getElementById('shot-url');
  const shotTabs = document.querySelectorAll('.shot-tabs button');
  shotTabs.forEach(b => b.addEventListener('click', () => {
    shotTabs.forEach(o => o.setAttribute('aria-selected', o === b));
    shotImg.src = b.dataset.src; shotImg.alt = b.dataset.alt;
    shotUrl.textContent = 'apm-dashboard / ' + b.dataset.url;
  }));
  const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
  document.getElementById('shot-open').addEventListener('click', () => {
    lbImg.src = shotImg.src; lbImg.alt = shotImg.alt; lb.hidden = false;
  });
  lb.addEventListener('click', () => lb.hidden = true);
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });
}

// CV download buttons. On a normal website the plain <a download> link works.
// Inside the claude.ai viewer, plain downloads are blocked, so hand the file
// over through the viewer's `downloads` capability instead.
let viewerDownloads = null;
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('downloads').then(d => { viewerDownloads = d; }).catch(() => {});
}
document.addEventListener('click', async e => {
  const link = e.target.closest('a[download]');
  if (!link || !viewerDownloads) return;
  e.preventDefault();
  try {
    const res = await fetch(link.getAttribute('href'));
    if (!res.ok) throw new Error('fetch failed');
    const filename = decodeURIComponent(link.getAttribute('href').split('/').pop());
    await viewerDownloads.save({ filename, data: await res.blob() });
  } catch (err) {
    // `declined` means the viewer chose not to save: nothing to do.
    if (err && err.code === 'declined') return;
    window.open(link.getAttribute('href'), '_blank', 'noopener');
  }
});

// Reveal on scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Count-up for numbers marked with data-count
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count;
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0) / 1200, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }).observe(el);
  });
}
