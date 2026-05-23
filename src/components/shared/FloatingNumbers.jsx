import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Floating Numbers Background
 * Random numbers 101-200 floating across the screen
 */
export default function FloatingNumbers() {
  const [numbers, setNumbers] = useState([]);

  useEffect(() => {
    // Generate 15 random floating numbers
    const floatingNums = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      value: Math.floor(Math.random() * 100) + 101, // 101-200
      x: Math.random() * 100, // % position
      delay: Math.random() * 5, // stagger start
      duration: 15 + Math.random() * 10, // 15-25s
    }));
    setNumbers(floatingNums);
  }, []);

  return (
    <div className="floating-numbers">
      {numbers.map((num) => (
        <motion.div
          key={num.id}
          className="floating-number"
          style={{
            left: `${num.x}%`,
            top: '-50px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
            opacity: [0, 0.1, 0.1, 0],
          }}
          transition={{
            duration: num.duration,
            delay: num.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {num.value}
        </motion.div>
      ))}
    </div>
  );
}
