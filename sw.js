// Evrak Defterim - çevrimdışı önbellek
const SURUM = "evrak-v19";
const DOSYALAR = ["./", "index.html", "manifest.webmanifest", "icon-192.png?v=2", "icon-512.png?v=2"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
// Yalnızca uygulamanın kendi dosyaları: önce internetten güncelini dener, yoksa önbellekten açar.
// Tarayıcının HTTP önbelleği atlanır (no-cache), böylece güncelleme hemen gelir.
// Eşitleme (Google) istekleri önbelleğe alınmaz.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(r => {
      const kopya = r.clone();
      caches.open(SURUM).then(c => c.put(e.request, kopya));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
