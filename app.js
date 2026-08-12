// ============================================================
//  Pentathlon — shared logic.  Store is the Supabase seam.
//  Scheme-A progression is baked in; never surfaced.
// ============================================================

// Bump on every app.js change; shown on the Backup page so you can confirm
// which build a device is actually running (iOS caches HTML aggressively).
const APP_VERSION = '2026.08.12-7';

// Register the service worker (offline support + deterministic cache updates).
// Fails silently on unsupported/insecure contexts — the app works either way.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  });
}

const PROGRAM = {
  // tier 1 = always (main lifts + knee rehab) · 2 = support · 3 = extras (superset these)
  // rest is per-exercise seconds; heavy work gets long rests, accessories short.
  w1: { label:'Workout 1', focus:'Bench + horizontal pull', ex:[
    {k:'wallsq',  n:'Heels-elevated wall squat', t:'work', tier:1, sets:3, reps:'8\u201312', rest:60, tempo:'2-0-2', cue:'knee prep \u00b7 ~2 in reserve',
      alts:[{k:'kneeext',n:'Seated knee extension'},{k:'legpress_slow',n:'Slow leg-press (knee-forward)'}]},
    {k:'bench',   n:'Smith machine bench', t:'top', tier:1, sets:4, reps:'4', rpe:8, inc:5, rest:180,
      alts:[{k:'bench_bb',n:'Barbell bench (w/ spotter)'},{k:'bench_db',n:'DB bench press'},{k:'chestpress',n:'Machine chest press'}]},
    {k:'legpress',n:'Leg press', t:'work', tier:1, sets:3, reps:'5\u20138', rpe:7, rest:90,
      alts:[{k:'hacksquat',n:'Hack squat'},{k:'gobletsq',n:'Goblet squat'}]},
    {k:'cablerow',n:'Seated cable row', t:'work', tier:1, sets:4, reps:'8\u201312', rest:90,
      alts:[{k:'row_machine',n:'Machine row'},{k:'row_db',n:'DB row'},{k:'row',n:'Chest-supported row'}]},
    {k:'pullthrough',n:'Cable pull-through', t:'work', tier:2, sets:3, reps:'8\u201312', rest:60, cue:'hinge \u00b7 no spinal load',
      alts:[{k:'backext',n:'45\u00b0 back extension'},{k:'hipthrust',n:'Hip thrust'}]},
    {k:'pallof',  n:'Pallof press', t:'work', tier:2, sets:3, reps:'8\u201312 / side', rest:60, cue:'resist the twist',
      alts:[{k:'pallof_kneel',n:'Half-kneeling Pallof'},{k:'chop',n:'Cable chop'},{k:'deadbug',n:'Dead bug'}]},
    {k:'pmtap',   n:'Posterior medial tap', t:'work', tier:2, sets:2, reps:'8\u201312 / side', rest:60, rotate:true, cue:'alternates weekly w/ SL RDL',
      alts:[{k:'slrdl',n:'Single-leg RDL'},{k:'stepdown',n:'Lateral step-down'}]},
    {k:'carry',   n:'Suitcase carry', t:'work', tier:2, sets:3, reps:'30\u201360s / side', rest:60, cue:'one hand \u00b7 ribs down, don\u2019t lean',
      alts:[{k:'farmerhold',n:'Farmer hold (two hands)'},{k:'towelhang',n:'Towel hang'}]},
    {k:'facepull',n:'Face pull', t:'work', tier:3, sets:2, reps:'12\u201320', rest:45,
      alts:[{k:'reardelt',n:'Rear-delt fly'},{k:'bandpull',n:'Band pull-apart'}]},
    {k:'dbcurl',  n:'DB curl', t:'work', tier:3, sets:2, reps:'8\u201312', rest:45,
      alts:[{k:'curl_bb',n:'Barbell curl'},{k:'curl_cable',n:'Cable curl'},{k:'curl_hammer',n:'Hammer curl'}]},
    {k:'calf_legpress',n:'Leg-press calf raise', t:'work', tier:3, sets:3, reps:'8\u201312', rest:45, tempo:'2-1-2', cue:'straight leg \u00b7 gastroc',
      alts:[{k:'calf_stand',n:'Standing calf raise'},{k:'calf_single',n:'Single-leg calf raise'}]},
  ]},
  w2: { label:'Workout 2', focus:'Vertical pull + incline', ex:[
    {k:'kneeext', n:'Seated knee extension', t:'work', tier:1, sets:3, reps:'8\u201312', rest:60, tempo:'2-0-2', cue:'knee prep \u00b7 ~2 in reserve',
      alts:[{k:'wallsq',n:'Heels-elevated wall squat'},{k:'legpress_slow',n:'Slow leg-press (knee-forward)'}]},
    {k:'pullup',  n:'Weighted pull-up', t:'pullup', tier:1, sets:4, reps:'4\u20136', inc:5, added:true, rest:150,
      alts:[{k:'pullup_neutral',n:'Neutral-grip pull-up'},{k:'chinup',n:'Weighted chin-up'},{k:'pulldown_wide',n:'Lat pulldown'}]},
    {k:'incline', n:'Smith machine incline', t:'top', tier:1, sets:4, reps:'4', rpe:8, inc:5, rest:180,
      alts:[{k:'incline_bb',n:'Barbell incline (w/ spotter)'},{k:'incline_db',n:'DB incline press'},{k:'incline_machine',n:'Machine incline press'}]},
    {k:'rdl',     n:'Romanian deadlift', t:'work', tier:1, sets:3, reps:'5\u20138', rpe:7, rest:90, cue:'strict \u00b7 stop at the stretch',
      alts:[{k:'rdl_db',n:'DB RDL'},{k:'pullthrough',n:'Cable pull-through'}]},
    {k:'legpress_sumo', n:'Wide-stance leg press', t:'work', tier:2, sets:3, reps:'6\u201310', rest:90, rotate:true, cue:'adductors \u00b7 alternates w/ split squat',
      alts:[{k:'splitsq',n:'DB split squat'},{k:'sumosq_bb',n:'Wide-stance barbell squat'},{k:'sumosq',n:'DB sumo squat'},{k:'bulgarian',n:'Bulgarian split squat'},{k:'reverselunge',n:'Reverse lunge'}]},
    {k:'row_bb_chest', n:'Chest-supported barbell row', t:'work', tier:2, sets:4, reps:'8\u201312', rest:90, inc:5, cue:'chest stays on the pad \u00b7 no heaving',
      alts:[{k:'row_machine',n:'Machine row'},{k:'row_db',n:'DB row'},{k:'cablerow',n:'Cable row'}]},
    {k:'halfkneelpress',n:'Half-kneeling DB press', t:'work', tier:2, sets:2, reps:'6\u201310 / side', rest:60, cue:'ribs down, glute on',
      alts:[{k:'ohp_db',n:'DB shoulder press'},{k:'ohp_landmine',n:'Landmine press'}]},
    {k:'latraise',n:'Lateral raise', t:'work', tier:3, sets:3, reps:'12\u201320', rest:45,
      alts:[{k:'latraise_cable',n:'Cable lateral raise'},{k:'latraise_machine',n:'Machine lateral raise'}]},
    {k:'rollout', n:'Ab rollout', t:'work', tier:3, sets:2, reps:'8\u201312', rest:45, cue:'anti-extension \u00b7 ribs tucked',
      alts:[{k:'deadbug',n:'Dead bug'},{k:'plank_ext',n:'Long-lever plank'}]},
    {k:'dbcurl',  n:'DB curl', t:'work', tier:3, sets:2, reps:'8\u201312', rest:45,
      alts:[{k:'curl_bb',n:'Barbell curl'},{k:'curl_cable',n:'Cable curl'},{k:'curl_hammer',n:'Hammer curl'}]},
  ]},
  w3: { label:'Workout 3', focus:'Squat + overhead', ex:[
    {k:'kneeext', n:'Seated knee extension', t:'work', tier:1, sets:3, reps:'8\u201312', rest:60, tempo:'2-0-2', cue:'knee prep FIRST \u00b7 keep it light',
      alts:[{k:'wallsq',n:'Heels-elevated wall squat'},{k:'legpress_slow',n:'Slow leg-press (knee-forward)'}]},
    {k:'boxsq',   n:'Box squat', t:'work', tier:1, sets:3, reps:'5', rpe:8, tempo:'3-0-3', rest:150,
      alts:[{k:'gobletbox',n:'DB goblet box squat'},{k:'frontsq',n:'Front squat'},{k:'backsq',n:'Back squat'}]},
    {k:'ohp',     n:'Overhead press', t:'top', tier:1, sets:3, reps:'4', rpe:8, inc:5, rest:180,
      alts:[{k:'ohp_db',n:'DB shoulder press'},{k:'ohp_machine',n:'Machine shoulder press'}]},
    {k:'row',     n:'Chest-supported row', t:'work', tier:1, sets:4, reps:'6\u201310', rest:90,
      alts:[{k:'row_machine',n:'Machine row'},{k:'cablerow',n:'Cable row'},{k:'row_db',n:'DB row'}]},
    {k:'legcurl', n:'Lying leg curl', t:'work', tier:2, sets:3, reps:'8\u201312', rest:90, tempo:'2-1-2', cue:'controlled, build slowly',
      alts:[{k:'legcurl_seated',n:'Seated leg curl'},{k:'slider_curl',n:'Slider leg curl'}]},
    {k:'cossack', n:'Cossack squat', t:'work', tier:2, sets:2, reps:'8\u201312 / side', rest:60, cue:'chase range',
      alts:[{k:'latlunge',n:'Lateral lunge'},{k:'lateralstepup',n:'Lateral step-up'}]},
    {k:'copenhagen',n:'Copenhagen plank', t:'work', tier:2, sets:2, reps:'20\u201340s / side', rest:60, cue:'adductor \u00b7 start bent-knee',
      alts:[{k:'adductor_machine',n:'Adductor machine'},{k:'ballsqueeze',n:'Ball squeeze'}]},
    {k:'calf_seated',n:'Seated calf raise', t:'work', tier:2, sets:3, reps:'10\u201315', rest:60, cue:'bent knee \u00b7 soleus',
      alts:[{k:'calf_db_seated',n:'DB seated calf raise'},{k:'calf_legpress',n:'Leg-press calf raise'}]},
    {k:'deadhang',n:'Weighted dead hang', t:'work', tier:2, sets:3, reps:'30\u201390s', rest:60, cue:'weight = added lbs \u00b7 past 90s? add 5',
      alts:[{k:'towelhang',n:'Towel hang'},{k:'farmerhold',n:'Heavy farmer hold'}]},
    {k:'pushdown',n:'Cable pushdown', t:'work', tier:3, sets:2, reps:'8\u201315', rest:45,
      alts:[{k:'tri_oh',n:'Overhead extension'},{k:'skullcrusher',n:'Skull crusher'},{k:'dips',n:'Dips'}]},
    {k:'latraise',n:'Lateral raise', t:'work', tier:3, sets:3, reps:'12\u201320', rest:45,
      alts:[{k:'latraise_cable',n:'Cable lateral raise'},{k:'latraise_machine',n:'Machine lateral raise'}]},
    {k:'tibraise',n:'Wall tibialis raise', t:'work', tier:3, sets:2, reps:'20\u201325', rest:45, cue:'heels out from wall \u00b7 toes to shins',
      alts:[{k:'tib_kb',n:'Seated KB tib raise'}]},
  ]},
};
// lifts shown on the Progress page (balanced upper + lower)
const PROGRESS_LIFTS = [
  {k:'boxsq', n:'Box squat'}, {k:'bench', n:'Bench'}, {k:'ohp', n:'Overhead press'},
  {k:'rdl', n:'Romanian deadlift'}, {k:'pullup', n:'Pull-up'},
];

