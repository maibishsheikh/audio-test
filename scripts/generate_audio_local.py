#!/usr/bin/env python3
"""
Local Audio Generation Script — Place Value Module
===================================================
Generates pre-rendered .mp3 files using Microsoft Edge TTS (free, no API key).
Produces high-quality neural speech with style-tuned pacing for young learners.

Usage:
    python scripts/generate_audio_local.py

Voice: en-US-AvaMultilingualNeural (clear, warm, engaging)
"""

import asyncio
import os
import re
import sys
import json
from datetime import datetime

import edge_tts

# ── Configuration ────────────────────────────────────────────────────────────

VOICE = "en-US-AvaMultilingualNeural"  # Clear, warm, premium neural voice

# Style-tuned pacing for young learners (ages 6-8)
# Each style maps to rate/pitch adjustments for natural, expressive narration
STYLE_SETTINGS = {
    "statement": {
        "rate": "-8%",     # Slightly slow — clear, comfortable pace
        "pitch": "+0Hz",   # Neutral — warm, natural baseline
    },
    "instruction": {
        "rate": "-12%",    # Slower — kids need time to follow directions
        "pitch": "+0Hz",   # Neutral — authoritative but gentle
    },
    "question": {
        "rate": "-10%",    # Slower — inviting curiosity, time to think
        "pitch": "+3Hz",   # Slightly higher — natural question intonation
    },
    "encouragement": {
        "rate": "-3%",     # Near normal — supportive, warm energy
        "pitch": "+2Hz",   # Slightly warm — uplifting tone
    },
    "emphasis": {
        "rate": "-18%",    # Noticeably slow — highlighting key concepts
        "pitch": "-1Hz",   # Slightly lower — authoritative clarity
    },
    "thinking": {
        "rate": "-14%",    # Gentle pace — reflective, inviting
        "pitch": "+1Hz",   # Soft rise — curious, wondering
    },
    "celebration": {
        "rate": "+2%",     # Slightly faster — excited, joyful energy
        "pitch": "+5Hz",   # Higher — happy, celebratory
    },
}

