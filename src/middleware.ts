import { NextRequest, NextResponse } from 'next/server'

function isAuthenticated(
  request: NextRequest,
  expectedUser: string,
  expectedPass: string,
  realm: string
): NextResponse | null {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  const base64Credentials = authHeader.slice('Basic '.length)
  let credentials: string
  try {
    credentials = atob(base64Credentials)
  } catch {
    return NextResponse.json(
      { error: 'Invalid authorization header' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  const colonIndex = credentials.indexOf(':')
  if (colonIndex === -1) {
    return NextResponse.json(
      { error: 'Invalid credentials format' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  const user = credentials.slice(0, colonIndex)
  const pass = credentials.slice(colonIndex + 1)

  if (user !== expectedUser || pass !== expectedPass) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      {
        status: 401,
        headers: { 'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"` },
      }
    )
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const adminUser = process.env.ADMIN_USER
    const adminPass = process.env.ADMIN_PASS

    if (!adminUser || !adminPass) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 503 })
    }

    const response = isAuthenticated(request, adminUser, adminPass, 'CodeDay Admin')
    if (response) return response
  }

  if (pathname.startsWith('/mentor')) {
    const mentorUser = process.env.MENTOR_USER
    const mentorPass = process.env.MENTOR_PASS

    if (!mentorUser || !mentorPass) {
      return NextResponse.json({ error: 'Mentor credentials not configured' }, { status: 503 })
    }

    const response = isAuthenticated(request, mentorUser, mentorPass, 'CodeDay Mentors')
    if (response) return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/mentor/:path*'],
}
