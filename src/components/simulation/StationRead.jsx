import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BasetenBlock from './BasetenBlock';
import { decompose, randomDistributedNumber } from '../../utils/placeValue';
import { narrate, stopNarration } from '../../utils/audio';
import { simulateStationBIntro, simulateCorrectNarration, simulateIncorrectNarration } from '../../utils/narration';

const ROUNDS = 3;

function generateOptions(correct) {
  const opts = new Set([String(correct)]);
  while (opts.size < 4) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? 1 : -1);
    const candidate = correct + offset * (Math.random() < 0.5 ? 10 : 1);
    if (candidate >= 101 && candidate <= 200) opts.add(String(candidate));
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

export default function StationRead({ audioEnabled, onComplete }) {
  const [round, setRound] = useState(0);
  const [targetNumber, setTargetNumber] = useState(() => randomDistributedNumber());
  const [options, setOptions] = useState(() => generateOptions(targetNumber));
  const [selected, setSelected] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (audioEnabled) narrate(simulateStationBIntro(), true);
    return () => stopNarration();
  }, [audioEnabled]);

  const handleSelect = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const isCorrect = parseInt(opt) === targetNumber;
    if (audioEnabled) {
      narrate(isCorrect ? simulateCorrectNarration() : simulateIncorrectNarration(), true);
    }
    setRoundResults(prev => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (round + 1 >= ROUNDS) {
      onComplete && onComplete(roundResults);
    } else {
      const next = randomDistributedNumber();
      setRound(r => r + 1);
      setTargetNumber(next);
      setOptions(generateOptions(next));
      setSelected(null);
      setAnswered(false);
    }
  };

  const { hundreds, tens, ones } = decompose(targetNumber);

  return (
    <div className="station-container">
      <div className="station-header">
        <div className="station-title">📖 Station B — Read It</div>
        <p className="station-instructions">Look at the blocks on the chart. What number do they show?</p>
        <div className="station-progress">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div key={i} className={`progress-dot ${i < round ? 'completed' : i === round ? 'active' : ''}`} />
          ))}
        </div>
      </div>

      {/* Block display */}
      <div className="place-value-chart" style={{ maxWidth: 500, margin: '0 auto var(--space-xl)' }}>
        {['hundreds', 'tens', 'ones'].map(col => {
          const count = col === 'hundreds' ? hundreds : col === 'tens' ? tens : ones;
          const type = col === 'hundreds' ? 'flat' : col === 'tens' ? 'rod' : 'unit';
          return (
            <div
              key={col}
              className={`place-value-column ${col}`}
              style={{ minHeight: 200 }}
            >
              <div className="column-label">{col}</div>
              <div className="column-count">{count}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', flex: 1 }}>
                {Array.from({ length: count }).map((_, i) => (
                  <BasetenBlock key={i} type={type} small />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MCQ Options */}
      <div className="answer-options" style={{ maxWidth: 500, margin: '0 auto' }}>
        {options.map(opt => {
          const isCorrect = parseInt(opt) === targetNumber;
          let cls = 'option-btn';
          if (answered) {
            if (opt === selected && isCorrect) cls += ' correct';
            else if (opt === selected && !isCorrect) cls += ' wrong';
            else if (isCorrect) cls += ' correct';
          }
          return (
            <motion.button
              key={opt}
              className={cls}
              onClick={() => handleSelect(opt)}
              disabled={answered}
              whileHover={!answered ? { scale: 1.05 } : {}}
              whileTap={!answered ? { scale: 0.97 } : {}}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <button className="btn btn-primary" onClick={handleNext}>
              {round + 1 >= ROUNDS ? '✨ Finish Station B' : 'Next Round →'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
