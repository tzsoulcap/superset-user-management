import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_SUPERSET_URL_CONST = process.env.NEXT_PUBLIC_SUPERSET_URL || 'http://localhost:8088'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'POST')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, await params, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
): Promise<NextResponse> {
  const pathSegments = params.path || []
  const targetPath = pathSegments.join('/')

  // Resolve which Superset server to forward to.
  // The client sends X-Superset-URL on every request so multi-server
  // switching works without restarting the Next.js process.
  const supersetBase = request.headers.get('x-superset-url') || DEFAULT_SUPERSET_URL_CONST

  // Paths starting with "custom/" forward to /api/custom/ on Superset.
  // All other paths use the standard /api/v1/ prefix.
  const isCustom = pathSegments[0] === 'custom'
  const targetUrl = isCustom
    ? `${supersetBase}/api/${targetPath}`
    : `${supersetBase}/api/v1/${targetPath}`

  // Forward relevant headers to Superset
  const forwardHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    // Referer is required by Superset's CSRF validation
    Referer: supersetBase,
    // Must also match Origin for stricter CSRF checks
    Origin: supersetBase,
  }

  const authorization = request.headers.get('authorization')
  if (authorization) {
    forwardHeaders['Authorization'] = authorization
  }

  const csrfToken = request.headers.get('x-csrftoken')
  if (csrfToken) {
    forwardHeaders['X-CSRFToken'] = csrfToken
  }

  // Forward browser cookies to Superset so the session that issued
  // the CSRF token is the same session used in subsequent requests.
  const cookies = request.headers.get('cookie')
  if (cookies) {
    forwardHeaders['Cookie'] = cookies
  }

  let body: BodyInit | null = null
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const text = await request.text()
      if (text) body = text
    } catch {
      // No body
    }
  }

  try {
    const supersetResponse = await fetch(targetUrl, {
      method,
      headers: forwardHeaders,
      body,
    })

    const responseText = await supersetResponse.text()

    const responseHeaders = new Headers({
      'Content-Type': supersetResponse.headers.get('content-type') || 'application/json',
    })

    // Forward any Set-Cookie headers from Superset back to the browser
    // so the session cookie (tied to the CSRF token) is persisted.
    supersetResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append('Set-Cookie', value)
      }
    })

    return new NextResponse(responseText, {
      status: supersetResponse.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error(`Proxy error for ${method} ${targetUrl}:`, error)
    return NextResponse.json(
      { message: 'Proxy request failed', error: String(error) },
      { status: 502 }
    )
  }
}
