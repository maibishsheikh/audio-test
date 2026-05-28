import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasetenBlock from './BasetenBlock';
import { decompose, compare, randomDistributedNumber } from '../../utils/placeValue';
import { narrate, stopNarration, preloadNarration } from '../../utils/audio';
import { simulateStationCIntro, simulateCorrectNarration, simulateIncorrectNarration } from '../../utils/narration';

const ROUNDS = 3;

function generatePair() {
  let a = randomDistributedNumber();
  let b = randomDistributedNumber();
  // ensure they're different
  while (b === a) b = randomDistributedNumber();
  return [a, b];
}

function BlockColumn({ number, col }) {
  const counts = decompose(number);
  const count = counts[col];
  const type = col === 'hundreds' ? 'flat' : col === 'tens' ? 'rod' : 'unit';
  return (
    <div className={`place-value-column ${col}`} style={{ minHeight: 120, padding: 8 }}>
      <div className="column-label" style={{ fontSize: '0.7rem' }}>{col.slice(0, 1).toUpperCase()}</div>
      <div className="column-count" style={{ fontSize: '1rem' }}>{count}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        {Array.from({ length: count }).map((_, i) => <BasetenBlock key={i} type={type} small />)}
      </div>
    </div>
  );
}

export default function StationCompare({ audioEnabled, onComplete }) {
  const [round, setRound] = useState(0);
  const [[numA, numB], setPair] = useState(() => generatePair());
  const [chosen, setChosen] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [roundResults, setRoundResults] = useState([]);
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(simulateStationCIntro());
      const timer = setTimeout(() => {
        narrationRef.current = narrate(simulateStationCIntro(), true);
      }, 200);
      return () => {
        clearTimeout(timer);
        narrationRef.current?.cancel();
        stopNarration();
      };
    }
    return () => {
      narrationRef.current?.cancel();
      stopNarration();
    };
  }, [audioEnabled]);

  const correctSymbol = compare(numA, numB);

  const handleChoose = (sym) => {
    if (answered) return;
    setChosen(sym);
    setAnswered(true);
    const isCorrect = sym === correctSymbol;
    if (audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(isCorrect ? simulateCorrectNarration() : simulateIncorrectNarration(), true);
    }
    setRoundResults(prev => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (round + 1 >= ROUNDS) {
      onComplete && onComplete(roundResults);
    } else {
      setRound(r => r + 1);
      setPair(generatePair());
      setChosen(null);
      setAnswered(false);
    }
  };

  const symbols = ['>', '<', '='];
  const symbolLabels = { '>': 'is greater than', '<': 'is less than', '=': 'is equal to' };

  return (
    <div className="station-container">
      <div className="station-header">
        <div className="station-title">⚖️ Station C — Compare It</div>
        <p className="station-instructions">
          Look at both numbers. Which symbol makes the statement correct?
        </p>
        <div className="station-progress">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} className={`progress-dot ${i < round ? 'completed' : i === round ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Two numbers side by side */}
      <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
        {[numA, numB].map((num, idx) => (
          <div key={idx} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: idx === 0 ? 'var(--accent-gold)' : '#3B82F6',
              marginBottom: 'var(--space-md)',
            }}>
              {num}
            </div>
            <div className="place-value-chart" style={{ maxWidth: 240, gap: 'var(--space-sm)' }}>
              {['hundreds', 'tens', 'ones'].map(col => (
                <BlockColumn key={col} number={num} col={col} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Symbol choices */}
      <div style={{ display: 'flex', gap: 'var(--space-lg)', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
        {symbols.map(sym => {
          const isCorrect = sym === correctSymbol;
          let bg = 'rgba(124,58,237,0.3)';
          let border = 'rgba(124,58,237,0.5)';
          if (answered) {
            if (sym === chosen && isCorrect) { bg = 'var(--success-green)'; border = 'var(--success-green)'; }
            else if (sym === chosen && !isCorrect) { bg = 'var(--error-red)'; border = 'var(--error-red)'; }
            else if (isCorrect) { bg = 'var(--success-green)'; border = 'var(--success-green)'; }
          }
          return (
            <motion.button
              key={sym}
              onClick={() => handleChoose(sym)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.15 } : {}}
              whileTap={!answered ? { scale: 0.9 } : {}}
              title={symbolLabels[sym]}
              style={{
                width: 72, height: 72,
                background: bg,
                border: `3px solid ${border}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '2rem',
                fontWeight: 700,
                cursor: answered ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {sym}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--space-md)', color: chosen === correctSymbol ? 'var(--success-green)' : 'var(--error-red)', fontWeight: 700 }}>
              {numA} {chosen === correctSymbol ? correctSymbol : `${chosen} (correct: ${correctSymbol})`} {numB}
            </div>
            <button className="btn btn-primary" onClick={handleNext}>
              {round + 1 >= ROUNDS ? '✨ Finish Station C' : 'Next Round →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
