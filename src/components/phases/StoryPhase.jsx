import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { narrate, stopNarration, preloadNarration } from '../../utils/audio';
import { storyScene1Narration, storyScene2Narration, storyScene3Narration } from '../../utils/narration';
import STORY_IMAGES from '../../config/storyImages.js';

/* ─── Inline place-value chart for scene 4 ──────────────────────────── */
function MiniPlaceChart({ number, label }) {
  const h = Math.floor(number / 100);
  const t = Math.floor((number % 100) / 10);
  const o = number % 10;
  const cols = [
    { name:'H', val:h, color:'#ef4444', bg:'rgba(239,68,68,0.18)' },
    { name:'T', val:t, color:'#3b82f6', bg:'rgba(59,130,246,0.18)' },
    { name:'O', val:o, color:'#f59e0b', bg:'rgba(245,158,11,0.18)' },
  ];
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', marginBottom:6 }}>{label}</div>
      <div style={{ display:'flex', border:'2px solid rgba(255,255,255,0.12)', borderRadius:10, overflow:'hidden' }}>
        {cols.map((c,i) => (
          <div key={c.name} style={{
            flex:1, textAlign:'center', padding:'6px 8px',
            borderRight: i<2 ? '1px solid rgba(255,255,255,0.12)' : 'none',
            background: c.bg,
          }}>
            <div style={{ fontSize:'0.62rem', fontWeight:800, color:c.color, textTransform:'uppercase', letterSpacing:0.5 }}>{c.name}</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:c.color, lineHeight:1.1 }}>{c.val}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'white', marginTop:6 }}>{number}</div>
    </div>
  );
}

/* ─── Scene 4 visual: comparing two numbers ─────────────────────────── */
function CompareVisual() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        <MiniPlaceChart number={120} label="Number A" />
        <motion.div
          animate={{ scale:[1,1.15,1] }} transition={{ repeat:Infinity, duration:1.8 }}
          style={{
            width:48, height:48, borderRadius:'50%',
            background:'linear-gradient(135deg,#7C3AED,#a855f7)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.4rem', fontWeight:900, color:'white',
            boxShadow:'0 0 20px rgba(124,58,237,0.5)',
          }}
        >
          &gt;
        </motion.div>
        <MiniPlaceChart number={98} label="Number B" />
      </div>
      <motion.div
        initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.6}}
        style={{
          background:'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(16,185,129,0.1))',
          border:'2px solid rgba(16,185,129,0.4)',
          borderRadius:12, padding:'10px 22px',
          fontFamily:'var(--font-display)', fontSize:'1rem', color:'#10B981',
          textAlign:'center',
        }}
      >
        120 has more hundreds → 120 is greater!
      </motion.div>
    </div>
  );
}

/* ─── SCENE DEFINITIONS ─────────────────────────────────────────────── */
const SCENES = [
  {
    id: 1,
    title: '100 Mangoes at Pasar Malam!',
    paragraph: 'Xiao Ming visited Pasar Malam Singapore with his friends. They saw a big wooden crate packed with 100 juicy mangoes! "Wow!" said Xiao Ming. "That\'s 10 rows × 10 mangoes = 100!"',
    quote: '⭐ 100 = 10 tens = One Hundred',
    narration: storyScene1Narration,
    mascotSpeech: "Wow! 100 mangoes! That's One Hundred! 🥭",
    mascotMood: 'happy',
    image: STORY_IMAGES.scene1,
    accentColor: '#f59e0b',
  },
  {
    id: 2,
    title: 'Place Value is Everywhere!',
    paragraph: '100 is a very special number! The shopkeeper showed that 100 mangoes in the crate is the same as 10 tens. Look at the place value chart: 1 in the Hundreds place, 0 in Tens, 0 in Ones!',
    quote: '100 = 10 tens and 0 ones!',
    narration: storyScene2Narration,
    mascotSpeech: '100 mangoes = 1 hundred! 🔢',
    mascotMood: 'thinking',
    image: STORY_IMAGES.scene2,
    accentColor: '#3b82f6',
  },
  {
    id: 3,
    title: "Let's Build 147!",
    paragraph: 'Then the shopkeeper added 4 bags of 10 mangoes and 7 single mangoes. Now we can see: 1 hundred + 4 tens + 7 ones = 147! The Place Value Chart makes it easy to read!',
    quote: '100 + 40 + 7 = 147 🎉',
    narration: storyScene3Narration,
    mascotSpeech: '1 hundred, 4 tens, 7 ones = 147! 🧮',
    mascotMood: 'happy',
    image: STORY_IMAGES.scene3,
    accentColor: '#10b981',
  },
  {
    id: 4,
    title: 'Bigger Numbers, Same Rules!',
    paragraph: 'Place value works for ALL numbers! To compare 120 and 98, look at the hundreds place first. 120 has 1 hundred, but 98 has 0 hundreds. So 120 is always greater than 98!',
    quote: null,
    narration: storyScene3Narration,
    mascotSpeech: 'Compare the hundreds first! 🏆',
    mascotMood: 'happy',
    image: null,
    accentColor: '#7c3aed',
    customVisual: <CompareVisual />,
  },
];

