import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decompose } from '../../utils/placeValue';

/* ─── COMPACT Blocks visual — constrained height ────────────────────── */
function BlocksVisual({ number }) {
  const { hundreds, tens, ones } = decompose(number);
  // Compact: flat squares for hundreds, vertical bars for tens, dots for ones
  return (
    <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center', flexWrap:'wrap' }}>
      {/* Hundreds */}
      {hundreds > 0 && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', maxWidth:90 }}>
            {Array.from({length:hundreds}).map((_,i) => (
              <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.07,type:'spring',stiffness:300}}
                style={{
                  width:38, height:38, borderRadius:6,
                  background:'linear-gradient(135deg,#F59E0B,#d97706)',
                  display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:1, padding:3,
                  boxShadow:'0 2px 8px rgba(245,158,11,0.4)',
                }}>
                {Array.from({length:25}).map((_,j) => <div key={j} style={{background:'rgba(255,255,255,0.3)',borderRadius:1}} />)}
              </motion.div>
            ))}
          </div>
          <div style={{marginTop:4,fontSize:'0.72rem',color:'#F59E0B',fontWeight:800}}>
            {hundreds} hundred{hundreds>1?'s':''}
          </div>
        </div>
      )}
      {/* Tens */}
      {tens > 0 && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', maxWidth:80 }}>
            {Array.from({length:tens}).map((_,i) => (
              <motion.div key={i} initial={{scaleY:0}} animate={{scaleY:1}} transition={{delay:0.15+i*0.06,type:'spring'}}
                style={{
                  width:11, height:52, borderRadius:4,
                  background:'linear-gradient(180deg,#7C3AED,#5b21b6)',
                  display:'flex', flexDirection:'column', gap:1, padding:2,
                  boxShadow:'0 2px 8px rgba(124,58,237,0.4)',
                }}>
                {Array.from({length:8}).map((_,j) => <div key={j} style={{flex:1,background:'rgba(255,255,255,0.28)',borderRadius:1}} />)}
              </motion.div>
            ))}
          </div>
          <div style={{marginTop:4,fontSize:'0.72rem',color:'#7C3AED',fontWeight:800}}>
            {tens} ten{tens>1?'s':''}
          </div>
        </div>
      )}
      {/* Ones */}
      {ones > 0 && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, maxWidth:72, justifyContent:'center' }}>
            {Array.from({length:ones}).map((_,i) => (
              <motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:0.3+i*0.05,type:'spring'}}
                style={{
                  width:16, height:16, borderRadius:4,
                  background:'linear-gradient(135deg,#3B82F6,#2563eb)',
                  boxShadow:'0 1px 5px rgba(59,130,246,0.4)',
                }} />
            ))}
          </div>
          <div style={{marginTop:4,fontSize:'0.72rem',color:'#3B82F6',fontWeight:800}}>
            {ones} one{ones>1?'s':''}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── COMPACT Chart visual ───────────────────────────────────────────── */
