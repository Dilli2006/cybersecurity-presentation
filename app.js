/* =========================================================
   SECURITY POLICY & RISK MANAGEMENT — V3 · app.js
   Carousel engine + ReactBits/shadcn-style components (vanilla)
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const SPRM = window.SPRM = { cur: 0, risk: { L: 4, I: 5, rL: 4, rI: 5 } };

  /* ---------- fit 1600×900 stage to any screen ---------- */
  const stage = $('#stage');
  const fit = () => { const s = Math.min(innerWidth / 1600, innerHeight / 900); stage.style.setProperty('--s', s); window.__scale = s; };
  addEventListener('resize', fit); fit();

  /* ---------- Split Text ---------- */
  $$('[data-split]').forEach(el => {
    let k = 0;
    el.innerHTML = el.textContent.split('|').map(line =>
      '<span class="line">' + [...line].map(ch => ch === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch" style="--i:${k++}">${ch}</span>`).join('') + '</span>'
    ).join('');
  });

  /* ---------- Decrypted Text ---------- */
  const GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEFXYZ$%&';
  function decrypt(el, speed = 32) {
    const target = el.dataset.text || (el.dataset.text = el.textContent);
    let f = 0; clearInterval(el._t);
    el._t = setInterval(() => {
      f++; const rev = Math.floor(f * target.length / 24);
      el.textContent = [...target].map((c, i) => (i < rev || c === ' ') ? c : GLYPHS[Math.random() * GLYPHS.length | 0]).join('');
      if (rev >= target.length) { clearInterval(el._t); el.textContent = target; }
    }, speed);
  }

  /* ---------- Count Up ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    const dur = 1500, t0 = performance.now() + 350; cancelAnimationFrame(el._r);
    const step = t => {
      const p = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + (to * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (p < 1) el._r = requestAnimationFrame(step);
    };
    el._r = requestAnimationFrame(step);
  }

  /* ---------- Toasts (Sonner-style) ---------- */
  const ICONS = {
    ok: '<span class="material-symbols-rounded">check</span>',
    bad: '<span class="material-symbols-rounded">priority_high</span>',
    warn: '<span class="material-symbols-rounded">warning</span>',
    info: '<span class="material-symbols-rounded">info</span>'
  };
  function toast(title, desc = '', type = 'ok') {
    const t = document.createElement('div'); t.className = 'toast ' + type;
    t.innerHTML = `<span class="ti">${ICONS[type] || ICONS.ok}</span><div><b>${title}</b><span>${desc}</span></div>`;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3400);
  }
  SPRM.toast = toast;

  /* ---------- Mascot: Patch ---------- */
  const mascot = $('#mascot'), bubble = $('#bubble'), eyes = $('#eyes'), mouth = $('#mouth');
  const MOUTHS = { happy: 'M52 64 Q60 73 68 64', idle: 'M53 66 Q60 70 67 66', alarmed: 'M54 68 Q60 63 66 68', think: 'M54 67 L66 66' };
  let bubbleTimer;
  function say(html, mood) {
    if (mood) { mascot.classList.remove('happy', 'alarmed', 'idle', 'think'); void mascot.offsetWidth; mascot.classList.add(mood); mouth.setAttribute('d', MOUTHS[mood] || MOUTHS.idle); }
    bubble.innerHTML = html; bubble.classList.remove('hide', 'say'); void bubble.offsetWidth; bubble.classList.add('say');
    clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => bubble.classList.add('hide'), 5200);
  }
  SPRM.say = say;
  addEventListener('pointermove', e => {
    const r = mascot.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .38;
    const a = Math.atan2(e.clientY - cy, e.clientX - cx), d = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 300);
    eyes.setAttribute('transform', `translate(${Math.cos(a) * 3.2 * d} ${Math.sin(a) * 2.6 * d})`);
  });
  setInterval(() => { eyes.style.transform = 'scaleY(.1)'; eyes.style.transformOrigin = '60px 57px'; setTimeout(() => eyes.style.transform = '', 130); }, 3800);
  const QUIPS = ['Policy on paper is not security in practice.', 'MFA everywhere. Yes, even the old VPN.', 'Patch Tuesday is not a suggestion.', 'Evidence, or it didn\'t happen.', 'Risk is never zero. Just smaller.'];
  let qi = 0;
  mascot.addEventListener('click', () => say(QUIPS[qi++ % QUIPS.length], 'happy'));
  mascot.addEventListener('mouseenter', () => bubble.classList.remove('hide'));

  /* ---------- Carousel core ---------- */
  const slides = $$('.slide'), N = slides.length;
  const hooks = {};
  let booted = false;

  function go(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (booted && i === SPRM.cur) return;
    SPRM.cur = i;
    slides.forEach((s, j) => { s.classList.toggle('active', j === i); s.classList.toggle('prev', j < i); });
    const s = slides[i];
    decrypt($('.decktitle', s), 22);
    $$('[data-decrypt]', s).forEach(el => decrypt(el));
    $$('[data-count]', s).forEach(countUp);
    $('#deck-footer').textContent = s.dataset.footer || '';
    $('#progress').style.width = ((i + 1) / N * 100) + '%';
    $('#counter').innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${N}`;
    $$('.dock-item[data-i]').forEach(d => d.classList.toggle('on', +d.dataset.i === i));
    if (s.dataset.say) setTimeout(() => say(s.dataset.say, s.dataset.mood), 450);
    $('#notes-title').textContent = `${i + 1}. ${s.dataset.title}`;
    $('#notes-body').textContent = s.dataset.notes || '';
    if (s.dataset.hook && hooks[s.dataset.hook]) hooks[s.dataset.hook]();
    history.replaceState(null, '', '#' + (i + 1));
    document.dispatchEvent(new CustomEvent('slidechange', { detail: i }));
    booted = true;
  }
  SPRM.go = go;
  const next = () => go(SPRM.cur + 1), prev = () => go(SPRM.cur - 1);

  /* ---------- Dock (ReactBits Dock w/ magnification) ---------- */
  const dock = $('#dock');
  slides.forEach((s, i) => {
    const b = document.createElement('button'); b.className = 'dock-item'; b.dataset.i = i; b.id = 'dock-' + (i + 1);
    b.innerHTML = `<span class="material-symbols-rounded">${s.dataset.icon || 'circle'}</span><span class="tip">${i + 1}. ${s.dataset.title.split(':')[0]}</span>`;
    b.onclick = () => go(i); dock.appendChild(b);
  });
  dock.insertAdjacentHTML('beforeend', '<span class="sep"></span>' +
    '<button class="dock-item tool" id="dock-cmd"><span class="material-symbols-rounded">search</span><span class="tip">Jump (Ctrl K)</span></button>' +
    '<button class="dock-item tool" id="dock-notes"><span class="material-symbols-rounded">edit_note</span><span class="tip">Notes (N)</span></button>' +
    '<button class="dock-item tool" id="dock-fs"><span class="material-symbols-rounded">fullscreen</span><span class="tip">Fullscreen (F)</span></button>');
  const dockItems = $$('.dock-item', dock);
  dock.addEventListener('pointermove', e => dockItems.forEach(it => {
    const r = it.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)) / (window.__scale || 1);
    it.style.setProperty('--m', 1 + Math.max(0, 1 - d / 150) * .55);
  }));
  dock.addEventListener('pointerleave', () => dockItems.forEach(it => it.style.setProperty('--m', 1)));
  $('#dock-cmd').onclick = () => openCmd();
  $('#dock-notes').onclick = () => toggleNotes();
  $('#dock-fs').onclick = () => toggleFS();

  /* ---------- Command palette (shadcn ⌘K) ---------- */
  const ov = $('#cmdk-ov'), cin = $('#cmdk-in'), clist = $('#cmdk-list'); let sel = 0, items = [];
  function renderCmd() {
    const q = cin.value.toLowerCase();
    items = slides.map((s, i) => ({ i, t: s.dataset.title, ic: s.dataset.icon })).filter(x => (x.t + ' ' + (x.i + 1)).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, items.length - 1));
    clist.innerHTML = items.map((x, k) => `<li class="${k === sel ? 'sel' : ''}" data-i="${x.i}"><span class="material-symbols-rounded" style="font-size:20px">${x.ic}</span>${x.t}<span class="k">${x.i + 1}</span></li>`).join('');
  }
  function openCmd() { ov.classList.add('on'); cin.value = ''; sel = 0; renderCmd(); setTimeout(() => cin.focus(), 30); }
  function closeCmd() { ov.classList.remove('on'); cin.blur(); }
  cin.addEventListener('input', () => { sel = 0; renderCmd(); });
  cin.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = (sel + 1) % items.length; renderCmd(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = (sel - 1 + items.length) % items.length; renderCmd(); e.preventDefault(); }
    if (e.key === 'Enter' && items[sel]) { go(items[sel].i); closeCmd(); }
    if (e.key === 'Escape') closeCmd();
    e.stopPropagation();
  });
  clist.addEventListener('click', e => { const li = e.target.closest('li'); if (li) { go(+li.dataset.i); closeCmd(); } });
  ov.addEventListener('click', e => { if (e.target === ov) closeCmd(); });

  /* ---------- Notes + timer + fullscreen ---------- */
  const notes = $('#notes'); const t0 = Date.now();
  const toggleNotes = () => notes.classList.toggle('on');
  setInterval(() => { const s = (Date.now() - t0) / 1000 | 0; $('#timer').textContent = `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000);
  const toggleFS = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {});

  /* ---------- Keyboard + swipe ---------- */
  addEventListener('keydown', e => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ov.classList.contains('on') ? closeCmd() : openCmd(); return; }
    if (typing) { if (e.key === 'Escape') document.activeElement.blur(); return; }
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(N - 1);
    else if (e.key.toLowerCase() === 'f') toggleFS();
    else if (e.key.toLowerCase() === 'n') toggleNotes();
    else if (e.key === '/') { e.preventDefault(); openCmd(); }
    else if (e.key === 'Escape') { closeCmd(); notes.classList.remove('on'); }
    else if (/^[0-9]$/.test(e.key)) go(e.key === '0' ? 9 : +e.key - 1);
  });
  let tx = null;
  addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 60) dx < 0 ? next() : prev(); tx = null; });
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => go(+b.dataset.goto)));

  /* ---------- Tilted card + spotlight ---------- */
  $$('.tilt').forEach(el => {
    const max = +el.dataset.tilt || 9;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((.5 - y) * max) + 'deg'); el.style.setProperty('--ry', ((x - .5) * max) + 'deg');
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* ---------- Magnet ---------- */
  $$('.magnet').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), s = window.__scale || 1;
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) / s * .22}px, ${(e.clientY - r.top - r.height / 2) / s * .3}px)`;
    });
    el.addEventListener('pointerleave', () => el.style.transform = '');
  });

  /* ---------- Click Spark (ReactBits) ---------- */
  const sc = $('#sparks'), sx = sc.getContext('2d'); let sparks = [];
  const sizeCanvas = c => { c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; c.getContext('2d').setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); };
  sizeCanvas(sc); addEventListener('resize', () => { sizeCanvas(sc); sizeCanvas(cc); });
  addEventListener('pointerdown', e => {
    const now = performance.now(), cols = ['#20221e', '#ff4f62', '#ffb83f', '#6fa7ff'];
    for (let k = 0; k < 9; k++) sparks.push({ x: e.clientX, y: e.clientY, a: k / 9 * Math.PI * 2, t: now, c: cols[k % 4] });
    if (sparks.length === 9) requestAnimationFrame(drawSparks);
  });
  function drawSparks(now) {
    sx.clearRect(0, 0, innerWidth, innerHeight);
    sparks = sparks.filter(p => {
      const p01 = (now - p.t) / 420; if (p01 >= 1) return false;
      const e = p01 * (2 - p01), d = e * 34, len = 13 * (1 - e);
      sx.strokeStyle = p.c; sx.lineWidth = 3; sx.lineCap = 'round'; sx.beginPath();
      sx.moveTo(p.x + Math.cos(p.a) * d, p.y + Math.sin(p.a) * d); sx.lineTo(p.x + Math.cos(p.a) * (d + len), p.y + Math.sin(p.a) * (d + len)); sx.stroke();
      return true;
    });
    if (sparks.length) requestAnimationFrame(drawSparks); else sx.clearRect(0, 0, innerWidth, innerHeight);
  }

  /* ---------- Confetti ---------- */
  const cc = $('#confetti'), cx = cc.getContext('2d'); sizeCanvas(cc);
  function confetti() {
    const cols = ['#6fa7ff', '#5848f7', '#45db9b', '#ff4f62', '#ffb83f', '#ffe77c'];
    const ps = Array.from({ length: 220 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .6, vx: (Math.random() - .5) * 22, vy: -Math.random() * 22 - 8, w: 8 + Math.random() * 8, h: 6 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.random() * cols.length | 0] }));
    const t0 = performance.now();
    (function f(t) {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.vy += .55; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.strokeStyle = '#20221e'; cx.lineWidth = 2; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); });
      if (t - t0 < 3800) requestAnimationFrame(f); else cx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------- Slide 1: lock ---------- */
  document.addEventListener('lock-toggle', e => {
    if (e.detail) { toast('Lock opened', 'Having a lock isn\'t security. Verifying it is.', 'warn'); say('See? A lock you never test is just decoration.', 'alarmed'); }
    else { toast('Locked again', 'Control re-applied — now go verify it.', 'ok'); say('Locked. Now prove it with <b>evidence</b>.', 'happy'); }
  });

  /* ---------- Slide 2: flip + tabs ---------- */
  $$('.flip').forEach(f => f.addEventListener('click', () => f.classList.toggle('flipped')));
  $$('[data-tabs]').forEach(tabs => {
    const btns = $$('[data-tab]', tabs), panels = $$('[data-panel]', tabs), ind = $('.tab-ind', tabs);
    const place = b => { ind.style.left = b.offsetLeft + 'px'; ind.style.width = b.offsetWidth + 'px'; };
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('on', x === b));
      panels.forEach(p => p.classList.toggle('on', p.dataset.panel === b.dataset.tab)); place(b);
    }));
    requestAnimationFrame(() => place(btns[0]));
    document.addEventListener('slidechange', () => place($('[data-tab].on', tabs)));
  });

  /* ---------- Slide 3: Venn ---------- */
  const venn = $('#venn'), vstate = { asset: false, threat: false, vuln: false };

  function updateVennUI() {
    ['asset', 'threat', 'vuln'].forEach(k => {
      const active = !!vstate[k];
      const c = $('#vc-' + k);
      if (c) {
        c.classList.toggle('on', active);
        c.classList.toggle('off', !active);
      }
      const b = $('#tgl-' + k);
      if (b) b.setAttribute('aria-pressed', active ? 'true' : 'false');
      const card = $(`.eq-card[data-k="${k}"]`);
      if (card) {
        card.classList.toggle('on', active);
        const st = $('.card-status', card);
        if (st) st.textContent = active ? 'ACTIVE' : 'OFF';
      }
    });

    const activeCount = Object.values(vstate).filter(Boolean).length;
    const all = activeCount === 3;
    const wasAll = venn.classList.contains('all');
    venn.classList.toggle('all', all);

    const calcEl = $('[data-count="20"]');
    if (all) {
      if (calcEl) calcEl.textContent = '20';
      if (!wasAll) {
        say('<b>RISK TRIGGERED!</b> All 3 intersect: Asset + Threat + Vulnerability. Formula: <b>4 × 5 = 20 (HIGH)</b>!', 'alarmed');
        toast('Risk Identified (Score: 20)', 'Asset + Threat + Vulnerability converged', 'bad');
      }
    } else {
      if (calcEl) calcEl.textContent = '0';
      const missing = Object.keys(vstate).filter(x => !vstate[x]).map(x => x.toUpperCase());
      const activeList = Object.keys(vstate).filter(x => vstate[x]).map(x => x.toUpperCase());
      if (activeCount === 0) {
        say('Click any circle, button, or card above! When all 3 intersect, we trigger <b>RISK</b>.', 'idle');
      } else {
        say(`Active: <b>${activeList.join(', ')}</b>. No threat path yet — still missing: <b>${missing.join(', ')}</b>.`, 'idle');
      }
    }
  }

  function toggleVenn(k) {
    if (k && vstate.hasOwnProperty(k)) {
      vstate[k] = !vstate[k];
      updateVennUI();
    }
  }

  // 1. Clicks directly on SVG circle groups
  $$('.v-group').forEach(g => {
    g.style.cursor = 'pointer';
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVenn(g.dataset.k);
    });
  });

  // 2. Clicks on toggle buttons
  $$('.tgl[data-k]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVenn(b.dataset.k);
    });
  });

  // 3. Clicks on right-side summary cards
  $$('.eq-card').forEach(c => {
    c.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleVenn(c.dataset.k);
    });
  });

  hooks.venn = () => {
    updateVennUI();
  };

  /* ---------- Slide 4: Colonial ---------- */
  const steps = $$('#col-steps .step'), colPanel = $('#col-panel'), colStatus = $('#col-status');
  let colRun = 0;
  function colReset() { colRun++; steps.forEach(s => s.classList.remove('done', 'current')); colPanel.classList.remove('halted'); colStatus.textContent = 'FUEL FLOWING'; colStatus.className = 'stamp pipe-status'; }
  $('#col-run').onclick = async () => {
    colReset(); const id = colRun;
    for (let k = 0; k < steps.length; k++) {
      if (id !== colRun) return;
      steps.forEach((s, j) => { s.classList.toggle('done', j < k); s.classList.toggle('current', j === k); });
      if (k === 2) { colStatus.textContent = 'INTRUDER ON NETWORK'; colStatus.className = 'stamp warn pipe-status'; }
      await sleep(1000);
    }
    if (id !== colRun) return;
    steps.forEach(s => { s.classList.remove('current'); s.classList.add('done'); }); steps[3].classList.add('current');
    colPanel.classList.add('halted'); colStatus.textContent = 'OPERATIONS HALTED'; colStatus.className = 'stamp bad pipe-status';
    toast('Pipeline shut down', 'Fuel delivery disrupted across the US East Coast', 'bad');
    say('One unused account. One missing control. <b>6 days</b> offline.', 'alarmed');
  };
  $('#col-reset').onclick = colReset;
  hooks.colonial = colReset;

  /* ---------- Slide 5: Uber MFA fatigue ---------- */
  const notifs = $('#notifs'), phone = $('#phone'), breached = $('#breached'), spamCount = $('#spam-count'), spamBig = $('#spam-big');
  let spamT = null, pushes = 0, chatShown = false;
  function uberReset() { clearInterval(spamT); spamT = null; pushes = 0; chatShown = false; notifs.innerHTML = ''; breached.classList.remove('on'); spamCount.classList.remove('on'); spamBig.textContent = '×0'; }
  function addPush() {
    pushes++; spamCount.textContent = pushes + ' PUSH REQUESTS'; spamCount.classList.add('on'); spamBig.textContent = '×' + pushes;
    const n = document.createElement('div'); n.className = 'notif top';
    n.innerHTML = `<div class="t"><span style="display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-rounded" style="font-size:16px;color:var(--ink)">lock</span><b>Duo Push · Uber SSO</b></span><small>now</small></div>Are you trying to sign in?<div class="acts"><button class="dn">Deny</button><button class="ap">Approve</button></div>`;
    $$('.notif.top', notifs).forEach(x => x.classList.remove('top'));
    notifs.prepend(n);
    while (notifs.children.length > (chatShown ? 3 : 4)) notifs.lastElementChild.remove();
    if (pushes === 14 && !chatShown) {
      chatShown = true;
      const c = document.createElement('div'); c.className = 'notif chat';
      c.innerHTML = '<div class="t"><span style="display:inline-flex;align-items:center;gap:4px"><span class="material-symbols-rounded" style="font-size:16px;color:#075e54">chat</span><b>WhatsApp · "Uber IT Support"</b></span><small>now</small></div>Hi! We\'re seeing login errors on your account. Please <b>accept the prompt</b> so the notifications stop.';
      notifs.appendChild(c);
      say('Classic social engineering. Will they press Approve?', 'alarmed');
    }
  }
  notifs.addEventListener('click', e => {
    if (e.target.classList.contains('ap')) {
      clearInterval(spamT); breached.classList.add('on'); phone.classList.remove('shake'); void phone.offsetWidth; phone.classList.add('shake');
      toast('MFA bypassed', `Approved after ${pushes} push requests — attacker is in.`, 'bad');
      say('And that\'s how MFA "was on" but still failed. Fix: <b>number matching + FIDO2</b>.', 'alarmed');
    } else if (e.target.classList.contains('dn')) e.target.closest('.notif').remove();
  });
  $('#uber-start').onclick = () => { uberReset(); spamT = setInterval(addPush, 260); };
  $('#uber-reset').onclick = uberReset;
  hooks.uber = uberReset;

  /* ---------- Slide 6: AIIMS board ---------- */
  hooks.aiims = async () => {
    const rows = $$('#aiims-board .row'); rows.forEach(r => { r.classList.remove('down'); $('.st', r).textContent = 'ONLINE'; });
    await sleep(1300);
    for (const r of rows) { if (SPRM.cur !== 5) return; r.classList.add('down'); $('.st', r).textContent = 'ENCRYPTED'; await sleep(420); }
  };

  /* ---------- Slide 7: Password audit ---------- */
  const pw = $('#pw'), meterBars = $$('#pw-meter i'), stamp = $('#pw-stamp'), result = $('#pw-result'), warn = $('#pw-warn'), ent = $('#pw-entropy');
  const RULES = { len: v => v.length >= 12, up: v => /[A-Z]/.test(v), low: v => /[a-z]/.test(v), num: v => /\d/.test(v), sym: v => /[^A-Za-z0-9]/.test(v) };
  let lastState = '';
  function audit(announce) {
    const v = pw.value; let passed = 0;
    $$('#pw-policy .pl').forEach(el => { const ok = RULES[el.dataset.rule](v); el.classList.toggle('ok', ok && !!v); el.classList.toggle('no', !ok && !!v); $('.bx', el).textContent = v ? (ok ? '✓' : '✕') : ''; if (ok) passed++; });
    const pool = (/[a-z]/.test(v) ? 26 : 0) + (/[A-Z]/.test(v) ? 26 : 0) + (/\d/.test(v) ? 10 : 0) + (/[^A-Za-z0-9]/.test(v) ? 32 : 0);
    const bits = v ? Math.round(v.length * Math.log2(pool || 1)) : 0;
    const common = /(password|admin|qwerty|letmein|welcome|123|19\d\d|20\d\d)/i.test(v);
    const cols = ['#ff4f62', '#ff4f62', '#ffb83f', '#ffb83f', '#45db9b'];
    meterBars.forEach((b, i) => { const on = v && i < passed; b.classList.toggle('on', on); b.style.background = on ? cols[passed - 1] : ''; });
    ent.textContent = `≈ ${bits} bits of entropy · ${v.length} chars`;
    if (!v) { result.textContent = 'Waiting for input…'; stamp.textContent = 'PENDING'; stamp.className = 'stamp warn'; warn.classList.remove('on'); lastState = ''; return; }
    const comp = passed === 5, state = comp ? (common ? 'weak' : 'ok') : 'bad';
    warn.classList.toggle('on', comp && common);
    if (comp) { result.textContent = 'All 5 rules met'; stamp.textContent = common ? 'COMPLIANT*' : 'COMPLIANT'; stamp.className = common ? 'stamp warn' : 'stamp'; }
    else { result.textContent = `${5 - passed} rule${5 - passed > 1 ? 's' : ''} failed`; stamp.textContent = 'NON-COMPLIANT'; stamp.className = 'stamp bad'; }
    if (announce || state !== lastState) {
      if (state === 'bad' && announce) say('Nope. That fails policy.', 'alarmed');
      if (state === 'ok') { say('Compliant. Nice — now add MFA on top.', 'happy'); if (announce) toast('Password compliant', 'Meets all 5 policy rules', 'ok'); }
      if (state === 'weak') say('Technically compliant… but attackers have <b>wordlists</b>.', 'think');
    }
    lastState = state;
  }
  pw.addEventListener('input', () => audit(false));
  pw.addEventListener('keydown', e => { if (e.key === 'Enter') audit(true); });
  $('#pw-audit').onclick = () => audit(true);
  $('#pw-eye').onclick = () => { pw.type = pw.type === 'password' ? 'text' : 'password'; };
  $$('[data-pw]').forEach(el => el.addEventListener('click', async () => {
    pw.value = ''; pw.type = 'text'; const target = el.dataset.pw;
    for (const ch of target) { pw.value += ch; audit(false); await sleep(45); }
    audit(true);
  }));
  hooks.password = () => setTimeout(() => pw.focus({ preventScroll: true }), 700);

  /* ---------- Slide 8: terminal ---------- */
  const term = $('#term'); let fixed = false, termRun = 0;
  const LINES = () => [
    [{ c: 'p', t: 'PS C:\\> ' }, { t: 'Get-NetTCPConnection -State Listen | Select LocalAddress,LocalPort,OwningProcess', type: 1 }],
    [{ c: 'm', t: '' }],
    [{ c: 'm', t: 'LocalAddress   LocalPort   OwningProcess' }],
    [{ c: 'm', t: '------------   ---------   -------------' }],
    [{ c: 'g', t: '127.0.0.1      ' }, { t: '8080        4120' }],
    fixed ? [{ c: 'g', t: '127.0.0.1      ' }, { t: '443         5532' }, { tag: 'LOOPBACK', ok: 1 }] : [{ c: 'r', t: '0.0.0.0        ' }, { t: '443         5532' }, { tag: 'EXPOSED' }],
    [{ c: 'g', t: '::1            ' }, { t: '8080        4120' }],
    fixed ? [{ c: 'g', t: '::1            ' }, { t: '443         5532' }, { tag: 'LOOPBACK', ok: 1 }] : [{ c: 'r', t: '::             ' }, { t: '443         5532' }, { tag: 'EXPOSED' }],
    [{ c: 'm', t: '' }],
    [{ c: 'p', t: 'PS C:\\> ' }, { t: 'Get-Process -Id 5532 | Select Name,Id', type: 1 }],
    [{ c: 'y', t: 'Name: nginx     Id: 5532' }],
    ...(fixed ? [[{ c: 'm', t: '' }], [{ c: 'p', t: 'PS C:\\> ' }, { c: 'm', t: '# listen 127.0.0.1:443; + New-NetFirewallRule -Block', type: 1 }], [{ c: 'g', t: '✓ No wildcard listeners found. Finding resolved.' }]] : [])
  ];
  async function typeTerm() {
    const id = ++termRun; term.innerHTML = '';
    for (const line of LINES()) {
      if (id !== termRun) return;
      const ln = document.createElement('span'); ln.className = 'ln'; term.appendChild(ln);
      for (const seg of line) {
        if (seg.tag) { ln.insertAdjacentHTML('beforeend', `<span class="tag ${seg.ok ? 'ok' : ''}">${seg.tag}</span>`); continue; }
        const sp = document.createElement('span'); if (seg.c) sp.className = seg.c; ln.appendChild(sp);
        if (seg.type) { for (const ch of seg.t) { if (id !== termRun) return; sp.textContent += ch; await sleep(14); } await sleep(260); }
        else sp.textContent = seg.t;
      }
      await sleep(70);
    }
    term.insertAdjacentHTML('beforeend', '<span class="ln"><span class="p">PS C:\\&gt; </span><span class="caret"></span></span>');
  }
  hooks.port = typeTerm;
  $('#term-replay').onclick = typeTerm;
  $('#term-copy').onclick = () => { navigator.clipboard?.writeText('Get-NetTCPConnection -State Listen'); toast('Copied', 'Get-NetTCPConnection -State Listen', 'info'); };
  $('#port-fix').onclick = () => {
    fixed = !fixed; const st = $('#port-status');
    st.textContent = fixed ? 'RESOLVED' : 'OPEN · EXPOSED'; st.className = fixed ? 'stamp' : 'stamp bad';
    $('#port-fix').innerHTML = fixed ? '<span class="material-symbols-rounded" style="font-size:18px">undo</span> Undo fix (show exposed state)' : '<span class="material-symbols-rounded" style="font-size:18px">build</span> Apply fix: rebind to 127.0.0.1 + firewall rule';
    typeTerm();
    if (fixed) { toast('Finding resolved', 'nginx now listens on loopback only', 'ok'); say('Exposure gone. Re-scan = <b>evidence</b>.', 'happy'); }
  };

  /* ---------- Slide 9: risk calculator ---------- */
  const rl = $('#r-l'), ri = $('#r-i'), ctl = { mfa: false, lock: false, bak: false };
  const level = s => s <= 5 ? ['low', 'LOW'] : s <= 14 ? ['med', 'MEDIUM'] : ['high', 'HIGH'];
  const fb = $('#risk-fallback');
  for (let L = 5; L >= 1; L--) for (let I = 1; I <= 5; I++) { const s = L * I, d = document.createElement('div'); d.textContent = s; d.dataset.k = L + '-' + I; d.style.background = s <= 5 ? 'var(--green)' : s <= 14 ? 'var(--orange)' : 'var(--red)'; fb.appendChild(d); }
  let lastRes = 20;
  function calcRisk() {
    const L = +rl.value, I = +ri.value;
    const rL = Math.max(1, L - (ctl.mfa ? 1 : 0) - (ctl.lock ? 1 : 0)), rI = Math.max(1, I - (ctl.bak ? 1 : 0));
    const inS = L * I, reS = rL * rI;
    $('#r-lo').textContent = L; $('#r-io').textContent = I;
    const [ci, ti] = level(inS), [cr, tr] = level(reS);
    $('#sc-in').className = 'score ' + ci; $('#sc-in-v').textContent = inS; $('#sc-in-t').textContent = `${L} × ${I} · ${ti}`;
    $('#sc-re').className = 'score ' + cr; $('#sc-re-t').textContent = `${rL} × ${rI} · ${tr}`;
    const el = $('#sc-re-v'), from = lastRes, t0 = performance.now();
    (function f(t) { const p = Math.min(1, (t - t0) / 500); el.textContent = Math.round(from + (reS - from) * p); if (p < 1) requestAnimationFrame(f); })(t0);
    lastRes = reS;
    $$('div', fb).forEach(d => d.classList.toggle('hit', d.dataset.k === rL + '-' + rI));
    SPRM.risk = { L, I, rL, rI };
    document.dispatchEvent(new CustomEvent('riskchange', { detail: SPRM.risk }));
    return { inS, reS };
  }
  rl.addEventListener('input', calcRisk); ri.addEventListener('input', calcRisk);
  $$('.sw').forEach(s => s.addEventListener('click', () => {
    const k = s.dataset.ctl; ctl[k] = !ctl[k]; s.classList.toggle('on', ctl[k]);
    const { inS, reS } = calcRisk();
    if (ctl.mfa && ctl.lock && reS < inS) say(`Risk ${inS} → <b>${reS}</b>. Reduced — not zero. That's the honest answer.`, 'happy');
  }));
  $$('[data-acc]').forEach(acc => $$('.acc-item', acc).forEach(it => $('button', it).addEventListener('click', () => {
    const was = it.classList.contains('open'); $$('.acc-item', acc).forEach(x => x.classList.remove('open')); if (!was) it.classList.add('open');
  })));
  calcRisk();

  /* ---------- Slide 10: takeaway loop + confetti ---------- */
  const tks = $$('#take .tk'); let tkI = 0;
  setInterval(() => { if (SPRM.cur !== 9) return; tks.forEach((t, i) => t.classList.toggle('lit', i === tkI)); tkI = (tkI + 1) % tks.length; }, 1100);
  $('#btn-questions').onclick = () => { confetti(); say('Thank you! Ask me anything.', 'happy'); };
  hooks.takeaway = () => setTimeout(confetti, 900);

  /* ---------- boot ---------- */
  const start = Math.max(0, Math.min(N - 1, (parseInt(location.hash.slice(1)) || 1) - 1));
  SPRM.cur = -1; go(start);
})();