// ---- Supabase client wrapper (configured via config.js) ----
const Cloud = (() => {
  let sb = null, user = null, inited = false;
  return {
    get sb() { return sb; },
    ready() { return !!sb; },
    uid() { return user ? user.id : null; },
    init() {
      if (inited) return; inited = true;
      const url = window.SUPA_URL, key = window.SUPA_KEY;
      if (window.supabase && url && key && !/YOUR_|PASTE_/.test(url + key)) {
        try { sb = window.supabase.createClient(url, key); } catch (e) { sb = null; }
      }
    },
    async session() {
      if (!sb) return null;
      const { data } = await sb.auth.getSession();
      user = data.session ? data.session.user : null;
      return data.session;
    },
    signIn(email, pw) { return sb.auth.signInWithPassword({ email, password: pw }); },
    signUp(email, pw) { return sb.auth.signUp({ email, password: pw }); },
    async signOut() { if (sb) await sb.auth.signOut(); },
  };
})();

// ---- storage: local-first cache, Supabase as the source of truth across devices ----
const Store = (() => {
  const KEY = 'pentathlon_v2', TS = 'pentathlon_v2_ts';
  let persistent = true, mem = null;
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); } catch (e) { persistent = false; }
  const def = () => ({ sessions:[], activities:[], episodes:[], weights:[], draft:null });

  const readLocal = () => { if (!persistent) return mem || (mem = def());
    try { return Object.assign(def(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return def(); } };
  const writeLocal = (s, ts) => { if (!persistent) { mem = s; return; }
    try { localStorage.setItem(KEY, JSON.stringify(s)); localStorage.setItem(TS, ts || new Date().toISOString()); } catch (e) {} };
  const localTs = () => { try { return localStorage.getItem(TS) || ''; } catch (e) { return ''; } };

  let pushTimer = null, pending = false;
  async function push() {
    if (!Cloud.ready()) return; const uid = Cloud.uid(); if (!uid) return;
    try {
      await Cloud.sb.from('app_state').upsert({ user_id: uid, data: readLocal(), updated_at: localTs() || new Date().toISOString() });
      pending = false;
    } catch (e) { pending = true; }   // offline: keep it flagged and retry on reconnect
  }

  return {
    def,
    get() { return readLocal(); },
    pending() { return pending; },
    set(s) { pending = true; writeLocal(s, new Date().toISOString()); clearTimeout(pushTimer); pushTimer = setTimeout(push, 600); },
    update(fn) { const s = readLocal(); fn(s); this.set(s); return s; },
    flush() { clearTimeout(pushTimer); return push(); },
    async pull() {
      if (!Cloud.ready()) return; const uid = Cloud.uid(); if (!uid) return;
      let row = null;
      try { const r = await Cloud.sb.from('app_state').select('data,updated_at').eq('user_id', uid).maybeSingle(); row = r.data; } catch (e) { return; }
      const lts = localTs();
      if (row && row.data) {
        if (!lts || row.updated_at > lts) writeLocal(Object.assign(def(), row.data), row.updated_at);
        else if (lts > row.updated_at) await push();
      } else { await push(); }
    },
    clearLocal() { try { localStorage.removeItem(KEY); localStorage.removeItem(TS); } catch (e) {} mem = null; },
  };
})();
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) Store.flush(); });
// back online → push anything logged while offline
if (typeof window !== 'undefined') window.addEventListener('online', () => { Store.flush(); netBadge(); });
if (typeof window !== 'undefined') window.addEventListener('offline', () => netBadge());

// small persistent indicator so you always know whether work is saved to the cloud yet
function netBadge() {
  if (typeof document === 'undefined' || !document.body) return;
  let el = document.getElementById('netbadge');
  const off = !navigator.onLine;
  if (!off && !Store.pending()) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement('div'); el.id = 'netbadge'; el.className = 'netbadge'; document.body.appendChild(el); }
  el.textContent = off ? 'Offline \u00b7 saved on this device' : 'Syncing\u2026';
  el.classList.toggle('warn', off);
}

const Auth = {
  // Order matters: push anything still queued BEFORE wiping the device. Saves are
  // debounced 600ms, so a logout tapped right after logging a set would otherwise
  // drop it. Both network steps get a deadline — on weak signal they stall rather
  // than fail, and a logout that hangs forever is worse than one that syncs late.
  async logout() {
    try { await withTimeout(Store.flush(), 3000); } catch (e) {}
    try { await withTimeout(Cloud.signOut(), 3000); } catch (e) {}
    Store.clearLocal();
    location.href = 'login.html';
  },
};

// gate + sync, then render the page. Falls back to local-only if Supabase isn't configured yet.
const SEEN_KEY = 'pentathlon_signed_in';
const hasSignedInBefore = () => { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; } };
const TIMED_OUT = '__timeout__';
// Never let a hanging request hold the UI hostage. Weak gym signal is worse than
// no signal: requests stall instead of failing, so everything gets a deadline.
function withTimeout(p, ms) {
  let t;
  return Promise.race([
    Promise.resolve(p).catch(() => null).then(v => { clearTimeout(t); return v; }),
    new Promise(r => { t = setTimeout(() => r(TIMED_OUT), ms); }),
  ]);
}
let badgeTimer = null;
function startBadge() { netBadge(); if (!badgeTimer) badgeTimer = setInterval(netBadge, 4000); }

async function boot(render) {
  Cloud.init();
  if (!Cloud.ready()) { render(); startBadge(); return; }

  // Offline: don't touch the network at all — render instantly from the local cache.
  if (typeof navigator !== 'undefined' && navigator.onLine === false && hasSignedInBefore()) {
    render(); startBadge(); return;
  }

  const session = await withTimeout(Cloud.session(), 3500);
  if (session === TIMED_OUT) {
    // Signal too weak to verify the session — trust the device and carry on locally
    // rather than bouncing to a login page that also can't reach the network.
    if (hasSignedInBefore()) { render(); startBadge(); return; }
    location.replace('login.html'); return;
  }
  if (!session) {
    if (!navigator.onLine && hasSignedInBefore()) { render(); startBadge(); return; }
    location.replace('login.html'); return;
  }
  try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}

  await withTimeout(Store.pull(), 3500);   // stale data beats no data
  render();
  startBadge();
}

// ---- helpers ----
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayISO = () => isoOf(new Date());
const round5 = w => { w = +w; return isFinite(w) && w ? Math.round(w/5)*5 : ''; };
const e1rm = (w,r) => { w=+w; r=+r||1; if(!isFinite(w)||!w) return 0; return r<=1 ? Math.round(w) : Math.round(w*(1+r/30)); };

function lastSessionOf(day) {
  return Store.get().sessions.filter(s => s.day === day).sort((a,b) => a.date < b.date ? 1 : -1)[0];
}
function prevSets(day, k) {
  const ls = lastSessionOf(day);
  const e = ls && ls.exercises && ls.exercises[k];
  return e && e.sets ? e.sets : null;
}
// ---- pre-workout check-in: only inputs that actually move a lever ----
// readiness scales load; prog=false pauses progression for the day.
const READINESS = {
  fresh:  { label:'Fresh',  f:1,    prog:true  },
  normal: { label:'Normal', f:1,    prog:true  },
  tired:  { label:'Tired',  f:0.9,  prog:false },
  cooked: { label:'Cooked', f:0.8,  prog:false },
};
const READY_ORDER = ['fresh','normal','tired','cooked'];
// joint status routes exercise selection; never a diagnosis — Derek's call governs.
const JOINTS = {
  ok:     { label:'Good',    note:'' },
  niggle: { label:'Niggle',  note:'Niggle logged \u00b7 stay in pain-free range' },
  sore:   { label:'Sore',    note:'Sore \u00b7 prefer the rehab-friendly swap, ease the load' },
  pain:   { label:'Painful', note:'Painful \u00b7 pain-free ROM only today \u2014 flag it to Derek' },
};
const JOINT_ORDER = ['ok','niggle','sore','pain'];
// Where you trained. Machines and plate sets differ between gyms, so each
// regular gym keeps its OWN progression history — suggestions come from your
// last session at that gym. 'other' is a one-off (travel) and never anchors.
const GYMS = { apt:{ label:'Apartment', tracked:true }, penn:{ label:'Penn', tracked:true }, other:{ label:'Other', tracked:false } };
const GYM_ORDER = ['apt','penn','other'];
// 'home' was the old two-option tag — treat it as the apartment so any session
// logged before this change keeps anchoring normally.
const normGym = g => (g === 'home' ? 'apt' : g);
const gymTracked = g => { g = normGym(g); return !!(GYMS[g] && GYMS[g].tracked); };
const TIMECAP = {
  full:  { label:'Full',    pri:3 },   // everything
  short: { label:'~40 min', pri:2 },   // tier 1 + 2
  min:   { label:'~25 min', pri:1 },   // tier 1 only
};
const TIME_ORDER = ['full','short','min'];
// tier comes straight from the program now — no guessing
function slotPriority(ex) { return (ex && ex.tier) ? ex.tier : 3; }

