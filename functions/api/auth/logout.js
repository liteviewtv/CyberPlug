import { sessionCookie } from '../../_lib/auth'
export async function onRequestPost() {
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie('', 0), 'Cache-Control': 'no-store' } })
}
