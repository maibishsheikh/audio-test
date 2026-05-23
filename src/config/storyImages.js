/**
 * ══════════════════════════════════════════════════════════════════════
 *  STORY IMAGES CONFIGURATION
 *  ─────────────────────────────────────────────────────────────────────
 *  HOW TO ADD YOUR OWN IMAGES:
 *
 *  Step 1 — Copy your image files into:
 *             public/assets/images/
 *
 *  Step 2 — Update the file names below (just the filename, not the path).
 *            e.g.  'my-scene.png'
 *
 *  Step 3 — Save this file. The story will use your images instantly.
 *
 *  Supported formats: .png  .jpg  .jpeg  .webp
 *  Set a scene to null to use the built-in animated visual instead.
 * ══════════════════════════════════════════════════════════════════════
 *
 *  SCENE GUIDE:
 *    scene1  →  Slide 1 — "100 Mangoes at Pasar Malam"
 *    scene2  →  Slide 2 — "Place Value is Everywhere"
 *    scene3  →  Slide 3 — "Let's Build 147"
 *    scene4  →  Slide 4 — "Bigger Numbers, Same Rules"  (no image by default)
 *
 *  NOTE: BASE_URL is automatically set by Vite for both dev and production.
 *        Do NOT hardcode leading slashes — use the helper below.
 * ══════════════════════════════════════════════════════════════════════
 */

// Vite exposes the correct base URL for both dev (/) and production (/courses/grade-2-math/)
const base = import.meta.env.BASE_URL; // e.g. "/" in dev, "/courses/grade-2-math/" in prod

function img(filename) {
  // Normalise: strip any trailing slash from base, strip any leading slash from filename
  return `${base.replace(/\/$/, '')}/assets/images/${filename}`;
}

const STORY_IMAGES = {
  scene1: img('story-1.png'),
  scene2: img('story-2.png'),
  scene3: img('story-3.png'),
};

export default STORY_IMAGES;
