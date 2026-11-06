<script setup lang="ts">
import { format, lightboxWidth } from '#gallery'

// Justified "rows" layout, the same look as vue-photo-album: every photo in a
// row shares one height and the row fills the full width exactly.
//
// It is done in CSS rather than measured in JS. Each tile's flex-grow and
// flex-basis are proportional to its aspect ratio, so when a row's tiles grow
// to fill the leftover width they all scale by the same factor and keep the
// same height. A greedy spacer after the last tile stops the final, partly
// filled row from being stretched into giant photos.

const props = withDefaults(
  defineProps<{
    photos: { src: string; width: number; height: number; alt?: string }[]
    /** Height a row aims for (on desktop) before it is stretched to fill the width. */
    rowHeight?: number
  }>(),
  { rowHeight: 260 },
)

// Each tile (PhotoAlbumTile) loads its own photo once it nears the screen and
// shows its download progress.

// Photos are served resized and as WebP through Nuxt Image; the lightbox gets
// one large size. These URLs are prerendered by modules/gallery.ts.
const img = useImage()
const large = (src: string) => img(src, { format, width: lightboxWidth })

// Lightbox
const active = ref<number | null>(null)
const open = (i: number) => (active.value = i)
const close = () => (active.value = null)
const step = (dir: 1 | -1) => {
  if (active.value === null) return
  active.value = (active.value + dir + props.photos.length) % props.photos.length
}

const onKey = (e: KeyboardEvent) => {
  if (active.value === null) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowRight') step(1)
  else if (e.key === 'ArrowLeft') step(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <!-- Phones get shorter rows so more than one photo fits across. -->
  <div
    class="flex flex-wrap gap-2 [--row-h:calc(var(--row-height)*0.55)] sm:[--row-h:var(--row-height)]"
    :style="{ '--row-height': `${rowHeight}px` }"
  >
    <!-- The lightbox teleports out, but living inside keeps this a single-root
         component so a class passed from the parent lands on the grid. -->
    <PhotoAlbumTile
      v-for="(photo, i) in photos"
      :key="photo.src"
      :src="photo.src"
      :ratio="photo.width / photo.height"
      :alt="photo.alt"
      @open="open(i)"
    />
    <span class="grow-[10]" aria-hidden="true" />

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="active !== null"
          class="fixed inset-0 z-50 flex items-center justify-center bg-night-950/95 p-4 sm:p-12"
          role="dialog"
          aria-modal="true"
          @click.self="close"
        >
          <img
            :src="large(photos[active]!.src)"
            :alt="photos[active]!.alt ?? ''"
            class="max-h-full max-w-full object-contain shadow-2xl"
          />

          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="xl"
            aria-label="Close"
            class="absolute top-3 right-3 text-white"
            @click="close"
          />
          <UButton
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="ghost"
            size="xl"
            aria-label="Previous photo"
            class="absolute top-1/2 left-2 -translate-y-1/2 text-white"
            @click="step(-1)"
          />
          <UButton
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            size="xl"
            aria-label="Next photo"
            class="absolute top-1/2 right-2 -translate-y-1/2 text-white"
            @click="step(1)"
          />

          <p class="absolute inset-x-0 bottom-3 text-center text-xs tracking-[0.25em] text-white/60">
            {{ active + 1 }} / {{ photos.length }}
          </p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
