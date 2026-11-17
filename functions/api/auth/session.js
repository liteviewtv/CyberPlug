import { requireAdmin } from '../../_lib/auth'
export async function onRequestGet({ request, env }) {
  return Response.json({ authenticated: await requireAdmin(request, env) }, { headers: { 'Cache-Control': 'no-store' } })
}
