// Audio Cleanup Script for Numbers to 200
// Removes orphaned .mp3 files not referenced in audioMap.js
// Run: node scripts/clean_audio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🧹 Starting audio cleanup...\n');

  // Import audioMap
  const audioMapPath = path.join(__dirname, '..', 'src', 'utils', 'audioMap.js');
  
  if (!fs.existsSync(audioMapPath)) {
    console.error('❌ audioMap.js not found. Run generate_audio.js first.');
    return;
  }

  const audioMapModule = await import(pathToFileURL(audioMapPath).href);
  const audioMap = audioMapModule.audioMap || audioMapModule.default;
  
  // Get all referenced files
  const referencedFiles = new Set(
    Object.values(audioMap).map(p => path.basename(p))
  );

  console.log(`📋 Found ${referencedFiles.size} referenced audio files in audioMap.js\n`);

  // Scan audio directory
  const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio');
  
  if (!fs.existsSync(audioDir)) {
    console.log('✓ No audio directory found. Nothing to clean.');
    return;
  }

  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
  console.log(`📁 Found ${files.length} .mp3 files in audio directory\n`);

  let deletedCount = 0;

  for (const file of files) {
    if (!referencedFiles.has(file)) {
      const filepath = path.join(audioDir, file);
      fs.unlinkSync(filepath);
      console.log(`🗑️  Deleted orphaned file: ${file}`);
      deletedCount++;
    }
  }

  if (deletedCount === 0) {
    console.log('✓ No orphaned files found. Audio directory is clean!');
  } else {
    console.log(`\n✓ Cleanup complete! Deleted ${deletedCount} orphaned file(s).`);
  }
}

main().catch(console.error);
