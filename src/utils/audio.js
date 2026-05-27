// Audio Engine — Place Values Module
// All narration served from pre-generated static .mp3 assets.
// No ElevenLabs API key required — fully offline-ready.

import audioMap from './audioMap.js';

// ── Playback state ────────────────────────────────────────────────────────
let currentQueue = null;
let currentAudio = null;
let isPlaying    = false;

// ── Segment helpers ───────────────────────────────────────────────────────
export const say       = (text) => ({ text, style: 'statement'     });
export const ask       = (text) => ({ text, style: 'question'      });
export const cheer     = (text) => ({ text, style: 'celebration'   });
export const emphasize = (text) => ({ text, style: 'emphasis'      });
export const think     = (text) => ({ text, style: 'thinking'      });
export const celebrate = (text) => ({ text, style: 'celebration'   });
export const encourage = (text) => ({ text, style: 'encouragement' });
export const instruct  = (text) => ({ text, style: 'instruction'   });

// ── getAudioUrl ───────────────────────────────────────────────────────────
// Returns the pre-generated static asset path, or null if not found.
export async function getAudioUrl(text) {
  if (audioMap[text]) return audioMap[text];
  console.info(`[audio] No pre-generated audio for: "${text.substring(0, 60)}"`);
  return null;
}

// ── narrate ───────────────────────────────────────────────────────────────
// Plays an array of {text, style} segments sequentially with eager preloading.
export async function narrate(segments, interrupt = false) {
  if (!segments || segments.length === 0) return;
  if (interrupt) stopNarration();
  if (isPlaying) return;

  const queueId = Symbol('queue');
  currentQueue  = queueId;
  isPlaying     = true;

  try {
    for (let i = 0; i < segments.length; i++) {
      if (currentQueue !== queueId) break;
      const { text } = segments[i];
      const url = await getAudioUrl(text);
      if (!url) continue;

      // Eager-preload next segment while current plays
      if (i < segments.length - 1) {
        getAudioUrl(segments[i + 1].text).catch(() => {});
      }
      await playSegment(url, queueId);
    }
  } catch (err) {
    console.warn('[audio] narration error:', err);
  } finally {
    if (currentQueue === queueId) {
      isPlaying    = false;
      currentQueue = null;
    }
  }
}

// ── playSegment ───────────────────────────────────────────────────────────
function playSegment(url, queueId) {
  return new Promise((resolve) => {
    if (currentQueue !== queueId) { resolve(); return; }
    const audio  = new Audio(url);
    currentAudio = audio;
    audio.addEventListener('ended', () => { currentAudio = null; resolve(); });
    audio.addEventListener('error', () => { currentAudio = null; resolve(); });
    audio.play().catch(() => { currentAudio = null; resolve(); });
  });
}

// ── stopNarration ─────────────────────────────────────────────────────────
export function stopNarration() {
  currentQueue = null;
  isPlaying    = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ── isNarrating ───────────────────────────────────────────────────────────
export function isNarrating() {
  return isPlaying;
}