// a session whose numbers were deliberately eased — never anchors future suggestions
const isEasedSession = s => !!(s && (s.reduced || s.deload || (s.gym && !gymTracked(s.gym)) ||
  (s.readiness && READINESS[s.readiness] && !READINESS[s.readiness].prog)));

function topHistory(k) {
  const out = [];
  Store.get().sessions.forEach(s => {
    const e = s.exercises && s.exercises[k];
    if (e && e.sets && e.sets[0] && e.sets[0].w) out.push({ date:s.date, id:s.id, gym:s.gym, bw:(s.bodyweight || bwOn(s.date)), reduced:!!s.reduced, ...e.sets[0] });
  });
  return out.sort((a,b) => a.date === b.date ? ((a.id||0)-(b.id||0)) : (a.date < b.date ? -1 : 1));
}
// The session a suggestion should build on: most recent non-eased session logging k.
// When a gym is given, prefer history from THAT gym (machines differ). If there's
// none yet, fall back to your other gym so a first session still gets a number —
// flagged with `fromOtherGym` so the UI can say where it came from.
function anchorSession(k, gym) {
  const all = Store.get().sessions
    .filter(s => s.exercises && s.exercises[k] && s.exercises[k].sets && s.exercises[k].sets[0] && s.exercises[k].sets[0].w)
    .sort((a,b) => a.date === b.date ? ((b.id||0)-(a.id||0)) : (a.date < b.date ? 1 : -1));
  const usable = all.filter(x => !isEasedSession(x));
  const pick = list => list[0] || null;
  let s = null, fromOtherGym = false;
  if (gym && gymTracked(gym)) {
    s = pick(usable.filter(x => normGym(x.gym || 'apt') === normGym(gym)));
    if (!s) { s = pick(usable); fromOtherGym = !!s; }   // no history here yet — borrow
  } else {
    s = pick(usable);
  }
  if (!s) s = pick(all);
  return s ? { date:s.date, bw:s.bodyweight, sets:s.exercises[k].sets, gym:s.gym, fromOtherGym } : null;
}

function e1rmSeries(k, gym) {
  return topHistory(k).filter(e => !gym || normGym(e.gym || 'apt') === normGym(gym)).map(e => {
    if (k === 'pullup' && +e.bw) return { date:e.date, v:e1rm((+e.bw)+(+e.w||0), e.r), basis:'total' };
    return { date:e.date, v:e1rm(e.w, e.r), basis: k === 'pullup' ? 'added' : 'std' };
  });
}
// best est-1RM ever logged for a lift (from saved sessions only) — used for in-workout PR flags
// best est-1RM for a lift. Pass a gym to keep machine lifts honest — a 300 lb
// apartment leg press is not a PR target on a different machine at Penn.
function bestE1rm(k, gym) { const s = e1rmSeries(k, gym); return s.length ? Math.max(...s.map(x => x.v)) : 0; }
// the actual set behind your best est-1RM, and how many sessions back it was (0 = current best).
function bestSet(k, gym) {
  const h = topHistory(k).filter(e => !gym || normGym(e.gym || 'apt') === normGym(gym));
  if (!h.length) return null;
  let bi = -1, bv = 0;
  h.forEach((e,i) => { const v = (k==='pullup' && +e.bw) ? e1rm((+e.bw)+(+e.w||0), e.r) : e1rm(e.w, e.r); if (v > bv) { bv = v; bi = i; } });
  if (bi < 0) return null;
  return { w:h[bi].w, r:h[bi].r, v:bv, ago:h.length-1-bi, added:k==='pullup' };
}
function suggest(k, ex, gym) {
  if (ex && ex.t === 'ath') return null;
  const a = anchorSession(k, gym);
  if (!a) return null;
  const top = a.sets[0];
  const inc = ex.inc || 5;
  const nums = (ex.reps.match(/\d+/g) || []).map(Number);
  const topRange = nums.length ? Math.max(...nums) : 4;

  // timed holds (reps measured in seconds): chase more time, then add load past the range
  if (/\d\s*s/i.test(ex.reps || '')) {
    const secs = parseInt(('' + (top.r || '')).replace(/[^\d]/g, ''), 10) || 0;
    if (+top.w && topRange && secs >= topRange) return { w: round5((+top.w) + 5), tag: '+5', borrowed: a.fromOtherGym };
    return { w: +top.w || '', tag: 'time', borrowed: a.fromOtherGym };
  }

  if (ex.t === 'top' || ex.t === 'pullup') {
    const target = ex.t === 'pullup' ? topRange : (nums[0] || 4);
    const metReps = (+top.r) >= target;
    const okRpe = ex.rpe ? (top.rpe ? (+top.rpe) <= ex.rpe : true) : true;
    return (metReps && okRpe)
      ? { w: round5((+top.w) + inc), base: +top.w || '', tag: '+' + inc, borrowed: a.fromOtherGym }
      : { w: +top.w || '', base: +top.w || '', tag: 'hold', borrowed: a.fromOtherGym };
  }

  // work lifts — double progression: add weight only when EVERY working set hit the top of the range
  const working = a.sets.filter(s => s.w !== '' || s.r !== '');
  const allTop = working.length > 0 && working.every(s => (+s.r) >= topRange);
  return allTop
    ? { w: round5((+top.w || 0) + 5), base: +top.w || '', tag: '+5', borrowed: a.fromOtherGym }
    : { w: +top.w || '', base: +top.w || '', tag: 'same', borrowed: a.fromOtherGym };
}
// ---- reactive deload detection --------------------------------------------
// Fires only when fatigue markers CLUSTER (>=2), never on a schedule. Evidence
// favours as-needed deloads over calendar ones; a deload taken while fresh costs
// you progress. This informs, it never forces — programming stays yours/Derek's.
// A deload keeps the same lifts and frequency but strips volume: tier 1 only,
// load eased ~10%, stop well shy of failure. That matches what the athlete
// survey data actually describes (volume down, frequency and exercises kept).
const DELOAD = { loadF: 0.9, tierCap: 1, minGapDays: 21, minSessions: 6 };
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

function lastDeloadDate() {
  const d = Store.get().sessions.filter(s => s.deload).sort((a,b) => a.date < b.date ? 1 : -1)[0];
  return d ? d.date : null;
}
function fatigueSignals() {
  const sess = Store.get().sessions.filter(s => WORKOUTS.includes(s.day))
    .sort((a,b) => a.date === b.date ? ((a.id||0)-(b.id||0)) : (a.date < b.date ? -1 : 1));
  const out = { reasons: [], recommend: false, enough: sess.length >= DELOAD.minSessions };
  if (!out.enough) return out;
  const recent = sess.slice(-6);

  // 1. RPE creep — same-or-lighter load feeling harder is the classic fatigue marker
  let creep = 0;
  ['bench','incline','ohp','pullup','boxsq'].forEach(k => {
    const h = topHistory(k).filter(e => e.rpe && e.w);
    if (h.length < 4) return;
    const late = h.slice(-2), early = h.slice(-4, -2);
    const avg = arr => arr.reduce((a,e) => a + (+e.rpe), 0) / arr.length;
    const wAvg = arr => arr.reduce((a,e) => a + (+e.w), 0) / arr.length;
    if (avg(late) - avg(early) >= 1 && wAvg(late) <= wAvg(early) * 1.02) creep++;
  });
  if (creep >= 2) out.reasons.push(`${creep} main lifts feeling harder at the same load`);

  // 2. Stalled estimated strength on the tracked lifts
  let stalls = 0;
  PROGRESS_LIFTS.forEach(({k}) => {
    const v = e1rmSeries(k).map(x => x.v);
    if (v.length < 4) return;
    if (Math.max(...v.slice(-2)) <= Math.max(...v.slice(-4, -2))) stalls++;
  });
  if (stalls >= 3) out.reasons.push(`${stalls} tracked lifts flat or down`);

  // 3. Self-reported readiness trending low
  const low = recent.slice(-4).filter(s => s.readiness === 'tired' || s.readiness === 'cooked').length;
  if (low >= 2) out.reasons.push('showing up tired repeatedly');

  // 4. Joints not clearing between sessions
  const knees = recent.slice(-3).map(s => s.feedback && s.feedback.knee).filter(v => typeof v === 'number');
  if (knees.length >= 2 && knees.reduce((a,b) => a+b, 0) / knees.length >= 5) out.reasons.push('knee scores staying high');
  const today = todayISO();
  const flares = (Store.get().episodes || []).filter(e => daysBetween(e.date, today) <= 14).length;
  if (flares >= 2) out.reasons.push(`${flares} flares in the last 2 weeks`);

  const last = lastDeloadDate();
  out.daysSince = last ? daysBetween(last, today) : null;
  const gapOk = !last || out.daysSince >= DELOAD.minGapDays;
  out.recommend = out.reasons.length >= 2 && gapOk;
  return out;
}

// Renders the shared 1-10 sRPE picker into an element. Same scale everywhere,
// anchors always visible, so ratings stay comparable across sports.
function renderSrpePicker(el, current, onPick) {
  el.innerHTML =
    `<div class="srpe-scale">${SRPE_SCALE.map(([v]) =>
      `<button data-v="${v}" class="${+current===v?'sel':''}${v>=9?' hi':''}">${v}</button>`).join('')}</div>
     <div class="srpe-legend"><span>1 very easy</span><span>5 hard</span><span>10 all out</span></div>
     <div class="srpe-pick" id="${el.id}-lbl">${current ? SRPE_LABEL(current) : ''}</div>`;
  el.querySelectorAll('.srpe-scale button').forEach(b => b.onclick = () => {
    el.querySelectorAll('.srpe-scale button').forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    const lbl = document.getElementById(el.id + '-lbl');
    if (lbl) lbl.textContent = SRPE_LABEL(b.dataset.v);
    onPick(+b.dataset.v);
  });
}