# ── All 57 Narration Phrases ────────────────────────────────────────────────
# Strict 1:1 parity with narration.js and generate_audio.js
PHRASES = [
    # ── Intro Screen (introNarration) ────────────────────────────────────
    {"text": "Ready to explore numbers beyond 100?",                                                                             "style": "question"},
    {"text": "Join Xiao Ming on a journey to understand numbers 101 to 200 through stories, simulations, and fun games!",       "style": "statement"},
    {"text": "Let's discover how hundreds, tens, and ones work together to make bigger numbers.",                                "style": "thinking"},

    # ── Wonder Phase (wonderNarration) ───────────────────────────────────
    {"text": "I have 1 hundred, 3 tens and 5 ones. What number am I?",                                                          "style": "question"},
    {"text": "Let's think about this together.",                                                                                 "style": "thinking"},
    {"text": "When we count past ninety-nine, we reach one hundred.",                                                           "style": "emphasis"},
    {"text": "One hundred is a very special number. It's made of 10 tens!",                                                     "style": "statement"},

    # ── Story Phase — Scene 1 (storyScene1Narration) ─────────────────────
    {"text": "Xiao Ming went to the market one sunny morning.",                                                                  "style": "statement"},
    {"text": "He saw a big box filled with mangoes.",                                                                            "style": "statement"},
    {"text": "The sign said: 100 mangoes in this box!",                                                                         "style": "emphasis"},
    {"text": "Xiao Ming wondered, what does 100 really mean?",                                                                  "style": "thinking"},
    {"text": "The shopkeeper explained: 100 is the same as 10 groups of 10. That's 10 tens!",                                   "style": "statement"},

    # ── Story Phase — Scene 2 (storyScene2Narration) ─────────────────────
    {"text": "Next, Xiao Ming saw bags of mangoes on the table.",                                                               "style": "statement"},
    {"text": "Each bag had exactly 10 mangoes.",                                                                                 "style": "statement"},
    {"text": "There were 4 bags, plus 7 single mangoes on the side.",                                                           "style": "statement"},
    {"text": "The shopkeeper said: That's 1 hundred, 4 tens, and 7 ones.",                                                      "style": "emphasis"},
    {"text": "Together, they make 147 mangoes!",                                                                                 "style": "statement"},

    # ── Story Phase — Scene 3 (storyScene3Narration) ─────────────────────
    {"text": "The shopkeeper showed Xiao Ming a special chart.",                                                                 "style": "statement"},
    {"text": "It had three columns: Hundreds, Tens, and Ones.",                                                                 "style": "emphasis"},
    {"text": "Each digit in a number has its own place and its own value.",                                                     "style": "statement"},
    {"text": "Now Xiao Ming understood! The position of each digit tells us how much it's worth!",                              "style": "celebration"},

    # ── Simulate Phase — Station A (simulateStationAIntro) ───────────────
    {"text": "Welcome to Station A: Build It!",                                                                                 "style": "thinking"},
    {"text": "You'll see a number on the screen. Your job is to build it using base-ten blocks.",                               "style": "statement"},
    {"text": "Drag the correct number of hundreds, tens, and ones blocks to the chart.",                                        "style": "statement"},

    # ── Simulate Phase — Station B (simulateStationBIntro) ───────────────
    {"text": "Welcome to Station B: Read It!",                                                                                  "style": "thinking"},
    {"text": "You'll see blocks arranged on the place value chart.",                                                            "style": "statement"},
    {"text": "Can you figure out what number they represent? Choose the correct answer!",                                        "style": "statement"},

    # ── Simulate Phase — Station C (simulateStationCIntro) ───────────────
    {"text": "Welcome to Station C: Compare It!",                                                                               "style": "thinking"},
    {"text": "Which number is greater?",                                                                                        "style": "question"},
    {"text": "Look at both arrangements carefully and decide: greater than, less than, or equal to?",                           "style": "statement"},

    # ── Simulate Phase — Correct Feedback (simulateCorrectNarration) ─────
    {"text": "That's correct! Well done!",                                                                                      "style": "encouragement"},
    {"text": "You're really understanding place value!",                                                                        "style": "celebration"},

    # ── Simulate Phase — Incorrect Feedback (simulateIncorrectNarration) ─
    {"text": "Not quite right, but that's okay!",                                                                               "style": "encouragement"},
    {"text": "Let's try again. Look carefully at each place value column.",                                                     "style": "thinking"},

    # ── Play Phase — Intro (playIntroNarration) ──────────────────────────
    {"text": "Now it's time to test your skills with 100 questions!",                                                           "style": "statement"},
    {"text": "Answer correctly to build your streak and earn bonus points. You've got this!",                                   "style": "encouragement"},

    # ── Play Phase — Streak Milestones (streakNarration) ─────────────────
    {"text": "Amazing! You've got a 3-question streak!",                                                                        "style": "celebration"},
    {"text": "Keep going to earn even more bonus points!",                                                                      "style": "encouragement"},
    {"text": "Incredible! 5 in a row! You're on fire!",                                                                        "style": "celebration"},
    {"text": "You're earning maximum bonus points now!",                                                                        "style": "celebration"},
    {"text": "Wow! 10 correct answers in a row! You're a place value master!",                                                  "style": "celebration"},
    {"text": "Keep up this amazing work!",                                                                                      "style": "celebration"},

    # ── Reflect Phase — Stars 3 ──────────────────────────────────────────
    {"text": "Outstanding work! You earned 3 stars!",                                                                           "style": "celebration"},
    {"text": "You've mastered numbers to 200!",                                                                                 "style": "celebration"},

    # ── Reflect Phase — Stars 2 ──────────────────────────────────────────
    {"text": "Great job! You earned 2 stars!",                                                                                  "style": "celebration"},
    {"text": "You're doing really well with place value!",                                                                      "style": "encouragement"},

    # ── Reflect Phase — Stars 1 ──────────────────────────────────────────
    {"text": "Good effort! You earned 1 star!",                                                                                 "style": "encouragement"},
    {"text": "Keep practicing and you'll get even better!",                                                                     "style": "statement"},

    # ── Reflect Phase — Stars 0 ──────────────────────────────────────────
    {"text": "Thanks for trying!",                                                                                              "style": "encouragement"},
    {"text": "Practice makes progress. Try again to improve your score!",                                                       "style": "statement"},

    # ── Reflect Phase — Common Endings ───────────────────────────────────
    {"text": "Let's review what you learned about hundreds, tens, and ones.",                                                   "style": "statement"},
    {"text": "Are you ready to see your achievements?",                                                                         "style": "question"},

    # ── Generic Helpers ──────────────────────────────────────────────────
    {"text": "Fantastic work!",                                                                                                  "style": "celebration"},
    {"text": "You're doing an amazing job!",                                                                                    "style": "celebration"},
    {"text": "Keep trying! You're learning!",                                                                                   "style": "encouragement"},
    {"text": "Every mistake helps us learn something new.",                                                                     "style": "thinking"},

    # ── Badge Narration ──────────────────────────────────────────────────
    {"text": "Outstanding work! You've mastered numbers to 200!",                                                               "style": "celebration"},
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Match the exact slugify logic from generate_audio.js for filename parity."""
    s = text.lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = s.strip("_")
    return s[:60]


async def generate_single(text: str, style: str, index: int, output_dir: str):
    """Generate a single MP3 file with style-tuned pacing."""
    settings = STYLE_SETTINGS.get(style, STYLE_SETTINGS["statement"])

    slug = slugify(text)
    filename = f"audio_{slug}_{index}.mp3"
    filepath = os.path.join(output_dir, filename)

    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate=settings["rate"],
        pitch=settings["pitch"],
    )
    await communicate.save(filepath)

    file_size = os.path.getsize(filepath)
    return filename, file_size


def write_audio_map(entries: dict, map_path: str):
    """Write the audioMap.js file matching the project's expected format."""
    timestamp = datetime.now().isoformat()

    # Build organized content with section comments
    lines = [
        "// Auto-generated audio map — DO NOT EDIT MANUALLY",
        f"// Generated: {timestamp} via edge-tts (local, no API key)",
        f"// Voice: {VOICE}",
        "// Style-tuned pacing: statement=-8%/+0Hz, question=-10%/+3Hz, thinking=-14%/+1Hz,",
        "//   emphasis=-18%/-1Hz, celebration=+2%/+5Hz, encouragement=-3%/+2Hz",
        "// Maps EXACT narration.js text strings → pre-generated .mp3 asset paths",
        "",
        "const audioMap = {",
    ]

    # Section labels for readability
    sections = [
        (0,  "Intro Screen"),
        (3,  "Wonder Phase"),
        (7,  "Story Scene 1"),
        (12, "Story Scene 2"),
        (17, "Story Scene 3"),
        (21, "Simulate Station A"),
        (24, "Simulate Station B"),
        (27, "Simulate Station C"),
        (30, "Simulate Feedback"),
        (34, "Play Phase"),
        (36, "Streak Milestones"),
        (42, "Reflect Phase"),
        (52, "Generic helpers"),
        (56, "Badge narration"),
    ]
    section_map = {s[0]: s[1] for s in sections}

    for i, (text, path) in enumerate(entries.items()):
        if i in section_map:
            if i > 0:
                lines.append("")
            lines.append(f"  // ── {section_map[i]} " + "─" * max(1, 60 - len(section_map[i])) + "──")

        # Escape quotes in text for JS string
        escaped = text.replace("\\", "\\\\").replace('"', '\\"')
        lines.append(f'  "{escaped}":')
        lines.append(f'    "{path}",')

    lines.append("};")
    lines.append("")
    lines.append("export default audioMap;")
    lines.append("")

    with open(map_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


# ── Main ─────────────────────────────────────────────────────────────────────

async def main():
    # Fix Windows console encoding
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    audio_dir = os.path.join(project_root, "public", "assets", "audio")
    map_path = os.path.join(project_root, "src", "utils", "audioMap.js")

    os.makedirs(audio_dir, exist_ok=True)

    print()
    print("[*] Place Value Module -- Local Audio Generation")
    print("=" * 55)
    print(f"   Voice:    {VOICE}")
    print(f"   Phrases:  {len(PHRASES)}")
    print(f"   Output:   {audio_dir}")
    print()

    audio_map_entries = {}
    generated = 0
    failed = 0
    total_bytes = 0

    for i, phrase in enumerate(PHRASES):
        text = phrase["text"]
        style = phrase["style"]
        short = text[:55] + ("…" if len(text) > 55 else "")

        print(f"[{str(i + 1).rjust(2)}/{len(PHRASES)}] ({style:14s}) \"{short}\"")

        try:
            filename, file_size = await generate_single(text, style, i, audio_dir)
            slug = slugify(text)
            asset_path = f"/assets/audio/audio_{slug}_{i}.mp3"
            audio_map_entries[text] = asset_path
            total_bytes += file_size
            generated += 1
            print(f"       ✓ {filename}  ({file_size:,} bytes)")
        except Exception as e:
            print(f"       ✗ Failed: {e}")
            failed += 1

    # Write audioMap.js
    write_audio_map(audio_map_entries, map_path)

    print()
    print("=" * 55)
    print(f"✅  Generated: {generated}   ❌ Failed: {failed}")
    print(f"📦  Total size: {total_bytes:,} bytes ({total_bytes / 1024 / 1024:.1f} MB)")
    print(f"📄  audioMap → src/utils/audioMap.js")
    print()

    if failed > 0:
        print("⚠️   Some files failed. Re-run to retry.")
    else:
        print("🎉  All audio files generated successfully!")
        print("    Next: node scripts/clean_audio.js  (remove orphaned mp3s)")
    print()


if __name__ == "__main__":
    asyncio.run(main())