function ChartVisual({ number }) {
  const { hundreds, tens, ones } = decompose(number);
  const cols = [
    { label:'Hundreds', value:hundreds, color:'#F59E0B', bg:'rgba(245,158,11,0.13)', border:'rgba(245,158,11,0.35)' },
    { label:'Tens',     value:tens,     color:'#7C3AED', bg:'rgba(124,58,237,0.13)', border:'rgba(124,58,237,0.35)' },
    { label:'Ones',     value:ones,     color:'#3B82F6', bg:'rgba(59,130,246,0.13)', border:'rgba(59,130,246,0.35)' },
  ];
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {cols.map((col,i) => (
        <motion.div key={col.label}
          initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.12}}
          style={{ textAlign:'center', padding:'10px 14px', background:col.bg,
            borderRadius:12, border:`2px solid ${col.border}`, minWidth:72 }}>
          <div style={{fontSize:'0.65rem',color:col.color,fontWeight:800,textTransform:'uppercase',letterSpacing:0.8,marginBottom:3}}>
            {col.label}
          </div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:700,color:col.color,lineHeight:1}}>
            {col.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Feedback overlay — centred on FULL viewport ────────────────────── */
function FeedbackOverlay({ show, isCorrect, explanation }) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Blurred backdrop */}
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            transition={{duration:0.18}}
            style={{
              position:'fixed', inset:0,
              background:'rgba(4,4,20,0.72)',
              zIndex:900,
              backdropFilter:'blur(5px)',
            }}
          />

          {/* Card — dead centre */}
          <motion.div
            initial={{scale:0.55, opacity:0, y:30}}
            animate={{scale:1, opacity:1, y:0}}
            exit={{scale:0.8, opacity:0, y:16}}
            transition={{type:'spring', stiffness:360, damping:28}}
            style={{
              position:'fixed',
              top:'50%', left:'50%',
              transform:'translate(-50%,-50%)',
              zIndex:901,
              width:'min(86vw, 360px)',
              background: isCorrect
                ? 'linear-gradient(150deg,#064e3b 0%,#065f46 100%)'
                : 'linear-gradient(150deg,#7f1d1d 0%,#991b1b 100%)',
              border: `2.5px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
              borderRadius:24,
              padding:'32px 24px 28px',
              textAlign:'center',
              boxShadow: isCorrect
                ? '0 28px 90px rgba(16,185,129,0.55)'
                : '0 28px 90px rgba(239,68,68,0.55)',
            }}
          >
            {/* Big animated emoji */}
            <motion.div
              initial={{scale:0, rotate:-15}}
              animate={{scale:1, rotate:0}}
              transition={{delay:0.08, type:'spring', stiffness:420}}
              style={{fontSize:'4rem', marginBottom:10, display:'block', lineHeight:1}}
            >
              {isCorrect ? '🎉' : '😢'}
            </motion.div>

            {/* Title */}
            <div style={{
              fontFamily:'var(--font-display)',
              fontSize:'2rem', color:'white', marginBottom:10,
            }}>
              {isCorrect ? 'Correct! 🎊' : 'Not quite!'}
            </div>

            {/* Explanation */}
            {explanation && (
              <div style={{
                fontSize:'0.97rem', color:'rgba(255,255,255,0.88)',
                lineHeight:1.6, fontWeight:600, fontFamily:'var(--font-body)',
              }}>
                {explanation}
              </div>
            )}

            {/* Check / X circle */}
            <motion.div
              initial={{scale:0}} animate={{scale:1}} transition={{delay:0.22,type:'spring'}}
              style={{
                margin:'18px auto 0',
                width:46, height:46, borderRadius:'50%',
                background: isCorrect ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)',
                border:`2px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.5rem',
              }}
            >
              {isCorrect ? '✓' : '✗'}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Question-change flash ring ─────────────────────────────────────── */
