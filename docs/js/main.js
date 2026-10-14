import { PRODUCTS, GALLERY, CONTACT } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const productName = p => `${p.name}${p.sup ? `<sup>${p.sup}</sup>` : ''}`;

const ICONS = {
  chart: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 20h16v2H4zM6 10h3v8H6zm5-4h3v12h-3zm5 7h3v5h-3z"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 7h11l-3-3 1.4-1.4L22 8l-5.6 5.4L15 12l3-3H7zm10 10H6l3 3-1.4 1.4L2 16l5.6-5.4L9 12l-3 3h11z"/></svg>',
  tools: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="m21.7 18.6-6.8-6.8a6 6 0 0 0-7.8-7.4l3.9 3.9-2.8 2.8-4-3.9a6 6 0 0 0 7.5 7.8l6.8 6.8a1 1 0 0 0 1.4 0l1.8-1.8a1 1 0 0 0 0-1.4Z"/></svg>',
  box: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 5h18v4H3zm1 6h16v8H4zm4 2v2h8v-2z"/></svg>',
};

/* ==========================================================================
   Product cards
   ========================================================================== */
const grid = $('#product-grid');

grid.innerHTML = PRODUCTS.map(p => `
  <article class="product-card" data-id="${p.id}" data-theme="${p.theme}" data-cat="${p.category}">
    <div class="pc-media">
      <span class="pc-badge">${p.badge}</span>
      <img src="${p.image}" alt="${p.name}${p.sup ? ' ' + p.sup : ''} ${p.type}" loading="lazy">
    </div>
    <div class="pc-body">
      <span class="pc-cat">${p.category}</span>
      <h3 class="pc-name">${productName(p)}${p.edition ? `<span class="pc-edition">${p.edition}</span>` : ''}</h3>
      <p class="pc-type">${p.type}</p>
      <span class="pc-toggle"><span class="pc-toggle-label">View details &amp; specs</span><span class="chev" aria-hidden="true">▾</span></span>
    </div>
    <button class="pc-hit" aria-expanded="false" aria-controls="detail-slot" aria-label="Show details for ${p.name}${p.sup ? ' ' + p.sup : ''} ${p.edition || ''}"></button>
  </article>`).join('');

