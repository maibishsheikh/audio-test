import { motion } from 'framer-motion';

/**
 * Speech Bubble Component
 * @param {string} text - Text to display
 * @param {string} position - 'left' | 'right' (default: 'left')
 */
export default function SpeechBubble({ text, position = 'left' }) {
  return (
    <motion.div
      className={`speech-bubble ${position}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.div>
  );
}
