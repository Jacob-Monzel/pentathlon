// ============================================================
//  Pentathlon — shared logic.  Store is the Supabase seam.
//  Scheme-A progression is baked in; never surfaced.
// ============================================================

const PROGRAM = {
  w1: { label:'Workout 1', ex:[
    {k:'wallsq',  n:'Heels-elevated wall squat', t:'work', sets:3, reps:'8–12', tempo:'2-0-2', cue:'~2 in reserve',
      alts:[{k:'goblet_slow',n:'Heels-elevated goblet squat'},{k:'kneeext',n:'Seated knee extension'},{k:'spanishsq',n:'Spanish squat'}]},
    {k:'bench',   n:'Smith machine bench', t:'top', sets:4, reps:'4', rpe:8, inc:5,
      alts:[{k:'bench_bb',n:'Barbell bench (w/ spotter)'},{k:'bench_db',n:'DB bench press'},{k:'bench_cg',n:'Close-grip bench'}]},
    {k:'legpress',n:'Leg press', t:'work', sets:3, reps:'5–8', rpe:7,
      alts:[{k:'hacksquat',n:'Hack squat'},{k:'gobletsq',n:'Goblet squat'}]},
    {k:'gm',      n:'DB good morning', t:'work', sets:3, reps:'6–10',
      alts:[{k:'backext',n:'45° back extension'},{k:'gm_bb',n:'Barbell good morning'}]},
    {k:'pmtap',   n:'Posterior medial tap', t:'work', sets:3, reps:'8–12 / side', cue:'chase range',
      alts:[{k:'stepdown',n:'Lateral step-down'},{k:'slrdl',n:'Single-leg RDL'}]},
    {k:'pulldown',n:'Single-arm lat pulldown', t:'work', sets:3, reps:'8–12 / side',
      alts:[{k:'pulldown_neutral',n:'Neutral-grip pulldown'},{k:'pullover',n:'Cable pullover'}]},
    {k:'sealrow', n:'Seal row', t:'work', sets:3, reps:'8–12',
      alts:[{k:'row_db',n:'DB row'},{k:'cablerow',n:'Cable row'}]},
    {k:'dbcurl',  n:'DB curl', t:'work', sets:3, reps:'8–12',
      alts:[{k:'curl_bb',n:'Barbell curl'},{k:'curl_cable',n:'Cable curl'},{k:'curl_hammer',n:'Hammer curl'}]},
    {k:'facepull',n:'Face pull', t:'work', sets:3, reps:'12–20',
      alts:[{k:'reardelt',n:'Rear-delt fly'},{k:'bandpull',n:'Band pull-apart'}]},
    {k:'calf_stand',n:'Standing calf raise', t:'work', sets:3, reps:'8–12', tempo:'2-1-2', cue:'gastroc',
      alts:[{k:'calf_legpress',n:'Leg-press calf raise'},{k:'calf_single',n:'Single-leg calf raise'}]},
  ]},
  w2: { label:'Workout 2', ex:[
    {k:'kneeext', n:'Seated knee extension', t:'work', sets:3, reps:'8–12', tempo:'2-0-2', cue:'~2 in reserve',
      alts:[{k:'wallsq',n:'Heels-elevated wall squat'},{k:'legpress_slow',n:'Slow leg-press (knee-forward)'},{k:'spanishsq',n:'Spanish squat'}]},
    {k:'rdl',     n:'Romanian deadlift', t:'work', sets:3, reps:'5–8', rpe:7,
      alts:[{k:'rdl_db',n:'DB RDL'},{k:'backext',n:'45° back extension'}]},
    {k:'incline', n:'Smith machine incline', t:'top', sets:4, reps:'4', rpe:8, inc:5,
      alts:[{k:'incline_bb',n:'Barbell incline (w/ spotter)'},{k:'incline_db',n:'DB incline press'}]},
    {k:'pullup',  n:'Weighted pull-up', t:'pullup', sets:3, reps:'4–6', inc:5, added:true,
      alts:[{k:'pullup_neutral',n:'Neutral-grip pull-up'},{k:'chinup',n:'Weighted chin-up'},{k:'pulldown_wide',n:'Lat pulldown'}]},
    {k:'cablerow', n:'Cable row', t:'work', sets:3, reps:'8–12',
      alts:[{k:'row_db',n:'DB row'},{k:'sealrow',n:'Seal row'}]},
    {k:'splitsq', n:'DB split squat', t:'work', sets:3, reps:'6–10 / side',
      alts:[{k:'bulgarian',n:'Bulgarian split squat'},{k:'reverselunge',n:'Reverse lunge'}]},
    {k:'sumosq',  n:'DB sumo squat', t:'work', sets:3, reps:'8–12', cue:'chase range',
      alts:[{k:'gobletsq',n:'Goblet squat'},{k:'cossack',n:'Cossack squat'}]},
    {k:'armbar',  n:'DB armbar', t:'work', sets:3, reps:'6–10 / side', cue:'control',
      alts:[{k:'windmill',n:'KB windmill'},{k:'halfkneelpress',n:'Half-kneeling press'}]},
    {k:'latraise',n:'Lateral raise', t:'work', sets:2, reps:'12–20',
      alts:[{k:'latraise_cable',n:'Cable lateral raise'},{k:'latraise_machine',n:'Machine lateral raise'}]},
    {k:'dbcurl',  n:'DB curl', t:'work', sets:2, reps:'8–12',
      alts:[{k:'curl_bb',n:'Barbell curl'},{k:'curl_cable',n:'Cable curl'},{k:'curl_hammer',n:'Hammer curl'}]},
  ]},
  w3: { label:'Workout 3', ex:[
    {k:'kneeext', n:'Seated knee extension', t:'work', sets:3, reps:'8–12', tempo:'2-0-2', cue:'~2 in reserve',
      alts:[{k:'wallsq',n:'Heels-elevated wall squat'},{k:'legpress_slow',n:'Slow leg-press (knee-forward)'},{k:'spanishsq',n:'Spanish squat'}]},
    {k:'boxsq',   n:'Box squat', t:'work', sets:4, reps:'5', rpe:8, tempo:'3-0-3',
      alts:[{k:'ssbsquat',n:'SSB box squat'},{k:'frontsq',n:'Front squat'},{k:'backsq',n:'Back squat'}]},
    {k:'ohp',     n:'Overhead press', t:'top', sets:4, reps:'4', rpe:8, inc:5,
      alts:[{k:'ohp_db',n:'DB shoulder press'},{k:'ohp_landmine',n:'Landmine press'}]},
    {k:'row',     n:'Chest-supported row', t:'work', sets:3, reps:'6–10',
      alts:[{k:'row_db',n:'DB row'},{k:'cablerow',n:'Cable row'}]},
    {k:'legcurl', n:'Lying leg curl', t:'work', sets:3, reps:'8–12', tempo:'2-1-2', cue:'controlled, build slowly',
      alts:[{k:'slider_curl',n:'Slider leg curl'},{k:'legcurl_seated',n:'Seated leg curl'},{k:'nordic',n:'Nordic curl (eccentric)'}]},
    {k:'latlunge',n:'Lateral lunge', t:'work', sets:3, reps:'8–12 / side', cue:'chase range',
      alts:[{k:'cossack',n:'Cossack squat'},{k:'lateralstepup',n:'Lateral step-up'}]},
    {k:'windmill',n:'KB windmill', t:'work', sets:3, reps:'6–10 / side', cue:'control',
      alts:[{k:'armbar',n:'DB armbar'},{k:'halo',n:'Half-kneeling halo'}]},
    {k:'pushdown',n:'Cable pushdown', t:'work', sets:3, reps:'8–15',
      alts:[{k:'tri_oh',n:'Overhead extension'},{k:'skullcrusher',n:'Skull crusher'},{k:'dips',n:'Dips'}]},
    {k:'latraise',n:'Lateral raise', t:'work', sets:3, reps:'12–20',
      alts:[{k:'latraise_cable',n:'Cable lateral raise'},{k:'latraise_machine',n:'Machine lateral raise'}]},
    {k:'calf_seated',n:'Seated calf raise', t:'work', sets:3, reps:'10–15', cue:'soleus',
      alts:[{k:'calf_db_seated',n:'DB seated calf raise'},{k:'calf_legpress',n:'Leg-press calf raise'},{k:'calf_stand',n:'Standing calf raise'}]},
  ]},
};
// lifts shown on the Progress page (balanced upper + lower)
const PROGRESS_LIFTS = [
  {k:'boxsq', n:'Box squat'}, {k:'bench', n:'Bench'}, {k:'ohp', n:'Overhead press'},
  {k:'rdl', n:'Romanian deadlift'}, {k:'pullup', n:'Pull-up'},
];