// ---- weekly volume from LOGGED sets (not the plan) ----
// primary 1.0, secondary 0.5. Covers program mains + their alternates.
const EX_MUSCLES = {
  bench:[['Chest',1],['Triceps',.5],['Front delts',.5]], bench_bb:[['Chest',1],['Triceps',.5],['Front delts',.5]],
  bench_db:[['Chest',1],['Triceps',.5],['Front delts',.5]], chestpress:[['Chest',1],['Triceps',.5],['Front delts',.5]],
  incline:[['Chest',1],['Triceps',.5],['Front delts',.5]], incline_bb:[['Chest',1],['Triceps',.5],['Front delts',.5]],
  incline_db:[['Chest',1],['Triceps',.5],['Front delts',.5]], incline_machine:[['Chest',1],['Triceps',.5],['Front delts',.5]],
  ohp:[['Front delts',1],['Triceps',.5]], ohp_db:[['Front delts',1],['Triceps',.5]],
  ohp_machine:[['Front delts',1],['Triceps',.5]], ohp_landmine:[['Front delts',1],['Triceps',.5]],
  halfkneelpress:[['Front delts',1],['Triceps',.5],['Core',.5]],
  cablerow:[['Back',1],['Biceps',.5],['Rear delts',.5]], row:[['Back',1],['Biceps',.5],['Rear delts',.5]],
  row_db:[['Back',1],['Biceps',.5],['Rear delts',.5]], row_machine:[['Back',1],['Biceps',.5],['Rear delts',.5]],
  row_bb_chest:[['Back',1],['Biceps',.5],['Rear delts',.5]],
  pullup:[['Back',1],['Biceps',.5]], pullup_neutral:[['Back',1],['Biceps',.5]], chinup:[['Back',1],['Biceps',.5]],
  pulldown_wide:[['Back',1],['Biceps',.5]],
  legpress:[['Quads',1],['Glutes',.5]], hacksquat:[['Quads',1],['Glutes',.5]], gobletsq:[['Quads',1],['Glutes',.5]],
  boxsq:[['Quads',1],['Glutes',.5]], gobletbox:[['Quads',1],['Glutes',.5]], frontsq:[['Quads',1],['Glutes',.5]],
  backsq:[['Quads',1],['Glutes',.5]],
  wallsq:[['Quads',1]], kneeext:[['Quads',1]], legpress_slow:[['Quads',1]], goblet_slow:[['Quads',1]], spanishsq:[['Quads',1]],
  rdl:[['Hamstrings',1],['Glutes',.5]], rdl_db:[['Hamstrings',1],['Glutes',.5]],
  pullthrough:[['Hamstrings',1],['Glutes',1]], backext:[['Hamstrings',1],['Glutes',.5]], hipthrust:[['Glutes',1],['Hamstrings',.5]],
  legcurl:[['Hamstrings',1]], legcurl_seated:[['Hamstrings',1]], slider_curl:[['Hamstrings',1]], nordic:[['Hamstrings',1]],
  pmtap:[['Glutes',1],['Hamstrings',.5]], slrdl:[['Glutes',1],['Hamstrings',.5]], stepdown:[['Glutes',1],['Quads',.5]],
  sumosq:[['Adductors',1],['Quads',.5],['Glutes',.5]], splitsq:[['Quads',1],['Glutes',.5]],
  legpress_sumo:[['Adductors',1],['Quads',.5],['Glutes',.5]], sumosq_bb:[['Adductors',1],['Quads',.5],['Glutes',.5]],
  bulgarian:[['Quads',1],['Glutes',.5]], reverselunge:[['Quads',1],['Glutes',.5]],
  cossack:[['Adductors',1],['Glutes',.5],['Quads',.5]], latlunge:[['Adductors',1],['Glutes',.5]],
  lateralstepup:[['Glutes',1],['Quads',.5]],
  copenhagen:[['Adductors',1],['Core',.5]], adductor_machine:[['Adductors',1]], ballsqueeze:[['Adductors',1]],
  pallof:[['Core',1]], pallof_kneel:[['Core',1]], chop:[['Core',1]], deadbug:[['Core',1]],
  rollout:[['Core',1]], plank_ext:[['Core',1]],
  carry:[['Core',1],['Grip',1],['Traps',.5]], farmerhold:[['Grip',1],['Core',.5]],
  deadhang:[['Grip',1],['Core',.5]], towelhang:[['Grip',1],['Core',.5]],
  calf_legpress:[['Calves',1]], calf_stand:[['Calves',1]], calf_seated:[['Calves',1]],
  calf_db_seated:[['Calves',1]], calf_single:[['Calves',1]],
  latraise:[['Side delts',1]], latraise_cable:[['Side delts',1]], latraise_machine:[['Side delts',1]],
  facepull:[['Rear delts',1]], reardelt:[['Rear delts',1]], bandpull:[['Rear delts',1]],
  dbcurl:[['Biceps',1]], curl_bb:[['Biceps',1]], curl_cable:[['Biceps',1]], curl_hammer:[['Biceps',1]],
  pushdown:[['Triceps',1]], tri_oh:[['Triceps',1]], skullcrusher:[['Triceps',1]], dips:[['Triceps',1],['Chest',.5]],
  tibraise:[['Tibialis',1]], tib_kb:[['Tibialis',1]],
  armbar:[['Core',1]], windmill:[['Core',1]], halo:[['Core',1]],
};
// actual effective sets per muscle over a set of dates
function loggedVolume(isos) {
  const set = new Set(isos), t = {};
  Store.get().sessions.forEach(s => {
    if (!set.has(s.date)) return;
    Object.entries(s.exercises || {}).forEach(([k, e]) => {
      const n = (e.sets || []).filter(x => x.w !== '' || x.r !== '').length;
      if (!n) return;
      (EX_MUSCLES[k] || [['Other', 1]]).forEach(([g, w]) => { t[g] = (t[g] || 0) + n * w; });
    });
  });
  return Object.entries(t).map(([group, sets]) => ({ group, sets: Math.round(sets * 10) / 10 }))
    .sort((a, b) => b.sets - a.sets);
}

// ---- analytics helpers -----------------------------------------------------
// name for any exercise key, main or alternate, anywhere in the program
const EX_NAMES = (() => {
  const m = {};
  Object.values(PROGRAM).forEach(d => d.ex.forEach(e => {
    m[e.k] = e.n; (e.alts || []).forEach(a => { if (!m[a.k]) m[a.k] = a.n; });
  }));
  return m;
})();
const exName = k => EX_NAMES[k] || k;

// every lift you've actually logged weight on, most-trained first
function loggedLifts() {
  const c = {};
  Store.get().sessions.forEach(s => Object.entries(s.exercises || {}).forEach(([k, e]) => {
    if ((e.sets || []).some(x => x.w)) c[k] = (c[k] || 0) + 1;
  }));
  return Object.entries(c).map(([k, n]) => ({ k, n: exName(k), count: n }))
    .sort((a, b) => b.count - a.count || a.n.localeCompare(b.n));
}
// every time an est-1RM beat everything before it
function recentPRs(limit = 8) {
  const out = [];
  loggedLifts().forEach(({ k, n }) => {
    let best = 0;
    e1rmSeries(k).forEach(p => {
      if (p.v > best) { if (best > 0) out.push({ k, n, date: p.date, v: p.v, prev: best }); best = p.v; }
    });
  });
  return out.sort((a, b) => a.date < b.date ? 1 : -1).slice(0, limit);
}
// weekly total load for the last n weeks, oldest first
function loadTrend(n = 8) {
  const out = [];
  for (let o = -(n - 1); o <= 0; o++) {
    const days = weekDays(o).map(d => d.iso);
    const w = weekLoad(days);
    out.push({ offset: o, total: w.total, monotony: w.monotony, start: days[0] });
  }
  return out;
}
// merged reverse-chronological log of everything
function trainingHistory(limit = 14) {
  const items = [];
  Store.get().sessions.forEach(s => items.push({
    kind: 'lift', date: s.date, id: s.id,
    label: dayLabel(s.day),
    emoji: ATHLETIC_DAYS.includes(s.day) ? '\u26A1' : '\u{1F3CB}\uFE0F',
    load: loadOfSession(s), srpe: s.srpe, minutes: sessionMinutes(s),
    readiness: s.readiness, deload: !!s.deload,
    detail: (() => { const n = Object.keys(s.exercises || {}).length; return `${n} exercise${n === 1 ? '' : 's'}`; })(),
  }));
  (Store.get().activities || []).forEach(a => items.push({
    kind: a.type, date: a.date, id: a.id,
    label: ACT[a.type] ? ACT[a.type].label : a.type,
    emoji: ACT[a.type] ? ACT[a.type].emoji : '\u2022',
    load: loadOfActivity(a), srpe: a.srpe, minutes: actMinutes(a),
    detail: activitySummary(a),
  }));
  return items.sort((x, y) => x.date === y.date ? ((y.id > x.id) ? 1 : -1) : (x.date < y.date ? 1 : -1)).slice(0, limit);
}

// ---- joint / flare tracking ------------------------------------------------
// One vocabulary for both entry points (post-workout sheet + flares page), so
// the same injury never splits into two categories in the history.
const FLARES = ['Groin L','Groin R','Rotation','Hip L','Hip R','Knee','Other'];
const FLARE_LEGACY = {
  'Groin — left':'Groin L', 'Groin — right':'Groin R', 'Rotation / trunk':'Rotation',
  'Hip — left':'Hip L', 'Hip — right':'Hip R',
};
const normFlare = w => FLARE_LEGACY[w] || w;

// post-workout knee scores over time
function kneeLog() {
  return Store.get().sessions
    .filter(s => s.feedback && typeof s.feedback.knee === 'number')
    .map(s => ({ date: s.date, v: s.feedback.knee }))
    .sort((a,b) => a.date < b.date ? -1 : 1);
}
// flare history with the gap between each one — a widening gap is the win
function flareStats() {
  const eps = [...(Store.get().episodes || [])].sort((a,b) => a.date < b.date ? 1 : -1);
  const today = todayISO();
  const withGaps = eps.map((e, i) => {
    const nxt = eps[i+1];
    return { ...e, what: normFlare(e.what), gap: nxt ? daysBetween(nxt.date, e.date) : null };
  });
  return {
    all: withGaps,
    recent: withGaps.slice(0, 6),
    last: eps[0] || null,
    daysSince: eps[0] ? daysBetween(eps[0].date, today) : null,
    last30: eps.filter(e => daysBetween(e.date, today) <= 30).length,
  };
}

