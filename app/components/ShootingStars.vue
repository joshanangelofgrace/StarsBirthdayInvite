<script setup lang="ts">
/**
 * The occasional shooting star.
 *
 * Each entry below is one streak on its own loop: it crosses the screen in
 * about 1.5s and then sits invisible for the rest of its cycle (see the
 * `shoot` keyframes). Giving the four of them different periods keeps the
 * pattern from reading as a loop — on average one goes past every ~7s.
 *
 * The list is static rather than randomised so the server and client render
 * the same markup and hydration stays quiet, same reasoning as StarField.
 */

const STARS = [
  { top: '8%', left: '-10%', angle: 20, delay: 2, duration: 24, length: 150 },
  { top: '-22%', left: '30%', angle: 32, delay: 11, duration: 31, length: 110 },
  { top: '-4%', left: '55%', angle: 14, delay: 20, duration: 27, length: 180 },
  { top: '35%', left: '-5%', angle: 25, delay: 29, duration: 35, length: 120 },
] as const
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div
      v-for="(star, i) in STARS"
      :key="i"
      class="absolute"
      :style="{ top: star.top, left: star.left, transform: `rotate(${star.angle}deg)` }"
    >
      <div
        class="animate-shoot relative"
        :style="{
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`,
        }"
      >
        <!-- Trail sits behind the head and tapers off backwards. -->
        <div
          class="absolute top-1/2 right-0 h-px -translate-y-1/2 bg-linear-to-l from-star to-transparent"
          :style="{ width: `${star.length}px` }"
        />
        <div
          class="h-[2px] w-[2px] rounded-full bg-star shadow-[0_0_6px_2px_rgba(255,255,255,0.5)]"
        />
      </div>
    </div>
  </div>
</template>
