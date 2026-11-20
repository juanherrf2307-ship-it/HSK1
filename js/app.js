import { TOPICS, SENT } from './data.js';
import { TIPS, CURIOS } from './extras.js';
import { firebaseConfig } from './firebase-config.js';
import { bao, flame, ice } from './mascot.js';

// ================= utilidades =================
const $ = s => document.querySelector(s), app = $('#app'), foot = $('#foot'), footIn = $('#footIn');
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]] } return a };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rb = (h, p) => { const cs = [...h], ps = p.split(' '); return '<span class="zh">' + (cs.length === ps.length ? cs.map((c, i) => `<ruby>${c}<rt>${esc(ps[i])}</rt></ruby>`).join('') : `<ruby>${h}<rt>${esc(p)}</rt></ruby>`) + '</span>' };
const rich = t => t.replace(/\{([^|}]+)\|([^}]+)\}/g, (_, h, p) => rb(h, p));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const iso = d => d.toLocaleDateString('sv');
const today = () => iso(new Date());
const dnum = s => Math.round(Date.parse(s + 'T12:00:00') / 864e5);
const weekKey = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return iso(x) };
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length] }
const INT = [0, 1, 2, 4, 7, 15, 30];
const DAILY_CAP = 30, FREEZES = 2;

// ================= datos =================
const W = []; TOPICS.forEach(([name, txt], ti) => txt.split('\n').forEach(l => { const [h, p, es] = l.split('|'); if (h && !W.some(w => w.h === h)) W.push({ h, p, es, t: ti }) }));
const S = SENT.split('\n').filter(Boolean).map(l => { const [es, t] = l.split('||'); return { es, toks: t.split(' ').map(x => { const [h, p] = x.split(':'); return { h, p: p.replace(/_/g, ' ') } }) } });
const COLS = ['#16c784', '#3fb5ff', '#ff6f61', '#ffc23a', '#ff5d9e', '#2fd3c4', '#7bd34f', '#ff9447', '#4f8cff', '#f36fb4', '#18b6a0', '#ffb020'];
const SHORT = ['Saludos', 'Clase', 'Pronombres', 'Nombre', 'Países', 'Idiomas', 'Personas', 'Números', 'Edad', 'Familia', 'Miembros', 'Cantidad'];

// ================= estado y nube =================
const blank = () => ({ name: '', nameNorm: '', code: '', srs: {}, xp: 0, streak: 0, best: 0, last: '', days: [], ice: [], freezeWeek: '', freezeUsed: 0, weekly: {}, reviewsDay: '', reviews: 0, lessons: 0, upd: 0 });
let U = blank(), uid = null, fb = null;
const LS = 'huohuo-v1';
function local() { try { return JSON.parse(localStorage.getItem(LS) || 'null') } catch (e) { return null } }
function saveLocal() { try { localStorage.setItem(LS, JSON.stringify({ uid, U })) } catch (e) { } }