// ---- storage layer (swap for Supabase here) ----
const Store = (() => {
  const KEY = 'pentathlon_v2';
  let persistent = true, mem = null;
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); }
  catch (e) { persistent = false; }
  const def = () => ({ sessions:[], activities:[], episodes:[], draft:null, user:null, pwHash:null });
  return {
    persistent,
    get() {
      if (!persistent) return mem || (mem = def());
      try { return Object.assign(def(), JSON.parse(localStorage.getItem(KEY)) || {}); }
      catch (e) { return def(); }
    },
    set(s) { if (!persistent) { mem = s; return; } try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} },
    update(fn) { const s = this.get(); fn(s); this.set(s); return s; },
  };
})();

const Auth = {
  isAuthed() { return !!Store.get().user; },
  logout()   { Store.update(s => { s.user = null; }); location.href = 'login.html'; },
  guard()    { if (!this.isAuthed()) location.replace('login.html'); },
};

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
function topHistory(k) {
  const out = [];
  Store.get().sessions.forEach(s => {
    const e = s.exercises && s.exercises[k];
    if (e && e.sets && e.sets[0] && e.sets[0].w) out.push({ date:s.date, bw:s.bodyweight, ...e.sets[0] });
  });
  return out.sort((a,b) => a.date < b.date ? -1 : 1);
}
function isStalled(k) {
  const h = topHistory(k);
  if (h.length < 3) return false;
  return (+h[h.length-1].w) <= (+h[h.length-3].w);
}
function e1rmSeries(k) {
  return topHistory(k).map(e => {
    if (k === 'pullup' && +e.bw) return { date:e.date, v:e1rm((+e.bw)+(+e.w||0), e.r), basis:'total' };
    return { date:e.date, v:e1rm(e.w, e.r), basis: k === 'pullup' ? 'added' : 'std' };
  });
}
function suggest(k, ex) {
  const h = topHistory(k);
  const p = h[h.length-1];
  if (!p) return null;
  const inc = ex.inc || 5;
  const nums = (ex.reps.match(/\d+/g) || []).map(Number);
  const topRange = nums.length ? Math.max(...nums) : 4;
  if (ex.t === 'top' || ex.t === 'pullup') {
    if (isStalled(k)) return { w: round5((+p.w) * 0.9), tag: 'deload' };
    const target = ex.t === 'pullup' ? topRange : (nums[0] || 4);
    const metReps = (+p.r) >= target;
    const okRpe = ex.rpe ? (p.rpe ? (+p.rpe) <= ex.rpe : true) : true;
    return (metReps && okRpe) ? { w: round5((+p.w) + inc), tag: '+' + inc } : { w: +p.w || '', tag: 'hold' };
  }
  if (topRange && (+p.r) >= topRange) return { w: round5((+p.w || 0) + 5), tag: '+5' };
  return { w: +p.w || '', tag: 'same' };
}
function bodyweightLog() {
  return Store.get().sessions.filter(s => s.bodyweight)
    .map(s => ({ date:s.date, bw:+s.bodyweight }))
    .sort((a,b) => a.date < b.date ? -1 : 1);
}
function latestBodyweight() { const l = bodyweightLog(); return l.length ? l[l.length-1].bw : ''; }