function QuestionFlash({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{opacity:0.7}} animate={{opacity:0}} exit={{}}
          transition={{duration:0.4, ease:'easeOut'}}
          style={{
            position:'fixed', inset:0,
            background:'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(245,158,11,0.15))',
            zIndex:50, pointerEvents:'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Main QuestionCard ───────────────────────────────────────────────── */
export default function QuestionCard({ question, onAnswer, questionNumber }) {
  const [selected,     setSelected]     = useState(null);
  const [answered,     setAnswered]     = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFlash,    setShowFlash]    = useState(false);
  const prevId = useRef(null);

  useEffect(() => {
    if (!question) return;
    if (prevId.current !== null && prevId.current !== question.id) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 420);
    }
    prevId.current = question.id;
    setSelected(null);
    setAnswered(false);
    setShowFeedback(false);
  }, [question?.id]);

  if (!question) return null;

  const handleSelect = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    setShowFeedback(true);
    const isCorrect = opt === question.correct;
    setTimeout(() => {
      setShowFeedback(false);
      setTimeout(() => onAnswer && onAnswer(isCorrect, opt), 100);
    }, isCorrect ? 1300 : 2600);
  };

  const isCorrect = selected === question.correct;

  const getState = (opt) => {
    if (!answered) return 'idle';
    if (opt === question.correct) return 'correct';
    if (opt === selected) return 'wrong';
    return 'idle';
  };

  const hasVisual = !!question.visual;

  return (
    <>
      <QuestionFlash show={showFlash} />
      <FeedbackOverlay show={showFeedback} isCorrect={isCorrect} explanation={question.explanation} />

      <motion.div
        key={question.id}
        initial={{opacity:0, scale:0.93, y:20}}
        animate={{opacity:1, scale:1, y:0}}
        exit={{opacity:0, scale:0.95, y:-14}}
        transition={{duration:0.3, ease:'easeOut'}}
        style={{
          background:'rgba(20,12,56,0.97)',
          borderRadius:22,
          padding: hasVisual ? '20px 18px 18px' : '26px 20px 20px',
          boxShadow:'0 12px 50px rgba(0,0,0,0.55)',
          border:'1px solid rgba(124,58,237,0.22)',
        }}
      >
        {/* Question number chip */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
          <div style={{
            background:'rgba(124,58,237,0.18)', border:'1px solid rgba(124,58,237,0.38)',
            borderRadius:50, padding:'3px 14px',
            fontSize:'0.72rem', fontWeight:800, color:'#c4b5fd', letterSpacing:0.4,
          }}>
            Question {questionNumber}
          </div>
        </div>

        {/* Question text */}
        <div style={{
          fontFamily:'var(--font-display)',
          fontSize: hasVisual ? '1.3rem' : '1.55rem',
          color:'white', textAlign:'center',
          marginBottom: hasVisual ? 14 : 20,
          lineHeight:1.35,
        }}>
          {question.prompt}
        </div>

        {/* Visual — compact */}
        {question.visual && (
          <div style={{
            margin:'0 0 14px',
            padding:'14px 12px',
            background:'rgba(0,0,0,0.22)',
            borderRadius:14,
            border:'1px solid rgba(255,255,255,0.06)',
          }}>
            {question.visual === 'blocks' && <BlocksVisual number={question.targetNumber} />}
            {question.visual === 'chart'  && <ChartVisual  number={question.targetNumber} />}
          </div>
        )}

        {/* 2×2 answer grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {question.options.map((opt, idx) => (
            <OptionButton
              key={opt}
              label={opt}
              index={idx}
              state={getState(opt)}
              disabled={answered}
              onClick={() => handleSelect(opt)}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Option button ──────────────────────────────────────────────────── */
const ACCENT = ['#7C3AED','#2563EB','#059669','#D97706'];
const LETTER = ['A','B','C','D'];

function OptionButton({ label, index, state, disabled, onClick }) {
  const idle    = state === 'idle';
  const correct = state === 'correct';
  const wrong   = state === 'wrong';
  const accent  = ACCENT[index % 4];

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      initial={{opacity:0, y:8}}
      animate={{
        opacity:1, y:0,
        scale: correct ? [1,1.06,1] : 1,
        x: wrong ? [-5,5,-4,4,0] : 0,
      }}
      transition={{
        opacity:{delay:index*0.07, duration:0.22},
        y:{delay:index*0.07, duration:0.22},
        scale:{duration:0.38},
        x:{duration:0.32},
      }}
      whileHover={!disabled && idle ? {scale:1.04, y:-2} : {}}
      whileTap={!disabled && idle ? {scale:0.97} : {}}
      style={{
        minHeight:60,
        width:'100%',
        padding:'12px 14px',
        borderRadius:15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily:'var(--font-display)',
        fontSize:'1.35rem',
        fontWeight:700,
        outline:'none',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'background 0.15s, border-color 0.15s, box-shadow 0.15s',
        background: correct
          ? 'linear-gradient(135deg,#10B981,#059669)'
          : wrong
          ? 'linear-gradient(135deg,#EF4444,#dc2626)'
          : `rgba(28,16,76,0.9)`,
        border: correct ? '2.5px solid #10B981'
          : wrong ? '2.5px solid #EF4444'
          : `2.5px solid ${accent}55`,
        color:'white',
        boxShadow: correct ? '0 6px 22px rgba(16,185,129,0.42)'
          : wrong ? '0 6px 22px rgba(239,68,68,0.35)'
          : idle && !disabled ? '0 3px 12px rgba(0,0,0,0.28)' : 'none',
      }}
    >
      <span style={{
        width:24, height:24, borderRadius:'50%', flexShrink:0,
        background: correct ? 'rgba(255,255,255,0.22)'
          : wrong ? 'rgba(255,255,255,0.18)' : `${accent}55`,
        fontSize:'0.68rem', fontWeight:900, lineHeight:'24px', textAlign:'center',
        fontFamily:'var(--font-body)',
      }}>
        {LETTER[index]}
      </span>
      {label}
    </motion.button>
  );
}
