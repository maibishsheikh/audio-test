import { motion } from 'framer-motion';

/**
 * Mascot Component - Bear emoji with animated moods
 * @param {string} mood - 'happy' | 'thinking' | 'default'
 * @param {number} size - Size in pixels (default: 80)
 */
export default function Mascot({ mood = 'default', size = 80 }) {
  const moodClasses = {
    happy: 'mascot happy',
    thinking: 'mascot thinking',
    default: 'mascot',
  };

  const animations = {
    happy: {
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.6 },
    },
    thinking: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
    default: {
      scale: 1,
    },
  };

  return (
    <motion.div
      className={moodClasses[mood] || moodClasses.default}
      style={{ fontSize: `${size}px` }}
      animate={animations[mood] || animations.default}
    >
      🐻
    </motion.div>
  );
}
