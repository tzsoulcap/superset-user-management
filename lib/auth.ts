export const PROXY_BASE = '/api/superset'

/**
 * Login to Superset and retrieve a JWT token.
 * @param supersetUrl  Base URL of the target Superset server (forwarded via X-Superset-URL header)
 */
export async function loginToSuperset(
  username: string,
  password: string,
  supersetUrl: string
): Promise<string> {
  const res = await fetch(`${PROXY_BASE}/security/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Superset-URL': supersetUrl,
    },
    body: JSON.stringify({
      username,
      password,
      provider: 'db',
      refresh: true,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.message || `Login failed: ${res.status}`)
  }

  const data = await res.json()
  if (!data.access_token) {
    throw new Error('No access token returned from server')
  }
  return data.access_token
}

/**
 * Fetch a fresh CSRF token from Superset.
 * @param supersetUrl  Base URL of the target Superset server
 */
export async function fetchCsrfToken(jwtToken: string, supersetUrl: string): Promise<string> {
  const res = await fetch(`${PROXY_BASE}/security/csrf_token/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
      'X-Superset-URL': supersetUrl,
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch CSRF token: ${res.status}`)
  }

  const data = await res.json()
  if (!data.result) {
    throw new Error('No CSRF token returned from server')
  }
  return data.result
}