// 3D tilt on hover
if (!reduceMotion) {
  $$('.product-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ==========================================================================
   Product detail drop-down
   ========================================================================== */
const slot = document.createElement('div');
slot.className = 'detail-slot';
slot.id = 'detail-slot';
slot.innerHTML = '<div class="detail-clip"></div>';
const clip = slot.firstElementChild;
let openId = null;

function featurePane(p) {
  let html = '';
  if (p.pillars) html += `<ul class="pillars">${p.pillars.map(t => `<li>${t}</li>`).join('')}</ul>`;
  if (p.features) {
    html += `<div class="feature-grid">${p.features.map(f => `
      <div class="feature"><h4><span class="ficon">${ICONS[f.icon]}</span>${f.title}</h4>
      <ul>${f.items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('')}</div>`;
  }
  if (p.highlights) html += `<ul class="highlight-list">${p.highlights.map(h => `<li><span>${h}</span></li>`).join('')}</ul>`;
  if (p.altImage) html += `<div class="tech" style="margin-top:1.6rem"><div><h4>${p.summary.split(' — ')[0]}</h4><p>${p.summary.split(' — ')[1] || ''}</p></div><div class="tech-media"><img src="${p.altImage}" alt="${p.name} side view" loading="lazy"></div></div>`;
  return html;
}

function paramPane(p) {
  const pr = p.parameters;
  return `<div class="param-block">
    <div class="param-total"><span>Test Parameters${p.id === 'hy500' ? '<br>for HY 500 PRO' : ''}</span><b>${pr.total}</b><span>PARAMETERS</span></div>
    <div class="param-groups">${pr.groups.map(g => `
      <div><h5>${g.name} (${g.count})</h5>
      <div class="chip-row">${g.items.split(', ').map(i => `<span>${i}</span>`).join('')}</div></div>`).join('')}
    </div></div>`;
}

function hemaSpecs(p) {
  let html = '';
  if (p.performance) {
    html += `<h3 class="pane-title">Reliable Results</h3><div class="perf-wrap"><table class="perf">
      <thead><tr>${p.performance.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${p.performance.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  html += `<h3 class="pane-title">Specifications</h3>
    <div class="spec-pills ${p.performance ? 'alt' : ''}">${p.specs.map(([k, v]) => `<div class="spec-pill"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>`;
  return html;
}

function chemTable(p) {
  // keep the brochure's two-column table; "wide" rows span both columns
  return `<h3 class="pane-title">Specification</h3><div class="chem-table">${p.specs.map(([k, v, wide]) =>
    `<div class="chem-row${wide ? ' wide' : ''}"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>`;
}

function chemGroups(p) {
  return `<h3 class="pane-title gold-title">Specifications</h3><div class="spec-cols">${p.specGroups.map(([k, lines]) =>
    `<div class="spec-group"><h5>${k}</h5>${lines.map(l => `<p>${l}</p>`).join('')}</div>`).join('')}</div>`;
}

function kitPane(p) {
  return `<h3 class="pane-title"><span>Main test kits for Chem Smart<sup>PRO</sup></span></h3>
    <div class="kit-grid">${p.testKits.map(([k, v]) => `<div class="kit"><b>${k}</b><span>${v}</span></div>`).join('')}</div>`;
}

function techPane(p) {
  return `<div class="tech-list">${p.technology.map((t, i) => `
    ${i === 2 ? '<p class="tech-algo-banner">Software Algorithm – Intelligent and Accurate Results</p>' : ''}
    <div class="tech">
      <div><h4>${t.title}</h4>${t.text.map(x => `<p>${x}</p>`).join('')}</div>
      <div class="tech-media${t.round ? ' round' : ''}"><img src="${t.image}" alt="${t.title} diagram" loading="lazy"></div>
      ${t.extra ? `<div class="tech-extra">${t.extra.map(src => `<img src="${src}" alt="" loading="lazy">`).join('')}</div>` : ''}
    </div>`).join('')}</div>`;
}

function tabsFor(p) {
  const tabs = [['overview', 'Overview', featurePane(p)]];
  if (p.parameters) tabs.push(['params', 'Test Parameters', paramPane(p)]);
  if (p.testKits) tabs.push(['kits', 'Test Kits', kitPane(p)]);
  if (p.theme === 'hema') tabs.push(['specs', p.performance ? 'Performance & Specs' : 'Specifications', hemaSpecs(p)]);
  if (p.specs && p.theme === 'chem') tabs.push(['specs', 'Specification', chemTable(p)]);
  if (p.specGroups) tabs.push(['specs', 'Specifications', chemGroups(p)]);
  if (p.technology) tabs.push(['tech', 'Technology', techPane(p)]);
  return tabs;
}

function renderDetail(p) {
  const tabs = tabsFor(p);
  const enquiry = encodeURIComponent(`Hello SnS Biomedicals, I would like a quote for the ${p.name}${p.sup ? ' ' + p.sup : ''}${p.edition ? ' (' + p.edition + ')' : ''} ${p.type}.`);
  return `<div class="detail" data-theme="${p.theme}" role="region" aria-label="${p.name} details">
    <button class="detail-close" aria-label="Close details">×</button>
    <div class="detail-head">
      <div class="dh-media"><img src="${p.image}" alt=""></div>
      <div>
        <h3 class="dh-title">${productName(p)}</h3>
        <p class="dh-type">${p.type}${p.edition ? ` · ${p.edition}` : ''}</p>
        <p class="dh-summary">${p.summary}</p>
        <div class="dh-stats">${p.keyStats.map(([b, s]) => `<div class="dh-stat"><b>${b}</b><span>${s}</span></div>`).join('')}</div>
      </div>
    </div>
    <div class="detail-tabs" role="tablist">${tabs.map(([id, label], i) =>
      `<button class="dtab${i ? '' : ' is-active'}" role="tab" aria-selected="${!i}" data-tab="${id}">${label}</button>`).join('')}</div>
    <div class="detail-body">${tabs.map(([id, , html], i) =>
      `<div class="dpane${i ? '' : ' is-active'}" role="tabpanel" data-pane="${id}">${html}</div>`).join('')}</div>
    <div class="detail-foot">
      <p>Interested in the ${p.name}${p.sup ? ' ' + p.sup : ''}? Get pricing, demo &amp; installation support.</p>
      <div style="display:flex;gap:.6rem;flex-wrap:wrap">
        <a class="btn btn-primary" href="https://wa.me/${CONTACT.phoneRaw}?text=${enquiry}" target="_blank" rel="noopener">Enquire on WhatsApp</a>
        <a class="btn btn-ghost" href="tel:${CONTACT.phone.replace(/[^+\d]/g, '')}">Call ${CONTACT.phone}</a>
      </div>
    </div>
  </div>`;
}

function lastCardInRow(card) {
  const visible = $$('.product-card', grid).filter(c => !c.classList.contains('is-hidden'));
  const top = card.offsetTop;
  return visible.filter(c => Math.abs(c.offsetTop - top) < 4).pop();
}

function setCardState(id) {
  $$('.product-card', grid).forEach(c => {
    const on = c.dataset.id === id;
    c.classList.toggle('is-open', on);
    $('.pc-hit', c).setAttribute('aria-expanded', on);
    $('.pc-toggle-label', c).textContent = on ? 'Hide details' : 'View details & specs';
  });
}

function closeDetail() {
  if (!openId) return;
  openId = null;
  slot.classList.remove('is-open');
  setCardState(null);
  history.replaceState(null, '', location.pathname + location.search);
}

function openDetail(id, { scroll = true } = {}) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (openId === id) { closeDetail(); return; }
  const card = $(`.product-card[data-id="${id}"]`, grid);
  if (card.classList.contains('is-hidden')) resetProductFilter();

  // measure rows without the slot in the grid
  const wasOpen = !!openId;
  slot.remove();
  const anchor = lastCardInRow(card);
  anchor.after(slot);
  clip.innerHTML = renderDetail(p);
  slot.classList.remove('is-open');
  void slot.offsetHeight; // restart the drop-down animation
  slot.style.setProperty('--arrow-x', '50%');
  const det = $('.detail', clip);
  det.style.setProperty('--arrow-x', `${card.offsetLeft - grid.offsetLeft + card.offsetWidth / 2 - 9}px`);
  requestAnimationFrame(() => slot.classList.add('is-open'));
  openId = id;
  setCardState(id);
  history.replaceState(null, '', `#product-${id}`);

  bindDetail(det);
  if (scroll) {
    const delay = wasOpen ? 60 : 0;
    setTimeout(() => {
      const y = card.getBoundingClientRect().top + scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) - 16;
      scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }, delay);
  }
}

function bindDetail(det) {
  $('.detail-close', det).addEventListener('click', () => {
    const card = $(`.product-card[data-id="${openId}"]`, grid);
    closeDetail();
    card?.querySelector('.pc-hit').focus({ preventScroll: true });
  });
  const tabs = $$('.dtab', det);
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.toggle('is-active', x === t); x.setAttribute('aria-selected', x === t); });
    $$('.dpane', det).forEach(pn => pn.classList.toggle('is-active', pn.dataset.pane === t.dataset.tab));
  }));
}

