import tailwindcss from '@tailwindcss/vite'

// Link previews need an *absolute* og:image — a relative path is ignored by
// several scrapers, and pasting the link into WhatsApp or iMessage then shows
// no image at all. Netlify exports the deploy's own address at build time
// (DEPLOY_PRIME_URL covers branch/preview deploys, URL is the production
// domain), so nothing has to be hardcoded. NUXT_PUBLIC_SITE_URL is the manual
// override, and is also what makes `npm run build` locally produce real URLs.
const siteUrl = (
  process.env.NUXT_PUBLIC_SITE_URL ||
  process.env.DEPLOY_PRIME_URL ||
  process.env.URL ||
  ''
).replace(/\/$/, '')

const title = 'You are invited to a party under the stars'
const description = 'A shared birthday celebration of Lieke & Joshua — 18th October 2026.'
const ogImage = `${siteUrl}/og-image.png`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-17',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'motion-v/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  // The invite has no server-side work, so build straight to static files.
  // Without this, `nuxt build` emits a Nitro server and `.output/public` holds
  // only `_nuxt/` assets — no index.html — which leaves the `dist` symlink
  // pointing at an unservable directory.
  //
  // `crawlLinks` is what makes /rsvp exist as a real file: plain `nuxt build`
  // only prerenders `/`, so the RSVP route 404s on a static host. The explicit
  // `routes` list is a safety net for any page the crawler can't reach from a
  // <NuxtLink> on the home page.
  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/rsvp'],
    },
  },

  // Tailwind v4 is a Vite plugin now; there is no tailwind.config.js. Theme
  // values live in app/assets/css/main.css under @theme.
  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: {
      // Formatting is Prettier's job; ESLint only reports code issues.
      stylistic: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: description },
        { name: 'theme-color', content: '#090a0f' },

        // Open Graph — Facebook, WhatsApp, iMessage, LinkedIn, Slack, Discord.
        // `property` rather than `name` is what these scrapers look for.
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Lieke & Joshua' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: siteUrl || '/' },
        { property: 'og:image', content: ogImage },
        // Declaring the dimensions lets a scraper reserve the 1.91:1 slot on
        // first pass, instead of rendering a text-only card until it has
        // downloaded and measured the file.
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        {
          property: 'og:image:alt',
          content:
            'You are invited to a party under the stars — a shared birthday celebration of Lieke & Joshua, 18th October 2026.',
        },

        // X/Twitter reads og:* for everything except the card size, which has
        // to be opted into or the image renders as a small square thumbnail.
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: ogImage },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
        },
      ],
    },
  },
})
