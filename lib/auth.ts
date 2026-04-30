const SESSION_COOKIE_NAME = 'session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 dias

type SessionPayload = {
  sub: 'admin'
  exp: number
}

function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} environment variable is not set`)
  }
  return value
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  if (typeof btoa === 'function') {
    return btoa(binary)
  }
  return Buffer.from(bytes).toString('base64')
}

function base64ToBytes(value: string): Uint8Array {
  let binary: string
  if (typeof atob === 'function') {
    binary = atob(value)
  } else {
    binary = Buffer.from(value, 'base64').toString('binary')
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const base64 = bytesToBase64(bytes)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  return base64ToBytes(padded)
}

async function signHmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64UrlEncode(signature)
}

export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: 'admin',
    exp: now + SESSION_TTL_SECONDS,
  }

  const encoder = new TextEncoder()
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const secret = getRequiredEnv('SESSION_SECRET')
  const signature = await signHmacSha256(body, secret)
  return `${body}.${signature}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const [body, signature] = token.split('.')
  if (!body || !signature) {
    return false
  }

  const secret = process.env.SESSION_SECRET
  if (!secret) {
    return false
  }

  const expectedSignature = await signHmacSha256(body, secret)
  if (signature !== expectedSignature) {
    return false
  }

  let payload: SessionPayload
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload
  } catch {
    return false
  }

  if (payload.sub !== 'admin') {
    return false
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp > now
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME
}

export function getSessionMaxAge(): number {
  return SESSION_TTL_SECONDS
}
