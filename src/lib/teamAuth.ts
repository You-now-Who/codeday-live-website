import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from './prisma'

export const TEAM_SESSION_COOKIE = 'teamSession'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function createSession(accountId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await prisma.teamSession.create({ data: { token, accountId, expiresAt } })
  return token
}

export async function getAccountFromToken(token: string) {
  const session = await prisma.teamSession.findUnique({
    where: { token },
    include: { account: true },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.teamSession.delete({ where: { token } }).catch(() => {})
    return null
  }
  return session.account
}

export async function deleteSession(token: string) {
  await prisma.teamSession.deleteMany({ where: { token } })
}

export function makeSessionCookie(token: string) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000)
  return `${TEAM_SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

export function clearSessionCookie() {
  return `${TEAM_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
}

export function generatePassword(length = 10): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from(randomBytes(length))
    .map(b => chars[b % chars.length])
    .join('')
}