grid.addEventListener('click', e => {
  const hit = e.target.closest('.pc-hit');
  if (hit) openDetail(hit.closest('.product-card').dataset.id);
});

// keep the panel under the right row when the layout reflows
let rTimer;
addEventListener('resize', () => {
  clearTimeout(rTimer);
  rTimer = setTimeout(() => {
    if (!openId) return;
    const card = $(`.product-card[data-id="${openId}"]`, grid);
    slot.remove();
    lastCardInRow(card).after(slot);
    const det = $('.detail', clip);
    det?.style.setProperty('--arrow-x', `${card.offsetLeft - grid.offsetLeft + card.offsetWidth / 2 - 9}px`);
  }, 150);
});

// product filter chips
function applyProductFilter(f) {
  $$('#product-filters .chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === f));
  $$('.product-card', grid).forEach(c => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
  if (openId) {
    const card = $(`.product-card[data-id="${openId}"]`, grid);
    if (card.classList.contains('is-hidden')) closeDetail();
    else { slot.remove(); lastCardInRow(card).after(slot); }
  }
}
function resetProductFilter() { applyProductFilter('all'); }
$('#product-filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (chip) applyProductFilter(chip.dataset.filter);
});

/* ==========================================================================
   Hero 3D product ring
   ========================================================================== */
const ring = $('#ring');
const scene = $('#ring-scene');
// two laps of the range so the ring always shows neighbours
ring.innerHTML = [...PRODUCTS, ...PRODUCTS].map(p => `
  <div class="ring-card" data-id="${p.id}" data-theme="${p.theme}" role="button" tabindex="0" aria-label="${p.name} ${p.sup || ''} ${p.edition || ''} details">
    <img src="${p.image}" alt="" draggable="false">
    <div class="rc-name">${productName(p)}</div>
    <div class="rc-type">${p.type}${p.edition ? ' · ' + p.edition : ''}</div>
  </div>`).join('');
const ringCards = $$('.ring-card', ring);
const step = 360 / ringCards.length;
let angle = 0, velocity = 0, dragging = false, lastX = 0, moved = 0, hovering = false;

function ringRadius() { return (ring.offsetWidth / 2 + 14) / Math.tan(Math.PI / ringCards.length); }
function layoutRing() {
  const r = ringRadius();
  ringCards.forEach((c, i) => {
    const a = i * step + angle;
    c.style.transform = `rotateY(${a}deg) translateZ(${r}px)`;
    // fade cards that face away
    const facing = Math.cos(a * Math.PI / 180);
    c.style.opacity = facing < 0 ? 0 : (0.25 + 0.75 * facing).toFixed(3);
    c.style.pointerEvents = facing < 0.3 ? 'none' : 'auto';
    c.style.zIndex = Math.round(facing * 10) + 10;
  });
  ring.style.transform = `translateZ(${-r}px) rotateX(-6deg)`;
}
function tickRing() {
  if (!dragging) {
    if (!hovering && !reduceMotion) velocity += (-0.12 - velocity) * 0.02; // gentle auto-spin
    else velocity *= 0.92;
    angle += velocity;
  }
  layoutRing();
  requestAnimationFrame(tickRing);
}
scene.addEventListener('pointerdown', e => {
  dragging = true; moved = 0; lastX = e.clientX; velocity = 0;
  scene.setPointerCapture(e.pointerId); scene.classList.add('is-dragging');
});
scene.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
  angle += dx * 0.35; velocity = dx * 0.35;
});
const endDrag = e => {
  if (!dragging) return;
  dragging = false; scene.classList.remove('is-dragging');
  if (moved < 6) {
    // treat as a click on whichever card is under the pointer
    scene.releasePointerCapture?.(e.pointerId);
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.ring-card');
    if (el) goToProduct(el.dataset.id);
  }
};
scene.addEventListener('pointerup', endDrag);
scene.addEventListener('pointercancel', () => { dragging = false; scene.classList.remove('is-dragging'); });
scene.addEventListener('pointerenter', () => hovering = true);
scene.addEventListener('pointerleave', () => hovering = false);
ring.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('ring-card')) { e.preventDefault(); goToProduct(e.target.dataset.id); }
});
function goToProduct(id) {
  if (openId !== id) openDetail(id);
  else $('#products').scrollIntoView({ behavior: 'smooth' });
}
layoutRing();
requestAnimationFrame(tickRing);

