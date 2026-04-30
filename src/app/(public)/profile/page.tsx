import { getSessionAccount } from '@/lib/serverAuth'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/sections/ProfileClient'

export default async function ProfilePage() {
  const account = await getSessionAccount()
  if (!account) redirect('/login')

  return (
    <ProfileClient
      account={{ id: account.id, username: account.username, displayName: account.displayName }}
    />
  )
}
