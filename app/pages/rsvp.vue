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
      <form class="mt-12 space-y-8" @submit.prevent="submit" netlify>
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
            class="mt-3 w-full border border-white/30 bg-white/5 px-4 py-3 font-light text-white 
                 placeholder:text-white/30 focus:border-white focus:bg-white/10 focus:outline-none
                   disabled:text-white/50"
            placeholder="Your name"
            :disabled="submitting"
            v-model="name"
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
            class="mt-3 w-full border border-white/30 bg-white/5 px-4 py-3 font-light text-white 
                placeholder:text-white/30 focus:border-white focus:bg-white/10 
                  focus:outline-none disabled:text-white/50"
            placeholder="you@example.com"
            :disabled="submitting"
            v-model="email"
          />
        </div>

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
            class="mt-3 w-full resize-y border border-white/30 bg-white/5 px-4 py-3 font-light 
                text-white placeholder:text-white/30 focus:border-white focus:bg-white/10 
                  focus:outline-none disabled:text-white/50"
            placeholder="Optional"
            :disabled="submitting"
            v-model="message"
          />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full flex cursor-pointer border border-white bg-transparent px-8 py-3 text-center text-xl leading-relaxed font-medium text-white hover:bg-white/90 hover:text-night-700"
        >
        <!-- A spinning loading icon -->
          <div class="text-center flex m-auto gap-4">
            <div v-if="submitting" class="animate-spin h-8 w-8 border-4 border-white/80 border-solid rounded-full border-t-transparent"></div>
            <div>Send RSVP</div>
          </div>
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const count = 200;
const defaults = {
  origin: { y: 0.7 }
};

const router = useRouter()

const name = ref<string>()
const email = ref<string>()
const message = ref<string>()
const submitting = ref<boolean>(false)

const submit = async () => {
  submitting.value = true
  const response = await fetch("https://formbold.com/s/3jYWb", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: email.value,
      name: name.value,
      message: message.value,
    }),
  });

  const result = await response.json()
  if (response.ok) {
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

    router.push({ path: '/thank-you' })
  } else {
    const toast = useToast()
    toast.add({
      title: 'Unable to send RSVP',
      description: 'There was an error submitting the RSVP',
      color: 'error'
    })
  }
  submitting.value = false
}

const fire = (particleRatio: number, opts: any) => {
  confetti({
    ...defaults,
    ...opts,
    particleCount: Math.floor(count * particleRatio)
  });
}
</script>