async function cloud() {
  if (fb) return fb;
  try {
    const V = '10.12.2';
    const [{ initializeApp }, fs] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore-lite.js`)]);
    const db = fs.getFirestore(initializeApp(firebaseConfig));
    fb = { db, ...fs }; return fb;
  } catch (e) { console.warn('Sin conexión con Firebase', e); return null }
}
let saving = Promise.resolve();
function save() {
  U.upd = Date.now(); saveLocal();
  saving = saving.then(async () => {
    const f = await cloud(); if (!f || !uid) return;
    const data = JSON.parse(JSON.stringify(U));
    await f.setDoc(f.doc(f.db, 'users', uid), data);
  }).catch(e => console.warn('No se pudo guardar en la nube', e));
}
async function pull() {
  const f = await cloud(); if (!f || !uid) return false;
  try { const s = await f.getDoc(f.doc(f.db, 'users', uid)); if (s.exists()) { const r = s.data(); if ((r.upd || 0) > (U.upd || 0)) { U = Object.assign(blank(), r); saveLocal() } } return true } catch (e) { return false }
}

// ================= sonido, vibración, efectos =================
let ac;
function tone(freqs, type = 'triangle', gap = .07, vol = .06) { try { ac = ac || new AudioContext(); const t = ac.currentTime; freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.connect(g); g.connect(ac.destination); o.frequency.value = f; g.gain.setValueAtTime(vol, t + i * gap); g.gain.exponentialRampToValueAtTime(.001, t + i * gap + .22); o.start(t + i * gap); o.stop(t + i * gap + .23) }) } catch (e) { } }
const vib = p => { try { navigator.vibrate && navigator.vibrate(p) } catch (e) { } };
function good(combo) { const b = 440 * Math.pow(2, Math.min(combo, 12) / 12); tone([b, b * 1.26, b * 1.5]); vib(20 + combo * 6) }
function bad() { tone([262, 220], 'sine'); vib([40, 40, 40]) }
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [];
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function confetti(n = 120) { if (calm()) return; cv.width = innerWidth; cv.height = innerHeight; const s = parts.length; for (let i = 0; i < n; i++)parts.push({ x: innerWidth / 2, y: innerHeight * .45, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 4, r: Math.random() * 7 + 4, c: COLS[i % 6], a: Math.random() * 6, l: 95, o: Math.random() < .3 }); if (!s) tick() }
function tick() { cx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(p => p.l-- > 0); parts.forEach(p => { p.vy += .45; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += .2; cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; if (p.o) { cx.beginPath(); cx.arc(0, 0, p.r / 2, 0, 7); cx.fill() } else cx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * .6); cx.restore() }); if (parts.length) requestAnimationFrame(tick) }
function floatXP(el, txt) { const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'floatxp'; d.textContent = txt; d.style.left = (r.left + r.width / 2 - 30) + 'px'; d.style.top = (r.top - 10) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1000) }
function toast(t, sub) { const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = `<div class="badge">★</div><div>${t}<br><small>${sub}</small></div>`; document.body.appendChild(d); setTimeout(() => d.remove(), 2700) }
function countUp(el, to, ms = 900) { if (!el) return; const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f) }; requestAnimationFrame(f) }

// voz china del dispositivo (listening)
let zhVoice = null;
function loadVoices() { try { zhVoice = speechSynthesis.getVoices().find(v => /^zh(-|_)?(CN|Hans)?/i.test(v.lang)) || speechSynthesis.getVoices().find(v => /^zh/i.test(v.lang)) || null } catch (e) { } }
try { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices } catch (e) { }
function say(t, rate = .8) { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'zh-CN'; if (zhVoice) u.voice = zhVoice; u.rate = rate; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch (e) { } }
const canListen = () => !!zhVoice;

// ================= nivel, racha, congelación =================
const level = xp => { let n = 1; while (xp >= 50 * n * (n + 1)) n++; return n };
const lvlFloor = n => 50 * (n - 1) * n, lvlCeil = n => 50 * n * (n + 1);
const RANK = n => n < 5 ? 'Chispa' : n < 10 ? 'Llama' : n < 15 ? 'Hoguera' : 'Volcán';
const acc = () => U.streak >= 30 ? 'scarf crown' : U.streak >= 7 ? 'scarf' : '';
function liveStreak() { if (!U.last) return 0; return dnum(today()) - dnum(U.last) <= 1 ? U.streak : 0 }
function applyFreezes() {
  if (!U.last) return;
  const wk = weekKey(); if (U.freezeWeek !== wk) { U.freezeWeek = wk; U.freezeUsed = 0 }
  const gap = dnum(today()) - dnum(U.last) - 1; // días perdidos (sin contar hoy)
  if (gap <= 0) return;
  const left = FREEZES - U.freezeUsed;
  if (gap <= left) {
    for (let i = 1; i <= gap; i++) { const d = new Date(Date.parse(U.last + 'T12:00:00') + i * 864e5); U.ice.push(iso(d)) }
    U.freezeUsed += gap; U.last = iso(new Date(Date.now() - 864e5)); U.ice = U.ice.slice(-30);
    pendingToast = [`${gap === 1 ? 'Racha congelada' : 'Racha congelada ' + gap + ' días'}`, `Huǒhuo protegió tu racha. Te ${FREEZES - U.freezeUsed === 1 ? 'queda 1 congelación' : 'quedan ' + (FREEZES - U.freezeUsed) + ' congelaciones'} esta semana`];
    save();
  }
}
let pendingToast = null;

// ================= repetición espaciada =================
const box = w => (U.srs[w.h] || [0, 0])[0];
const due = w => { const s = U.srs[w.h]; return s && s[1] <= dnum(today()) };
function grade(w, ok) { const s = U.srs[w.h] || [0, 0]; const was = s[0]; const b = ok ? Math.min(s[0] + 1, 6) : 1; U.srs[w.h] = [b, dnum(today()) + (ok ? INT[b] : 0)]; if (ok && was === 2 && b === 3) mastered.push(w) }
let mastered = [];
function reviewsLeft() { if (U.reviewsDay !== today()) { U.reviewsDay = today(); U.reviews = 0 } return Math.max(0, DAILY_CAP - U.reviews) }
function pickWords(topic) {
  if (topic != null) return shuf(W.filter(w => w.t === topic)).slice(0, 10);
  const cap = reviewsLeft();
  const d = shuf(W.filter(due)).sort((a, b) => box(a) - box(b)).slice(0, Math.min(8, cap));
  const fresh = W.filter(w => !U.srs[w.h]).slice(0, Math.max(3, 10 - d.length)).slice(0, 6);
  let out = [...d, ...fresh];
  if (out.length < 8) out = out.concat(shuf(W.filter(w => !out.includes(w))).sort((a, b) => box(a) - box(b)).slice(0, 8 - out.length));
  return shuf(out);
}

// ================= tonos =================
const TM = { a: 'āáǎàa', e: 'ēéěèe', i: 'īíǐìi', o: 'ōóǒòo', u: 'ūúǔùu', 'ü': 'ǖǘǚǜü' };
const REV = {}; for (const [b, s] of Object.entries(TM)) [...s].forEach((c, i) => { if (i < 4) REV[c] = [b, i] });
function retone(syl) { const cs = [...syl.toLowerCase()]; const k = cs.findIndex(c => REV[c]); if (k < 0) return null; const [b, t] = REV[cs[k]]; const o = [0, 1, 2, 3].filter(x => x !== t); cs[k] = TM[b][o[Math.random() * o.length | 0]]; const r = cs.join(''); return syl[0] !== syl[0].toLowerCase() ? r[0].toUpperCase() + r.slice(1) : r }
function toneOpts(p) { const set = new Set([p]); const ps = p.split(' '); for (let k = 0; k < 50 && set.size < 4; k++) { const q = ps.slice(); const i = Math.random() * q.length | 0; const r = retone(q[i]); if (r) { q[i] = r; if (Math.random() < .35 && q.length > 1) { const j = (i + 1) % q.length; const r2 = retone(q[j]); if (r2) q[j] = r2 } set.add(q.join(' ')) } } return set.size >= 3 ? shuf([...set]) : null }

// ================= construir lección =================
function distract(w, key, n = 3) { const same = shuf(W.filter(x => x !== w && x.t === w.t && x[key] !== w[key])); const rest = shuf(W.filter(x => x !== w && x.t !== w.t && x[key] !== w[key])); const out = []; for (const x of [...same, ...rest]) { if (!out.some(o => o[key] === x[key])) out.push(x); if (out.length === n) break } return shuf([w, ...out]) }
function clozeFor(w) { const c = shuf(S.filter(s => s.toks.length >= 3 && s.toks.some(t => t.h === w.h))); return c[0] ? { s: c[0], k: c[0].toks.findIndex(t => t.h === w.h) } : null }
function build(topic) {
  const ws = pickWords(topic), ex = [];
  ws.forEach((w, i) => {
    let type;
    if (!U.srs[w.h]) type = 'meaning';
    else {
      const pool = ['meaning', 'word', 'tone', 'cloze', 'write', 'listen', 'word'];
      type = pool[(i + U.lessons) % pool.length];
      if (type === 'tone' && !toneOpts(w.p)) type = 'word';
      if (type === 'cloze' && !clozeFor(w)) type = 'meaning';
      if (type === 'listen' && !canListen()) type = 'word';
      if (type === 'write' && box(w) < 2) type = 'word';
    }
    ex.push({ type, w });
  });
  const pool = ws.length >= 4 ? ws : W; ex.splice(Math.min(4, ex.length), 0, { type: 'match', ws: shuf(pool).slice(0, 4) });
  const sents = shuf(S.filter(s => topic == null || s.toks.some(t => W.some(w => w.t === topic && w.h === t.h)))).slice(0, 2);
  sents.forEach((s, i) => ex.splice(Math.min(3 + i * 5, ex.length), 0, { type: 'order', s }));
  if (canListen() && ws.some(w => U.srs[w.h])) { const w = ws.find(w => U.srs[w.h] && toneOpts(w.p)); if (w) ex.splice(Math.min(7, ex.length), 0, { type: 'tonelisten', w }) }
  return ex;
}

// ================= pantallas =================
let view = 'login', L = null;
function render(html) { app.innerHTML = html; window.scrollTo(0, 0) }

function login(msg = '') {
  view = 'login'; foot.hidden = true;
  render(`<div class="center"><div class="bob mascot">${bao('happy', 160)}</div>
  <h1>${rb('你好', 'nǐ hǎo')}！Soy ${rb('火火', 'huǒ huo')}</h1>
  <p class="sub">Un panda rojo con la cola en llamas: cuanto más larga tu racha, más fuego. Dime tu nombre y un código; en otro dispositivo, lo mismo y seguimos donde lo dejaste.</p></div>
  <form id="lf" autocomplete="off"><label class="lab" for="nm">Tu nombre</label><input id="nm" maxlength="30" autocomplete="given-name" required>
  <label class="lab" for="cd">Tu código</label><input id="cd" maxlength="12" inputmode="numeric" required placeholder="Por ejemplo, 3444">
  <button class="btn" id="go">¡Vamos!</button></form><div class="react" id="re">${msg}</div>
  <p class="tag center">Tu progreso se guarda con tu nombre y código. No pedimos email ni datos personales.</p>`);
  $('#lf').onsubmit = async e => {
    e.preventDefault(); const raw = $('#nm').value.trim(), code = $('#cd').value.trim(); if (!raw || !code) return;
    $('#go').disabled = true; $('#go').textContent = 'Buscando…';
    const f = await cloud();
    if (!f) { $('#re').innerHTML = say2(false, 'No hay conexión. Prueba de nuevo en un momento.'); $('#go').disabled = false; $('#go').textContent = '¡Vamos!'; return }
    try {
      const snap = await f.getDocs(f.query(f.collection(f.db, 'users'), f.where('code', '==', code)));
      const n = norm(raw); const cands = snap.docs.map(d => ({ id: d.id, d: d.data(), dist: lev(n, d.data().nameNorm || '') })).filter(c => c.dist <= Math.max(1, Math.min(2, Math.floor(c.d.nameNorm.length / 4)))).sort((a, b) => a.dist - b.dist);
      if (cands.length > 1 && cands[0].dist === cands[1].dist) { $('#re').innerHTML = say2(false, 'Hay dos personas parecidas con ese código. Escribe tu nombre completo.'); $('#go').disabled = false; $('#go').textContent = '¡Vamos!'; return }
      if (cands[0]) { uid = cands[0].id; U = Object.assign(blank(), cands[0].d); saveLocal(); $('#re').innerHTML = say2(true, `¡Hola de nuevo, ${esc(U.name)}! Cargando tu racha…`); good(3); setTimeout(home, 1000); return }
      U = blank(); U.name = raw; U.nameNorm = n; U.code = code; U.upd = Date.now();
      const ref = await f.addDoc(f.collection(f.db, 'users'), JSON.parse(JSON.stringify(U))); uid = ref.id; saveLocal();
      $('#re').innerHTML = say2(true, `¡Encantado, ${esc(raw)}! ${rb('认识你很高兴', 'rèn shi nǐ hěn gāo xìng')}`); good(3); confetti(60); setTimeout(home, 1300);
    } catch (err) { console.warn(err); $('#re').innerHTML = say2(false, 'No he podido conectar con el servidor. Prueba otra vez.'); $('#go').disabled = false; $('#go').textContent = '¡Vamos!' }
  };
}
const say2 = (ok, t) => `<div class="${ok ? 'jump' : ''}">${bao(ok ? 'joy' : 'cheer', 64)}</div><div class="bubble pop">${t}</div>`;

function home() {
  view = 'home'; foot.hidden = true; applyFreezes();
  const st = liveStreak(), done = U.days.includes(today()), lv = level(U.xp);
  const learned = W.filter(w => box(w) >= 3).length, dueN = W.filter(due).length;
  const names = ['D', 'L', 'M', 'X', 'J', 'V', 'S'], wk = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const s = iso(d); wk.push(`<i class="${U.days.includes(s) ? 'on' : U.ice.includes(s) ? 'ice' : ''} ${i === 0 ? 'today' : ''}">${U.ice.includes(s) && !U.days.includes(s) ? ice : names[d.getDay()]}</i>`) }
  const pct = Math.round((U.xp - lvlFloor(lv)) / (lvlCeil(lv) - lvlFloor(lv)) * 100);
  const msg = done ? `¡Hoy ya ardo! Si quieres, otra rondita. ${rb('太棒了', 'tài bàng le')}` : st ? `Mi cola se apaga sin repaso… ¿5 minutitos? ${rb('加油', 'jiā yóu')}` : `¡Encendamos la primera llama! ${rb('加油', 'jiā yóu')}`;
  const tip = TIPS[(dnum(today()) + U.lessons) % TIPS.length];
  render(`<div class="topbar"><h1>¡Hola, ${esc(U.name)}!</h1><button class="icon" id="menu" aria-label="Ajustes"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button></div>
  <div class="hero"><div class="bob" id="mb">${bao(done ? 'happy' : 'sleepy', 150, acc())}</div>
   <div><div class="bubble">${msg}</div><div class="row">${flame(38)}<div><div class="big" style="color:#ff8a3d">${st}</div><b style="font-size:14px">${st === 1 ? 'día' : 'días'} de racha</b></div></div></div></div>
  <div class="card tight"><div class="week">${wk.join('')}</div><p class="sub small">${ice} Te ${FREEZES - (U.freezeWeek === weekKey() ? U.freezeUsed : 0) === 1 ? 'queda 1 congelación' : 'quedan ' + (FREEZES - (U.freezeWeek === weekKey() ? U.freezeUsed : 0)) + ' congelaciones'} esta semana: si un día no puedes, Huǒhuo protege tu racha solo.</p></div>
  <button class="btn" id="start">${done ? 'Otra lección' : 'Empezar lección'}</button>
  <div class="grid2" style="margin-top:16px"><div class="stat" style="background:var(--mint);--d:var(--mintD)"><b id="learned">0</b><span>palabras dominadas</span></div><div class="stat" style="background:var(--sky);--d:var(--skyD)"><b>${dueN}</b><span>por repasar · tope ${DAILY_CAP}/día</span></div></div>
  <div class="card"><div class="row between"><b>Nivel ${lv} · ${RANK(lv)}</b><b style="color:var(--sunD)">${U.xp}/${lvlCeil(lv)} XP</b></div><div class="lvl"><div style="width:${pct}%"></div></div></div>
  <h2>Tu mapa</h2><div class="map">${TOPICS.map((t, i) => { const ws = W.filter(w => w.t === i); const p = ws.filter(w => box(w) >= 3).length / ws.length, seen = ws.some(w => U.srs[w.h]); return `<button class="${seen ? '' : 'lock'}" data-t="${i}" style="background:${COLS[i]};opacity:${seen ? .5 + p * .5 : 1}">${SHORT[i]}${seen ? `<small>${Math.round(p * 100)}%</small>` : ''}</button>` }).join('')}</div>
  <p class="tag">Toca un tema para practicarlo.</p>
  <div class="know"><b>¿Sabías que…?</b><br>${rich(tip)}</div>
  <h2>Esta semana en clase</h2><div class="card rank" id="rank"><p class="sub">Cargando ranking…</p></div>`);
  countUp($('#learned'), learned);
  $('#start').onclick = () => { $('#mb').innerHTML = `<div class="jump">${bao('joy', 150, acc())}</div>`; good(4); confetti(40); setTimeout(() => start(null), 600) };
  app.querySelectorAll('.map button').forEach(b => b.onclick = () => start(+b.dataset.t));
  $('#menu').onclick = settings;
  if (pendingToast) { toast(...pendingToast); pendingToast = null }
  loadRank();
}
async function loadRank() {
  const el = $('#rank'); const f = await cloud();
  if (!f) { el.innerHTML = '<p class="sub">Sin conexión: el ranking aparecerá cuando vuelvas a tener internet.</p>'; return }
  try {
    const snap = await f.getDocs(f.collection(f.db, 'users')); const wk = weekKey();
    const rows = snap.docs.map(d => ({ id: d.id, n: d.data().name, xp: (d.data().weekly || {})[wk] || 0 })).sort((a, b) => b.xp - a.xp).slice(0, 10);
    if (!$('#rank')) return;
    el.innerHTML = rows.map((r, i) => `<div class="${r.id === uid ? 'me' : ''}"><span>${i + 1}. ${r.id === uid ? 'Tú' : esc(r.n)}</span><span>${r.xp} XP</span></div>`).join('') + '<p class="tag" style="margin:8px 0 0">Se reinicia cada lunes.</p>';
  } catch (e) { el.innerHTML = '<p class="sub">No se pudo cargar el ranking.</p>' }
}
function settings() {
  view = 'settings';
  render(`<div class="topbar"><h1>Ajustes</h1><button class="icon" id="back" aria-label="Volver">×</button></div>
  <div class="card"><b>${esc(U.name)}</b><p class="sub small">Código: ${esc(U.code)}. Úsalo junto a tu nombre para entrar desde otro dispositivo.</p></div>
  <div class="card"><b>Instalar en el móvil</b><p class="sub small">iPhone: en Safari, botón Compartir → «Añadir a pantalla de inicio». Android: en Chrome, menú ⋮ → «Instalar aplicación».</p></div>
  <div class="card"><b>Audio</b><p class="sub small">${canListen() ? 'Tu dispositivo tiene voz en chino: los ejercicios de escucha están activados.' : 'Tu dispositivo no tiene voz en chino instalada, así que los ejercicios de escucha no aparecen. Puedes añadirla en los ajustes de voz/accesibilidad del sistema.'}</p></div>
  <div class="card"><b>Privacidad</b><p class="sub small">Solo se guardan tu nombre, tu código y tu progreso, para que el ranking funcione y puedas entrar desde otro dispositivo. Sin email, sin anuncios y sin analíticas.</p></div>
  <button class="btn ghost" id="out">Cerrar sesión en este dispositivo</button>`);
  $('#back').onclick = home; $('#out').onclick = () => { try { localStorage.removeItem(LS) } catch (e) { } uid = null; U = blank(); login() };
}

// ================= lección =================
function start(topic) { mastered = []; L = { ex: build(topic), i: 0, ok: 0, tot: 0, combo: 0, best: 0, xp: 0, topic, wrong: new Set(), seen: new Set() }; view = 'lesson'; step() }
function header() { const p = Math.round(L.i / L.ex.length * 100); return `<div class="ltop"><button class="icon" id="quit" aria-label="Salir">×</button><div class="lvl"><div style="width:${p}%"></div></div><span class="combo ${L.combo >= 2 ? 'on' : ''} ${L.combo >= 4 ? 'hot' : ''}">${flame(18, '#fff')}x${L.combo}</span></div>` }
const spk = t => `<button class="spk" data-say="${t}" aria-label="Escuchar"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg></button>`;
function step() {
  if (L.i >= L.ex.length) return end();
  const e = L.ex[L.i]; foot.hidden = true; foot.className = 'foot';
  let h = header();
  if (e.type === 'meaning') { const o = distract(e.w, 'es'); h += `<p class="q">${U.srs[e.w.h] || e.retry ? '¿Qué significa?' : '<span class="new">Nueva</span> ¿Qué significa?'}</p><div class="qcard">${rb(e.w.h, e.w.p)}${canListen() ? spk(e.w.h) : ''}</div><div class="opts">${o.map(x => `<button class="opt" data-v="${esc(x.es)}">${esc(x.es)}</button>`).join('')}</div>`; render(h); bindOpts(e, e.w.es) }
  else if (e.type === 'word') { const o = distract(e.w, 'h'); h += `<p class="q">¿Cómo se dice…?</p><div class="es-big">${esc(e.w.es)}</div><div class="opts">${o.map(x => `<button class="opt" data-v="${esc(x.h)}">${rb(x.h, x.p)}</button>`).join('')}</div>`; render(h); bindOpts(e, e.w.h) }
  else if (e.type === 'tone') { const o = toneOpts(e.w.p); h += `<p class="q">Elige los tonos correctos</p><div class="qcard"><span class="zh">${e.w.h}</span><p class="sub" style="margin:6px 0 0">${esc(e.w.es)}</p></div><div class="opts">${o.map(x => `<button class="opt center" data-v="${esc(x)}" style="font-size:22px">${esc(x)}</button>`).join('')}</div>`; render(h); bindOpts(e, e.w.p) }
  else if (e.type === 'listen') { const o = distract(e.w, 'h'); h += `<p class="q">Escucha y elige</p><div class="center">${spk(e.w.h)}</div><div class="opts">${o.map(x => `<button class="opt" data-v="${esc(x.h)}">${rb(x.h, x.p)}</button>`).join('')}</div>`; render(h); bindOpts(e, e.w.h); setTimeout(() => say(e.w.h), 300) }
  else if (e.type === 'tonelisten') { const o = toneOpts(e.w.p); h += `<p class="q">¿Qué tonos has oído?</p><div class="center">${spk(e.w.h)}</div><p class="sub center">${esc(e.w.es)}</p><div class="opts">${o.map(x => `<button class="opt center" data-v="${esc(x)}" style="font-size:22px">${esc(x)}</button>`).join('')}</div>`; render(h); bindOpts(e, e.w.p); setTimeout(() => say(e.w.h, .7), 300) }
  else if (e.type === 'cloze') clozeEx(h, e);
  else if (e.type === 'write') writeEx(h, e);
  else if (e.type === 'match') matchEx(h, e);
  else orderEx(h, e);
  $('#quit').onclick = () => { save(); home() };
  app.querySelectorAll('[data-say]').forEach(b => b.onclick = () => say(b.dataset.say));
}
function bindOpts(e, right) {
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (!foot.hidden) return; const ok = b.dataset.v === right;
    app.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.v === right) x.classList.add('ok'); else if (x === b) x.classList.add('no'); else x.classList.add('dim') });
    result(ok, [e.w], `${rb(e.w.h, e.w.p)} = ${esc(e.w.es)}`, b); if (ok && canListen()) say(e.w.h);
  });
}
function result(ok, ws, ans, el) {
  L.tot++; ws.forEach(w => { grade(w, ok); L.seen.add(w.h) });
  if (ok) {
    L.ok++; L.combo++; L.best = Math.max(L.best, L.combo); const gain = 10 + (L.combo >= 3 ? 5 * Math.min(L.combo - 2, 4) : 0); L.xp += gain;
    if (el) floatXP(el, '+' + gain); good(L.combo);
    if (L.combo === 3) toast('¡Racha de aciertos!', 'Combo x3: XP extra en cada respuesta');
    if (L.combo === 5) { confetti(150); toast('¡EN LLAMAS!', '5 seguidas: la cola de Huǒhuo arde') } else if (L.combo === 10) { confetti(220); toast('¡IMPARABLE!', '10 seguidas sin fallo') } else confetti(22);
  } else { L.combo = 0; bad(); app.classList.add('shakeS'); setTimeout(() => app.classList.remove('shakeS'), 400); ws.forEach(w => { if (!L.wrong.has(w.h)) { L.wrong.add(w.h); L.ex.push({ type: 'meaning', w, retry: 1 }) } }) }
  const c = app.querySelector('.combo'); if (c) { c.className = `combo ${L.combo >= 2 ? 'on' : ''} ${L.combo >= 4 ? 'hot' : ''}`; c.innerHTML = flame(18, '#fff') + 'x' + L.combo }
  foot.hidden = false; foot.className = 'foot ' + (ok ? 'ok' : 'no');
  const praise = ['¡Bien!', '¡Eso es!', '¡Imparable!', '¡Crack!', '¡Fuego!'][Math.min(Math.max(L.combo - 1, 0), 4)];
  footIn.innerHTML = `<div class="frow"><div class="${ok ? 'jump' : ''}">${bao(ok ? 'joy' : 'cheer', 58, acc())}</div><div><p class="fb">${ok ? praise : '¡La próxima es tuya!'}</p>${ok && !ans ? '' : `<p class="ans">${ok ? '' : 'Respuesta: '}${ans}</p>`}</div></div><button class="btn" id="next">Continuar</button>`;
  $('#next').onclick = () => { L.i++; step() }; $('#next').focus({ preventScroll: true });
}
function clozeEx(h, e) {
  const { s, k } = clozeFor(e.w); const o = distract(e.w, 'h');
  h += `<p class="q">Completa la frase</p><div class="sent">${s.toks.map((t, i) => i === k ? '<span class="gap" id="g">？</span>' : rb(t.h, t.p)).join(' ')}</div><p class="sub center">${esc(s.es)}</p><div class="opts">${o.map(x => `<button class="opt" data-v="${esc(x.h)}">${rb(x.h, x.p)}</button>`).join('')}</div>`;
  render(h);
  app.querySelectorAll('.opt').forEach(b => b.onclick = () => { if (!foot.hidden) return; const ok = b.dataset.v === e.w.h; app.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.v === e.w.h) x.classList.add('ok'); else if (x === b) x.classList.add('no'); else x.classList.add('dim') }); $('#g').innerHTML = rb(e.w.h, e.w.p); $('#g').classList.add(ok ? 'gok' : 'gno'); result(ok, [e.w], `${rb(e.w.h, e.w.p)} = ${esc(e.w.es)}`, b); if (ok && canListen()) say(s.toks.map(t => t.h).join('')) });
}
function writeEx(h, e) {
  h += `<p class="q">Escribe en caracteres</p><div class="qcard"><b class="pin">${esc(e.w.p)}</b><p class="sub" style="margin:4px 0 0">${esc(e.w.es)}</p></div><input id="w" lang="zh-CN" autocomplete="off" autocapitalize="off" placeholder="Usa el teclado chino (pinyin)"><p class="tag">Activa el teclado «Chino simplificado – Pinyin» en tu móvil.</p>`;
  render(h); foot.hidden = false; footIn.innerHTML = `<button class="btn" id="chk">Comprobar</button>`;
  const chk = () => { const v = $('#w').value.replace(/[\s，。？！,.?!]/g, ''); const ok = v === e.w.h; $('#w').disabled = true; result(ok, [e.w], `${rb(e.w.h, e.w.p)} = ${esc(e.w.es)}`, $('#w')) };
  $('#chk').onclick = chk; $('#w').onkeydown = ev => { if (ev.key === 'Enter' && !ev.isComposing) chk() };
}
function matchEx(h, e) {
  const L2 = shuf(e.ws), R = shuf(e.ws); let sel = null, left = 4; const errs = new Set();
  h += `<p class="q">Une las parejas</p><div class="pairs">${L2.map((w, i) => `<button class="opt" data-k="${w.h}" data-s="l">${rb(w.h, w.p)}</button><button class="opt small" data-k="${R[i].h}" data-s="r">${esc(R[i].es)}</button>`).join('')}</div>`;
  render(h);
  app.querySelectorAll('.pairs .opt').forEach(b => b.onclick = () => {
    if (b.classList.contains('gone')) return;
    if (!sel || sel.dataset.s === b.dataset.s) { if (sel) sel.classList.remove('sel'); sel = b; b.classList.add('sel'); if (b.dataset.s === 'l' && canListen()) say(b.dataset.k); return }
    if (sel.dataset.k === b.dataset.k) {
      tone([660, 880]); vib(15); [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok') }); const a = sel; setTimeout(() => { a.classList.add('gone'); b.classList.add('gone') }, 250); sel = null;
      if (--left === 0) { const ok = errs.size === 0; e.ws.forEach(w => grade(w, !errs.has(w.h))); L.tot++; if (ok) { L.ok++; L.combo++; L.xp += 15; good(L.combo); confetti(40) } else L.combo = 0; foot.hidden = false; foot.className = 'foot ' + (ok ? 'ok' : 'no'); footIn.innerHTML = `<div class="frow"><div class="${ok ? 'jump' : ''}">${bao(ok ? 'joy' : 'cheer', 58, acc())}</div><div><p class="fb">${ok ? '¡Todas a la primera!' : 'Completado'}</p>${ok ? '' : `<p class="ans">Repasa: ${[...errs].map(k => { const w = W.find(x => x.h === k); return rb(w.h, w.p) + ' = ' + esc(w.es) }).join(' · ')}</p>`}</div></div><button class="btn" id="next">Continuar</button>`; $('#next').onclick = () => { L.i++; step() } }
    } else { bad(); errs.add(sel.dataset.s === 'l' ? sel.dataset.k : b.dataset.k); b.classList.add('no'); const a = sel; setTimeout(() => { b.classList.remove('no'); a.classList.remove('sel') }, 400); sel = null }
  });
}
function orderEx(h, e) {
  const toks = e.s.toks; const bank = shuf(toks.map((t, i) => ({ ...t, i }))); let line = [], done = false;
  h += `<p class="q">Ordena la frase</p><div class="es-big">${esc(e.s.es)}</div><div class="line" id="ln"></div><div class="bank" id="bk"></div>`;
  render(h);
  const draw = () => {
    $('#ln').innerHTML = line.map((t, k) => `<button class="tile" data-k="${k}">${rb(t.h, t.p)}</button>`).join('');
    $('#bk').innerHTML = bank.map((t, k) => `<button class="tile ${line.includes(t) ? 'used' : ''}" data-b="${k}">${rb(t.h, t.p)}</button>`).join('');
    $('#ln').querySelectorAll('.tile').forEach(b => b.onclick = () => { if (done) return; line.splice(+b.dataset.k, 1); draw() });
    $('#bk').querySelectorAll('.tile').forEach(b => b.onclick = () => { if (done) return; const t = bank[+b.dataset.b]; if (!line.includes(t)) { line.push(t); tone([520], 'sine', 0, .03); draw() } });
    foot.hidden = false; footIn.innerHTML = `<button class="btn" id="chk" ${line.length === toks.length ? '' : 'disabled'}>Comprobar</button>`;
    $('#chk').onclick = () => {
      done = true; const ok = line.map(t => t.h).join('') === toks.map(t => t.h).join(''); const ws = toks.map(t => W.find(w => w.h === t.h)).filter(Boolean);
      L.tot++; if (ok) { L.ok++; L.combo++; L.xp += 20; good(L.combo); confetti(50); floatXP($('#ln'), '+20') } else { L.combo = 0; bad() } ws.forEach(w => { if (U.srs[w.h] || !ok) grade(w, ok) });
      foot.className = 'foot ' + (ok ? 'ok' : 'no'); footIn.innerHTML = `<div class="frow"><div class="${ok ? 'jump' : ''}">${bao(ok ? 'joy' : 'cheer', 58, acc())}</div><div><p class="fb">${ok ? '¡Frase perfecta!' : 'Casi…'}</p>${ok ? '' : `<p class="ans">${toks.map(t => rb(t.h, t.p)).join(' ')}</p>`}</div></div><button class="btn" id="next">Continuar</button>`; $('#next').onclick = () => { L.i++; step() };
      if (ok && canListen()) say(toks.map(t => t.h).join(''));
    };
  }; draw();
}
function end() {
  foot.hidden = true; view = 'end'; const t = today(), lvBefore = level(U.xp), stBefore = U.best || 0;
  if (!U.days.includes(t)) { const gap = U.last ? dnum(t) - dnum(U.last) : 99; U.streak = gap === 1 ? U.streak + 1 : (gap === 0 ? U.streak : 1); U.last = t; U.days = [...U.days, t].slice(-60) }
  let chest = null; if (Math.random() < .34) { chest = Math.random() < .25 && U.freezeUsed > 0 ? 'freeze' : 10 + (Math.random() * 4 | 0) * 10 }
  if (typeof chest === 'number') L.xp += chest; if (chest === 'freeze') U.freezeUsed = Math.max(0, U.freezeUsed - 1);
  U.xp += L.xp; const wk = weekKey(); U.weekly = { [wk]: ((U.weekly || {})[wk] || 0) + L.xp }; U.best = Math.max(U.best || 0, U.streak); U.lessons++; U.reviews = (U.reviewsDay === t ? U.reviews : 0) + L.seen.size; U.reviewsDay = t; save();
  const acc2 = L.tot ? Math.round(L.ok / L.tot * 100) : 0, lvAfter = level(U.xp), lvUp = lvAfter > lvBefore, record = U.streak > stBefore && U.streak > 1;
  const curio = Math.random() < .4 ? CURIOS[(U.lessons * 7) % CURIOS.length] : null;
  const o = document.createElement('div'); o.className = 'over'; o.id = 'over';
  o.innerHTML = `<div class="rays"></div><div class="overin"><div class="jump">${bao('joy', 140, acc())}</div>
   <div class="big">${lvUp ? '¡NIVEL ' + lvAfter + '!' : record ? '¡RÉCORD!' : acc2 >= 90 ? '¡IMPECABLE!' : '¡LECCIÓN HECHA!'}</div>
   <b class="osub">${lvUp ? 'Huǒhuo ya es «' + RANK(lvAfter) + '»' : record ? 'Nueva mejor racha: ' + U.streak + ' días' : 'Racha: ' + U.streak + (U.streak === 1 ? ' día' : ' días')}</b>
   <div class="res"><div><b id="r1">0</b>XP</div><div><b id="r2">0</b>% aciertos</div><div><b>${L.best}</b>mejor combo</div></div>
   ${mastered.length ? `<p class="osub">Dominadas: ${mastered.map(w => rb(w.h, w.p)).join(' · ')}</p>` : ''}
   <div id="chestBox"></div>
   <button class="btn sun" id="cl">${chest ? 'Abrir cofre' : '¡Seguir!'}</button></div>`;
  document.body.appendChild(o); confetti(lvUp || record ? 240 : 140); good(12); countUp($('#r1'), L.xp); countUp($('#r2'), acc2);
  const finish = () => {
    if (curio) { $('#chestBox').innerHTML = `<div class="curio pop"><b>Curiosidad china</b><br>${rich(curio)}</div>`; $('#cl').textContent = '¡Seguir!'; $('#cl').onclick = () => { o.remove(); home() }; return }
    o.remove(); home();
  };
  $('#cl').onclick = () => {
    if (chest) {
      const c = chest; chest = null; $('#chestBox').innerHTML = `<svg class="chestS shake" viewBox="0 0 140 120"><rect x="15" y="50" width="110" height="60" rx="12" fill="#ff9447"/><path id="lid" d="M15 56q0-36 55-36t55 36z" fill="#ffb020"/><rect x="60" y="46" width="20" height="26" rx="6" fill="#fff4cc" stroke="#e09a00" stroke-width="3"/></svg>`;
      setTimeout(() => { $('#lid') && $('#lid').setAttribute('transform', 'rotate(-28 15 56)'); confetti(120); good(8); $('#chestBox').insertAdjacentHTML('beforeend', `<div class="pop loot">${c === 'freeze' ? 'Congelación extra' : '+' + c + ' XP'}<small>${c === 'freeze' ? 'Protege tu racha un día más esta semana' : 'Ya sumados a tu total'}</small></div>`); $('#cl').textContent = '¡Seguir!'; $('#cl').onclick = finish }, 600);
    } else finish();
  };
}

// ================= arranque =================
const st = local();
if (st && st.uid) { uid = st.uid; U = Object.assign(blank(), st.U); home(); pull().then(ch => { if (ch && view === 'home') home() }) } else login();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => { });
