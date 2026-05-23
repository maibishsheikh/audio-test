import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlaceValueChart from './PlaceValueChart';
import { randomDistributedNumber } from '../../utils/placeValue';
import { narrate, stopNarration } from '../../utils/audio';
import { simulateStationAIntro, simulateCorrectNarration, simulateIncorrectNarration } from '../../utils/narration';

const ROUNDS = 3;

export default function StationBuild({ audioEnabled, onComplete }) {
  const [round,        setRound]        = useState(0);
  const [targetNumber, setTargetNumber] = useState(() => randomDistributedNumber());
  const [roundResults, setRoundResults] = useState([]);
  const [answered,     setAnswered]     = useState(false);
  const [lastResult,   setLastResult]   = useState(null);
  const [resetKey,     setResetKey]     = useState(0); // ← increment to reset chart

  useEffect(() => {
    if (audioEnabled) narrate(simulateStationAIntro(), true);
    return () => stopNarration();
  }, [audioEnabled]);

  const handleComplete = (isCorrect) => {
    if (answered) return;
    setAnswered(true);
    setLastResult(isCorrect);
    if (audioEnabled) {
      narrate(isCorrect ? simulateCorrectNarration() : simulateIncorrectNarration(), true);
    }
  };

  const handleNext = () => {
    const newResults = [...roundResults, lastResult];
    if (round + 1 >= ROUNDS) {
      onComplete && onComplete(newResults);
    } else {
      setRound(r => r + 1);
      setTargetNumber(randomDistributedNumber());
      setAnswered(false);
      setLastResult(null);
      setResetKey(k => k + 1);   // ← triggers PlaceValueChart useEffect reset
    }
  };

  return (
    <div className="station-container">
      <div className="station-header">
        <div className="station-title">🏗️ Station A — Build It</div>
        <p className="station-instructions">
          Build the number{' '}
          <strong style={{ color:'var(--accent-gold)', fontFamily:'var(--font-mono)', fontSize:'1.5rem' }}>
            {targetNumber}
          </strong>{' '}
          using base-ten blocks. Click or drag blocks into each column.
        </p>
        {/* Round dots */}
        <div className="station-progress">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < round ? 'completed' : i === round ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Pass resetKey — chart clears automatically when it changes */}
      <PlaceValueChart
        targetNumber={targetNumber}
        mode="build"
        onComplete={handleComplete}
        resetKey={resetKey}
      />

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            style={{ textAlign:'center', marginTop:'var(--space-xl)' }}
          >
            <button className="btn btn-primary" onClick={handleNext}>
              {round + 1 >= ROUNDS ? '✨ Finish Station A' : 'Next Round →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
