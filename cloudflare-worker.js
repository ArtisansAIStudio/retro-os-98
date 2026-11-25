// Cloudflare Worker "nostalgia-proxy": serves artisansmedia.com/nostalgia/ from the GitHub Pages site.
// Route: artisansmedia.com/nostalgia*   (Workers Routes on the artisansmedia.com zone)
// The zone's redirect rule excludes /nostalgia so everything else still redirects to artisansaistudio.com.
export default {
  async fetch(request) {
    const u = new URL(request.url);
    const p = u.pathname;
    if (p === '/nostalgia') return Response.redirect(u.origin + '/nostalgia/' + u.search, 301);
    if (!p.startsWith('/nostalgia/')) return new Response('Not found', { status: 404 });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const r = await fetch('https://artisansaistudio.github.io/retro-os-98/' + p.slice(11) + u.search, { cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 300, '404': 0, '500-599': 0 } } });
    return new Response(r.body, r);
  }
};
