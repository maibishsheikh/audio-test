import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './context/GameContext';
import IntroScreen   from './components/IntroScreen';
import WonderPhase   from './components/phases/WonderPhase';
import StoryPhase    from './components/phases/StoryPhase';
import SimulatePhase from './components/phases/SimulatePhase';
import PlayPhase     from './components/phases/PlayPhase';
import ReflectPhase  from './components/phases/ReflectPhase';
import FloatingNumbers from './components/shared/FloatingNumbers';
import AudioToggle   from './components/shared/AudioToggle';
import PhaseNav      from './components/shared/PhaseNav';

const transitions = {
  default:  { initial:{opacity:0,y:20},  animate:{opacity:1,y:0},  exit:{opacity:0,y:-20}, transition:{duration:0.35} },
  story:    { initial:{opacity:0},       animate:{opacity:1},       exit:{opacity:0},       transition:{duration:0.3} },
  simulate: { initial:{opacity:0,x:80},  animate:{opacity:1,x:0},  exit:{opacity:0,x:-80}, transition:{duration:0.35} },
  play:     { initial:{opacity:0,scale:0.9}, animate:{opacity:1,scale:1}, exit:{opacity:0}, transition:{duration:0.4,type:'spring',stiffness:220} },
};

export default function App() {
  const { phase, resetGame } = useGame();

  const phaseComponents = {
    intro:    <IntroScreen />,
    wonder:   <WonderPhase />,
    story:    <StoryPhase />,
    simulate: <SimulatePhase />,
    play:     <PlayPhase />,
    reflect:  <ReflectPhase />,
  };

  const t = transitions[phase] || transitions.default;
  const showNav = phase !== 'intro';

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      <FloatingNumbers />

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      {showNav && (
        <div style={{
          position:'fixed', top:0, left:0, right:0,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'8px 14px', zIndex:1000,
          background:'linear-gradient(rgba(8,8,32,0.88),transparent)',
          backdropFilter:'blur(6px)',
        }}>
          {/* Home */}
          <button
            onClick={resetGame}
            style={{
              background:'rgba(30,18,80,0.9)',
              border:'1px solid rgba(255,255,255,0.18)',
              borderRadius:50, color:'white',
              padding:'7px 16px',
              fontFamily:'var(--font-body)', fontWeight:800, fontSize:'0.82rem',
              cursor:'pointer', display:'flex', alignItems:'center', gap:5,
            }}
          >
            🏠 Home
          </button>

          <PhaseNav />

          {/* Audio + close */}
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <AudioToggle inline />
            <button
              onClick={resetGame}
              style={{
                width:34, height:34,
                background:'rgba(124,58,237,0.6)',
                border:'none', borderRadius:8,
                color:'white', cursor:'pointer',
                fontSize:'1rem', fontWeight:900,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}
              title="Exit module"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {!showNav && <AudioToggle />}

      {/* ── Phase content ─────────────────────────────────────────────── */}
      <div style={{ paddingTop: showNav ? 58 : 0 }}>
        <AnimatePresence mode="wait">
          <motion.div key={phase} {...t}>
            {phaseComponents[phase]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
