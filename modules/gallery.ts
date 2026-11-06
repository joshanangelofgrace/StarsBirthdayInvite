import { readdir } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { addTemplate, addTypeTemplate, defineNuxtModule, useLogger } from '@nuxt/kit'
import sharp from 'sharp'
import { encodePath, joinURL } from 'ufo'

// Every photo dropped into public/gallery/ shows up on the gallery page, in
// filename order — there is no list to maintain, just add files and rebuild.
//
// At build time this module:
//  - reads each photo's size, so tiles reserve the right shape before the
//    photo arrives instead of jumping when it does;
//  - exposes the list as `#gallery`;
//  - tells the prerenderer about every resized version. Nuxt Image only
//    generates the /_ipx/ files it finds in prerendered HTML, and the album
//    picks a size in the browser, so they would otherwise never be written.

/** Widths a tile can request; it picks the smallest that covers it on screen. */
const TILE_WIDTHS = [480, 960, 1440]
const LIGHTBOX_WIDTH = 2048
const FORMAT = 'webp'

// Browsers other than Safari can't show HEIC, and sharp's prebuilt binaries
// can't decode it either, so those files have to be converted to JPEG first.
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

export default defineNuxtModule({
  meta: { name: 'gallery' },
  async setup(_options, nuxt) {
    const logger = useLogger('gallery')
    const dir = resolve(nuxt.options.rootDir, 'public/gallery')

    const files = (await readdir(dir).catch(() => [] as string[]))
      .filter((f) => !f.startsWith('.'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

    const skipped = files.filter((f) => !SUPPORTED.has(extname(f).toLowerCase()))
    if (skipped.length) {
      logger.warn(`Skipping ${skipped.length} unsupported photo(s) — convert to JPEG: ${skipped.join(', ')}`)
    }

    const photos = await Promise.all(
      files
        .filter((f) => SUPPORTED.has(extname(f).toLowerCase()))
        .map(async (file) => {
          const { width = 3, height = 2, orientation = 1 } = await sharp(resolve(dir, file)).metadata()
          // EXIF orientations 5–8 are quarter turns: the stored pixels are on
          // their side, and the displayed photo swaps width and height.
          const turned = orientation >= 5
          return {
            src: `/gallery/${file}`,
            width: turned ? height : width,
            height: turned ? width : height,
          }
        }),
    )

    const data = { photos, tileWidths: TILE_WIDTHS, lightboxWidth: LIGHTBOX_WIDTH, format: FORMAT }
    const template = addTemplate({
      filename: 'gallery.mjs',
      getContents: () => Object.entries(data).map(([k, v]) => `export const ${k} = ${JSON.stringify(v)}`).join('\n'),
    })
    addTypeTemplate({
      filename: 'types/gallery.d.ts',
      getContents: () => `declare module '#gallery' {
  export const photos: { src: string; width: number; height: number }[]
  export const tileWidths: number[]
  export const lightboxWidth: number
  export const format: string
}
`,
    })
    nuxt.options.alias['#gallery'] = template.dst

    // Must match the URLs Nuxt Image's ipx provider builds for
    // { format, width } — modifiers in that order become `f_webp&w_480`.
    const ipx = (src: string, width: number) =>
      joinURL(nuxt.options.app.baseURL, '_ipx', `f_${FORMAT}&w_${width}`, encodePath(src))

    nuxt.hook('nitro:config', (nitro) => {
      nitro.prerender ||= {}
      nitro.prerender.routes ||= []
      for (const { src } of photos) {
        for (const w of [...TILE_WIDTHS, LIGHTBOX_WIDTH]) nitro.prerender.routes.push(ipx(src, w))
      }
    })
  },
})
