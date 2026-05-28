// Audio Engine — Place Values Module
// Three-tier architecture: Static MP3 → ElevenLabs API → Silent skip
// No browser TTS fallback, ever.

// ── Voice Configuration ─────────────────────────────────────────────────────
const ELEVENLABS_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice

// ── ElevenLabs voice_settings by style ──────────────────────────────────────
function getElevenLabsSettings(style) {
  switch (style) {
    case 'celebration':   return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    case 'statement':
    case 'instruction':
    default:              return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
}

// ── Audio Map (dynamic import — non-blocking) ───────────────────────────────
let audioMap = {};
try {
  import('./audioMap.js').then(module => {
    audioMap = module.audioMap || module.default || {};
  }).catch(() => {});
} catch (e) {}

// ── Playback state ──────────────────────────────────────────────────────────
let currentQueue = null;
let currentAudio = null;
let isSpeaking   = false;
let playId       = 0;

// ── In-memory cache for Tier 2 (ElevenLabs API) ────────────────────────────
const elevenLabsCache = new Map();

// ── Segment helpers ─────────────────────────────────────────────────────────
export function seg(text, style = 'statement', pause = 400) {
  return { text, style, pause };
}

export const say       = (text, pause = 0) => seg(text, 'statement',     pause);
export const ask       = (text, pause = 0) => seg(text, 'question',      pause);
export const cheer     = (text, pause = 0) => seg(text, 'encouragement', pause);
export const emphasize = (text, pause = 0) => seg(text, 'emphasis',      pause);
export const think     = (text, pause = 0) => seg(text, 'thinking',      pause);
export const celebrate = (text, pause = 0) => seg(text, 'celebration',   pause);
export const instruct  = (text, pause = 0) => seg(text, 'instruction',   pause);
export const encourage = (text, pause = 0) => seg(text, 'encouragement', pause); // backward compat
export const pause     = (ms = 0)          => seg('',   'statement',     ms);    // silent gap

// ── getAudioUrl — Three-Tier Lookup ─────────────────────────────────────────
export async function getAudioUrl(text, style) {
  // ── TIER 1: Static pre-generated asset ──────────────────────
  if (audioMap && audioMap[text]) {
    return audioMap[text];
  }

  // ── TIER 2: Live ElevenLabs API (with in-memory caching) ────
  const cacheKey = `${text}_${style}`;
  if (elevenLabsCache.has(cacheKey)) {
    return elevenLabsCache.get(cacheKey);
  }

  const fetchPromise = (async () => {
    const localApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (!localApiKey) throw new Error('No ElevenLabs API key');

    const voiceSettings = getElevenLabsSettings(style);

    // Try backend proxy first (preferred for key security)
    let response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID, voiceSettings })
    });

    const isHtmlFallback = (response.headers.get('content-type') || '').includes('text/html');

    // Fall back to direct ElevenLabs if proxy fails or returns HTML (404 page)
    if ((!response.ok || isHtmlFallback) && localApiKey) {
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': localApiKey },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceSettings
          })
        }
      );
    }

    if (!response.ok || isHtmlFallback) throw new Error('Audio fetch failed.');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  })();

  // Cache the promise (not the result) — concurrent requests share one fetch
  elevenLabsCache.set(cacheKey, fetchPromise);
  fetchPromise.catch(() => elevenLabsCache.delete(cacheKey)); // evict on failure

  return fetchPromise;
}

// ── speak — Single Segment Playback ─────────────────────────────────────────
export function speak(text, enabled = true, style = 'statement') {
  return new Promise(async (resolve) => {
    if (!enabled || !text) { resolve(); return; }

    playId++;
    const currentPlayId = playId;
    isSpeaking = true;

    try {
      const audioUrl = await getAudioUrl(text, style);

      // If playback was cancelled while fetching, abort
      if (currentPlayId !== playId) { isSpeaking = false; resolve(); return; }

      if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }

      currentAudio = new Audio(audioUrl);
      currentAudio.onended = () => { isSpeaking = false; resolve(); };
      currentAudio.onerror = () => { isSpeaking = false; resolve(); };

      await currentAudio.play();

    } catch (error) {
      // ── TIER 3: Silent skip — no browser TTS ──
      console.error('[audio] ElevenLabs failed, skipping:', error.message || error);
      isSpeaking = false;
      resolve();
    }
  });
}

// ── narrate — Sequence Playback with Eager Preloading ───────────────────────
export function narrate(segments, enabled = true) {
  const queueId = Symbol('narration');
  currentQueue = queueId;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (currentQueue === queueId) {
      isSpeaking = false;
      currentQueue = null;
    }
  };

  const promise = (async () => {
    if (!enabled || !segments || segments.length === 0) return;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (cancelled || currentQueue !== queueId) return;

      // ── EAGER PRELOAD: fetch segment i+1 while i is playing ──
      if (i + 1 < segments.length) {
        const next = segments[i + 1];
        if (next.text?.trim()) {
          getAudioUrl(next.text, next.style).catch(() => {});
        }
      }

      // Speak current segment (empty text = silent pause)
      if (segment.text?.trim()) {
        await speak(segment.text, true, segment.style);
      }

      // Pause gap after segment
      if (segment.pause > 0 && !cancelled && currentQueue === queueId) {
        await new Promise(r => setTimeout(r, segment.pause));
      }
    }
  })();

  return { cancel, promise };
}

// ── preloadNarration — Warm the Cache ───────────────────────────────────────
export function preloadNarration(segments) {
  if (!segments) return;
  segments.forEach(seg => {
    if (seg.text?.trim()) {
      getAudioUrl(seg.text, seg.style).catch(() => {});
    }
  });
}

// ── stopNarration — Hard Stop ───────────────────────────────────────────────
export function stopNarration() {
  playId++;
  currentQueue = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  isSpeaking = false;
}

// ── isNarrating ─────────────────────────────────────────────────────────────
export function isNarrating() {
  return isSpeaking;
}

// ── Sound Effects (AudioContext tones — not ElevenLabs) ──────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    vol.gain.value = gain;
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start();
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export const sounds = {
  correct: () => {
    // Ascending 3-note chime
    playTone(523, 0.15); // C5
    setTimeout(() => playTone(659, 0.15), 100); // E5
    setTimeout(() => playTone(784, 0.25), 200); // G5
  },
  wrong: () => {
    // Single low tone
    playTone(220, 0.3, 'triangle', 0.12);
  },
  badge: () => {
    // 4-note ascending fanfare
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 120);
    setTimeout(() => playTone(784, 0.15), 240);
    setTimeout(() => playTone(1047, 0.35), 360);
  },
  click: () => {
    // Short 440Hz tap
    playTone(440, 0.06, 'sine', 0.1);
  },
  streak: () => {
    // Two-note rising pulse
    playTone(587, 0.12);
    setTimeout(() => playTone(880, 0.2), 100);
  },
};
