import { motion } from 'framer-motion';

const COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706'];

export default function AnswerOption({ label, onClick, state = 'idle', disabled = false, index = 0 }) {
  const isIdle    = state === 'idle';
  const isCorrect = state === 'correct';
  const isWrong   = state === 'wrong';

  // subtle per-button accent so kids can visually distinguish options
  const accentHue = COLORS[index % COLORS.length];

  return (
    <motion.button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      initial={{ opacity:0, y:10 }}
      animate={{
        opacity:1, y:0,
        scale: isCorrect ? [1,1.06,1] : 1,
        x: isWrong ? [-5,5,-5,5,0] : 0,
      }}
      transition={{
        opacity: { delay: index * 0.07, duration: 0.25 },
        y:       { delay: index * 0.07, duration: 0.25 },
        scale:   { duration: 0.4 },
        x:       { duration: 0.35 },
      }}
      whileHover={!disabled && isIdle ? { scale:1.04, y:-2 } : {}}
      whileTap={!disabled && isIdle ? { scale:0.97 } : {}}
      style={{
        minHeight:66,
        width:'100%',
        padding:'14px 16px',
        borderRadius:16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily:'var(--font-display)',
        fontSize:'1.45rem',
        fontWeight:700,
        letterSpacing:0.3,
        outline:'none',
        transition:'background 0.18s, border-color 0.18s, box-shadow 0.18s',
        // states
        background: isCorrect
          ? 'linear-gradient(135deg,#10B981,#059669)'
          : isWrong
          ? 'linear-gradient(135deg,#EF4444,#dc2626)'
          : `rgba(30,18,80,0.85)`,
        border: isCorrect
          ? '2.5px solid #10B981'
          : isWrong
          ? '2.5px solid #EF4444'
          : `2.5px solid ${accentHue}55`,
        color: 'white',
        boxShadow: isCorrect
          ? '0 6px 22px rgba(16,185,129,0.45)'
          : isWrong
          ? '0 6px 22px rgba(239,68,68,0.35)'
          : isIdle && !disabled
          ? `0 4px 14px rgba(0,0,0,0.3)`
          : 'none',
      }}
    >
      {/* Option letter badge A B C D */}
      <span style={{
        display:'inline-block',
        width:26, height:26,
        borderRadius:'50%',
        background: isCorrect ? 'rgba(255,255,255,0.25)' : isWrong ? 'rgba(255,255,255,0.2)' : `${accentHue}55`,
        fontSize:'0.7rem', fontWeight:900,
        marginRight:8, verticalAlign:'middle',
        lineHeight:'26px', textAlign:'center',
        fontFamily:'var(--font-body)',
      }}>
        {['A','B','C','D'][index]}
      </span>
      {label}
    </motion.button>
  );
}
