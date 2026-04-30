import { NextRequest } from 'next/server'
import { deleteSession, clearSessionCookie, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(TEAM_SESSION_COOKIE)?.value
  if (token) await deleteSession(token)
  const res = Response.json({ ok: true })
  res.headers.set('Set-Cookie', clearSessionCookie())
  return res
}