/* ==========================================================================
   Gallery — coverflow + masonry + lightbox
   ========================================================================== */
const track = $('#cf-track');
const cover = $('#coverflow');
const caption = $('#cf-caption');
const masonry = $('#masonry');
const CAT_LABEL = { hematology: 'Hematology', biochemistry: 'Biochemistry', electrolyte: 'Electrolyte', installation: 'Installation' };
let gFilter = 'all';
let gList = GALLERY.slice();
let current = 0;

track.innerHTML = GALLERY.map((g, i) => `
  <figure class="cf-item" data-i="${i}"><img src="assets/thumbs/${g.f}.jpg" alt="${g.t} — ${g.s}" loading="lazy" draggable="false"></figure>`).join('');
masonry.innerHTML = GALLERY.map((g, i) => `
  <button class="m-item" data-i="${i}" data-cat="${g.cat}" aria-label="Open ${g.t} — ${g.s}">
    <img src="assets/thumbs/${g.f}.jpg" alt="${g.t} — ${g.s}" loading="lazy">
    <span class="m-cap"><b>${g.t}</b>${g.s}</span>
  </button>`).join('');
const cfItems = $$('.cf-item', track);

$$('#gallery-filters .chip').forEach(c => {
  const f = c.dataset.filter;
  $('.chip-count', c).textContent = f === 'all' ? GALLERY.length : GALLERY.filter(g => g.cat === f).length;
});

