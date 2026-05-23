// Audio Engine for Numbers to 200
// Pipeline per audio_generation_pipeline.md:
//   Layer 1 — Pre-generated static assets (audioMap lookup, zero latency)
//   Layer 2 — Dynamic fallback: direct ElevenLabs API call using VITE_ELEVENLABS_API_KEY
//             (in production, proxied via /api/elevenlabs to keep key server-side)
//
// Content policy: audio only for paragraph text and questions — never titles.

import audioMap from './audioMap.js';

// ElevenLabs voice config — DO NOT CHANGE (per audio_generation_pipeline.md)
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice — Clear Educator
const MODEL_ID = 'eleven_multilingual_v2';

// Per-style voice settings (exact copy from audio_generation_pipeline.md)
const VOICE_SETTINGS = {
  celebration:   { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement: { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:      { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:      { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:      { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:     { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction:   { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

// ── Playback state ────────────────────────────────────────────────────────
let currentQueue = null;
let currentAudio = null;
let isPlaying    = false;

// Session cache — avoids re-fetching the same text twice
const runtimeCache = new Map();

// ── Segment helpers (per TRD §5.3) ───────────────────────────────────────
export const say       = (text) => ({ text, style: 'statement'     });
export const ask       = (text) => ({ text, style: 'question'      });
export const cheer     = (text) => ({ text, style: 'celebration'   });
export const emphasize = (text) => ({ text, style: 'emphasis'      });
export const think     = (text) => ({ text, style: 'thinking'      });
export const celebrate = (text) => ({ text, style: 'celebration'   });
export const encourage = (text) => ({ text, style: 'encouragement' });
export const instruct  = (text) => ({ text, style: 'instruction'   });

// ── getAudioUrl ───────────────────────────────────────────────────────────
// Layer 1: check pre-generated audioMap (static asset, zero latency)
// Layer 2: call ElevenLabs directly using VITE_ELEVENLABS_API_KEY env var
//          OR call /api/elevenlabs server-side proxy in production
export async function getAudioUrl(text, style = 'statement') {
  // Layer 1 — static pre-generated asset
  if (audioMap[text]) {
    return audioMap[text];
  }

  // Runtime session cache
  const cacheKey = `${style}::${text}`;
  if (runtimeCache.has(cacheKey)) {
    return runtimeCache.get(cacheKey);
  }

  const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.statement;
  const voiceSettings = {
    stability:         settings.stability,
    similarity_boost:  settings.similarity_boost,
    style:             settings.style,
    use_speaker_boost: settings.use_speaker_boost,
  };

  // Retrieve API key from Vite env (set VITE_ELEVENLABS_API_KEY in .env.local)
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;

  let response;
  try {
    if (apiKey && apiKey.trim().length > 0) {
      // ── Direct ElevenLabs call (dev + any env with key embedded) ─────────
      response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept':         'audio/mpeg',
            'Content-Type':   'application/json',
            'xi-api-key':     apiKey.trim(),
          },
          body: JSON.stringify({
            text,
            model_id: MODEL_ID,
            voice_settings: voiceSettings,
          }),
        }
      );
    } else {
      // ── Server-side proxy (production without embedded key) ──────────────
      // POST to /api/elevenlabs — your backend must handle this and inject the key
      response = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_id:       VOICE_ID,
          model_id:       MODEL_ID,
          voice_settings: voiceSettings,
        }),
      });
    }

    if (!response || !response.ok) {
      const errText = response
        ? await response.text().catch(() => response.statusText)
        : 'no response';
      throw new Error(`ElevenLabs ${response?.status ?? 'ERR'}: ${errText}`);
    }

    const blob    = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    runtimeCache.set(cacheKey, blobUrl);
    return blobUrl;

  } catch (err) {
    console.warn(`[audio] dynamic fallback failed for "${text.substring(0, 50)}…":`, err.message);
    return null;
  }
}

// ── narrate ───────────────────────────────────────────────────────────────
// Plays an array of {text, style} segments sequentially with eager preloading.
// interrupt=true stops any active narration before starting.
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

      const { text, style } = segments[i];
      const audioUrl = await getAudioUrl(text, style);

      if (!audioUrl) continue;

      // Eager-preload next segment while current plays
      if (i < segments.length - 1) {
        const next = segments[i + 1];
        getAudioUrl(next.text, next.style).catch(() => {});
      }

      await playSegment(audioUrl, queueId);
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
    audio.addEventListener('error', (e) => {
      console.warn('[audio] playback error:', e);
      currentAudio = null;
      resolve();
    });

    audio.play().catch((e) => {
      // Autoplay policy — requires prior user interaction
      console.warn('[audio] play() blocked (autoplay policy):', e.message);
      currentAudio = null;
      resolve();
    });
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
