import type { APIRoute } from 'astro';
import { clearCookies, isLocal, revoke } from '@/lib/admin';

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  await revoke(request);
  const res = new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
  for (const c of clearCookies(!isLocal(url))) res.headers.append('Set-Cookie', c);
  return res;
};
