import { cookies } from 'next/headers'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from './teamAuth'

export async function getSessionAccount() {
  const jar = await cookies()
  const token = jar.get(TEAM_SESSION_COOKIE)?.value
  if (!token) return null
  return getAccountFromToken(token)
}
