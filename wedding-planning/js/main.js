document.addEventListener('DOMContentLoaded', () => {

  /* ── MOBILE NAV ── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }

  /* ── TABS ── */
  document.querySelectorAll('[data-tabgroup]').forEach(group => {
    const groupId = group.dataset.tabgroup;
    const btns = group.querySelectorAll('.tab-btn');
    const contents = group.querySelectorAll('.tab-content');

    function activate(target) {
      btns.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
      contents.forEach(c => c.classList.toggle('active', c.id === target));
      localStorage.setItem('tab:' + groupId, target);
    }

    btns.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tab)));

    const saved = localStorage.getItem('tab:' + groupId);
    const first = btns[0]?.dataset.tab;
    activate(saved && group.querySelector(`[data-tab="${saved}"]`) ? saved : first);
  });

  /* ── CHECKBOXES (persist state) ── */
  document.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
    const key = 'chk:' + cb.id;
    const defaultDone = cb.dataset.default === 'done';
    const stored = localStorage.getItem(key);
    const isChecked = stored !== null ? stored === 'true' : defaultDone;
    cb.checked = isChecked;
    setItemDone(cb, isChecked);

    cb.addEventListener('change', () => {
      localStorage.setItem(key, cb.checked);
      setItemDone(cb, cb.checked);
      updateProgress();
    });
  });

  function setItemDone(cb, done) {
    cb.closest('li')?.classList.toggle('done', done);
  }

  /* ── PROGRESS BAR ── */
  function updateProgress() {
    document.querySelectorAll('.progress-summary').forEach(summary => {
      const group = summary.dataset.progressGroup;
      const all = group
        ? document.querySelectorAll(`[data-group="${group}"] input[type="checkbox"]`)
        : document.querySelectorAll('.checklist input[type="checkbox"]');
      const done = [...all].filter(c => c.checked).length;
      const total = all.length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      const fill = summary.querySelector('.progress-bar-fill');
      const doneEl = summary.querySelector('.progress-done');
      const pctEl = summary.querySelector('.progress-pct');
      if (fill) fill.style.width = pct + '%';
      if (doneEl) doneEl.textContent = done + ' / ' + total + ' tasks done';
      if (pctEl) pctEl.textContent = pct + '%';
    });
  }
  updateProgress();

  /* ── COUNTDOWN ── */
  function startCountdown(elId, targetDate) {
    const el = document.getElementById(elId);
    if (!el) return;
    function tick() {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { el.innerHTML = '<div class="countdown-item"><span class="num">Today!</span></div>'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      el.innerHTML = [
        [d, 'Days'], [pad(h), 'Hours'], [pad(m), 'Mins'], [pad(s), 'Secs']
      ].map(([n, u]) => `<div class="countdown-item"><span class="num">${n}</span><span class="unit">${u}</span></div>`).join('');
    }
    tick();
    setInterval(tick, 1000);
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  startCountdown('countdown-wedding', '2026-11-22T18:30:00');
  startCountdown('countdown-gdl', '2026-11-20T10:00:00');

  /* ── EDITABLE SCHEDULE FIELDS ── */
  const scheduleDefaults = new Map();

  document.querySelectorAll('[data-sch-id]').forEach(el => {
    const id = el.dataset.schId;
    scheduleDefaults.set(id, el.innerHTML);

    const saved = localStorage.getItem('sch:' + id);
    if (saved !== null) el.innerHTML = saved;

    el.addEventListener('input', () => {
      localStorage.setItem('sch:' + id, el.innerHTML);
    });
  });

  window.resetSchedule = function(listId) {
    document.querySelectorAll('#' + listId + ' [data-sch-id]').forEach(el => {
      const id = el.dataset.schId;
      localStorage.removeItem('sch:' + id);
      if (scheduleDefaults.has(id)) el.innerHTML = scheduleDefaults.get(id);
    });
  };
});
