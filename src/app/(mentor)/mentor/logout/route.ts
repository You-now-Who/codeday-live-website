export function GET() {
  return new Response('Logged out', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="CodeDay Mentors", charset="UTF-8"',
    },
  })
}
