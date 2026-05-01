import { cookies } from 'next/headers'
import { getAccountFromToken } from '@/lib/teamAuth'
import { TEAM_SESSION_COOKIE } from '@/lib/teamAuth'
import { VotePage } from '@/components/music/VotePage'

export const dynamic = 'force-dynamic'

export default async function VotePageRoute() {
  const cookieStore = cookies()
  const token = cookieStore.get(TEAM_SESSION_COOKIE)?.value ?? null
  const account = token ? await getAccountFromToken(token) : null
  return <VotePage isLoggedIn={!!account} username={account?.username ?? null} />
}
