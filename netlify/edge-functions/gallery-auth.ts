// Password lock for the gallery, run by Netlify in front of the static files.
//
// The site is a plain static build, so there is no server to check a password
// — this Edge Function is that check. It guards the gallery page, its Nuxt
// payload, the original photos and every resized copy under /_ipx/ (only the
// gallery uses Nuxt Image), so nothing can be opened by guessing its address.
//
// The password is the GALLERY_PASSWORD environment variable in the Netlify
// dashboard. Signing in stores a cookie holding an HMAC derived from the
// password, so it can't be forged, and changing the password signs everyone
// out. Without the variable set the gallery stays locked.
//
// Edge Functions only run on Netlify (or `netlify dev`); `nuxt dev` serves
// the gallery unlocked.

declare const Netlify: { env: { get(name: string): string | undefined } }

const COOKIE = 'gallery_auth'
const MAX_AGE = 60 * 60 * 24 * 90 // 90 days

const token = async (password: string) => {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('gallery-auth-v1'))
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]!)
}

// Compares in constant time, so response timing doesn't leak how much matched.
const same = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const readCookie = (req: Request, name: string) =>
  req.headers
    .get('cookie')
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1)

export default async (req: Request, context: { next: () => Promise<Response> }) => {
  const password = Netlify.env.get('GALLERY_PASSWORD')
  if (!password) return new Response('The gallery is not set up yet.', { status: 503 })

  const expected = await token(password)
  const cookie = readCookie(req, COOKIE)
  if (cookie && same(cookie, expected)) return context.next()

  const url = new URL(req.url)
  const isPage = url.pathname === '/gallery' || url.pathname === '/gallery/' || url.pathname === '/gallery/index.html'

  // Photos and payloads just refuse; only the page itself offers a sign-in.
  if (!isPage) return new Response('Unauthorized', { status: 401 })

  if (req.method === 'POST') {
    const form = await req.formData().catch(() => null)
    const attempt = String(form?.get('password') ?? '')
    if (attempt && same(await token(attempt), expected)) {
      return new Response(null, {
        status: 303,
        headers: {
          location: '/gallery',
          'set-cookie': `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      })
    }
    // Slows down anyone trying passwords in a loop.
    await new Promise((r) => setTimeout(r, 1000))
    return signIn(true)
  }

  return signIn(false)
}

const signIn = (wrong: boolean) =>
  new Response(
    `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Memories under the stars</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 24px;
    background: radial-gradient(ellipse at bottom, #06356B 0%, #090a0f 100%);
    color: #fff; font-family: Lato, ui-sans-serif, system-ui, sans-serif; font-weight: 300;
  }
  form { width: 100%; max-width: 320px; text-align: center; }
  h1 { margin: 0 0 40px; font-size: 14px; font-weight: 300; letter-spacing: .3em; line-height: 1.8; }
  label { display: block; font-size: 11px; letter-spacing: .25em; color: rgb(255 255 255 / .7); }
  input {
    width: 100%; margin-top: 12px; padding: 10px 0; background: transparent; color: #fff;
    border: 0; border-bottom: 1px solid rgb(255 255 255 / .3); font: inherit; font-size: 16px;
    text-align: center; letter-spacing: .15em; outline: none;
  }
  input:focus { border-color: gold; }
  .error { margin: 16px 0 0; font-size: 11px; letter-spacing: .2em; color: #ff8a8a; }
  button {
    margin-top: 32px; padding: 12px 32px; background: transparent; color: gold; cursor: pointer;
    border: 1px solid gold; border-radius: 999px; font: inherit; font-size: 11px; letter-spacing: .3em;
  }
  button:hover { background: rgb(255 215 0 / .1); }
</style>
</head>
<body>
<form method="post" action="/gallery">
  <h1>MEMORIES UNDER THE STARS</h1>
  <label for="password">PASSWORD</label>
  <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
  ${wrong ? '<p class="error">THAT PASSWORD ISN’T RIGHT</p>' : ''}
  <button type="submit">VIEW PHOTOS</button>
</form>
</body>
</html>`,
    {
      status: wrong ? 401 : 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    },
  )

export const config = {
  path: ['/gallery', '/gallery/*', '/_ipx/*'],
}
