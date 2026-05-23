import { motion } from 'framer-motion';

function Heart({ filled }) {
  return (
    <motion.span
      animate={{ scale: filled ? 1 : 0.72, opacity: filled ? 1 : 0.25 }}
      transition={{ type:'spring', stiffness:280 }}
      style={{ fontSize:'1.25rem', display:'inline-block', lineHeight:1 }}
    >
      ❤️
    </motion.span>
  );
}

export function ScoreBar({ score, streak, questionsAnswered, totalQuestions=100, locationName, lives=3 }) {
  const pct = Math.min(100, Math.round((questionsAnswered / totalQuestions) * 100));
  const mult = streak>=5 ? '×3' : streak>=3 ? '×2' : '×1';
  const streakColor = streak>=5 ? '#F59E0B' : streak>=3 ? '#EC4899' : 'rgba(255,255,255,0.4)';

  return (
    <div style={{ marginBottom:10 }}>
      {/* Zone pill */}
      {locationName && (
        <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
          <motion.div
            key={locationName}
            initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}}
            style={{
              background:'linear-gradient(135deg,#F59E0B,#f97316)',
              color:'#0a0820', borderRadius:50, padding:'5px 20px',
              fontWeight:900, fontSize:'0.88rem', fontFamily:'var(--font-body)',
              display:'flex', alignItems:'center', gap:5,
              boxShadow:'0 3px 14px rgba(245,158,11,0.4)',
            }}
          >
            {locationName}
          </motion.div>
        </div>
      )}

      {/* Score | hearts | streak — all compact */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <motion.div
          key={score}
          initial={{scale:1.4}} animate={{scale:1}} transition={{duration:0.28}}
          style={{
            display:'flex', alignItems:'center', gap:5,
            background:'rgba(245,158,11,0.1)', borderRadius:50, padding:'5px 12px',
            fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.95rem', color:'#F59E0B',
            border:'1px solid rgba(245,158,11,0.22)',
          }}
        >
          ⭐ {score}
        </motion.div>

        <div style={{ display:'flex', gap:3 }}>
          {[0,1,2].map(i => <Heart key={i} filled={i < lives} />)}
        </div>

        <motion.div
          key={streak}
          animate={streak>=3 ? {scale:[1,1.2,1]} : {}} transition={{duration:0.32}}
          style={{
            display:'flex', alignItems:'center', gap:4,
            background:'rgba(255,255,255,0.06)', borderRadius:50, padding:'5px 12px',
            fontFamily:'var(--font-mono)', fontWeight:700, fontSize:'0.88rem', color:streakColor,
            border:'1px solid rgba(255,255,255,0.1)',
          }}
        >
          🔥 {mult}
        </motion.div>
      </div>

      {/* Progress bar */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap', minWidth:80, fontWeight:600 }}>
          Q {questionsAnswered+1} / {totalQuestions}
        </span>
        <div style={{ flex:1, height:7, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
          <motion.div
            style={{ height:'100%', background:'linear-gradient(90deg,#7C3AED,#F59E0B)', borderRadius:4 }}
            animate={{ width:`${pct}%` }}
            transition={{ duration:0.55, ease:'easeOut' }}
          />
        </div>
        <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.33)', minWidth:28, textAlign:'right', fontWeight:600 }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

export function StreakIndicator({ streak }) {
  const color = streak>=5 ? '#F59E0B' : streak>=3 ? '#EC4899' : 'var(--text-secondary)';
  const mult  = streak>=5 ? '×3' : streak>=3 ? '×2' : '×1';
  return (
    <motion.div key={streak} style={{display:'flex',alignItems:'center',gap:5}}
      animate={streak>=3 ? {scale:[1,1.15,1]} : {}} transition={{duration:0.4}}>
      <span>🔥</span>
      <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color}}>{streak} — {mult}</span>
    </motion.div>
  );
}

export default ScoreBar;
