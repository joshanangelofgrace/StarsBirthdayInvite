<template>
  <!-- The layout's <main> is `h-dvh overflow-hidden` so the starfield stays put
       instead of scrolling away. This form is taller than a phone viewport, so
       the page owns its own scroll container rather than the document. -->
  <div class="relative z-10 h-full overflow-y-auto overscroll-contain">
    <div class="mx-auto w-full max-w-lg px-6 py-14">
      <h1
        class="text-center text-sm leading-relaxed font-light tracking-[0.3em] text-white sm:text-2xl"
      >
        RSVP
      </h1>
      <p
        class="mt-4 text-center text-xs leading-loose font-light tracking-[0.25em] text-white/70"
      >
        LIEKE &amp; JOSHUA
      </p>
      <p
        class="mt-1 text-center text-xs font-light tracking-[0.15em] text-[gold]"
      >
        18TH OCTOBER 2026
      </p>

      <!-- Markup only — no v-model or submit handler, the backend is wired up
           separately. Every control carries a `name`, so whichever route it
           takes (native POST, FormData, or refs added later) the field names
           are already in place. -->
      <form class="mt-12 space-y-8" >
        <div>
          <label
            for="name"
            class="block text-xs font-light tracking-[0.2em] text-white/70"
          >
            FULL NAME
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autocomplete="name"
            class="mt-3 w-full border border-white/30 bg-white/5 px-4 py-3 font-light text-white placeholder:text-white/30 focus:border-white focus:bg-white/10 focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-xs font-light tracking-[0.2em] text-white/70"
          >
            EMAIL
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autocomplete="email"
            class="mt-3 w-full border border-white/30 bg-white/5 px-4 py-3 font-light text-white placeholder:text-white/30 focus:border-white focus:bg-white/10 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <fieldset>
          <legend class="text-xs font-light tracking-[0.2em] text-white/70">
            WILL YOU JOIN US?
          </legend>
          <div class="mt-4 space-y-3">
            <label
              class="flex cursor-pointer items-center gap-3 font-light text-white"
            >
              <input
                name="attending"
                type="radio"
                value="yes"
                required
                class="size-4 shrink-0 accent-[gold]"
              />
              <span>Yes, I'll be there</span>
            </label>
            <label
              class="flex cursor-pointer items-center gap-3 font-light text-white"
            >
              <input
                name="attending"
                type="radio"
                value="no"
                class="size-4 shrink-0 accent-[gold]"
              />
              <span>Sorry, I can't make it</span>
            </label>
          </div>
        </fieldset>

        <div>
          <label
            for="message"
            class="block text-xs font-light tracking-[0.2em] text-white/70"
          >
            A MESSAGE
          </label>
          <textarea
            id="message"
            name="message"
            rows="4"
            class="mt-3 w-full resize-y border border-white/30 bg-white/5 px-4 py-3 font-light text-white placeholder:text-white/30 focus:border-white focus:bg-white/10 focus:outline-none"
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          class="w-full cursor-pointer border border-white bg-transparent px-8 py-3 text-center text-xl leading-relaxed font-medium text-white hover:bg-white/90 hover:text-night-700"
          @click="submit"
        >
          Send RSVP
        </button>
      </form>

      <NuxtLink
        to="/"
        class="mt-10 block text-center text-xs font-light tracking-[0.2em] text-white/50 hover:text-white"
      >
        BACK
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import confetti from 'canvas-confetti'

const submit = () => {
    confetti({
  particleCount: 300,
  spread: 70,
  origin: { y: 0.6 }
});
}
</script>