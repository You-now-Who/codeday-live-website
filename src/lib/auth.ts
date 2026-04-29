export function checkAdminKey(request: Request): boolean {
  const key = request.headers.get('x-admin-key')
  return typeof key === 'string' && key.length > 0 && key === process.env.ADMIN_SECRET
}
