import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasetenBlock from './BasetenBlock';
import { decompose } from '../../utils/placeValue';

const MAX        = { hundreds: 2, tens: 9, ones: 9 };
const BLOCK_TYPE = { hundreds: 'flat', tens: 'rod', ones: 'unit' };

const COL_STYLE = {
  hundreds: { border:'#F59E0B', label:'#F59E0B', bg:'rgba(245,158,11,0.08)', glow:'rgba(245,158,11,0.35)' },
  tens:     { border:'#7C3AED', label:'#7C3AED', bg:'rgba(124,58,237,0.08)', glow:'rgba(124,58,237,0.35)' },
  ones:     { border:'#3B82F6', label:'#3B82F6', bg:'rgba(59,130,246,0.08)', glow:'rgba(59,130,246,0.35)'  },
};
const COL_NAMES  = { hundreds:'Hundreds', tens:'Tens', ones:'Ones' };
const COL_VALUES = { hundreds:'= 100',    tens:'= 10',  ones:'= 1'  };
const COLS       = ['hundreds', 'tens', 'ones'];

const EMPTY = { hundreds: 0, tens: 0, ones: 0 };

export default function PlaceValueChart({
  targetNumber,
  mode = 'build',
  onComplete,
  showAnswer = false,
  resetKey = 0,       // increment this from parent to auto-reset between rounds
}) {
  const [placed,   setPlaced]   = useState({ ...EMPTY });
  const [dragOver, setDragOver] = useState(null);
  const [checked,  setChecked]  = useState(false);
  const [result,   setResult]   = useState(null);   // null | true | false

  /* ── Reset whenever resetKey changes (new round from parent) ─────── */
  useEffect(() => {
    setPlaced({ ...EMPTY });
    setChecked(false);
    setResult(null);
  }, [resetKey]);

  /* ── Block manipulation ──────────────────────────────────────────── */
  const addBlock = (col) => {
    setPlaced(p => ({ ...p, [col]: Math.min(p[col] + 1, MAX[col]) }));
    setChecked(false); setResult(null);
  };
  const removeBlock = (col) => {
    setPlaced(p => ({ ...p, [col]: Math.max(p[col] - 1, 0) }));
    setChecked(false); setResult(null);
  };

  /* ── Drag & drop ─────────────────────────────────────────────────── */
  const handleDragStart = (e, col) => e.dataTransfer.setData('blockType', col);
  const handleDrop = useCallback((e, col) => {
    e.preventDefault();
    if (e.dataTransfer.getData('blockType') !== col) return;
    setDragOver(null);
    addBlock(col);
  }, []);
  const handleDragOver  = (e, col) => { e.preventDefault(); setDragOver(col); };
  const handleDragLeave = () => setDragOver(null);

  /* ── Check / Reset ───────────────────────────────────────────────── */
  const handleCheck = () => {
    const t  = decompose(targetNumber);
    const ok = placed.hundreds === t.hundreds && placed.tens === t.tens && placed.ones === t.ones;
    setChecked(true);
    setResult(ok);
    onComplete && onComplete(ok);
  };
  const handleReset = () => { setPlaced({ ...EMPTY }); setChecked(false); setResult(null); };

  const target = decompose(targetNumber);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, alignItems:'center', width:'100%' }}>

      {/* ── Palette ──────────────────────────────────────────────────── */}
      {mode === 'build' && (
        <div style={{
          display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap',
          padding:'12px 18px',
          background:'rgba(0,0,0,0.22)',
          borderRadius:16,
          border:'1px solid rgba(255,255,255,0.08)',
        }}>
          {COLS.map(col => {
            const cs = COL_STYLE[col];
            return (
              <motion.div
                key={col}
                onClick={() => addBlock(col)}
                draggable
                onDragStart={(e) => handleDragStart(e, col)}
                whileHover={{ scale:1.1, y:-3 }}
                whileTap={{ scale:0.9 }}
                style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                  cursor:'pointer',
                  padding:'10px 14px', borderRadius:12,
                  border:`2px solid ${cs.border}55`,
                  background:cs.bg,
                  minWidth:72,
                }}
                title={`Click to add 1 ${COL_NAMES[col]}`}
              >
                <BasetenBlock type={BLOCK_TYPE[col]} />
                <span style={{ fontSize:'0.72rem', fontWeight:800, color:cs.label, textAlign:'center', lineHeight:1.3 }}>
                  {COL_NAMES[col]}<br/>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', opacity:0.75 }}>
                    {COL_VALUES[col]}
                  </span>
                </span>
              </motion.div>
            );
          })}
          <div style={{
            alignSelf:'center', fontSize:'0.72rem', color:'rgba(255,255,255,0.35)',
            textAlign:'center', maxWidth:100, lineHeight:1.5,
          }}>
            👆 Click or drag into the columns below
          </div>
        </div>
      )}

      {/* ── Place Value Columns — 3 side-by-side ─────────────────────── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr 1fr',
        gap:10,
        width:'100%',
        maxWidth:560,
      }}>
        {COLS.map(col => {
          const cs        = COL_STYLE[col];
          const count     = placed[col];
          const isDrag    = dragOver === col;
          const colOk     = checked && placed[col] === target[col];
          const colWrong  = checked && placed[col] !== target[col];

          return (
            <div
              key={col}
              onDrop={(e) => handleDrop(e, col)}
              onDragOver={(e) => handleDragOver(e, col)}
              onDragLeave={handleDragLeave}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                padding:'12px 8px 12px',
                borderRadius:16,
                border:`2px solid ${isDrag ? cs.border : colOk ? '#10B981' : colWrong ? '#EF4444' : `${cs.border}44`}`,
                background: isDrag ? cs.glow : colOk ? 'rgba(16,185,129,0.08)' : colWrong ? 'rgba(239,68,68,0.06)' : cs.bg,
                boxShadow: isDrag ? `0 0 18px ${cs.glow}` : 'none',
                transition:'all 0.2s',
                minHeight:150,
                position:'relative',
              }}
            >
              {/* Header */}
              <div style={{ fontWeight:800, fontSize:'0.78rem', color:cs.label, textTransform:'uppercase', letterSpacing:0.8 }}>
                {COL_NAMES[col]}
              </div>

              {/* Count */}
              <motion.div
                key={count}
                initial={{ scale:1.5 }} animate={{ scale:1 }} transition={{ duration:0.18 }}
                style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:cs.label, lineHeight:1 }}
              >
                {count}
              </motion.div>

              {/* ── BLOCKS — horizontal row + wrap ───────────────────── */}
              <div style={{
                display:'flex',
                flexDirection:'row',    /* HORIZONTAL */
                flexWrap:'wrap',
                gap:4,
                justifyContent:'center',
                alignItems:'center',    /* vertically centre rods with flat/unit blocks */
                width:'100%',
                minHeight:56,
                padding:'0 4px',
              }}>
                <AnimatePresence>
                  {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale:0, opacity:0 }}
                      animate={{ scale:1, opacity:1 }}
                      exit={{ scale:0, opacity:0 }}
                      transition={{ duration:0.15 }}
                      onClick={() => removeBlock(col)}
                      title="Click to remove"
                      style={{ cursor:'pointer', flexShrink:0, display:'flex' }}
                    >
                      <BasetenBlock type={BLOCK_TYPE[col]} small />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {count === 0 && (
                  <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.2)', textAlign:'center', width:'100%' }}>
                    {mode === 'build' ? 'Empty — add blocks!' : 'Empty'}
                  </div>
                )}
              </div>

              {/* Answer peek */}
              {showAnswer && (
                <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)', marginTop:2 }}>
                  Ans: {target[col]}
                </div>
              )}

              {/* Per-column tick / cross */}
              {checked && (
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  style={{
                    position:'absolute', top:-9, right:-9,
                    width:22, height:22, borderRadius:'50%',
                    background: colOk ? '#10B981' : '#EF4444',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.68rem', fontWeight:900, color:'white',
                    boxShadow:`0 2px 8px ${colOk ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  }}
                >
                  {colOk ? '✓' : '✗'}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Result banner ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {result !== null && (
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            style={{
              padding:'10px 24px', borderRadius:12, textAlign:'center',
              background: result ? 'rgba(16,185,129,0.16)' : 'rgba(239,68,68,0.16)',
              border:`2px solid ${result ? '#10B981' : '#EF4444'}`,
              color: result ? '#10B981' : '#EF4444',
              fontWeight:800, fontSize:'1rem',
            }}
          >
            {result
              ? '✅ Correct! Great job!'
              : `❌ Not quite! Needed: ${target.hundreds}×100, ${target.tens}×10, ${target.ones}×1`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Buttons ───────────────────────────────────────────────────── */}
      {mode === 'build' && (
        <div style={{ display:'flex', gap:10 }}>
          <motion.button
            className="btn btn-primary"
            onClick={handleCheck}
            disabled={checked && result === true}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
          >
            ✔ Check My Answer
          </motion.button>
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      )}
    </div>
  );
}
