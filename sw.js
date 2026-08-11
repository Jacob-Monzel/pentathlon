// ============================================================
//  Pentathlon service worker
//  Two jobs: (1) work offline in a gym with no signal,
//            (2) make cache updates deterministic instead of iOS's guess.
//  Bump CACHE_VERSION on every deploy — it wipes old caches on activate.
// ============================================================
const CACHE_VERSION = '2026.08.10-1';
const CACHE = 'pentathlon-' + CACHE_VERSION;

// The app shell. Everything needed to open and log a workout with zero network.
const SHELL = [
  './', 'index.html', 'login.html', 'day.html', 'workout.html', 'activity.html',
  'progress.html', 'episodes.html', 'data.html',
  'app.js', 'config.js', 'styles.css', 'manifest.json',
  'icon-180.png', 'icon-192.png', 'icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

self.addEventListener('install', e => {
  // cache what we can; one failed cross-origin fetch shouldn't fail the install
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(u => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Supabase auth/REST must always hit the network — never serve stale user data.
const isApi = url => /supabase\.co|supabase\.in/.test(url.hostname);

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // writes always go to network
  const url = new URL(req.url);
  if (isApi(url)) return;                           // let the app's own error handling deal with it

  // Navigations: network-first so a deploy shows up immediately when online,
  // cache fallback so the app still opens with no signal.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(req, { ignoreSearch: true });
        return cached || caches.match('index.html') || Response.error();
      }
    })());
    return;
  }

  // Assets: serve from cache instantly, refresh in the background.
  // ignoreSearch so app.js and app.js?v=123 are the same entry.
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.status === 200) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }).catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
