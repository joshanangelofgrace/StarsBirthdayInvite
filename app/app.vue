<template>
  <main
    class="relative isolate h-dvh overflow-hidden bg-radial-[ellipse_at_bottom] from-night-900 to-night-950 font-display"
  >
    <!-- Smaller stars drift fastest, matching the original layer speeds. -->
    <StarField layer="near" :count="700" :size="1" :seed="1" />
    <StarField layer="mid" :count="200" :size="2" :seed="2" />
    <StarField layer="far" :count="100" :size="3" :seed="3" />
    <ShootingStars />

    <div
      class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
    >
      <!-- Sizing is tuned so each line survives on one line down to 320px. The
           gradient fill runs top-to-bottom per line, so a wrapped line would
           land on the dark end and stop being readable. -->
      <h1
        class="text-sm leading-relaxed font-light tracking-[0.2em] text-balance text-white sm:text-2xl sm:tracking-[0.35em] md:text-3xl"
      >
        <span
          class="block bg-linear-to-b from-white from-25% to-night-700 bg-clip-text text-transparent"
        >
          YOU ARE INVITED
        </span>
        <span
          class="block bg-linear-to-b from-white from-25% to-night-700 bg-clip-text text-transparent"
        >
          TO A PARTY UNDER THE STARS
        </span>
      </h1>

      <p
        class="mt-10 max-w-xl text-xs leading-loose font-light tracking-[0.25em] text-white/90 sm:text-sm"
      >
        A SHARED BIRTHDAY CELEBRATION OF LIEKE &amp; JOSHUA
      </p>
    </div>

    <div class="absolute inset-x-0 bottom-[20%] z-10 w-full flex">
      <button class="leading-relaxed font-medium text-balance text-center mx-auto text-xl px-8 py-3 border bg-transparent border-white text-white cursor-pointer hover:text-night-700 hover:bg-white/90">RSVP</button>
  </div>
    <p
      class="absolute inset-x-0 bottom-[12%] z-10 px-6 text-center text-sm font-light tracking-[0.15em] text-[gold] sm:text-base"
    >
      18TH OCTOBER 2026
    </p>
  </main>
</template>
