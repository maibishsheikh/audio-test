import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Mascot from './shared/Mascot';
import SpeechBubble from './shared/SpeechBubble';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { introNarration } from '../utils/narration';

/**
 * Intro Screen - Landing page for the module
 */
export default function IntroScreen() {
  const { advancePhase, audioEnabled } = useGame();
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(introNarration());
      const timer = setTimeout(() => {
        narrationRef.current = narrate(introNarration(), true);
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

  const handleBegin = () => {
    narrationRef.current?.cancel();
    stopNarration();
    advancePhase();
  };

  return (
    <div className="intro-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', position: 'relative' }}>
      {/* Top Badge */}
      <div className="top-badge">
        ✨ Singapore MOE Curriculum · Grade 2
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', maxWidth: '800px' }}
      >
        {/* Title */}
        <h1 style={{ marginTop: 'var(--space-2xl)', marginBottom: 'var(--space-lg)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Numbers to </span>
          <span style={{ color: 'var(--accent-gold)' }}>200</span>
        </h1>

        {/* Mascot with Speech Bubble */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <Mascot mood="happy" size={100} />
          <SpeechBubble text="Ready to explore numbers beyond 100? 🚀" />
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto var(--space-xl)' }}>
          Join Xiao Ming on a journey to understand numbers 101–200 through stories, simulations, and fun games!
        </p>

        {/* Journey Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
          {[
            { icon: '❓', label: 'Wonder' },
            { icon: '📖', label: 'Story' },
            { icon: '🔬', label: 'Simulate' },
            { icon: '🎮', label: 'Play' },
            { icon: '⭐', label: 'Reflect' },
          ].map((phase, index) => (
            <div key={phase.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <div style={{ fontSize: '2rem' }}>{phase.icon}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{phase.label}</div>
              </div>
              {index < 4 && <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>→</div>}
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          className="btn btn-primary"
          onClick={handleBegin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: '1.25rem', padding: '16px 48px', marginBottom: 'var(--space-lg)' }}
        >
          🚀 Begin Your Journey!
        </motion.button>

        {/* Feature Chips */}
        <div className="feature-chips">
          <div className="feature-chip">📊 Place Value</div>
          <div className="feature-chip">🔬 Simulations</div>
          <div className="feature-chip">🎯 100 Questions</div>
        </div>
      </motion.div>
    </div>
  );
}