// ---- weekly EFFECTIVE sets per muscle group (primary 1.0 + secondary 0.5) ----
const EX_MUSCLES = {
  bench:[['Chest',1],['Triceps',0.5],['Shoulders',0.5]],
  incline:[['Chest',1],['Triceps',0.5],['Shoulders',0.5]],
  pulldown:[['Back',1],['Biceps',0.5]],
  pullup:[['Back',1],['Biceps',0.5]],
  row:[['Back',1],['Biceps',0.5],['Rear delts',0.5]],
  sealrow:[['Back',1],['Biceps',0.5],['Rear delts',0.5]],
  cablerow:[['Back',1],['Biceps',0.5],['Rear delts',0.5]],
  facepull:[['Rear delts',1]],
  latraise:[['Side delts',1]],
  ohp:[['Shoulders',1],['Triceps',0.5]],
  dbcurl:[['Biceps',1]],
  pushdown:[['Triceps',1]],
  legpress:[['Quads',1],['Glutes / hips',0.5]],
  boxsq:[['Quads',1],['Glutes / hips',0.5]],
  splitsq:[['Quads',1],['Glutes / hips',0.5]],
  wallsq:[['Knee rehab',1]],
  kneeext:[['Knee rehab',1]],
  gm:[['Hamstrings',1],['Glutes / hips',0.5]],
  rdl:[['Hamstrings',1],['Glutes / hips',0.5]],
  legcurl:[['Hamstrings',1]],
  calf_stand:[['Calves',1]],
  calf_seated:[['Calves',1]],
  pmtap:[['Glutes / hips',1]],
  sumosq:[['Glutes / hips',1],['Quads',0.5]],
  latlunge:[['Glutes / hips',1],['Quads',0.5]],
  armbar:[['Core',1]],
  windmill:[['Core',1]],
};
function weeklyVolume() {
  const t = {};
  Object.values(PROGRAM).forEach(d => d.ex.forEach(e => {
    (EX_MUSCLES[e.k] || [['Other',1]]).forEach(([g, wt]) => { t[g] = (t[g]||0) + wt * e.sets; });
  }));
  return Object.entries(t).map(([group, sets]) => ({ group, sets })).sort((a,b) => b.sets - a.sets);
}

