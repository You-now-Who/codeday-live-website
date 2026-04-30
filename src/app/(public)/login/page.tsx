import { getSessionAccount } from '@/lib/serverAuth'
import { redirect } from 'next/navigation'
import { TeamLoginForm } from '@/components/sections/TeamLoginForm'

export default async function LoginPage() {
  const account = await getSessionAccount()
  if (account) redirect('/profile')
  return <TeamLoginForm />
}
