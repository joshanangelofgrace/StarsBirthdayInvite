// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

// `withNuxt` layers in Nuxt's own rules, which know about auto-imports
// (useSiteContent, defineEventHandler, createError, …) so they aren't flagged
// as undefined. `prettier` goes last to switch off formatting rules.
export default withNuxt(prettier)
  .append({
    files: ['**/*.vue'],
    rules: {
      // Single-word component names are fine in a Nuxt app (pages/, layouts/).
      'vue/multi-word-component-names': 'off',
    },
  })
  .append({
    // Verbatim SVG lifted from the original site — don't reformat it.
    ignores: ['app/components/TornPaperShape.vue'],
  })
