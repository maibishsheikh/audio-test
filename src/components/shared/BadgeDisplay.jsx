import { motion } from 'framer-motion';

/**
 * Badge Display Component
 * Shows earned badges with animation
 * @param {string} icon - Badge emoji icon
 * @param {string} title - Badge title
 * @param {string} description - Badge description
 * @param {number} stars - Number of stars (0-3)
 */
export default function BadgeDisplay({ icon, title, description, stars = 0 }) {
  return (
    <motion.div
      className="badge-card"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <div className="badge-icon">{icon}</div>
      <div className="badge-title">{title}</div>
      {description && (
        <div className="badge-description" style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          {description}
        </div>
      )}
      {stars > 0 && (
        <div className="star-rating">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ opacity: i < stars ? 1 : 0.3 }}>
              ⭐
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