// ---- per-exercise execution cues (mains + every alternate) ----
const CUES = {
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
  ssbsquat:["Brace hard against the bar's forward pull.","Sit back to the box, upright torso.","Controlled down, drive up."],
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
  sumosq:["Wide stance, toes out, DB at the chest.","Sit straight down, knees over toes.","Push the knees out; chase depth over load."],
  cossack:["Wide stance, shift over one bent leg.","Other leg straight, heel down, sink low.","Range and control side to side."],
  latlunge:["Step wide, sit into that hip.","Other leg straight, chest tall.","Push back to center; range over weight."],
  lateralstepup:["Side-on to a box, step up with the near leg.","Control the drive up and the lower down.","No push-off from the trailing foot."],
  armbar:["On your back, press a DB/KB up, roll to the shoulder.","Keep the arm locked and stacked.","Slow — it's a position drill."],
  windmill:["Weight locked overhead, eyes on it.","Hinge to the side, hand slides down the leg.","Move slowly, own the position."],
  halfkneelpress:["Half-kneeling, ribs down, glute tight.","Press overhead without arching.","Control the return."],
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
};
const ACT_ORDER = ['run','swim','fence','ninja'];
const WORKOUTS   = ['w1','w2','w3'];

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

// suggest next lift in rotation (based on most recent lift session), user can override
function nextWorkout(){
  const ls = Store.get().sessions.slice().sort((a,b)=>a.date<b.date?1:-1)[0];
  if(!ls || !WORKOUTS.includes(ls.day)) return 'w1';
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
    const pace = a.type==='run' ? ((d&&sec)?` \u00b7 ${fmtDur(sec/d)}/${u}`:'') : ((d&&sec)?` \u00b7 ${fmtDur(sec/(d/100))}/100`:'');
    return `${d} ${u} \u00b7 ${a.time||'\u2014'}${pace}${tag}`;
  }
  if(a.type==='fence'){ return `${a.weapon||'épée'} \u00b7 ${a.duration||'\u2014'} min${a.bouts?` \u00b7 ${a.bouts} bouts`:''}`; }
  if(a.type==='ninja'){ return `${a.duration||'\u2014'} min`; }
  return '';
}
// current week (Mon-first) with optional week offset
function weekDays(offset=0){
  const now=new Date(); const dow=(now.getDay()+6)%7; // Mon=0
  const mon=new Date(now.getFullYear(),now.getMonth(),now.getDate()-dow+offset*7);
  const names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return Array.from({length:7},(_,i)=>{ const d=new Date(mon.getFullYear(),mon.getMonth(),mon.getDate()+i);
    return { iso:isoOf(d), dow:names[i], dom:d.getDate(),
             mon:d.toLocaleString('en-US',{month:'short'}) }; });
}
const prettyDate = iso => { const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d);
  return dt.toLocaleString('en-US',{weekday:'long', month:'short', day:'numeric'}); };

