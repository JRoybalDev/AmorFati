const FILE_API_URL = process.env.FILE_API_URL || ''
const ARCON_API_KEY = process.env.ARCON_API_KEY || ''
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

let cachedToken: string | null = null
let tokenExpiresAt: number = 0

export function invalidateToken() {
  cachedToken = null
  tokenExpiresAt = 0
}

export async function getFileApiToken(): Promise<string> {
  const now = Date.now()

  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const res = await fetch(`${FILE_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ARCON_API_KEY,
    },
    body: JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`File API login failed: ${res.status} ${text}`)
  }

  const data = await res.json()

  if (!data.token) {
    throw new Error('File API login response missing token')
  }

  cachedToken = data.token as string  // ← fixes "string | null not assignable to string"
  tokenExpiresAt = now + 24 * 60 * 60 * 1000

  return cachedToken
}

export async function fileApiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getFileApiToken()

  const res = await fetch(`${FILE_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ARCON_API_KEY,
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (res.status === 403) {
    invalidateToken()  // ← reuse the exported function instead of duplicating logic
    const freshToken = await getFileApiToken()
    return fetch(`${FILE_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ARCON_API_KEY,
        Authorization: `Bearer ${freshToken}`,
        ...options.headers,
      },
    })
  }

  return res
}
