import { motion } from 'framer-motion';

/**
 * Progress Bar Component
 * @param {number} current - Current progress value
 * @param {number} total - Total/max value
 * @param {string} label - Optional label to display
 */
export default function ProgressBar({ current, total, label }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="progress-bar-wrapper">
      {label && (
        <div className="progress-bar-label" style={{ marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
          {label}
        </div>
      )}
      <div className="progress-bar-container">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {label && (
        <div className="progress-bar-text" style={{ marginTop: '4px', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {current} / {total}
        </div>
      )}
    </div>
  );
}
