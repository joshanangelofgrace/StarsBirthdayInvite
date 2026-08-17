import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-08-17',
  devtools: { enabled: true },

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

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'You are invited to a party under the stars',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'A shared birthday celebration of Lieke & Joshua — 18th October 2026.',
        },
        { name: 'theme-color', content: '#090a0f' },
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