// ---- bodyweight: one morning weigh-in per day, same conditions ------------
// Stored as its own daily series. Older weights recorded mid-workout still show
// in the trend (legacy), but a same-day weigh-in always wins.
function logWeight(date, bw) {
  Store.update(s => {
    s.weights = s.weights || [];
    const i = s.weights.findIndex(w => w.date === date);
    if (i > -1) s.weights[i].bw = +bw; else s.weights.push({ date, bw: +bw });
  });
}
function weightForDate(date) {
  return (Store.get().weights || []).find(w => w.date === date) || null;
}
function bodyweightLog() {
  const byDate = {};
  Store.get().sessions.forEach(s => { if (s.bodyweight) byDate[s.date] = +s.bodyweight; });   // legacy
  (Store.get().weights || []).forEach(w => { if (w.bw) byDate[w.date] = +w.bw; });            // wins
  return Object.entries(byDate).map(([date, bw]) => ({ date, bw }))
    .sort((a,b) => a.date < b.date ? -1 : 1);
}
// bodyweight on or most recently before a date — for pull-up e1RM math
function bwOn(date) {
  const log = bodyweightLog().filter(w => w.date <= date);
  return log.length ? log[log.length-1].bw : null;
}
function latestBodyweight() { const l = bodyweightLog(); return l.length ? l[l.length-1].bw : ''; }

// ---- session-RPE training load (Foster CR-10) ------------------------------
// One currency across all five sports: load = sRPE x minutes. Validated as a
// stand-alone internal-load measure; anchors are shown at rating time so a 7 in
// the pool means the same as a 7 under the bar.
const SRPE_SCALE = [
  [1,'Very easy'], [2,'Easy'], [3,'Moderate'], [4,'Somewhat hard'], [5,'Hard'],
  [6,'Harder'], [7,'Very hard'], [8,'Very hard +'], [9,'Near max'], [10,'All out'],
];
const SRPE_LABEL = v => (SRPE_SCALE.find(x => x[0] === +v) || [0,''])[1];

// minutes for an activity — inferred from what's already logged where possible
function actMinutes(a) {
  if (!a) return 0;
  if (a.minutes) return +a.minutes;
  if (a.time) { const s = parseTime(a.time); if (s) return Math.round(s/60); }
  if (a.duration) return +a.duration;
  return 0;
}
function sessionMinutes(s) { return s && s.minutes ? +s.minutes : 0; }
// training load in AU; returns 0 when we can't honestly compute it
function loadOfActivity(a) { const m = actMinutes(a), r = +(a && a.srpe); return (m && r) ? Math.round(m * r) : 0; }
function loadOfSession(s)  { const m = sessionMinutes(s), r = +(s && s.srpe); return (m && r) ? Math.round(m * r) : 0; }

// per-day loads across every modality for a set of ISO dates
function dailyLoads(isos) {
  const out = {}; isos.forEach(d => out[d] = { lift:0, run:0, swim:0, fence:0, ninja:0, athletic:0, total:0 });
  const set = new Set(isos);
  Store.get().sessions.forEach(s => {
    if (!set.has(s.date)) return;
    const l = loadOfSession(s); if (!l) return;
    const bucket = ATHLETIC_DAYS.includes(s.day) ? 'athletic' : 'lift';
    out[s.date][bucket] += l; out[s.date].total += l;
  });
  (Store.get().activities || []).forEach(a => {
    if (!set.has(a.date)) return;
    const l = loadOfActivity(a); if (!l) return;
    if (out[a.date][a.type] === undefined) out[a.date][a.type] = 0;
    out[a.date][a.type] += l; out[a.date].total += l;
  });
  return out;
}
// weekly totals by sport + monotony/strain (day-to-day sameness; high = little
// hard/easy contrast). Informative, not a verdict — thresholds are rules of thumb.
function weekLoad(isos) {
  const d = dailyLoads(isos), days = isos.map(i => d[i]);
  const totals = { lift:0, run:0, swim:0, fence:0, ninja:0, athletic:0 };
  days.forEach(x => Object.keys(totals).forEach(k => totals[k] += (x[k] || 0)));
  const dayTotals = days.map(x => x.total);
  const total = dayTotals.reduce((a,b) => a+b, 0);
  const mean = total / (isos.length || 1);
  const sd = Math.sqrt(dayTotals.reduce((a,b) => a + Math.pow(b-mean,2), 0) / (isos.length || 1));
  // sd = 0 with real training means every day was identical — the most monotonous
  // case there is, not the least. Cap it rather than dividing by zero.
  const monotony = total === 0 ? 0 : (sd > 0 ? Math.min(mean/sd, 5) : 5);
  return { totals, total, mean, sd, monotony, strain: Math.round(total * monotony), days: dayTotals };
}