// ---- suggested session templates (Layer 1: structure, you fill the times) ----
const TEMPLATES = {
  run: [
    {id:'easy',  label:'Easy aerobic', desc:'conversational base',
      s:{mode:'cont',intensity:'easy',unit:'mi',distance:'4',time:''}},
    {id:'long',  label:'Long run', desc:'steady endurance',
      s:{mode:'cont',intensity:'easy',unit:'mi',distance:'7',time:''}},
    {id:'tempo', label:'Tempo', desc:'~20 min comfortably hard',
      s:{mode:'cont',intensity:'tempo',unit:'mi',distance:'3',time:''}},
    {id:'thresh',label:'Threshold 3×1mi', desc:'cruise intervals',
      s:{mode:'struct',intensity:'threshold',unit:'mi',segments:[
        {reps:'1',distance:'1',kind:'warmup',time:'',rest:'',label:''},
        {reps:'3',distance:'1',kind:'interval',time:'',rest:'1:30',label:'@ threshold'},
        {reps:'1',distance:'1',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'vo2',   label:'VO2 6×800', desc:'aerobic power',
      s:{mode:'struct',intensity:'vo2',unit:'km',segments:[
        {reps:'1',distance:'1.5',kind:'warmup',time:'',rest:'',label:''},
        {reps:'6',distance:'0.8',kind:'interval',time:'',rest:'2:00',label:'800m hard'},
        {reps:'1',distance:'1.5',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'400s',  label:'400s ×8', desc:'speed-endurance',
      s:{mode:'struct',intensity:'vo2',unit:'km',segments:[
        {reps:'1',distance:'1.5',kind:'warmup',time:'',rest:'',label:''},
        {reps:'8',distance:'0.4',kind:'sprint',time:'',rest:'1:30',label:'400m'},
        {reps:'1',distance:'1.5',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'laser', label:'Laser-run sim', desc:'5×600m + shoot-break repeats',
      s:{mode:'struct',intensity:'vo2',unit:'km',segments:[
        {reps:'1',distance:'1',kind:'warmup',time:'',rest:'',label:''},
        {reps:'5',distance:'0.6',kind:'interval',time:'',rest:'0:40',label:'600m + shoot break'},
        {reps:'1',distance:'1',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'strides',label:'Strides / sprints', desc:'top-end speed',
      s:{mode:'struct',intensity:'sprint',unit:'km',segments:[
        {reps:'1',distance:'1.5',kind:'warmup',time:'',rest:'',label:''},
        {reps:'10',distance:'0.1',kind:'sprint',time:'',rest:'1:00',label:'100m'},
        {reps:'1',distance:'1.5',kind:'cooldown',time:'',rest:'',label:''}]}},
  ],
  swim: [
    {id:'tech',  label:'Technique', desc:'drills + kick + pull',
      s:{mode:'struct',intensity:'easy',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'8',distance:'50',kind:'drill',time:'',rest:':15',label:'catch-up / fist'},
        {reps:'4',distance:'50',kind:'kick',time:'',rest:':20',label:''},
        {reps:'4',distance:'50',kind:'pull',time:'',rest:':20',label:''},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'aero',  label:'Aerobic base', desc:'steady swim',
      s:{mode:'cont',intensity:'easy',unit:'yd',distance:'1500',time:''}},
    {id:'thresh',label:'Threshold 10×100', desc:'CSS pace',
      s:{mode:'struct',intensity:'threshold',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'10',distance:'100',kind:'swim',time:'',rest:':15',label:'@ threshold'},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'race',  label:'200 race-pace', desc:'speed-endurance',
      s:{mode:'struct',intensity:'vo2',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'8',distance:'50',kind:'swim',time:'',rest:':40',label:'@ 200 pace'},
        {reps:'4',distance:'25',kind:'swim',time:'',rest:':30',label:'fast'},
        {reps:'1',distance:'200',kind:'cooldown',time:'',rest:'',label:''}]}},
    {id:'sprint',label:'Sprint / speed', desc:'top-end',
      s:{mode:'struct',intensity:'sprint',unit:'yd',segments:[
        {reps:'1',distance:'300',kind:'warmup',time:'',rest:'',label:''},
        {reps:'10',distance:'25',kind:'swim',time:'',rest:':30',label:'sprint'},
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

// ---- soft weekly goals (a nudge, not a plan) ----
const GOALS = [
  {key:'lift',  emoji:'\u{1F3CB}\uFE0F', label:'Lifts', target:3},
  {key:'run',   emoji:'\u{1F3C3}',       label:'Runs',  target:2},
  {key:'swim',  emoji:'\u{1F3CA}',       label:'Swims', target:1, soft:true, aim:'1\u20132'},
  {key:'fence', emoji:'\u{1F93A}',       label:'Fence', target:2},
];
function weekCounts(isos){
  const set = new Set(isos); const c = {lift:0,run:0,swim:0,fence:0,ninja:0};
  Store.get().sessions.forEach(s => { if(set.has(s.date) && WORKOUTS.includes(s.day)) c.lift++; });
  (Store.get().activities||[]).forEach(a => { if(set.has(a.date) && c[a.type]!==undefined) c[a.type]++; });
  return c;
}
