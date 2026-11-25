{
  const PL = window.PL;
  /* nav: solid after scrolling, mobile menu */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const mnav = document.querySelector('.mnav');
  document.querySelectorAll('[data-menu-open]').forEach(b => b.addEventListener('click', () => { mnav.classList.add('open'); mnav.querySelector('a').focus(); }));
  document.querySelectorAll('[data-menu-close], .mnav a').forEach(b => b.addEventListener('click', () => mnav.classList.remove('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') mnav && mnav.classList.remove('open'); });

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* send data to a GoHighLevel inbound webhook. Resolves true if sent, false if no webhook is set or it failed */
  PL.send = (hook, data) => {
    const url = PL.hooks[hook];
    if (!url) return Promise.resolve(false);
    const body = new URLSearchParams({ ...data, source: 'website', page: location.pathname, submitted_at: new Date().toISOString() });
    return fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
      .then(() => true).catch(() => false);
  };
  PL.sms = text => 'sms:' + PL.phone + '?&body=' + encodeURIComponent(text);
  PL.money = n => '$' + n.toFixed(2);
  /* opening hours: highlight today and show open/closed in Langley time */
  const hl = document.querySelector('.hours');
  if (hl) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Vancouver', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => parts.find(p => p.type === t).value;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const di = days.indexOf(g('weekday')), now = (+g('hour') % 24) * 60 + +g('minute');
    const spans = i => { const li = hl.querySelector('[data-day="' + days[(i + 7) % 7] + '"]'); return li && li.dataset.spans ? li.dataset.spans.split(',').map(s => s.split('-').map(t => +t.slice(0, 2) * 60 + +t.slice(2))) : []; };
    const fmt = m => { const h = Math.floor(m / 60) % 24, mm = m % 60; return (h % 12 || 12) + (mm ? ':' + String(mm).padStart(2, '0') : '') + (h < 12 ? ' a.m.' : ' p.m.'); };
    let until = null;
    for (const [a, b] of spans(di)) if (b > a ? now >= a && now < b : now >= a) until = b;
    for (const [a, b] of spans(di - 1)) if (b < a && now < b) until = b;
    let msg;
    if (until !== null) msg = 'Open now · until ' + fmt(until);
    else {
      for (let k = 0; k < 8 && !msg; k++) for (const [a] of spans(di + k)) if (k > 0 || a > now) { msg = 'Closed now · opens ' + (k === 0 ? 'at ' : k === 1 ? 'tomorrow at ' : days[(di + k) % 7] + ' at ') + fmt(a); break; }
    }
    const today = hl.querySelector('[data-day="' + days[di] + '"]'); if (today) today.classList.add('today');
    const o = document.querySelector('.js-open'); if (o && msg) { o.textContent = msg; o.hidden = false; }
  }
  const y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();

  /* generic lead forms (catering, truck, club) */
  document.querySelectorAll('form[data-hook]').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const fd = new FormData(f), data = {};
    for (const [k, v] of fd) data[k] = data[k] ? data[k] + ', ' + v : v;
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…';
    const sent = await PL.send(f.dataset.hook, data);
    btn.disabled = false; btn.textContent = label;
    const box = document.getElementById(f.dataset.ok);
    const summary = f.dataset.title + '\n' + Object.entries(data).filter(([k]) => k !== 'bot').map(([k, v]) => k.replace(/_/g, ' ') + ': ' + v).join('\n');
    box.querySelectorAll('[data-sent]').forEach(x => x.hidden = !sent);
    box.querySelectorAll('[data-fallback]').forEach(x => x.hidden = sent);
    const sms = box.querySelector('[data-sms]'); if (sms) sms.href = PL.sms(summary);
    f.hidden = true; box.classList.add('show'); box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}