// ---- per-exercise execution cues (mains + every alternate) ----
const CUES = {
  pullthrough:["Rope between the legs, cable low behind you.","Hips back, flat back, let the rope drag through.","Snap the hips forward — glutes finish it. No spinal load."],
  carry:["One heavy DB, one hand. Stand tall.","Ribs down, shoulders level — don't lean away from it.","Walk or stand; set ends when posture breaks. Log seconds."],
  hipthrust:["Shoulders on a bench, bar over the hips.","Drive through the heels, ribs down at the top.","Squeeze glutes, don't hyperextend the back."],
  copenhagen:["Side plank, top leg on a bench.","Start bent-knee (shin on bench) before straightening.","Squeeze the adductor to lift the hips. Log seconds per side."],
  adductor_machine:["Sit tall, pads on the inner thighs.","Squeeze in under control.","Slow return to a comfortable stretch."],
  ballsqueeze:["Ball or towel between the knees, on your back.","Squeeze hard for the count.","Simple, and joint-friendly on a bad groin day."],
  tibraise:["Back on the wall, heels ~a foot out.","Pull the toes up toward the shins.","Further from the wall = harder."],
  tib_kb:["Sit, hang a KB over the toes.","Pull the toes up, slow lower.","Shin insurance for running and OCR."],
  sumosq:["Wide stance, toes out, DB at the chest.","Sit straight down, knees tracking out.","Adductors do the work — chase depth over load."],
  legpress_sumo:["Feet high and WIDE on the platform, toes turned out.","Knees track out over the toes, full depth.","Adductors do the work — the stack keeps loading long after a DB stops."],
  sumosq_bb:["Bar on the back, stance wide, toes out ~30°.","Sit straight down between the hips, chest tall.","Brace hard — this one loads the spine, keep it strict."],
  chop:["Cable high, pull down and across the body.","Rotate through the trunk, arms stay long.","Control it back up — no yanking."],
  plank_ext:["Plank with elbows further forward than usual.","Ribs tucked, glutes on, don't let the hips sag.","Longer lever = much harder; shorten if the back arches."],
  halfkneelpress:["Half-kneeling, ribs down, glute tight.","Press overhead without arching.","Control the return; the base stops you cheating."],
  // squat / knee / quad
  wallsq:["Upper back flat on the wall, heels raised on a plate.","Slide down slow — 2 s down, 2 s up.","Load the tendon; stop at discomfort, not sharp pain."],
  kneeext:["Up over 2 s, down over 2 s — no swinging.","Squeeze hard at the top.","Keep it to ~2 reps in reserve."],
  goblet_slow:["Hold a DB/KB at the chest, heels raised.","Slow controlled descent, knees forward over toes.","Drive up smooth, no bounce."],
  spanishsq:["Band behind the knees, anchored ahead of you.","Sit straight down against the band, shins tall.","Reps or holds — slow, quads do the work."],
  legpress:["Feet mid-platform, push through the whole foot.","Lower to ~90° without the low back rounding.","Controlled down, no hard lockout."],
  legpress_slow:["Slow 2–3 s descent, let the knees travel forward.","Push through the midfoot, no lockout slam.","Keep constant tension on the quads."],
  hacksquat:["Feet mid-platform, brace, unrack.","Descend under control, knees track toes.","Drive up without bouncing out of the hole."],
  gobletsq:["DB/KB at the chest, elbows tucked.","Sit between the hips, chest tall.","Full depth if pain-free, controlled tempo."],
  boxsq:["Box just below parallel.","Pull down on the bar and twist your feet into the floor.","Sit back to the box (3 s down), stay tight, drive up."],
  frontsq:["Bar on the front delts, elbows high.","Sit straight down, torso upright.","Drive up through the midfoot."],
  backsq:["Twist the feet into the floor, brace.","Sit down and back to depth.","Drive up, no forward pitch."],
  splitsq:["Long stance, torso tall, weight on the front heel.","Drop the back knee straight down.","Push through the front foot, control down."],
  bulgarian:["Rear foot on a bench, weight on the front leg.","Drop straight down, front shin ~vertical.","Drive up through the front heel."],
  reverselunge:["Step back, lower the back knee under control.","Front shin vertical, weight on the front heel.","Push back to standing, no wobble."],
  // hinge / hamstring
  gm:["DB behind the neck or at the shoulders.","Soft knees, push the hips back, flat back.","Feel the hamstrings; stop before the back rounds."],
  gm_bb:["Bar on the back, soft knees.","Hips back, chest down with a flat back.","Drive the hips forward to stand."],
  backext:["Pad at the hip crease, not the thighs.","Hinge from the hips, flat back.","Squeeze glutes/hams at the top, no hyperextension."],
  rdl:["Bar close, soft knees, hips back.","Bar drags down the thighs to mid-shin.","Flat back, stop at the stretch — RPE 7."],
  rdl_db:["DBs in front of the thighs, soft knees.","Hips back, DBs slide down the legs.","Feel the stretch, flat back, control up."],
  legcurl:["2 s up, 1 s squeeze, 2 s down.","No hip lift — keep the pelvis down.","Build load slowly given the hamstring history."],
  legcurl_seated:["Pad above the ankles, thighs pinned.","Curl under control, full squeeze.","Slow eccentric, no snapping back."],
  slider_curl:["Heels on towels/sliders, hips bridged up.","Curl the heels in slowly, hips stay high.","Lower with control."],
  nordic:["Ankles anchored, body straight.","Lower as slowly as you can control.","Catch with the hands — ease in, very high tension."],
  // press / chest / shoulder
  bench:["Smith bar over the mid-chest, feet planted.","Lower under control, elbows ~45°.","Press up; rack on the safeties if it stalls."],
  bench_bb:["Spotter only. Bar over the eyes at setup.","Shoulder blades retracted, feet planted.","Lower to the chest, press to lockout."],
  bench_db:["DBs over the chest, wrists stacked.","Lower to chest level, elbows ~45°.","Press up and slightly together."],
  bench_cg:["Grip just inside shoulder width.","Elbows tucked, lower to the lower chest.","Press up — triceps-biased."],
  bench_smith:["Controlled to the chest, elbows ~45°.","Press to lockout.","Safeties are your bail-out."],
  incline:["Smith, bench at ~30°.","Lower to the upper chest, elbows ~45°.","Press over the collarbone line."],
  incline_bb:["Spotter only. Bench ~30°.","Lower to the upper chest, control the bar.","Press to lockout over the shoulders."],
  incline_db:["Bench ~30°, DBs over the upper chest.","Lower to chest level, elbows ~45°.","Press up and together."],
  incline_smith:["Bench ~30° in the Smith.","Lower to the upper chest, controlled.","Press up, use the safeties."],
  ohp:["Bar on the front delts, brace abs and glutes.","Press up, head back then through.","Lock out over the mid-foot."],
  ohp_db:["DBs at shoulder height, wrists stacked.","Press overhead without flaring hard.","Lower under control."],
  ohp_landmine:["Half-kneel or stand, ribs down.","Press up and slightly forward.","Control the return."],
  // back / pull
  pulldown:["Tall chest, pull to the collarbone.","Lead with the elbows, squeeze the lats.","Control back up to a full stretch."],
  pulldown_neutral:["Neutral handle, chest tall.","Pull to the upper chest, elbows down and back.","Controlled stretch up top."],
  pulldown_wide:["Wide grip, slight lean back.","Pull to the upper chest, drive elbows down.","Full stretch, no jerking."],
  pullover:["Arms long, rope/bar high.","Pull down in an arc, arms near-straight.","Feel the lats; control back up."],
  pullup:["Dead hang, pull the chest to the bar.","Drive the elbows down, no kipping.","Add weight once you clean 6 reps."],
  pullup_neutral:["Neutral grip, dead hang.","Pull chest to bar, elbows down.","Controlled lower to a full hang."],
  chinup:["Underhand, shoulder width.","Pull the chest up, squeeze at the top.","Lower under control."],
  sealrow:["Chest on a raised bench, arms hanging.","Row to the lower ribs, squeeze the mid-back.","Lower fully, no body english."],
  cablerow:["Tall chest, pull to the belly.","Drive the elbows back, squeeze the blades.","Control the stretch forward."],
  row:["Chest supported, row to the lower ribs.","Elbows back, squeeze the mid-back.","Full stretch each rep, no heave."],
  row_db:["Hand and knee on a bench, flat back.","Row the DB to the hip, elbow tight.","Lower to a full stretch."],
  row_bb_chest:["Chest on an incline bench, barbell hanging at arm’s length.","Row to the ribs, elbows ~45°, squeeze the mid-back.","Chest never leaves the pad — that’s what keeps it off your low back."],
  row_machine:["Chest on the pad, grab the handles.","Pull to the ribs, squeeze the blades.","Slow return to a full stretch."],
  chestpress:["Seat set so handles meet mid-chest.","Press smooth, don't lock hard.","Control back until a slight stretch."],
  incline_machine:["Seat set so handles start below the collarbone.","Drive up and slightly back.","2 seconds down, no bounce."],
  ohp_machine:["Seat upright, handles at shoulder height.","Press without shrugging into the ears.","Lower under control to the start."],
  gobletbox:["Heavy DB at the chest, box behind you.","Same 3-0-3 tempo as the barbell version.","Sit back, tap, drive up — no plop."],
  pallof:["Cable/band at chest height, stand side-on.","Press straight out, arms long — don't let it twist you.","Slow return; ribs down, glutes on."],
  pallof_kneel:["Inside knee down, tall posture.","Press out and hold 2s; hips stay square.","Harder base = more honest anti-rotation."],
  deadbug:["Low back pressed into the floor the whole time.","Opposite arm + leg reach, slow.","Exhale as the leg lowers; no arch."],
  rollout:["Start on knees, ribs tucked.","Roll out only as far as the back stays flat.","Pull back with the lats, not the hips."],
  pinchhold:["Grip the DB by its round head, fingers only.","Stand tall, shoulder packed — don't shrug.","Set ends when the fingers peel; log seconds."],
  platepinch:["Pinch smooth plates together, thumb vs fingers.","Keep the wrist neutral.","Add plates before adding time past 40s."],
  farmerhold:["Heaviest DBs you can hold, stand tall.","Shoulders back, ribs stacked, breathe.","Time the hold; walk optional."],
  deadhang:["Full grip on the bar, arms long.","Let the shoulders stretch but stay engaged — not limp.","Weight field = added lbs (blank = bodyweight); log seconds."],
  towelhang:["Towel over the bar, grip the ends.","The OCR grip — crushing, not hooking.","Shorter times are normal; build up."],
  // athletic · sprint day
  jogwarm:["Easy conversational jog.","Finish with leg swings: front/back + side/side.","You should feel warm, not worked."],
  bikewarm:["5–8 min easy spin or row.","Build slightly at the end.","Sweat = ready."],
  askip:["Skip with a sharp knee punch.","Tall posture, arms drive.","Foot strikes under the hips."],
  amarch:["Same shape as the A-skip, walking.","Knee up, toe up, stay tall.","Master this before skipping."],
  bskip:["A-skip, then paw the leg down and back.","Leg extends, then pulls under you.","Rhythm over speed."],
  fastleg:["Jog, then cycle one leg fast for 3 steps.","Alternate legs each rep.","Quick off the ground."],
  highknee:["Run in place moving forward, knees to hip height.","Fast cadence, short ground time.","Arms pump hard."],
  buttkick:["Heels flick to the glutes, knees down.","Fast and light.","Hamstrings doing the work."],
  slbound:["Legs near-straight, bound off the ankles.","Keep it LOW and short.","Any groin twinge = done."],
  carioca:["Sideways cross-step pattern.","Hips rotate, shoulders stay square.","Both directions."],
  buildup:["Accelerate smoothly to ~85–90% by 30m.","Float the last 10m — never strain.","Walk all the way back between reps."],
  strides:["Relaxed 70–80% runs.","Tall, smooth, springy.","Form practice, not effort."],
  maxsprint:["Full acceleration, 30–40m, then coast.","2–3 min rest minimum — the rest IS the workout.","Stop the session when speed drops."],
  hillsprint:["Find a moderate hill, sprint 20–30m up.","Lower hamstring risk than flat sprints.","Walk down = rest."],
  flysprint:["Build 20m, then 20m at max.","Measures true top speed.","Only when flat sprints feel easy."],
  // athletic · jump day
  pogo:["Bounce on the balls of the feet, knees springy.","Quiet, rhythmic, elastic.","Ankles do the work."],
  jumprope:["Light, quick, two-foot bounces.","Same elastic quality as pogos.","Great stage-1 substitute."],
  linehop:["Small hops over a line: front/back, then side/side.","Fast and low.","Count contacts per direction."],
  lateralhop:["Low side-to-side hops over a line.","Stick soft, leave quick.","Groin-friendly heights only."],
  mbscoop:["Side-on to a wall, ball at the hip.","Rotate and throw THROUGH the wall.","Hips lead, arms finish."],
  mbchest:["Ball at the chest, explode it forward.","Step into it.","Full intent every rep."],
  mbslam:["Ball overhead, slam through the floor.","Whole body, exhale hard.","Pick up, reset, repeat."],
  mboverhead:["Ball behind the head, throw up/back or forward.","Triple extension — ankles, knees, hips.","Distance = score."],
  snapdown:["Reach tall, snap into an athletic quarter-squat.","Land loaded: hips back, chest up.","Teaches the landing before the jump."],
  dropcatch:["Step off a low box, land and STICK.","Silent landing, instant stillness.","Build height slowly."],
  hurdlehop:["Continuous hops over low hurdles.","Minimal ground time — leave before you settle.","Height comes later; speed first."],
  lowbox:["Quick hop onto a low box, step down.","Fast up, soft down.","Step-down saves the tendon."],
  boxjump:["Explode onto the box, land quietly in a quarter-squat.","STEP down, never jump down.","Full rest between reps."],
  depthdrop:["Step off, absorb, stick — no rebound yet.","The landing is the exercise.","Precursor to depth jumps."],
  squatjump:["Dip and jump max height, no arm swing.","Reset fully each rep.","Pure leg power."],
  broadjump:["Swing, load, jump for distance.","Stick the landing — don't stumble out.","Measure it; chase it."],
  vertjump:["Max vertical, full arm swing.","Land soft and centered.","One all-out rep at a time."],
  lungeplyo:["Fencing lunge, then explode back to en garde.","The exact energy of a real touch.","Last unlock — earn it."],
  splitjump:["Split-squat position, jump and switch legs.","Soft landings, tall torso.","Start small amplitude."],
  // delts / arms
  latraise:["Slight forward lean, soft elbows.","Raise to shoulder height, pinkies a touch up.","Lower slow, no swing."],
  latraise_cable:["Cable behind you, raise across the body.","To shoulder height, controlled.","Resist on the way down."],
  latraise_machine:["Pads on the forearms/elbows.","Raise to shoulder height, no shrug.","Slow negative."],
  facepull:["Rope at face height, pull to the eyes.","Elbows high, rotate out at the end.","Squeeze the rear delts, control back."],
  reardelt:["Bent over or on an incline, soft elbows.","Raise the DBs out to the sides.","Squeeze the rear delts, no traps."],
  bandpull:["Band at chest height, arms straight.","Pull apart, squeeze the blades.","Control the return."],
  dbcurl:["Elbows at the sides, no swinging.","Curl and supinate, squeeze the top.","Slow negative to a full stretch."],
  curl_bb:["Shoulder-width grip, elbows pinned.","Curl up, no shoulder swing.","Lower under control."],
  curl_cable:["Constant tension, elbows fixed.","Curl and squeeze.","Slow eccentric."],
  curl_hammer:["Neutral grip, elbows at the sides.","Curl up, no swing.","Slow down — hits the brachialis/forearm."],
  pushdown:["Elbows pinned to the sides.","Extend fully, squeeze the triceps.","Control back to ~90°."],
  tri_oh:["Rope/DB overhead, elbows high and still.","Extend to lockout.","Deep stretch at the bottom, controlled."],
  skullcrusher:["Elbows in, upper arms still.","Lower to the forehead/behind the head.","Extend to lockout, no flaring."],
  dips:["Slight forward lean, elbows tucked.","Lower to ~90° under control.","Press to lockout; stop if the shoulder pinches."],
  // rotation / groin / hip / core
  pmtap:["Stand on one leg, soft knee.","Reach the free foot back-and-in, tap light.","Control the hip; chase a little more range weekly."],
  stepdown:["On a step, one leg.","Lower the other heel slowly to tap the floor.","Knee over the toes, control up."],
  slrdl:["One leg, hinge at the hip, flat back.","Reach the DB down, back leg extends.","Feel the hamstring/glute, stand tall controlled."],
  cossack:["Wide stance, shift over one bent leg.","Other leg straight, heel down, sink low.","Range and control side to side."],
  latlunge:["Step wide, sit into that hip.","Other leg straight, chest tall.","Push back to center; range over weight."],
  lateralstepup:["Side-on to a box, step up with the near leg.","Control the drive up and the lower down.","No push-off from the trailing foot."],
  armbar:["On your back, press a DB/KB up, roll to the shoulder.","Keep the arm locked and stacked.","Slow — it's a position drill."],
  windmill:["Weight locked overhead, eyes on it.","Hinge to the side, hand slides down the leg.","Move slowly, own the position."],
  halo:["Half-kneeling, circle a KB/DB around the head.","Tight core, ribs down.","Slow circles both directions."],
  // calves
  calf_stand:["Balls of the feet on a plate/step, straight knees.","Rise tall, pause, lower slow into a deep stretch.","2 s up / 2 s down — this is tendon work."],
  calf_single:["One leg, ball of the foot on a step.","Full stretch at the bottom, tall at the top.","Controlled tempo, hold the top."],
  calf_legpress:["Balls of the feet on the platform edge.","Full plantarflexion, slow stretch back.","Straight legs bias the gastroc."],
  calf_seated:["Seated, knees bent, balls of the feet on a step.","Rise up, slow stretch at the bottom.","Bent knee targets the soleus."],
  calf_db_seated:["Seated, DBs on the knees, feet on a plate.","Rise up, pause, slow stretch down.","Bent knee = soleus focus."],
};

