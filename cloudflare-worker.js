// Cloudflare Worker "nostalgia-proxy": serves artisansmedia.com/nostalgia/ from the GitHub Pages site.
// Route: artisansmedia.com/*   (Workers Routes on the artisansmedia.com zone)
// The zone's redirect rule excludes /, /ads.txt, /robots.txt and /nostalgia so everything else still redirects to artisansaistudio.com.
export default {
  async fetch(request) {
    const u = new URL(request.url);
    const p = u.pathname;
    const O = 'https://artisansaistudio.github.io/retro-os-98/';
    const C = { cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 120, '404': 0, '500-599': 0 } } };
    // Files that must live at the domain root (landing page, AdSense ads.txt, robots.txt). Served from the repo.
    const T = { '/': ['home.html', 'text/html; charset=utf-8'], '/ads.txt': ['ads.txt', 'text/plain; charset=utf-8'], '/robots.txt': ['robots.txt', 'text/plain; charset=utf-8'] };
    if (T[p]) {
      const [f, ct] = T[p];
      const a = await fetch(O + f, C);
      return new Response(a.body, { status: a.status, headers: { 'Content-Type': ct, 'Cache-Control': a.ok ? 'public, max-age=300' : 'no-store' } });
    }
    if (p === '/nostalgia') return Response.redirect(u.origin + '/nostalgia/' + u.search, 301);
    if (!p.startsWith('/nostalgia/')) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const r = await fetch(O + p.slice(11) + u.search, C);
    // short browser cache so site updates appear within minutes, and never cache errors
    const h = new Headers(r.headers);
    h.set('Cache-Control', r.ok ? 'public, max-age=120' : 'no-store');
    return new Response(r.body, { status: r.status, headers: h });
  }
};
