// POST { token, game, name, country, score, daily?, log? } -> { ok, score }. Needs header x-user-token (a Supabase login).
// Verifies the login, the signed run token, replays/validates the run, rate-limits per IP, then inserts
// with the service role (the browser itself has NO insert permission on the table).
import '../_shared/sim.js';
import { corsHeaders, json, verifyToken, sha256Hex } from '../_shared/util.ts';

const SIM = (globalThis as any).SIM;
const URL_ = Deno.env.get('SUPABASE_URL')!;
const KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

  // login required: the player's Supabase access token, checked against Supabase Auth
  const ut = req.headers.get('x-user-token') || '';
  if (!ut) return json({ error: 'login required' }, 401);
  const ur = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: KEY, Authorization: `Bearer ${ut}` } });
  if (!ur.ok) return json({ error: 'login expired, please log in again' }, 401);
  const userId = (await ur.json())?.id;
  if (!userId || !/^[0-9a-f-]{36}$/.test(userId)) return json({ error: 'login required' }, 401);

  const tok = await verifyToken(body?.token);
  if (!tok) return json({ error: 'invalid run token' }, 400);

  const now = Date.now(), today = new Date(now).toISOString().slice(0, 10);
  const v = SIM.verify({ tok, body, now, today });
  if (!v.ok) return json({ error: v.reason }, 422);

  const name = String(body.name ?? '').toUpperCase();
  if (!/^[A-Z0-9 _.-]{1,12}$/.test(name)) return json({ error: 'invalid name' }, 400);
  const country = String(body.country ?? '');
  if (!/^[A-Z]{2}$/.test(country)) return json({ error: 'invalid country' }, 400);

  // rate limit: max 8 scores per minute and 150 per day from one IP (hashed, never stored raw)
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const ipHash = (await sha256Hex(ip + (Deno.env.get('RUN_SECRET') || ''))).slice(0, 24);
  const count = async (sinceMs: number) => {
    const r = await rest(`scores?select=id&ip_hash=eq.${ipHash}&created_at=gt.${new Date(now - sinceMs).toISOString()}`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
    return parseInt((r.headers.get('content-range') || '').split('/')[1] || '0', 10) || 0;
  };
  if ((await count(60e3)) >= 8 || (await count(86400e3)) >= 150) return json({ error: 'too many scores, slow down' }, 429);
  const ucount = async (sinceMs: number) => {
    const r = await rest(`scores?select=id&user_id=eq.${userId}&created_at=gt.${new Date(now - sinceMs).toISOString()}`, { headers: { Prefer: 'count=exact', Range: '0-0' } });
    return parseInt((r.headers.get('content-range') || '').split('/')[1] || '0', 10) || 0;
  };
  if ((await ucount(60e3)) >= 8 || (await ucount(86400e3)) >= 150) return json({ error: 'too many scores, slow down' }, 429);

  const ins = await rest('scores', {
    method: 'POST', headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ game: body.game, name, country, score: v.score, daily: v.daily, run_id: tok.n, ip_hash: ipHash, user_id: userId, verified: true }),
  });
  if (ins.status === 409) return json({ error: 'this run was already submitted' }, 409);
  if (!ins.ok) return json({ error: 'could not save score' }, 500);
  return json({ ok: true, score: v.score });
});
