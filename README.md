# Pentathlon

A personal training tracker for modern pentathlon: strength lifting + the five-sport
side (fencing, swimming, running, ninja/OCR). Built as a static, dependency-free web
app that runs on GitHub Pages and syncs across devices through Supabase.

- **Live:** https://jacob-monzel.github.io/pentathlon/
- **Repo:** https://github.com/Jacob-Monzel/pentathlon
- **Backend:** Supabase project `gxkocnfynpcjnvwkpfma`

---

## 1. What this is (and isn't)

It's a purpose-built logbook + light autoregulation engine for one athlete (Jacob),
tuned around a real PT rehab program (knee/groin) and a 2031 Pan Am Games horizon.
The lifting side prescribes and progresses; the sport side logs and nudges. It is
deliberately **not** a rigid prescriptive coach for endurance yet — that waits until
there's a fitness baseline and clearance (see Roadmap).

No framework, no build step, no bundler. Vanilla JS + one CDN script (Supabase).
Everything is plain files you can open and read.

---

## 2. Architecture in one breath

**Local-first, cloud-synced.** Every page reads/writes an in-browser cache
(`localStorage`) **synchronously**, so the whole app and all its logic stay simple and
instant. A thin sync layer pulls from Supabase on load and pushes on change. Supabase
is the source of truth across devices; localStorage is the fast local mirror + offline
cache.

```
page loads → boot() → Supabase session check → Store.pull() (reconcile) → render()
user acts  → Store.update() → writes localStorage instantly → debounced push to Supabase
```

The single seam is the `Store` object in `app.js`. Nothing else knows about the backend.

---

## 3. Files

All files live at the **repo root** (GitHub Pages serves from there).

| File | Role |
|------|------|
| `index.html` | **Home.** Week calendar (Mon–Sun, ‹ › nav), per-day activity chips, the "This week" goals nudge, **Resume banner** when a workout is in progress. Entry point. |
| `login.html` | Email/password auth (Supabase). Shown when no session. |
| `day.html` | **Day detail** (`?date=YYYY-MM-DD`). Lists logged items; "add activity" chooser (lift 1/2/3 + sports); **Preview 1/2/3** row; **Resume banner** when a workout is in progress. |
| `workout.html` | **Lift logging** (`?day=w1|w2|w3&date=...`). Sets grid, top-set/backoff, swaps, rest timer, post-workout feedback (knee/flare). Add `&preview=1` for a **read-only preview** (exercises, targets, last numbers, suggestions, cues, swaps) that touches no data. |
| `activity.html` | **Sport logging** (`?type=run|swim|fence|ninja&date=...` or `?id=...` to edit). Run/swim get intensity + unit + Continuous/Intervals + segment builder + templates. |
| `progress.html` | Bodyweight trend, est-1RM sparklines for major lifts, weekly effective-set volume bars. |
| `episodes.html` | Groin/rotation flare log with days-since-last. |
| `data.html` | **Backup:** export/import JSON, erase. |
| `app.js` | **Everything shared:** data model, Store/Cloud/Auth/boot, PROGRAM, all helpers, sport config, templates, goals, cues. |
| `styles.css` | Light "FitNotes-style" blue/white theme. All components. |
| `config.js` | Supabase URL + publishable key. **Safe to commit** (RLS protects data). |
| `manifest.json` | PWA manifest (installable, icon, standalone). |
| `.nojekyll` | Tells GitHub Pages to serve files as-is (hidden file; leading dot). |
| `icon-180/192/512.png` | App icons (pentagon = five events). |
| `schema.sql` | One-time Supabase table + RLS setup (reference; not served). |

---

## 4. Data model

One JSON object per user, cached in `localStorage` under key `pentathlon_v2`
(timestamp under `pentathlon_v2_ts`), mirrored to Supabase table `app_state.data`.

```js
{
  sessions:   [ /* lift workouts */ ],
  activities: [ /* run / swim / fence / ninja */ ],
  episodes:   [ /* groin/rotation flares */ ],
  draft:      null | { /* in-progress workout */ }
}
```

**Session** (a lift workout):
```js
{ id, day: 'w1'|'w2'|'w3', date: 'YYYY-MM-DD', bodyweight: number|null,
  exercises: { <exKey>: { sets: [ { w, r, rpe, done, added? } ] } },
  feedback: { knee: 0-10, flare: string, note } }
```

**Activity** (a sport session):
```js
{ id, type: 'run'|'swim'|'fence'|'ninja', date,
  // run/swim:
  mode: 'cont'|'struct', intensity: 'easy'|'tempo'|'threshold'|'vo2'|'sprint'|'race',
  unit, distance, time,                    // continuous
  segments: [ { reps, distance, time, rest, kind, label } ],  // intervals
  // fence: weapon, duration, bouts
  // ninja: duration
  note }
```

**Episode:** `{ id, date, what, ctx }`

IDs: sessions/episodes use `Date.now()`; activities use `'a'+Date.now()+rand`.

---

## 5. Core systems (all in `app.js`)