function layoutCover() {
  const w = cfItems[0].offsetWidth || 400;
  const visibleIdx = gList.map(g => GALLERY.indexOf(g));
  cfItems.forEach((el, i) => {
    const pos = visibleIdx.indexOf(i);
    if (pos === -1) { el.style.opacity = 0; el.style.pointerEvents = 'none'; el.style.transform = 'translate(-50%,-50%) scale(.5)'; el.classList.remove('is-center'); return; }
    // circular distance so neighbours show on both sides
    const n = gList.length;
    let d = pos - current;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    const ad = Math.abs(d);
    const x = d === 0 ? 0 : Math.sign(d) * (w * 0.62 + (ad - 1) * w * 0.26);
    const z = -ad * 160;
    const ry = d === 0 ? 0 : -Math.sign(d) * 42;
    el.style.transform = `translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
    el.style.opacity = ad > 4 ? 0 : 1 - ad * 0.12;
    el.style.filter = d === 0 ? 'none' : `brightness(${1 - ad * 0.1})`;
    el.style.zIndex = 100 - ad;
    el.style.pointerEvents = ad > 4 ? 'none' : 'auto';
    el.classList.toggle('is-center', d === 0);
  });
  const g = gList[current];
  caption.innerHTML = g ? `<b>${g.t}</b><span>${g.s}</span><small>${CAT_LABEL[g.cat]} · ${current + 1} / ${gList.length}</small>` : '';
}
function go(n) { current = (n + gList.length) % gList.length; layoutCover(); }

$('.cf-prev').addEventListener('click', () => { go(current - 1); restartAuto(); });
$('.cf-next').addEventListener('click', () => { go(current + 1); restartAuto(); });
cover.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { go(current - 1); restartAuto(); }
  if (e.key === 'ArrowRight') { go(current + 1); restartAuto(); }
  if (e.key === 'Enter') openLightbox(current);
});

// drag / swipe
let cfStart = null, cfMoved = 0;
cover.addEventListener('pointerdown', e => { if (e.target.closest('.cf-nav')) return; cfStart = e.clientX; cfMoved = 0; });
cover.addEventListener('pointermove', e => { if (cfStart !== null) cfMoved = e.clientX - cfStart; });
cover.addEventListener('pointerup', e => {
  if (cfStart === null) return;
  const dx = cfMoved; cfStart = null;
  if (Math.abs(dx) > 40) { go(current - Math.sign(dx) * Math.max(1, Math.round(Math.abs(dx) / 160))); restartAuto(); return; }
  const item = e.target.closest('.cf-item');
  if (!item) return;
  const pos = gList.indexOf(GALLERY[+item.dataset.i]);
  if (pos === current) openLightbox(current);
  else { go(pos); restartAuto(); }
});
cover.addEventListener('pointerleave', () => { cfStart = null; });

let auto;
function restartAuto() {
  clearInterval(auto);
  if (!reduceMotion) auto = setInterval(() => { if (!document.hidden && lb.hidden) go(current + 1); }, 4200);
}
cover.addEventListener('mouseenter', () => clearInterval(auto));
cover.addEventListener('mouseleave', restartAuto);

function applyGalleryFilter(f) {
  gFilter = f;
  gList = GALLERY.filter(g => f === 'all' || g.cat === f);
  current = 0;
  $$('#gallery-filters .chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === f));
  $$('.m-item', masonry).forEach(m => m.classList.toggle('is-hidden', f !== 'all' && m.dataset.cat !== f));
  layoutCover();
  restartAuto();
}
$('#gallery-filters').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (chip) applyGalleryFilter(chip.dataset.filter);
});
masonry.addEventListener('click', e => {
  const m = e.target.closest('.m-item');
  if (m) openLightbox(gList.indexOf(GALLERY[+m.dataset.i]));
});

// lightbox
const lb = $('#lightbox');
const lbImg = $('#lb-img');
const lbCap = $('#lb-cap');
let lbIndex = 0, lastFocus = null;
function showLb(i) {
  lbIndex = (i + gList.length) % gList.length;
  const g = gList[lbIndex];
  lbImg.src = `assets/gallery/${g.f}.jpg`;
  lbImg.alt = `${g.t} — ${g.s}`;
  lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
  lbCap.innerHTML = `<b>${g.t}</b> · ${g.s} <span>(${lbIndex + 1}/${gList.length})</span>`;
  // preload neighbours
  [1, -1].forEach(o => { const n = gList[(lbIndex + o + gList.length) % gList.length]; new Image().src = `assets/gallery/${n.f}.jpg`; });
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  showLb(i);
  $('.lb-close', lb).focus();
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = '';
  go(lbIndex);
  lastFocus?.focus?.({ preventScroll: true });
}
$('.lb-close', lb).addEventListener('click', closeLightbox);
$('.lb-prev', lb).addEventListener('click', () => showLb(lbIndex - 1));
$('.lb-next', lb).addEventListener('click', () => showLb(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-figure')) closeLightbox(); });
addEventListener('keydown', e => {
  if (lb.hidden) { if (e.key === 'Escape' && openId) closeDetail(); return; }
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
  if (e.key === 'ArrowRight') showLb(lbIndex + 1);
  if (e.key === 'Tab') { // simple focus trap
    const f = $$('button', lb); const i = f.indexOf(document.activeElement);
    e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
  }
});
let lbTouch = null;
lb.addEventListener('touchstart', e => { lbTouch = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  if (lbTouch === null) return;
  const dx = e.changedTouches[0].clientX - lbTouch; lbTouch = null;
  if (Math.abs(dx) > 50) showLb(lbIndex - Math.sign(dx));
});

layoutCover();
addEventListener('resize', layoutCover);
restartAuto();

/* ==========================================================================
   Contact, nav, reveal, counters
   ========================================================================== */
$('#manufacturer-list').innerHTML = CONTACT.manufacturerOf.map(m => `<li>${m}</li>`).join('');
$('#contact-list').innerHTML = `
  <li><a href="tel:${CONTACT.phone.replace(/[^+\d]/g, '')}"><span class="ci">☎</span>${CONTACT.phone}</a></li>
  <li><a href="mailto:${CONTACT.email}"><span class="ci">✉</span>${CONTACT.email}</a></li>
  <li><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}" target="_blank" rel="noopener"><span class="ci">⌖</span>${CONTACT.address}</a></li>`;
$('#wa-fab').href = `https://wa.me/${CONTACT.phoneRaw}?text=${encodeURIComponent('Hello SnS Biomedicals, I would like to know more about your analyzers.')}`;
$('#year').textContent = new Date().getFullYear();

const toggle = $('.nav-toggle');
const nav = $('#nav');
toggle.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => { if (e.target.tagName === 'A') { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', false); } });

const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
}), { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

// active nav link
const sections = ['products', 'gallery', 'about', 'contact'].map(id => document.getElementById(id));
const navIo = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) $$('.nav a').forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && navIo.observe(s));

// count-up stats
if (!reduceMotion) {
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// deep link: #product-hy300
const m = location.hash.match(/^#product-(.+)$/);
if (m && PRODUCTS.some(p => p.id === m[1])) setTimeout(() => openDetail(m[1]), 300);
