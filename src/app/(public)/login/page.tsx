import { cookies } from 'next/headers'
import { getAccountFromToken, TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { redirect } from 'next/navigation'
import { TeamLoginForm } from '@/components/sections/TeamLoginForm'

export default async function LoginPage() {
  const jar = await cookies()
  const token = jar.get(TEAM_SESSION_COOKIE)?.value
  if (token) {
    const account = await getAccountFromToken(token)
    if (account) redirect('/wall')
  }
  return <TeamLoginForm />
}