// ---- sport / cross-training activities ----
const ACT = {
  run:   { label:'Run',        emoji:'🏃', fields:[
    {k:'distance', t:'num',  label:'Distance', step:'0.01'},
    {k:'unit',     t:'sel',  label:'Unit', opts:['mi','km'], def:'mi'},
    {k:'time',     t:'time', label:'Time (mm:ss)'},
    {k:'note',     t:'text', label:'Note'} ]},
  swim:  { label:'Swim',       emoji:'🏊', fields:[
    {k:'distance', t:'num',  label:'Distance', step:'25'},
    {k:'unit',     t:'sel',  label:'Unit', opts:['yd','m'], def:'yd'},
    {k:'time',     t:'time', label:'Total time (mm:ss)'},
    {k:'note',     t:'text', label:'Note'} ]},
  fence: { label:'Fence',      emoji:'🤺', fields:[
    {k:'weapon',   t:'sel',  label:'Weapon', opts:['épée','sabre','foil'], def:'épée'},
    {k:'duration', t:'num',  label:'Minutes', step:'5'},
    {k:'bouts',    t:'num',  label:'Bouts (optional)', step:'1'},
    {k:'note',     t:'text', label:'Note'} ]},
  ninja: { label:'Ninja / OCR',emoji:'🧗', fields:[
    {k:'duration', t:'num',  label:'Minutes', step:'5'},
    {k:'note',     t:'text', label:'Note (obstacles, focus)'} ]},
  athletic: { label:'Athletic', emoji:'⚡', fields:[
    {k:'focus',    t:'sel',  label:'Focus', opts:['plyo 1 · rhythm','plyo 2 · fast ground','plyo 3 · max intent','sprints','agility','med-ball','mixed'], def:'mixed'},
    {k:'duration', t:'num',  label:'Minutes', step:'5'},
    {k:'contacts', t:'num',  label:'Ground contacts (plyos — optional)', step:'5'},
    {k:'note',     t:'text', label:'Note (quality, surface)'} ]},
};
const ACT_ORDER = ['run','swim','fence','ninja'];

const WORKOUTS   = ['w1','w2','w3'];
// retired session types. Kept so previously logged a1/a2 sessions still render
// and bucket correctly in history; they're no longer offered anywhere.
const ATHLETIC_DAYS = ['a1','a2'];
const RETIRED_LABELS = { a1:'Athletic \u00b7 Sprint', a2:'Athletic \u00b7 Jump' };
// label for any session day, including retired ones
const dayLabel = d => (PROGRAM[d] && PROGRAM[d].label) || RETIRED_LABELS[d] || 'Workout';

const parseTime = t => { if(!t) return 0; const p=String(t).split(':').map(Number);
  if(p.some(isNaN)) return 0; if(p.length===3) return p[0]*3600+p[1]*60+p[2];
  if(p.length===2) return p[0]*60+p[1]; return p[0]*60; };
