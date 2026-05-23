import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { ScoreBar } from '../game/ScoreBar';
import QuestionCard from '../game/QuestionCard';
import Mascot from '../shared/Mascot';
import SpeechBubble from '../shared/SpeechBubble';
import Confetti from '../shared/Confetti';
import { buildSessionQuestions } from '../../utils/questionEngine';
import { narrate, stopNarration } from '../../utils/audio';
import { playIntroNarration, streakNarration } from '../../utils/narration';

const ZONES = [
  { name:'🏠 Number Village', range:[0,24] },
  { name:'🔺 Teen Town',      range:[25,49] },
  { name:'🌾 Fifty Fields',   range:[50,74] },
  { name:'🏙️ Century City',  range:[75,99] },
];
const getZone = (idx) => ZONES.find(z => idx >= z.range[0] && idx <= z.range[1])?.name || ZONES[0].name;

/* ── Streak banner ───────────────────────────────────────────────────── */
function StreakBanner({ streak, visible }) {
  const MAP = {
    3:  { txt:'🔥 3 in a row! Bonus ×2!', bg:'linear-gradient(135deg,#EC4899,#be185d)' },
    5:  { txt:'🔥🔥 5 streak! Bonus ×3!', bg:'linear-gradient(135deg,#F59E0B,#d97706)' },
    10: { txt:'🏆 10 streak! Legend!',     bg:'linear-gradient(135deg,#10B981,#059669)' },
  };
  const info = MAP[streak];
  if (!info) return null;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{opacity:0, y:-24, scale:0.88}}
          animate={{opacity:1, y:0, scale:1}}
          exit={{opacity:0, y:-16, scale:0.9}}
          transition={{type:'spring', stiffness:300, damping:22}}
          style={{
            background:info.bg, borderRadius:50,
            padding:'8px 26px', textAlign:'center',
            fontWeight:900, fontSize:'1rem', color:'white',
            marginBottom:10, boxShadow:'0 6px 24px rgba(0,0,0,0.3)',
            fontFamily:'var(--font-body)',
          }}
        >
          {info.txt}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Floating +10 point indicator ───────────────────────────────────── */