export default function StoryPhase() {
  const { advancePhase, audioEnabled } = useGame();
  const [sceneIndex, setSceneIndex] = useState(0);
  const narrationRef = useRef(null);

  const scene = SCENES[sceneIndex];
  const isLast = sceneIndex === SCENES.length - 1;

  // Preload current AND next scene's audio eagerly
  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(scene.narration());
      if (sceneIndex + 1 < SCENES.length) {
        preloadNarration(SCENES[sceneIndex + 1].narration());
      }
    }
  }, [sceneIndex, audioEnabled]);

  // Play narration after a short delay (100ms after scene change)
  useEffect(() => {
    if (audioEnabled) {
      narrationRef.current?.cancel();
      const timer = setTimeout(() => {
        narrationRef.current = narrate(scene.narration(), true);
      }, 200);
      return () => {
        clearTimeout(timer);
        narrationRef.current?.cancel();
      };
    }
    return () => { narrationRef.current?.cancel(); };
  }, [sceneIndex, audioEnabled]);

  const go = (dir) => {
    narrationRef.current?.cancel();
    stopNarration();
    if (dir === 1 && !isLast) setSceneIndex(s => s + 1);
    else if (dir === 1 && isLast) advancePhase();
    else if (dir === -1 && sceneIndex > 0) setSceneIndex(s => s - 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 14px 90px',
      maxWidth: 660, margin: '0 auto', width: '100%',
    }}>
      {/* Progress bar */}
      <div style={{ width:'100%', display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
          <motion.div
            style={{ height:'100%', borderRadius:3,
              background:`linear-gradient(90deg, ${scene.accentColor}cc, ${scene.accentColor})` }}
            animate={{ width:`${((sceneIndex+1)/SCENES.length)*100}%` }}
            transition={{ duration:0.45 }}
          />
        </div>
        <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.38)', fontWeight:700, whiteSpace:'nowrap' }}>
          {sceneIndex+1} / {SCENES.length}
        </span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIndex}
          initial={{ opacity:0, x:50, scale:0.97 }}
          animate={{ opacity:1, x:0, scale:1 }}
          exit={{ opacity:0, x:-50, scale:0.97 }}
          transition={{ duration:0.32, ease:'easeOut' }}
          style={{
            width:'100%',
            background:'rgba(16,10,46,0.94)',
            borderRadius:22,
            overflow:'hidden',
            border:`1px solid ${scene.accentColor}33`,
            boxShadow:`0 16px 56px rgba(0,0,0,0.65), 0 0 0 1px ${scene.accentColor}18`,
          }}
        >
          {/* Image or custom visual */}
          {scene.image ? (
            <div style={{ width:'100%', height:210, overflow:'hidden', position:'relative' }}>
              <img
                src={scene.image}
                alt={scene.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }}
              />
              {/* gradient fade into card */}
              <div style={{
                position:'absolute', bottom:0, left:0, right:0, height:70,
                background:'linear-gradient(transparent, rgba(16,10,46,0.94))',
              }} />
            </div>
          ) : scene.customVisual ? (
            <div style={{
              padding:'22px 20px 18px',
              background:`linear-gradient(180deg, ${scene.accentColor}12 0%, transparent 100%)`,
              borderBottom:`1px solid ${scene.accentColor}22`,
            }}>
              {scene.customVisual}
            </div>
          ) : null}

          {/* Text content */}
          <div style={{ padding:'18px 22px 22px' }}>
            <h2 style={{
              fontFamily:'var(--font-display)',
              color: scene.accentColor,
              fontSize:'1.35rem', marginBottom:9, lineHeight:1.2,
            }}>
              {scene.title}
            </h2>

            <p style={{
              color:'rgba(255,255,255,0.88)', fontSize:'1rem',
              lineHeight:1.7, marginBottom: scene.quote ? 12 : 0,
            }}>
              {scene.paragraph}
            </p>

            {scene.quote && (
              <motion.div
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                style={{
                  background:`${scene.accentColor}1a`,
                  border:`1.5px solid ${scene.accentColor}44`,
                  borderRadius:11, padding:'10px 16px',
                  textAlign:'center', color:'rgba(255,255,255,0.88)',
                  fontWeight:800, fontSize:'0.93rem', letterSpacing:0.2,
                }}
              >
                ✨ {scene.quote} ✨
              </motion.div>
            )}

            {/* Mascot + speech */}
            <div style={{ display:'flex', alignItems:'center', gap:11, marginTop:16 }}>
              <motion.div
                animate={scene.mascotMood==='happy'
                  ? { scale:[1,1.1,1], rotate:[0,-4,4,0] }
                  : { y:[0,-6,0] }}
                transition={scene.mascotMood==='happy'
                  ? { duration:0.7 }
                  : { duration:2.5, repeat:Infinity }}
                style={{
                  width:40, height:40, borderRadius:'50%',
                  background:`linear-gradient(135deg, ${scene.accentColor}, ${scene.accentColor}99)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.3rem', flexShrink:0,
                  boxShadow:`0 2px 12px ${scene.accentColor}44`,
                }}
              >
                🐻
              </motion.div>
              <motion.div
                initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.55 }}
                style={{
                  background:'white', color:'#12103a',
                  borderRadius:'12px 12px 12px 3px',
                  padding:'8px 13px', fontSize:'0.88rem',
                  fontWeight:800, boxShadow:'0 2px 10px rgba(0,0,0,0.2)',
                  maxWidth:260, lineHeight:1.4,
                }}
              >
                {scene.mascotSpeech}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px 18px 20px',
        background:'linear-gradient(transparent, rgba(8,8,32,0.98) 28%)',
      }}>
        <button
          onClick={() => go(-1)}
          disabled={sceneIndex === 0}
          style={{
            background: sceneIndex===0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.09)',
            border:'2px solid rgba(255,255,255,0.13)',
            color: sceneIndex===0 ? 'rgba(255,255,255,0.2)' : 'white',
            borderRadius:50, padding:'10px 22px',
            fontWeight:800, fontSize:'0.88rem', cursor: sceneIndex===0 ? 'default' : 'pointer',
            fontFamily:'var(--font-body)',
          }}
        >
          ← Back
        </button>

        <div style={{ display:'flex', gap:7, alignItems:'center' }}>
          {SCENES.map((_,i) => (
            <div key={i} style={{
              width: i===sceneIndex ? 22 : 8, height:8, borderRadius:4,
              background: i===sceneIndex ? scene.accentColor : i<sceneIndex ? `${scene.accentColor}66` : 'rgba(255,255,255,0.14)',
              transition:'all 0.3s ease',
            }} />
          ))}
        </div>

        <motion.button
          onClick={() => go(1)}
          whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
          style={{
            background: isLast
              ? 'linear-gradient(135deg,#10B981,#059669)'
              : `linear-gradient(135deg, ${scene.accentColor}, ${scene.accentColor}cc)`,
            color: isLast ? 'white' : '#0a0820',
            border:'none', borderRadius:50, padding:'11px 22px',
            fontWeight:900, fontSize:'0.92rem', cursor:'pointer',
            fontFamily:'var(--font-body)',
            boxShadow: isLast ? '0 4px 16px rgba(16,185,129,0.4)' : `0 4px 16px ${scene.accentColor}44`,
          }}
        >
          {isLast ? '🚀 Let\'s Explore!' : 'Next →'}
        </motion.button>
      </div>
    </div>
  );
}
