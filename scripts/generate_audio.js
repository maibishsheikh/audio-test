// Audio Generation Script for Numbers to 200
// Generates pre-rendered .mp3 files using the ElevenLabs API
// and writes src/utils/audioMap.js for zero-latency static playback.
//
// Usage:
//   node scripts/generate_audio.js
//
// Requires VITE_ELEVENLABS_API_KEY in .env.local (root of project)

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Load .env.local manually (Node has no Vite env loader) ─────────────────
function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

// ── ElevenLabs config ───────────────────────────────────────────────────────
const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'; // Alice — Clear, Engaging Educator
const MODEL_ID = 'eleven_multilingual_v2';
const API_KEY  = process.env.VITE_ELEVENLABS_API_KEY;

// Per-style voice settings (from audio_generation_pipeline.md)
const VOICE_SETTINGS = {
  celebration:  { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true },
  encouragement:{ stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true },
  question:     { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true },
  emphasis:     { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true },
  thinking:     { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true },
  statement:    { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
  instruction:  { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true },
};

// ── Narration phrases (paragraphs & questions only — never titles) ──────────
// Content policy: matches narration.js exactly for strict parity
const PHRASES = [
  // Intro Screen (introNarration)
  { text: "Ready to explore numbers beyond 100?",                                                                           style: 'question'      },
  { text: "Join Xiao Ming on a journey to understand numbers 101 to 200 through stories, simulations, and fun games!",     style: 'statement'     },
  { text: "Let's discover how hundreds, tens, and ones work together to make bigger numbers.",                              style: 'thinking'      },

  // Wonder Phase (wonderNarration)
  { text: "I have 1 hundred, 3 tens and 5 ones. What number am I?",                                                        style: 'question'      },
  { text: "Let's think about this together.",                                                                               style: 'thinking'      },
  { text: "When we count past ninety-nine, we reach one hundred.",                                                         style: 'emphasis'      },
  { text: "One hundred is a very special number. It's made of 10 tens!",                                                   style: 'statement'     },

  // Story Phase — Scene 1 (storyScene1Narration)
  { text: "Xiao Ming went to the market one sunny morning.",                                                                style: 'statement'     },
  { text: "He saw a big box filled with mangoes.",                                                                          style: 'statement'     },
  { text: "The sign said: 100 mangoes in this box!",                                                                       style: 'emphasis'      },
  { text: "Xiao Ming wondered, what does 100 really mean?",                                                                style: 'thinking'      },
  { text: "The shopkeeper explained: 100 is the same as 10 groups of 10. That's 10 tens!",                                 style: 'statement'     },

  // Story Phase — Scene 2 (storyScene2Narration)
  { text: "Next, Xiao Ming saw bags of mangoes on the table.",                                                             style: 'statement'     },
  { text: "Each bag had exactly 10 mangoes.",                                                                               style: 'statement'     },
  { text: "There were 4 bags, plus 7 single mangoes on the side.",                                                         style: 'statement'     },
  { text: "The shopkeeper said: That's 1 hundred, 4 tens, and 7 ones.",                                                    style: 'emphasis'      },
  { text: "Together, they make 147 mangoes!",                                                                               style: 'statement'     },

  // Story Phase — Scene 3 (storyScene3Narration)
  { text: "The shopkeeper showed Xiao Ming a special chart.",                                                               style: 'statement'     },
  { text: "It had three columns: Hundreds, Tens, and Ones.",                                                               style: 'emphasis'      },
  { text: "Each digit in a number has its own place and its own value.",                                                   style: 'statement'     },
  { text: "Now Xiao Ming understood! The position of each digit tells us how much it's worth!",                            style: 'celebration'   },

  // Simulate Phase — Station A (simulateStationAIntro)
  { text: "Welcome to Station A: Build It!",                                                                               style: 'thinking'      },
  { text: "You'll see a number on the screen. Your job is to build it using base-ten blocks.",                             style: 'statement'     },
  { text: "Drag the correct number of hundreds, tens, and ones blocks to the chart.",                                      style: 'statement'     },

  // Simulate Phase — Station B (simulateStationBIntro)
  { text: "Welcome to Station B: Read It!",                                                                                style: 'thinking'      },
  { text: "You'll see blocks arranged on the place value chart.",                                                          style: 'statement'     },
  { text: "Can you figure out what number they represent? Choose the correct answer!",                                      style: 'statement'     },

  // Simulate Phase — Station C (simulateStationCIntro)
  { text: "Welcome to Station C: Compare It!",                                                                             style: 'thinking'      },
  { text: "Which number is greater?",                                                                                      style: 'question'      },
  { text: "Look at both arrangements carefully and decide: greater than, less than, or equal to?",                         style: 'statement'     },

  // Simulate Phase — Feedback (simulateCorrectNarration)
  { text: "That's correct! Well done!",                                                                                    style: 'encouragement' },
  { text: "You're really understanding place value!",                                                                      style: 'celebration'   },

  // Simulate Phase — Feedback (simulateIncorrectNarration)
  { text: "Not quite right, but that's okay!",                                                                             style: 'encouragement' },
  { text: "Let's try again. Look carefully at each place value column.",                                                   style: 'thinking'      },

  // Play Phase — Intro (playIntroNarration)
  { text: "Now it's time to test your skills with 100 questions!",                                                         style: 'statement'     },
  { text: "Answer correctly to build your streak and earn bonus points. You've got this!",                                 style: 'encouragement' },

  // Play Phase — Streak milestones (streakNarration)
  { text: "Amazing! You've got a 3-question streak!",                                                                      style: 'celebration'   },
  { text: "Keep going to earn even more bonus points!",                                                                    style: 'encouragement' },
  { text: "Incredible! 5 in a row! You're on fire!",                                                                      style: 'celebration'   },
  { text: "You're earning maximum bonus points now!",                                                                      style: 'celebration'   },
  { text: "Wow! 10 correct answers in a row! You're a place value master!",                                                style: 'celebration'   },
  { text: "Keep up this amazing work!",                                                                                    style: 'celebration'   },

  // Reflect Phase — Stars 3 (reflectNarration)
  { text: "Outstanding work! You earned 3 stars!",                                                                         style: 'celebration'   },
  { text: "You've mastered numbers to 200!",                                                                               style: 'celebration'   },

  // Reflect Phase — Stars 2
  { text: "Great job! You earned 2 stars!",                                                                                style: 'celebration'   },
  { text: "You're doing really well with place value!",                                                                    style: 'encouragement' },

  // Reflect Phase — Stars 1
  { text: "Good effort! You earned 1 star!",                                                                               style: 'encouragement' },
  { text: "Keep practicing and you'll get even better!",                                                                   style: 'statement'     },

  // Reflect Phase — Stars 0
  { text: "Thanks for trying!",                                                                                            style: 'encouragement' },
  { text: "Practice makes progress. Try again to improve your score!",                                                     style: 'statement'     },

  // Reflect Phase — Common endings
  { text: "Let's review what you learned about hundreds, tens, and ones.",                                                 style: 'statement'     },
  { text: "Are you ready to see your achievements?",                                                                       style: 'question'      },

  // Generic helpers
  { text: "Fantastic work!",                                                                                                style: 'celebration'   },
  { text: "You're doing an amazing job!",                                                                                  style: 'celebration'   },
  { text: "Keep trying! You're learning!",                                                                                 style: 'encouragement' },
  { text: "Every mistake helps us learn something new.",                                                                   style: 'thinking'      },
  { text: "Here is my new pedagogical line!",                                                                              style: 'statement'     },

  // Reflect badge narration
  { text: "Outstanding work! You've mastered numbers to 200!",                                                             style: 'celebration'   },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 60);
}

