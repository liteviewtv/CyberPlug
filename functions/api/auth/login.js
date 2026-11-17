import { signSession, sessionCookie } from '../../_lib/auth'
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return Response.json({ error: 'Admin authentication is not configured.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  if (typeof body.password !== 'string' || body.password !== env.ADMIN_PASSWORD) return Response.json({ error: 'Incorrect password.' }, { status: 401 })
  const token = await signSession(env.SESSION_SECRET)
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie(token), 'Cache-Control': 'no-store' } })
}
