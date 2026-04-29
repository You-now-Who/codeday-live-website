export const adminFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '',
      ...(options.headers ?? {}),
    },
  })
