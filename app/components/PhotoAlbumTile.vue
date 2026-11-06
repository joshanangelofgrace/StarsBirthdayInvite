<script lang="ts">
// Shared by every tile: only a few downloads run at once, so the photos on
// screen finish one after another instead of all crawling along together.
const MAX_CONCURRENT = 4
let running = 0
const waiting: (() => void)[] = []

const acquire = () =>
  new Promise<void>((resolve) => {
    if (running < MAX_CONCURRENT) {
      running++
      resolve()
    } else waiting.push(resolve)
  })

const release = () => {
  const next = waiting.shift()
  if (next) next()
  else running--
}

// The gallery page scrolls inside its own container rather than the window,
// and an IntersectionObserver's rootMargin only stretches its root — so the
// root has to be that container for "load a little before it's on screen" to
// work.
const scrollParent = (el: HTMLElement | null): HTMLElement | null => {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}
</script>

<script setup lang="ts">
// One photo in the album. It waits until it is near the visible area, then
// downloads a resized copy (via Nuxt Image) with fetch() so it can report real
// byte progress, and fades the photo in once it has arrived.
import { format, tileWidths } from '#gallery'

const props = defineProps<{
  src: string
  /** width / height, known at build time so the tile never changes shape. */
  ratio: number
  alt?: string
}>()
defineEmits<{ open: [] }>()

const root = ref<HTMLElement | null>(null)

type State = 'idle' | 'queued' | 'loading' | 'loaded' | 'error'
const state = ref<State>('idle')
/** 0–1, or null when the server didn't send a Content-Length. */
const progress = ref<number | null>(0)
const objectUrl = ref<string | null>(null)
const shown = ref(false)

// The smallest prerendered width that still covers the tile at this screen's
// pixel density, so phones don't download desktop-sized photos.
const img = useImage()
const pickUrl = () => {
  const needed = (root.value?.offsetWidth ?? 0) * (window.devicePixelRatio || 1)
  const width = tileWidths.find((w) => w >= needed) ?? tileWidths.at(-1)!
  return img(props.src, { format, width })
}

let controller: AbortController | null = null

const load = async () => {
  state.value = 'queued'
  progress.value = 0
  await acquire()
  controller = new AbortController()
  state.value = 'loading'

  try {
    const res = await fetch(pickUrl(), { signal: controller.signal })
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

    const total = Number(res.headers.get('content-length')) || 0
    progress.value = total ? 0 : null

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let received = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.length
      if (total) progress.value = Math.min(received / total, 1)
    }

    const blob = new Blob(chunks as BlobPart[], { type: res.headers.get('content-type') ?? '' })
    objectUrl.value = URL.createObjectURL(blob)
    progress.value = 1
    state.value = 'loaded'
  } catch (err) {
    if ((err as Error).name !== 'AbortError') state.value = 'error'
  } finally {
    controller = null
    release()
  }
}

const onImgLoad = () => (shown.value = true)

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer?.disconnect()
        observer = null
        load()
      }
    },
    { root: scrollParent(root.value), rootMargin: '400px 0px' },
  )
  observer.observe(root.value!)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  controller?.abort()
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

const percent = computed(() => (progress.value === null ? null : Math.round(progress.value * 100)))
const indeterminate = computed(
  () => state.value === 'idle' || state.value === 'queued' || percent.value === null,
)
</script>

<template>
  <button
    ref="root"
    type="button"
    class="group relative cursor-zoom-in overflow-hidden rounded-sm bg-white/5"
    :style="{
      flexGrow: ratio,
      flexBasis: `calc(var(--row-h) * ${ratio})`,
      aspectRatio: ratio,
    }"
    :aria-busy="!shown"
    @click="$emit('open')"
  >
    <img
      v-if="objectUrl"
      :src="objectUrl"
      :alt="alt ?? ''"
      decoding="async"
      class="size-full object-cover transition duration-500 group-hover:scale-105"
      :class="shown ? 'opacity-100' : 'opacity-0'"
      @load="onImgLoad"
    />

    <!-- Progress overlay, until the photo has faded in. -->
    <div
      v-if="!shown"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/60"
    >
      <template v-if="state === 'error'">
        <UIcon name="i-lucide-image-off" class="size-5" />
        <span class="text-[10px] tracking-[0.25em] underline underline-offset-4" @click.stop="load">
          RETRY
        </span>
      </template>
      <!-- Progress ring: fills with the download. While waiting its turn, or
           when the server sends no Content-Length, a short arc spins instead. -->
      <div v-else class="relative size-12">
        <svg
          viewBox="0 0 48 48"
          class="size-full -rotate-90"
          :class="{ 'animate-spin': indeterminate }"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="20" fill="none" stroke-width="3" class="stroke-white/15" />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            pathLength="100"
            stroke-dasharray="100"
            :stroke-dashoffset="100 - (indeterminate ? 25 : percent!)"
            class="stroke-[gold] transition-[stroke-dashoffset] duration-200 ease-out"
          />
        </svg>
        <span
          v-if="!indeterminate"
          class="absolute inset-0 flex items-center justify-center text-[10px] tabular-nums"
        >
          {{ percent }}%
        </span>
      </div>
    </div>
  </button>
</template>