async function generateAudio(text, style, index) {
  const settings = VOICE_SETTINGS[style] || VOICE_SETTINGS.statement;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Accept':       'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key':   API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability:         settings.stability,
          similarity_boost:  settings.similarity_boost,
          style:             settings.style,
          use_speaker_boost: settings.use_speaker_boost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText);
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const audioBuffer = await response.arrayBuffer();
  const filename    = `audio_${slugify(text)}_${index}.mp3`;
  const audioDir    = path.join(__dirname, '..', 'public', 'assets', 'audio');
  const filepath    = path.join(audioDir, filename);

  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  fs.writeFileSync(filepath, Buffer.from(audioBuffer));
  console.log(`  ✓ ${filename}`);

  return { text, path: `/assets/audio/${filename}` };
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎵  Numbers to 200 — Audio Generation\n');

  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('❌  VITE_ELEVENLABS_API_KEY not set.');
    console.log('   1. Copy .env.local.example → .env.local');
    console.log('   2. Replace "your_api_key_here" with your ElevenLabs key');
    console.log('   3. Re-run: node scripts/generate_audio.js\n');
    process.exit(1);
  }

  console.log(`   Voice:  Alice (${VOICE_ID})`);
  console.log(`   Model:  ${MODEL_ID}`);
  console.log(`   Phrases: ${PHRASES.length}\n`);

  const audioMapEntries = {};
  let generated = 0;
  let failed    = 0;

  for (let i = 0; i < PHRASES.length; i++) {
    const { text, style } = PHRASES[i];
    process.stdout.write(`[${String(i + 1).padStart(2)}/${PHRASES.length}] "${text.substring(0, 55)}${text.length > 55 ? '…' : ''}"\n`);

    const filename = `audio_${slugify(text)}_${i}.mp3`;
    const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio');
    const filepath = path.join(audioDir, filename);

    if (fs.existsSync(filepath)) {
      console.log(`  ✓ Skipping (exists): ${filename}`);
      audioMapEntries[text] = `/assets/audio/${filename}`;
      continue;
    }

    try {
      const result = await generateAudio(text, style, i);
      audioMapEntries[result.text] = result.path;
      generated++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      failed++;
    }

    // Rate limit: 500ms between requests (per pipeline spec)
    if (i < PHRASES.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Write audioMap.js
  const audioMapPath    = path.join(__dirname, '..', 'src', 'utils', 'audioMap.js');
  const audioMapContent =
`// Auto-generated audio map — DO NOT EDIT MANUALLY
// Run: node scripts/generate_audio.js
// Generated: ${new Date().toISOString()}
// Maps exact narration text strings → pre-generated .mp3 asset paths

const audioMap = ${JSON.stringify(audioMapEntries, null, 2)};

export default audioMap;
`;

  fs.writeFileSync(audioMapPath, audioMapContent);

  console.log(`\n✅  Generated: ${generated}  ❌  Failed: ${failed}`);
  console.log(`📄  audioMap written → src/utils/audioMap.js`);
  console.log(`\n   Next steps:`);
  console.log(`   • Run: node scripts/clean_audio.js   (remove orphaned mp3s)`);
  console.log(`   • Run: npm run build                 (include assets in dist)\n`);
}

main().catch(err => { console.error('\nFatal:', err); process.exit(1); });
