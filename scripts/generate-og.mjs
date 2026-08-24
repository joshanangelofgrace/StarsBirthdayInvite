/**
 * Renders scripts/og-image.html to public/og-image.png at 1200x630.
 *
 * Headless Chrome/Edge is used instead of an image library because the source
 * is real CSS — gradient-clipped text and hundreds of box-shadow stars are
 * things only a browser renders correctly. No npm dependency either; every
 * machine that can open this project already has one of these browsers.
 *
 * Run with: npm run og
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'scripts/og-image.html');
const output = resolve(root, 'public/og-image.png');

const CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const browser = CANDIDATES.find((path) => existsSync(path));
if (!browser) {
  console.error(
    'No Chrome or Edge found. Set CHROME_PATH to a Chromium-based browser and re-run.',
  );
  process.exit(1);
}

mkdirSync(dirname(output), { recursive: true });

// A throwaway profile keeps the screenshot away from the user's real one, which
// Chrome refuses to reuse while a normal window is open.
const profile = resolve(tmpdir(), `og-image-profile-${process.pid}`);

try {
  execFileSync(
    browser,
    [
      '--headless',
      '--disable-gpu',
      // Subpixel antialiasing paints red/blue fringes on the small text, which
      // look like artefacts once a chat app rescales the image.
      '--disable-lcd-text',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      `--user-data-dir=${profile}`,
      // Gives the webfont and the star-generating script time to land before
      // the frame is captured; without it the text falls back to Arial.
      '--virtual-time-budget=4000',
      `--screenshot=${output}`,
      pathToFileURL(source).href,
    ],
    { stdio: 'inherit' },
  );
} finally {
  rmSync(profile, { recursive: true, force: true });
}

console.log(`Wrote ${output}`);
