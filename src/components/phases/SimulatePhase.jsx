import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import Mascot from '../shared/Mascot';
import StationBuild from '../simulation/StationBuild';
import StationRead from '../simulation/StationRead';
import StationCompare from '../simulation/StationCompare';
import { narrate, stopNarration } from '../../utils/audio';

const STATIONS = [
  { id: 'stationA', label: 'Station A', title: 'Build It', icon: '🏗️', description: 'Drag blocks to build the given number.' },
  { id: 'stationB', label: 'Station B', title: 'Read It', icon: '📖', description: 'Look at the blocks and find the number.' },
  { id: 'stationC', label: 'Station C', title: 'Compare It', icon: '⚖️', description: 'Compare two numbers using >, < or =.' },
];

export default function SimulatePhase() {
  const { advancePhase, audioEnabled, completeStation, simulateProgress } = useGame();
  const [currentStation, setCurrentStation] = useState(null); // null = overview

  const allDone = STATIONS.every(s => simulateProgress[s.id]?.completed);

  const handleStationComplete = (stationId) => {
    completeStation(stationId);
    stopNarration();
    setCurrentStation(null);
  };

  const handleContinue = () => {
    stopNarration();
    advancePhase();
  };

  if (currentStation === 'stationA') {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--space-2xl) var(--space-xl) var(--space-xl)' }}>
        <button className="btn btn-secondary" onClick={() => { stopNarration(); setCurrentStation(null); }}
          style={{ marginBottom: 'var(--space-lg)' }}>← Back to Stations</button>
        <StationBuild audioEnabled={audioEnabled} onComplete={() => handleStationComplete('stationA')} />
      </div>
    );
  }
  if (currentStation === 'stationB') {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--space-2xl) var(--space-xl) var(--space-xl)' }}>
        <button className="btn btn-secondary" onClick={() => { stopNarration(); setCurrentStation(null); }}
          style={{ marginBottom: 'var(--space-lg)' }}>← Back to Stations</button>
        <StationRead audioEnabled={audioEnabled} onComplete={() => handleStationComplete('stationB')} />
      </div>
    );
  }
  if (currentStation === 'stationC') {
    return (
      <div style={{ minHeight: '100vh', padding: 'var(--space-2xl) var(--space-xl) var(--space-xl)' }}>
        <button className="btn btn-secondary" onClick={() => { stopNarration(); setCurrentStation(null); }}
          style={{ marginBottom: 'var(--space-lg)' }}>← Back to Stations</button>
        <StationCompare audioEnabled={audioEnabled} onComplete={() => handleStationComplete('stationC')} />
      </div>
    );
  }

  // Station overview
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-2xl) var(--space-xl) var(--space-xl)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}
      >
        <h2 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-md)' }}>🔬 Simulate Phase</h2>
        <p>Explore all three stations to earn your bonus points. Complete them in any order!</p>
      </motion.div>

      {/* Station cards */}
      <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900, marginBottom: 'var(--space-2xl)' }}>
        {STATIONS.map((station, i) => {
          const done = simulateProgress[station.id]?.completed;
          return (
            <motion.div
              key={station.id}
              className="glass-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              style={{
                minWidth: 220,
                maxWidth: 260,
                textAlign: 'center',
                cursor: 'pointer',
                border: done ? '2px solid var(--success-green)' : '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'visible',
              }}
              onClick={() => !done && setCurrentStation(station.id)}
              whileHover={!done ? { scale: 1.04, y: -4 } : {}}
            >
              {done && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: -12, right: -12,
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: 'var(--success-green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >✓</motion.div>
              )}
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>{station.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: done ? 'var(--success-green)' : 'var(--accent-gold)', marginBottom: 'var(--space-sm)' }}>
                {station.title}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
                {station.description}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                +15 points
              </div>
              <button
                className={done ? 'btn btn-secondary' : 'btn btn-primary'}
                onClick={(e) => { e.stopPropagation(); if (!done) setCurrentStation(station.id); }}
                style={{ width: '100%', opacity: done ? 0.7 : 1 }}
              >
                {done ? '✓ Completed' : 'Start →'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Mascot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <Mascot mood={allDone ? 'happy' : 'thinking'} size={70} />
      </div>

      {/* Continue button */}
      <AnimatePresence>
        {(
          <motion.button
            className="btn btn-primary"
            onClick={handleContinue}
            style={{
              fontSize: '1.125rem',
              padding: '14px 40px',
              opacity: allDone ? 1 : 0.5,
            }}
            whileHover={allDone ? { scale: 1.05 } : {}}
            title={allDone ? '' : 'Complete all stations to continue'}
          >
            {allDone ? '🎮 Go to Play Phase!' : `Complete all stations to continue (${STATIONS.filter(s => simulateProgress[s.id]?.completed).length}/${STATIONS.length})`}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