### Store / Cloud / Auth / boot — the sync layer
- `Cloud` — wraps the Supabase client (created from `window.SUPA_URL/SUPA_KEY`).
  `init()`, `ready()`, `session()`, `signIn/signUp/signOut()`, `uid()`.
  If `config.js` still has placeholders, `Cloud.ready()` is false and the app runs
  **local-only** (ungated) — graceful degradation during setup.
- `Store` — synchronous over localStorage: `get()`, `set(s)`, `update(fn)`, `def()`.
  Plus sync: `pull()` (reconcile cloud↔local, last-write-wins by `updated_at`),
  `flush()` (force push), `clearLocal()`. Writes debounce a push (600 ms) and also
  push on tab-hide (`visibilitychange`).
- `Auth.logout()` — signs out of Supabase, clears local cache, → login.
- `boot(render)` — the per-page entry: init cloud → if configured, require a session
  (else redirect to login) → `pull()` → `render()`. Every page's inline script is
  wrapped in `boot(async () => { ... })`.

### PROGRAM — the lifting plan
`PROGRAM = { w1, w2, w3 }` (labels "Workout 1/2/3"). Each has `ex: [...]`.
Exercise: `{ k, n, t, sets, reps, rpe?, inc?, tempo?, cue?, added?, alts:[{k,n}] }`.
- `t: 'top'` — press top-set + auto −10% backoffs, RPE-tracked (bench, incline, ohp).
- `t: 'pullup'` — weighted pull-up, double progression 4–6, bodyweight-aware e1RM.
- `t: 'work'` — everything else (knee rehab, hinges, accessories, ROM/rotation).
Bench + incline mains are **Smith machine** (solo safety); barbell versions are alts.
Every exercise has ≥1 alt and an apartment-doable option.

### Progression — `suggest(k, ex)`
Reads `topHistory(k)` (last set 1 of each session).
- Top/pullup lifts: if `isStalled` (last ≤ 3-sessions-ago weight) → **deload** (−10%).
  Else if hit target reps AND RPE ≤ target → **+inc** (usually +5). Else **hold**.
- Work lifts: hit top of rep range → **+5**, else **same**.
- `e1rm(w,r)` = Epley; pull-ups use bodyweight+added when bodyweight present.
- `PROGRESS_LIFTS` = boxsq, bench, ohp, rdl, pullup (shown on Progress page).

### Sport layer
- `ACT` — field schemas for fence/ninja (generic form); run/swim use a custom form.
- `INTENSITIES`, `SEG_KINDS` (run vs swim), `TEMPLATES` (one-tap suggested sessions:
  easy/tempo/threshold/VO2/400s/laser-run for run; technique/threshold/race/etc for swim).
- `activitySummary(a)`, `actTotals(a)`, `parseTime/fmtDur` (pace math).
- `nextWorkout()` — rotation suggestion (w1→w2→w3) based on last lift, overridable.

### Athletic workouts (⚡ a1/a2)
- Two structured sessions in PROGRAM alongside w1–w3: **a1 Sprint** and **a2 Jump**,
  started from the day page like lifts, with their own rotation (`nextAthletic()` —
  suggests the opposite of the last athletic session), preview, sticky swaps, ★s,
  draft/resume, and the knee/flare feedback sheet (groin monitoring on jump days).
- Each session is ordered **warm-up → build → MAX**; the athlete does what they're
  ready for — untouched exercises simply don't log — so progression = working further
  down the list. MAX-tier items (max sprints, stage-3 jumps) are cue-marked as gated
  on PT clearance. a2 embeds the plyo arc (rhythm → fast-ground → stage-3 max intent,
  ≤ 2 wks/stage) directly in its exercise order and cues.
- Exercise type `t:'ath'`: no weight-progression suggestions (`suggest()` returns null),
  reps field = meters/seconds/reps as labeled. `ATHLETIC_DAYS` guards: lift rotation
  ignores athletic sessions, `weeklyVolume()` counts lifting days only, weekCounts
  buckets a-day sessions under `athletic`. The old ⚡ activity type is out of the
  chooser (`ACT_ORDER`) but its definition remains so legacy entries still render.

### Volume, cues, goals
- `EX_MUSCLES` + `weeklyVolume()` — effective sets per muscle (secondary at ½). Progress page.
- `CUES` — 2–3 execution cues for all 75 exercises (mains + alts). "how" button in workout.
- `GOALS` + `weekCounts()` — soft weekly targets (lift 3, run 2, swim 1 "aim 1–2",
  fence 2) → the "This week" nudge on home. Positive framing only.

