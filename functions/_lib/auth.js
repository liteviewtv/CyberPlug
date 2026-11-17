const COOKIE = 'cp_admin_session'
const encoder = new TextEncoder()
const keyFor = (secret) => crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
const encode = (value) => btoa(String.fromCharCode(...new Uint8Array(value))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
export async function signSession(secret) {
  const payload = encode(encoder.encode(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })))
  const key = await keyFor(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return payload + '.' + encode(signature)
}
export async function validSession(request, secret) {
  const token = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1)
  if (!token || !secret) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  try {
    const key = await keyFor(secret)
    const raw = Uint8Array.from(atob(signature.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0))
    if (!await crypto.subtle.verify('HMAC', key, raw, encoder.encode(payload))) return false
    const decoded = atob(payload.replace(/-/g,'+').replace(/_/g,'/'))
    return JSON.parse(decoded).exp > Date.now()
  } catch { return false }
}
export const sessionCookie = (value, maxAge = 28800) => `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
export async function requireAdmin(request, env) {
  return env.SESSION_SECRET && await validSession(request, env.SESSION_SECRET)
}