function PointPop({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{opacity:1, y:0, scale:1}}
          animate={{opacity:0, y:-50, scale:1.3}}
          exit={{}}
          transition={{duration:0.9, ease:'easeOut'}}
          style={{
            position:'fixed', top:20, right:20, zIndex:999,
            background:'linear-gradient(135deg,#F59E0B,#f97316)',
            color:'#0a0820', fontWeight:900, fontSize:'1.1rem',
            padding:'8px 18px', borderRadius:50,
            boxShadow:'0 4px 18px rgba(245,158,11,0.5)',
            fontFamily:'var(--font-body)',
            pointerEvents:'none',
          }}
        >
          +10 ⭐
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PlayPhase() {
  const {
    advancePhase, audioEnabled,
    score, streak, questionsAnswered, questionsCorrect,
    sessionQuestions, currentQuestionIndex,
    setSessionQuestions, advanceQuestion, answerCorrect, answerIncorrect,
    calculateStars, awardBadge,
  } = useGame();

  const [started,      setStarted]      = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lives,        setLives]        = useState(3);
  const [streakVal,    setStreakVal]     = useState(0);
  const [showBanner,   setShowBanner]   = useState(false);
  const [showPop,      setShowPop]      = useState(false);

  useEffect(() => {
    if (sessionQuestions.length === 0) setSessionQuestions(buildSessionQuestions());
  }, []);

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const isFinished = questionsAnswered >= 100 || currentQuestionIndex >= sessionQuestions.length;
  const zoneName = getZone(currentQuestionIndex);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      answerCorrect();
      setShowPop(true);
      setTimeout(() => setShowPop(false), 900);
      const ns = streak + 1;
      if ([3,5,10].includes(ns)) {
        setStreakVal(ns); setShowBanner(true); setShowConfetti(true);
        if (audioEnabled) narrate(streakNarration(ns), true);
        setTimeout(() => { setShowBanner(false); setShowConfetti(false); }, 3000);
      }
    } else {
      answerIncorrect();
      setLives(l => Math.max(0, l - 1));
    }
    advanceQuestion();
  };

  const handleFinish = () => {
    calculateStars();
    const acc = questionsAnswered > 0 ? (questionsCorrect / questionsAnswered) * 100 : 0;
    awardBadge(acc >= 90 ? 'place-value-master' : acc >= 70 ? 'place-value-explorer' : 'place-value-learner');
    stopNarration();
    advancePhase();
  };

  /* ── Start screen ──────────────────────────────────────────────────── */
  if (!started) {
    return (
      <div style={{
        minHeight:'80vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'var(--space-xl)', textAlign:'center',
      }}>
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring'}}
          style={{fontSize:'5rem', marginBottom:'var(--space-xl)'}}>🎮</motion.div>
        <h2 style={{color:'var(--accent-gold)', marginBottom:'var(--space-md)'}}>Ready to Play?</h2>
        <p style={{maxWidth:500, marginBottom:'var(--space-xl)'}}>
          100 questions on <strong style={{color:'var(--accent-gold)'}}>place value</strong>!
          Build streaks for bonus points. You have 3 lives!
        </p>
        <div className="glass-card" style={{maxWidth:380, marginBottom:'var(--space-xl)', textAlign:'left', width:'100%'}}>
          <h3 style={{color:'var(--accent-gold)', marginBottom:'var(--space-md)', fontSize:'1.1rem'}}>⭐ Scoring</h3>
          {[['Correct answer','+10 pts'],['3-streak bonus','+10 pts'],['5+ streak bonus','+20 pts']].map(([l,p]) => (
            <div key={l} style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
              <span style={{color:'var(--text-secondary)'}}>{l}</span>
              <span style={{color:'var(--accent-gold)', fontWeight:700, fontFamily:'var(--font-mono)'}}>{p}</span>
            </div>
          ))}
        </div>
        <Mascot mood="happy" size={80} />
        <div style={{marginBottom:'var(--space-xl)'}}>
          <SpeechBubble text="Build your streak to earn bonus points! You've got this! 💪" />
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => { setStarted(true); if (audioEnabled) narrate(playIntroNarration(), true); }}
          whileHover={{scale:1.06}} whileTap={{scale:0.96}}
          style={{fontSize:'1.2rem', padding:'15px 42px'}}
        >
          🚀 Start Playing!
        </motion.button>
      </div>
    );
  }

  /* ── Finished screen ───────────────────────────────────────────────── */
  if (isFinished) {
    const acc = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;
    return (
      <motion.div
        initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
        style={{
          minHeight:'80vh', display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:'var(--space-xl)', textAlign:'center',
        }}
      >
        <Confetti active />
        <div style={{fontSize:'5rem', marginBottom:'var(--space-lg)'}}>🏆</div>
        <h2 style={{color:'var(--accent-gold)', marginBottom:'var(--space-md)'}}>All Done!</h2>
        <div className="glass-card" style={{maxWidth:380, marginBottom:'var(--space-xl)', width:'100%'}}>
          {[['Score',score,'#F59E0B','1.5rem'],['Accuracy',`${acc}%`,acc>=70?'#10B981':'#EF4444','1.5rem'],
            ['Correct',`${questionsCorrect} / ${questionsAnswered}`,'white','1.1rem']].map(([l,v,c,s]) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <span style={{color:'var(--text-secondary)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:s,color:c,fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
        <Mascot mood="happy" size={80} />
        <div style={{marginBottom:'var(--space-xl)'}}>
          <SpeechBubble text={acc>=70?"You're a number star! ⭐":"Great effort! Keep practising!"} />
        </div>
        <motion.button
          className="btn btn-primary" onClick={handleFinish}
          whileHover={{scale:1.05}} whileTap={{scale:0.95}}
          style={{fontSize:'1.2rem',padding:'14px 40px'}}
        >
          ⭐ See My Results!
        </motion.button>
      </motion.div>
    );
  }

  /* ── Main play screen — everything on one viewport ─────────────────── */
  return (
    <div style={{
      /* Outer wrapper fills viewport minus topbar, no overflow */
      height: 'calc(100vh - 60px)',
      display:'flex', flexDirection:'column',
      padding:'12px 14px 14px',
      maxWidth:640, margin:'0 auto',
      overflow:'hidden',  /* prevent scroll */
    }}>
      <Confetti active={showConfetti} duration={3000} />
      <PointPop show={showPop} />

      {/* Score bar — fixed compact height */}
      <div style={{flexShrink:0}}>
        <ScoreBar
          score={score} streak={streak}
          questionsAnswered={questionsAnswered} totalQuestions={100}
          locationName={zoneName} lives={lives}
        />
      </div>

      <StreakBanner streak={streakVal} visible={showBanner} />

      {/* Question card — fills remaining space, no scroll */}
      <div style={{flex:1, minHeight:0, overflow:'hidden'}}>
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              onAnswer={handleAnswer}
              questionNumber={currentQuestionIndex + 1}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
