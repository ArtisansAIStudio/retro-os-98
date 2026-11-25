// POST { game } -> { token, seed }. Called when a game starts. The token is signed by the server
// and later required to submit a score, so a score can only exist if a run really started.
import '../_shared/sim.js';
import { corsHeaders, json, sign } from '../_shared/util.ts';

const SIM = (globalThis as any).SIM;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  if (!SIM.GAMES.includes(body?.game)) return json({ error: 'unknown game' }, 400);
  const seed = crypto.getRandomValues(new Uint32Array(1))[0];
  const token = await sign({ g: body.game, s: seed, t: Date.now(), n: crypto.randomUUID() });
  return json({ token, seed });
});
