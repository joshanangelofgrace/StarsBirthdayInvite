<script setup lang="ts">
import { computed } from 'vue';

/**
 * One parallax layer of stars.
 *
 * The original index.css shipped ~41KB of hand-generated `box-shadow`
 * coordinates. Same rendering trick here — a single 1px element casting
 * hundreds of shadows is far cheaper than hundreds of DOM nodes — but the
 * coordinates are generated at render time instead of being checked in.
 *
 * The generator is seeded rather than Math.random, so the server and the
 * client produce byte-identical markup and hydration stays quiet.
 */

/** Height of one repeat. The layer scrolls exactly this far per cycle. */
const TILE = 2000

const props = withDefaults(
  defineProps<{
    /** Which parallax speed to run at. */
    layer?: 'near' | 'mid' | 'far'
    /** How many stars in one tile. */
    count?: number
    /** Star size in px. */
    size?: number
    /** Any integer; changing it reshuffles the layout. */
    seed?: number
  }>(),
  { layer: 'near', count: 700, size: 1, seed: 1 },
)

// Written out in full so Tailwind's scanner can see the class names.
const ANIMATION = {
  near: 'animate-drift-near',
  mid: 'animate-drift-mid',
  far: 'animate-drift-far',
} as const

/** Small deterministic PRNG (mulberry32). */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const boxShadow = computed(() => {
  const random = mulberry32(props.seed)
  const stars: string[] = []
  for (let i = 0; i < props.count; i++) {
    // Horizontal offsets are in vw so the field always spans the full window,
    // however wide it gets. A fixed px spread would leave a starless band on
    // any viewport wider than the tile. Vertical stays in px because the
    // scroll distance has to match the keyframe exactly.
    const x = (random() * 100).toFixed(3)
    const y = Math.floor(random() * TILE)
    stars.push(`${x}vw ${y}px var(--color-star)`)
  }
  return stars.join(', ')
})

const starStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  boxShadow: boxShadow.value,
}))

const tileOffset = `${TILE}px`
</script>
 
<template>
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div
      :class="ANIMATION[props.layer]"
      class="a"
    >
      <!-- Two identical tiles stacked vertically: as the first scrolls off the
           top the second takes its place, which is what makes it seamless. -->
      <div class="absolute top-0 left-0 bg-transparent" :style="starStyle" ></div>
      <div
        class="absolute left-0 bg-transparent"
        :style="{ ...starStyle, top: tileOffset }"
      >
    </div>
    </div>
  </div>
</template>