### Sticky swaps + prescribed stars (workout.html)
- Each slot defaults to the exercise **actually done last time** for that slot
  (`lastSlotChoice(day, baseK, alts)` in app.js scans this day's sessions newest-first
  across the slot's candidate keys; an in-progress draft takes precedence on resume).
- The PROGRAM main is the **prescribed** exercise (★): starred on the card and in the
  swap menu; when the current pick deviates, an amber "★ plan: … — swap back when
  possible" note shows. Preview mode reflects both.

### Draft / resume / timers (workout.html)
- Every input in a workout **autosaves** into `draft` (localStorage instantly + synced to
  Supabase like everything else), so closing the app mid-workout loses nothing.
- `draftHasContent(d)` / `draftInfo()` (app.js) — a draft "counts" once any set has real
  numbers. Home and Day pages show a **Resume banner** linking back to it.
- **Clobber guard:** opening a *different* workout while one is in progress asks
  resume-or-discard instead of silently wiping the draft.
- **Timers are timestamp-based.** `draft.startedAt` anchors the workout clock;
  `draft.restEnd` anchors the rest countdown. Both are computed from `Date.now()` on
  every tick and re-checked on `visibilitychange`, so backgrounding the PWA or even a
  full reload can't desync them. Finishing a workout clears the draft.

### Calendar
`weekDays(offset)` (Mon-first), `todayISO()`/`isoOf()` (local time, not UTC),
`prettyDate(iso)`.

---

## 6. Backend (Supabase)

**Table** `public.app_state`: `user_id uuid PK → auth.users`, `data jsonb`,
`updated_at timestamptz`. RLS on, 3 policies (select/insert/update) all
`auth.uid() = user_id`. Setup lives in `schema.sql` (run once in SQL Editor).

**Auth:** email/password. Publishable (anon) key in `config.js` is public-safe; the
`service_role`/secret key must **never** ship. New-user signups should be **disabled**
in Authentication → Sign In / Providers → Email once your account exists.

**Sync semantics:** last-write-wins by `updated_at`. On load, newer side wins; on
change, debounced upsert. First login on a device with local data seeds the cloud row.

---

## 7. Deploy / update workflow

1. Edit files locally.
2. Sanity check JS: `node --check app.js` (and extract each page's inline script if changed).
3. Upload changed files to the repo root (GitHub web: Add file → Upload files → drag
   the **files**, not a folder) → commit.
4. Wait ~1 min for Pages; **hard-refresh** (or private window) to beat the cache.

Run locally: from the folder, `python3 -m http.server 8000` →
`http://localhost:8000/login.html`. (Opening via `file://` breaks Supabase auth's
secure-context needs; use the server or the live site.)

---

## 8. Current state — DONE

- Lifting: full program, autoregulated suggestions, auto-deload, swaps with independent
  history, per-exercise cues, knee/flare feedback, episode log.
- Sport: week calendar, run/swim/fence/ninja logging, Continuous + Intervals + segment
  builder (incl. swim drills/kick/pull), templates, intensity tags, soft weekly goals.
- Progress: bodyweight, est-1RM sparklines, effective-set volume.
- Backend: Supabase auth + cross-device sync, RLS, PWA install, icons.
- Verified: 40/40 logic stress tests pass; all pages compile; live round-trip confirmed
  (row in `app_state`, phone sync working).

---

## 9. Where to pick up — ROADMAP

Ordered by value:

1. **Combined training-load view** (the marquee feature). One weekly picture merging
   lifting tonnage + running miles + pool yards + fencing hours + intensity distribution.
   No other app does this. Data + `weeklyVolume`/`weekCounts`/`activitySummary` already
   exist to build on. This is the natural next build.
2. **"Forgot password?"** link on login (Supabase `resetPasswordForEmail`). Small; makes
   lockouts self-serve. Needs email confirmation/redirect URL configured.
3. **Adaptive endurance scheduler** (parked intentionally). Prescribe run/swim per day
   with progression + **knee-aware backoff** (pull running when logged knee symptoms rise).
   *Prerequisites:* knee/groin cleared, a benchmark 5K + swim threshold, a few weeks of
   real data. Do NOT build before then — it would decorate a guess.
4. Per-exercise rest-timer customization; PR detection + celebration; a history/calendar
   view of past sessions. All nice-to-haves the big apps have.

---

## 10. Gotchas / notes

- **pwHash / user** may linger in older `data` blobs (cruft from the pre-backend
  localStorage version). Harmless — new code ignores them. Export→Erase→Import via the
  Backup page rewrites the blob clean if desired.
- **No forgot-password flow yet** — save the login in a password manager / iCloud
  Keychain as the recovery path. Worst case, reset from the Supabase dashboard.
- **Free-tier pause:** Supabase pauses a project after ~1 week of zero activity; normal
  use prevents it, and un-pausing is one click, data intact.
- **Sync is last-write-wins**, per single user. Only way to lose an edit is editing the
  same thing on two devices while both offline — practically never.
- Data lives in **two places** (cloud + each device's cache); a single failure never
  loses everything. Still: periodic Backup export = belt and suspenders.
- **Fencing defaults to épée** (the pentathlon weapon); sabre/foil selectable.
- **iOS backgrounds JS**, so the rest timer can't beep while the app is closed — but it's
  timestamp-anchored, so the moment you return it shows the true remaining time (or has
  correctly finished, with a vibration where supported). A real background alert would
  need push notifications; deliberately out of scope.
- No framework on purpose. Keep it that way unless there's a strong reason — the
  simplicity is the feature.