const fmtDur = sec => { sec=Math.round(sec); const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;
  return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`; };

function activitiesOn(date){ return Store.get().activities.filter(a => a.date===date); }
function sessionsOn(date){ return Store.get().sessions.filter(s => s.date===date); }
function getActivity(id){ return Store.get().activities.find(a => a.id===id); }
function saveActivity(a){ Store.update(s => {
  s.activities = s.activities || [];
  if(a.id){ const i=s.activities.findIndex(x=>x.id===a.id); if(i>-1){ s.activities[i]=a; return; } }
  a.id = 'a'+Date.now()+Math.floor(Math.random()*1000); s.activities.push(a);
}); return a.id; }
function deleteActivity(id){ Store.update(s => { s.activities = (s.activities||[]).filter(a=>a.id!==id); }); }

// ---- in-progress workout (draft) helpers ----
// A draft "has content" once any set has real numbers in it (bodyweight alone doesn't count).
function draftHasContent(d){
  if(!d || !d.exercises) return false;
  return Object.values(d.exercises).some(ex => (ex.sets||[]).some(s => s.touched && (s.w!=='' || s.r!=='' || s.done)));
}
// null, or { day, date, label, sets } for the resume banners on home / day pages.
function draftInfo(){
  const d = Store.get().draft;
  if(!draftHasContent(d)) return null;
  const sets = Object.values(d.exercises).reduce((a,ex)=>a+(ex.sets||[]).filter(s=>s.touched&&(s.w!==''||s.r!==''||s.done)).length,0);
  return { day:d.day, date:d.date, label: dayLabel(d.day), sets };
}

// last exercise actually logged for a program slot (sticky swaps):
// scans this day's sessions newest-first for any of the slot's candidate keys.
// For rotate:true slots the logic inverts — it returns the option you did NOT
// do last time, so sumo/split and PM-tap/SL-RDL genuinely alternate.
function lastSlotChoice(day, baseK, alts, rotate){
  const cand = [baseK, ...(alts||[]).map(a=>a.k)];
  const sess = Store.get().sessions.filter(s => s.day===day)
    .sort((a,b) => a.date===b.date ? (b.id-a.id) : (a.date<b.date ? 1 : -1));
  for (const s of sess){
    const hit = cand.find(k => s.exercises && s.exercises[k]);
    if (hit) {
      if (!rotate) return hit;
      const partner = (alts||[])[0];            // the designated alternate
      if (hit === baseK && partner) return partner.k;
      if (partner && hit === partner.k) return baseK;
      // an off-rotation swap (or a lift that used to be the base) — resume the
      // prescribed rotation rather than sticking on it forever
      return baseK;
    }
  }
  return null;
}


// suggest next lift in rotation (based on most recent lift session), user can override
function nextWorkout(){
  const ls = Store.get().sessions.filter(s=>WORKOUTS.includes(s.day)).sort((a,b)=>a.date<b.date?1:-1)[0];
  if(!ls) return 'w1';
  return WORKOUTS[(WORKOUTS.indexOf(ls.day)+1)%3];
}

const INTENSITIES = [['easy','Easy'],['tempo','Tempo'],['threshold','Threshold'],['vo2','Intervals'],['sprint','Sprints'],['race','Race']];
const INTENSITY_LABEL = {easy:'easy',tempo:'tempo',threshold:'threshold',vo2:'intervals',sprint:'sprints',race:'race'};
const SEG_KINDS = { run:['warmup','interval','sprint','tempo','recovery','cooldown'], swim:['swim','drill','kick','pull','IM','warmup','cooldown'] };
function actTotals(a){
  if(a && a.mode==='struct' && a.segments){ let d=0; a.segments.forEach(s=>d+=(+s.reps||1)*(+s.distance||0)); return { dist:Math.round(d*100)/100 }; }
  return { dist:+((a&&a.distance))||0 };
}
function activitySummary(a){
  const tag = a.intensity ? ` \u00b7 ${INTENSITY_LABEL[a.intensity]||a.intensity}` : '';
  if(a.type==='run' || a.type==='swim'){
    const u=a.unit||(a.type==='run'?'mi':'yd');
    if(a.mode==='struct'){ const n=(a.segments||[]).length; return `${actTotals(a).dist} ${u} \u00b7 ${n} set${n===1?'':'s'}${tag}`; }
    const sec=parseTime(a.time), d=+a.distance||0;
    // minutes-only entry (a lesson, a technique swim) — don't render it as "0 yd · —"
    // no intensity tag here — on a minutes-only entry it's an untouched default,
    // not something the athlete actually chose
    if(!d && !sec){ const m=actMinutes(a);
      return m ? `${m} min${a.srpe?` \u00b7 RPE ${a.srpe}`:''}` : '\u2014'; }
    const pace = a.type==='run' ? ((d&&sec)?` \u00b7 ${fmtDur(sec/d)}/${u}`:'') : ((d&&sec)?` \u00b7 ${fmtDur(sec/(d/100))}/100`:'');
    return `${d} ${u} \u00b7 ${a.time||'\u2014'}${pace}${tag}`;
  }
  if(a.type==='fence'){ return `${a.weapon||'épée'} \u00b7 ${a.duration||'\u2014'} min${a.bouts?` \u00b7 ${a.bouts} bouts`:''}`; }
  if(a.type==='ninja'){ return `${a.duration||'\u2014'} min`; }
  if(a.type==='athletic'){ return `${a.focus||'mixed'} \u00b7 ${a.duration||'\u2014'} min${a.contacts?` \u00b7 ${a.contacts} contacts`:''}`; }
  return '';
}
// current week (Mon-first) with optional week offset
// The week containing `ref` (an ISO date), or the current week when ref is omitted.
// Pages that show a specific day must pass it — otherwise back-filling last
// Thursday would consult THIS week's completed slots.
function weekDays(offset=0, ref){
  const now = ref ? (([y,m,d]) => new Date(y, m-1, d))(ref.split('-').map(Number)) : new Date();
  const dow=(now.getDay()+6)%7; // Mon=0
  const mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-dow+offset*7);
  const names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i);
    return { iso:isoOf(d), dow:names[i], dom:d.getDate(),
             mon:d.toLocaleString('en-US',{month:'short'}) }; });
}
const prettyDate = iso => { const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d);
  return dt.toLocaleString('en-US',{weekday:'long', month:'short', day:'numeric'}); };

// ---- suggested session templates (Layer 1: structure, you fill the times) ----
// ---- run templates -------------------------------------------------------
// Trimmed to six sessions with distinct jobs. `expand:true` splits a rep block
// into one row per rep, so a key session becomes "type five times" rather than
// building segments by hand.
const TEMPLATES = {
  run: [
    {id:'easy',  label:'Easy', desc:'conversational \u00b7 the 80%',
      s:{mode:'cont',intensity:'easy',unit:'mi',distance:'',time:''}},
    {id:'long',  label:'Long easy', desc:'same effort, more of it',
      s:{mode:'cont',intensity:'easy',unit:'mi',distance:'',time:''}},
    {id:'laser', label:'Laser-run 5\u00d7600', desc:'the event \u00b7 600m + ~35s shoot break', expand:true,
      s:{mode:'struct',intensity:'race',unit:'mi',segments:[
        {reps:'1',distance:'1',time:'',rest:'',kind:'warmup',label:''},
        {reps:'5',distance:'0.373',time:'',rest:':35',kind:'interval',label:'600m'},
        {reps:'1',distance:'1',time:'',rest:'',kind:'cooldown',label:''}]}},
    {id:'vo2',   label:'VO\u2082 6\u00d7800', desc:'5K\u201310K pace \u00b7 ~90s jog', expand:true,
      s:{mode:'struct',intensity:'vo2',unit:'mi',segments:[
        {reps:'1',distance:'1.5',time:'',rest:'',kind:'warmup',label:''},
        {reps:'6',distance:'0.5',time:'',rest:'1:30',kind:'interval',label:'800m'},
        {reps:'1',distance:'1.5',time:'',rest:'',kind:'cooldown',label:''}]}},
    {id:'thresh',label:'Threshold 3\u00d71mi', desc:'comfortably hard \u00b7 raises what you can hold', expand:true,
      s:{mode:'struct',intensity:'threshold',unit:'mi',segments:[
        {reps:'1',distance:'1',time:'',rest:'',kind:'warmup',label:''},
        {reps:'3',distance:'1',time:'',rest:'2:00',kind:'tempo',label:'1 mi'},
        {reps:'1',distance:'1',time:'',rest:'',kind:'cooldown',label:''}]}},
    {id:'strides',label:'Easy + strides', desc:'easy run, then 6\u00d720s @ 85\u201390%',
      s:{mode:'struct',intensity:'easy',unit:'mi',segments:[
        {reps:'1',distance:'3',time:'',rest:'',kind:'warmup',label:'easy run'},
        {reps:'6',distance:'0.06',time:'',rest:'walk back',kind:'sprint',label:'stride 20s'}]}},
    {id:'test5k',label:'5K test', desc:'benchmark \u00b7 sets every other pace',
      s:{mode:'cont',intensity:'race',unit:'mi',distance:'3.107',time:''}},
  ],
  swim: [
    {id:'tech',  label:'Technique', desc:'drills + kick + pull',
      s:{mode:'struct',intensity:'easy',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'8',distance:'50',kind:'drill',time:'',rest:':20',label:''},
        {reps:'4',distance:'50',kind:'kick',time:'',rest:':20',label:''},
        {reps:'4',distance:'50',kind:'pull',time:'',rest:':20',label:''},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'aer',   label:'Aerobic base', desc:'steady swim',
      s:{mode:'cont',intensity:'easy',unit:'yd',distance:'1500',time:''}},
    {id:'css',   label:'Threshold 10\u00d7100', desc:'CSS pace',
      s:{mode:'struct',intensity:'threshold',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'10',distance:'100',kind:'swim',time:'',rest:':15',label:''},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'race',  label:'100 race-pace', desc:'the pentathlon distance',
      s:{mode:'struct',intensity:'race',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'8',distance:'50',kind:'swim',time:'',rest:':45',label:'race pace'},
        {reps:'4',distance:'25',kind:'swim',time:'',rest:':30',label:'fast'},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'sprint',label:'Sprint / speed', desc:'top-end',
      s:{mode:'struct',intensity:'sprint',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'10',distance:'25',kind:'swim',time:'',rest:':45',label:''},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'mixed', label:'Mixed sets', desc:'pull / kick / build',
      s:{mode:'struct',intensity:'tempo',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'6',distance:'100',kind:'pull',time:'',rest:':20',label:''},
        {reps:'6',distance:'50',kind:'kick',time:'',rest:':20',label:''},
        {reps:'4',distance:'100',kind:'swim',time:'',rest:':20',label:'build'},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
  ],
};

// Split rep blocks into one row per rep, so a key session is "type five times"
// instead of building segments by hand. Warm-up/cool-down stay as single rows.
function expandSegments(segs) {
  const out = [];
  (segs || []).forEach(g => {
    const n = +g.reps || 1;
    if (n > 1 && /interval|sprint|tempo|swim|drill|kick|pull/.test(g.kind)) {
      for (let i = 0; i < n; i++) out.push({ ...g, reps:'1', label:(g.label||'') + ' #' + (i+1) });
    } else out.push({ ...g });
  });
  return out;
}

// ---- run slot ladder -----------------------------------------------------
// Priority order: whatever number of runs you get, you get the right ones.
// Easy first — it's the foundation and the safe floor at low frequency.
const RUN_SLOTS = [
  {k:'easy',    label:'Easy',           tpl:'easy',    min:25, max:45},
  {k:'key',     label:'Key session',    rotates:true,  min:35, max:45},
  {k:'strides', label:'Easy + strides', tpl:'strides', min:30, max:40},
  {k:'long',    label:'Long easy',      tpl:'long',    min:45, max:70},
  {k:'key2',    label:'Second key',     rotates:true,  min:35, max:45},
  {k:'shake',   label:'Shakeout jog',   tpl:'easy',    min:20, max:30},
];
// the rotating hard session: event-specific first, then ceiling, then the
// low-impact option (pick threshold when the knee is grumbling)
const KEY_ROTATION = ['laser','vo2','thresh'];
const KEY_LABEL = { laser:'Laser-run 5\u00d7600', vo2:'VO\u2082 6\u00d7800', thresh:'Threshold 3\u00d71mi' };

// which key session is up next (cycles across weeks, like the lift rotation)
function nextKeyRun() {
  const last = (Store.get().activities || []).filter(a => a.type === 'run' && a.key)
    .sort((a,b) => a.date === b.date ? 0 : (a.date < b.date ? 1 : -1))[0];
  if (!last) return KEY_ROTATION[0];
  const i = KEY_ROTATION.indexOf(last.key);
  return KEY_ROTATION[(i + 1) % KEY_ROTATION.length];
}
// highest-priority slot not yet filled this week
function nextRun(isos) {
  const done = new Set((Store.get().activities || [])
    .filter(a => a.type === 'run' && a.slot && isos.includes(a.date)).map(a => a.slot));
  const slot = RUN_SLOTS.find(s => !done.has(s.k)) || RUN_SLOTS[RUN_SLOTS.length - 1];
  const tpl = slot.rotates ? nextKeyRun() : slot.tpl;
  return { slot, tpl, label: slot.rotates ? KEY_LABEL[tpl] : slot.label,
           range: `${slot.min}\u2013${slot.max} min` };
}

// ---- soft weekly goals (a nudge, not a plan) ----
// Three kinds of number, deliberately:
//   floor — the minimum that counts as an acceptable week (amber)
//   good  — the number you actually want (green). No ceiling above it.
//   cap   — a hard ceiling set by recovery; exceeding it is a warning (red).
// Lifting is capped by recovery; the sport side isn't — more running is fine.
// Edit these as conditioning changes (the running "good" should climb over time).
const GOALS = [
  {key:'lift',     emoji:'\u{1F3CB}\uFE0F', label:'Lifts',    floor:2, good:3, cap:3},
  {key:'run',      emoji:'\u{1F3C3}',       label:'Runs',     floor:2, good:5},
  {key:'swim',     emoji:'\u{1F3CA}',       label:'Swims',    floor:2, good:3},
  {key:'fence',    emoji:'\u{1F93A}',       label:'Fence',    floor:1, good:2},
];
// which tier a count sits in, plus the next number worth chasing
function goalTier(g, n) {
  const floor = (g.floor != null) ? g.floor : (g.target != null ? g.target : 1);
  const good  = (g.good  != null) ? g.good  : floor;
  if (g.cap && n > g.cap)  return { cls:'over', next:g.cap };
  if (n >= good)           return { cls:'good', next:null };
  if (n >= floor)          return { cls:'mid',  next:good };
  return { cls:'', next:floor };
}
function weekCounts(isos){
  const set = new Set(isos); const c = {lift:0,run:0,swim:0,fence:0,ninja:0,athletic:0};
  Store.get().sessions.forEach(s => { if(!set.has(s.date)) return;
    if(WORKOUTS.includes(s.day)) c.lift++; else if(ATHLETIC_DAYS.includes(s.day)) c.athletic++; });
  (Store.get().activities||[]).forEach(a => { if(set.has(a.date) && c[a.type]!==undefined) c[a.type]++; });
  return c;
}
