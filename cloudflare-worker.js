// Cloudflare Worker "nostalgia-proxy": serves artisansmedia.com/nostalgia/ from the GitHub Pages site.
// Routes: artisansmedia.com/nostalgia*  and  artisansmedia.com/ads.txt   (Workers Routes on the artisansmedia.com zone)
// The zone's redirect rule excludes /nostalgia and /ads.txt so everything else still redirects to artisansaistudio.com.
export default {
  async fetch(request) {
    const u = new URL(request.url);
    const p = u.pathname;
    // ads.txt must live at the domain root (AdSense). Served from the repo's ads.txt.
    if (p === '/ads.txt') {
      const a = await fetch('https://artisansaistudio.github.io/retro-os-98/ads.txt', { cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 300, '404': 0, '500-599': 0 } } });
      return new Response(a.body, { status: a.status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': a.ok ? 'public, max-age=300' : 'no-store' } });
    }
    if (p === '/nostalgia') return Response.redirect(u.origin + '/nostalgia/' + u.search, 301);
    if (!p.startsWith('/nostalgia/')) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const r = await fetch('https://artisansaistudio.github.io/retro-os-98/' + p.slice(11) + u.search, { cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 120, '404': 0, '500-599': 0 } } });
    // short browser cache so site updates appear within minutes, and never cache errors
    const h = new Headers(r.headers);
    h.set('Cache-Control', r.ok ? 'public, max-age=120' : 'no-store');
    return new Response(r.body, { status: r.status, headers: h });
  }
};
