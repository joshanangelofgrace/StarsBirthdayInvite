<template>
     <main
    class="relative isolate h-dvh overflow-hidden bg-radial-[ellipse_at_bottom] from-night-900 to-night-950 font-display"
  >
    <!-- Smaller stars drift fastest, matching the original layer speeds. -->
    <StarField layer="near" :count="700" :size="1" :seed="1" />
    <StarField layer="mid" :count="200" :size="2" :seed="2" />
    <StarField layer="far" :count="100" :size="3" :seed="3" />
    <ShootingStars />

   <slot />
  </main>
</template>