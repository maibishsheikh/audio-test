import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import Mascot from '../shared/Mascot';
import SpeechBubble from '../shared/SpeechBubble';
import { narrate, stopNarration } from '../../utils/audio';
import { wonderNarration } from '../../utils/narration';

/**
 * Wonder Phase - Spark curiosity with a hook question
 */
export default function WonderPhase() {
  const { advancePhase, audioEnabled } = useGame();
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    if (audioEnabled) {
      narrate(wonderNarration(), true);
    }

    // Enable continue button after ~5 seconds (block animation completes at 3s + buffer)
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 5000);

    return () => {
      stopNarration();
      clearTimeout(timer);
    };
  }, [audioEnabled]);

  const handleContinue = () => {
    stopNarration();
    advancePhase();
  };

  return (
    <div className="wonder-phase" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', position: 'relative' }}>
      {/* Animated Question Mark Orb */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        style={{
          fontSize: '6rem',
          marginBottom: 'var(--space-xl)',
          filter: 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.6))',
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ❓
        </motion.div>
      </motion.div>

      {/* Hook Question */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        style={{ maxWidth: '600px', textAlign: 'center', marginBottom: 'var(--space-xl)' }}
      >
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-lg)' }}>
          I have 1 hundred, 3 tens and 5 ones.
        </h2>
        <h2 style={{ color: 'var(--text-primary)' }}>
          What number am I?
        </h2>

        {/* Thought Bubble with Base-Ten Blocks Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            marginTop: 'var(--space-xl)',
            padding: 'var(--space-lg)',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            flexWrap: 'wrap',
          }}
        >
          {/* 1 Hundred Block */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: 'spring' }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem' }}>🟨</div>
            <div style={{ fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>1 hundred</div>
          </motion.div>

          {/* 3 Tens Blocks */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5, type: 'spring' }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <div style={{ fontSize: '2rem' }}>🟪</div>
              <div style={{ fontSize: '2rem' }}>🟪</div>
              <div style={{ fontSize: '2rem' }}>🟪</div>
            </div>
            <div style={{ fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>3 tens</div>
          </motion.div>

          {/* 5 Ones Blocks */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3, type: 'spring' }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <div style={{ fontSize: '1rem' }}>🟦</div>
              <div style={{ fontSize: '1rem' }}>🟦</div>
              <div style={{ fontSize: '1rem' }}>🟦</div>
              <div style={{ fontSize: '1rem' }}>🟦</div>
              <div style={{ fontSize: '1rem' }}>🟦</div>
            </div>
            <div style={{ fontSize: '0.875rem', marginTop: 'var(--space-xs)' }}>5 ones</div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mascot */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}
      >
        <Mascot mood="thinking" size={80} />
        <SpeechBubble text="Let's think about this together..." />
      </motion.div>

      {/* Continue Button */}
      <motion.button
        className="btn btn-primary"
        onClick={handleContinue}
        initial={{ opacity: 0 }}
        animate={{ opacity: showContinue ? 1 : 0.5 }}
        disabled={!showContinue}
        whileHover={showContinue ? { scale: 1.05 } : {}}
        whileTap={showContinue ? { scale: 0.95 } : {}}
        style={{ cursor: showContinue ? 'pointer' : 'not-allowed' }}
      >
        Continue to Story →
      </motion.button>
    </div>
  );
}
