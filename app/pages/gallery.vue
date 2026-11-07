<script setup lang="ts">
// Every image dropped into public/gallery/ shows up here, in filename order —
// add or remove files and rebuild. modules/gallery.ts builds the list.
import { photos as gallery } from '#gallery'
import confetti from 'canvas-confetti'

const photos = gallery.map((p) => ({ ...p, alt: 'Photo from the party under the stars' }))

const count = 200;
const defaults = {
  origin: { y: 0.7 }
};

// The gallery is password protected by a Netlify Edge Function
// (netlify/edge-functions/gallery-auth.ts), which only sees real page loads.
// An in-app navigation would skip it and render a grid of locked photos, so
// arriving from another page always does a full load instead.
definePageMeta({
  middleware: (to, from) => {
    if (import.meta.client && from.name && from.fullPath !== to.fullPath) {
      return navigateTo(to.fullPath, { external: true })
    }
  },
})

useSeoMeta({ robots: 'noindex, nofollow' })

onMounted(() => {
  setTimeout(() => {
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
     fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, 500);
})

const fire = (particleRatio: number, opts: any) => {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio)
  });
}
</script>

<template>
  <!-- The layout clips to the viewport for the starfield, so this page scrolls itself. -->
  <div class="relative z-10 h-dvh overflow-y-auto">
    <div class="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <h1
        class="text-sm leading-relaxed font-light tracking-[0.2em] text-balance text-white sm:text-2xl sm:tracking-[0.35em] md:text-3xl"
      >
        <span class="block bg-linear-to-b from-white from-25% to-night-700 bg-clip-text text-transparent">
          Thank you for coming
        </span>
        <span class="block">
          🎉🎉
          <span class="bg-linear-to-b from-white from-25% to-night-700 bg-clip-text text-transparent">
            MEMORIES UNDER THE STARS
          </span>
          🎉🎉
        </span>
      </h1>

      <PhotoAlbum v-if="photos.length" :photos="photos" class="mt-12 w-full sm:mt-16" />
      <p v-else class="mt-12 text-xs tracking-[0.25em] text-white/60">PHOTOS COMING SOON</p>

      <p class="mt-16 text-sm font-light tracking-[0.15em] text-[gold] sm:text-base">
        THANK YOU FOR CELEBRATING WITH US
      </p>
    </div>
  </div>
</template>
