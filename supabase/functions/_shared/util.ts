// Shared helpers for the Edge Functions: CORS + signed run tokens (HMAC-SHA256).
const enc = new TextEncoder();
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const b64 = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));

async function hmac(data: string): Promise<string> {
  const secret = Deno.env.get('RUN_SECRET');
  if (!secret) throw new Error('RUN_SECRET is not set');
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}
export async function sign(payload: Record<string, unknown>): Promise<string> {
  const body = b64(enc.encode(JSON.stringify(payload)));
  return body + '.' + (await hmac(body));
}
export async function verifyToken(token: unknown): Promise<any | null> {
  const [body, sig] = String(token ?? '').split('.');
  if (!body || !sig) return null;
  const good = await hmac(body);
  if (good.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < good.length; i++) diff |= good.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff) return null;
  try { return JSON.parse(unb64(body)); } catch { return null; }
}
export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
