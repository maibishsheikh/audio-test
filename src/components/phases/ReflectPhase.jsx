import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import BadgeDisplay from '../shared/BadgeDisplay';
import Mascot from '../shared/Mascot';
import SpeechBubble from '../shared/SpeechBubble';
import Confetti from '../shared/Confetti';
import { narrate, stopNarration, preloadNarration } from '../../utils/audio';
import { reflectNarration } from '../../utils/narration';

const BADGE_INFO = {
  'place-value-master':   { icon: '🏆', title: 'Place Value Master!',   description: 'Outstanding! You got 90%+ correct.' },
  'place-value-explorer': { icon: '🌟', title: 'Place Value Explorer!',  description: 'Great job! You got 70%+ correct.' },
  'place-value-learner':  { icon: '📚', title: 'Place Value Learner!',   description: 'Well done for finishing! Keep practising.' },
};

const REFLECT_QUESTIONS = [
  {
    id: 'rq1',
    prompt: 'What do we call the position of a digit in a number?',
    options: ['Place value', 'Number value', 'Digit count', 'Number order'],
    correct: 'Place value',
    explanation: 'The position of a digit in a number is called its place value.',
  },
  {
    id: 'rq2',
    prompt: 'How many hundreds are in the number 175?',
    options: ['1', '7', '5', '175'],
    correct: '1',
    explanation: '175 has 1 hundred (in the hundreds place), 7 tens, and 5 ones.',
  },
  {
    id: 'rq3',
    prompt: 'What does "expanded form" mean?',
    options: [
      'Breaking a number into hundreds + tens + ones',
      'Writing a number in words',
      'Making a number bigger',
      'Counting forward by 10s',
    ],
    correct: 'Breaking a number into hundreds + tens + ones',
    explanation: "Expanded form shows each digit's value separately, e.g. 135 = 100 + 30 + 5.",
  },
];

export default function ReflectPhase() {
  const { score, stars, questionsCorrect, questionsAnswered, maxStreak, badges, resetGame, audioEnabled } = useGame();
  const [phase, setPhase] = useState('summary'); // 'summary' | 'quiz' | 'badge'
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const narrationRef = useRef(null);

  const earnedBadge = BADGE_INFO[badges[0]] || BADGE_INFO['place-value-learner'];
  const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(reflectNarration(stars));
      const timer = setTimeout(() => {
        narrationRef.current = narrate(reflectNarration(stars), true);
      }, 200);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
      return () => {
        clearTimeout(timer);
        narrationRef.current?.cancel();
        stopNarration();
      };
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
    return () => {
      narrationRef.current?.cancel();
      stopNarration();
    };
  }, [audioEnabled, stars]);

  const handleQuizAnswer = (opt) => {
    if (quizAnswers[quizIndex] !== undefined) return;
    setQuizAnswers(prev => ({ ...prev, [quizIndex]: opt }));
  };

  const handleNextQuiz = () => {
    if (quizIndex < REFLECT_QUESTIONS.length - 1) {
      setQuizIndex(i => i + 1);
    } else {
      setPhase('badge');
      if (audioEnabled) {
        narrationRef.current?.cancel();
        narrationRef.current = narrate([{ text: "Outstanding work! You've mastered numbers to 200!", style: 'celebration' }], true);
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  };

  const renderStars = (count) => (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', fontSize: '2.5rem', margin: 'var(--space-md) 0' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: i < count ? 1 : 0.5, opacity: i < count ? 1 : 0.25 }}
          transition={{ delay: i * 0.25, type: 'spring' }}
        >⭐</motion.span>
      ))}
    </div>
  );

  // ── Summary screen
  if (phase === 'summary') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', textAlign: 'center' }}
      >
        <Confetti active={showConfetti} />

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>
          {stars === 3 ? '🎉' : stars === 2 ? '🌟' : '📚'}
        </motion.div>

        <h2 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-md)' }}>
          {stars === 3 ? 'Outstanding!' : stars === 2 ? 'Great Job!' : stars === 1 ? 'Good Effort!' : 'Thanks for Trying!'}
        </h2>

        {renderStars(stars)}

        {/* Stats grid */}
        <div className="glass-card" style={{ maxWidth: 440, margin: 'var(--space-xl) auto', width: '100%' }}>
          <h3 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-lg)', fontSize: '1.125rem' }}>📊 Your Results</h3>
          {[
            { label: 'Final Score', value: score, color: 'var(--accent-gold)' },
            { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 70 ? 'var(--success-green)' : 'var(--error-red)' },
            { label: 'Correct Answers', value: `${questionsCorrect} / ${questionsAnswered}` },
            { label: 'Best Streak', value: `🔥 ${maxStreak}` },
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: 'var(--space-sm) 0',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.125rem', color: row.color || 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        <Mascot mood="happy" size={70} />
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <SpeechBubble text="Let's review what you learned about hundreds, tens, and ones!" />
        </div>

        <motion.button
          className="btn btn-primary"
          onClick={() => { narrationRef.current?.cancel(); stopNarration(); setPhase('quiz'); }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: '1.125rem', padding: '14px 40px' }}
        >
          🧠 Take the Reflection Quiz!
        </motion.button>
      </motion.div>
    );
  }

  // ── Reflection Quiz
  if (phase === 'quiz') {
    const q = REFLECT_QUESTIONS[quizIndex];
    const userAnswer = quizAnswers[quizIndex];
    const answered = userAnswer !== undefined;

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', maxWidth: 600, margin: '0 auto' }}>
        {/* Quiz progress */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
          {REFLECT_QUESTIONS.map((_, i) => (
            <div key={i} style={{
              width: 32, height: 4, borderRadius: 2,
              background: i < quizIndex ? 'var(--success-green)' : i === quizIndex ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <motion.div
          key={quizIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="glass-card"
          style={{ width: '100%', marginBottom: 'var(--space-xl)' }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
            Question {quizIndex + 1} of {REFLECT_QUESTIONS.length}
          </div>
          <div className="question-prompt">{q.prompt}</div>

          <div className="answer-options">
            {q.options.map(opt => {
              let cls = 'option-btn';
              if (answered) {
                if (opt === q.correct) cls += ' correct';
                else if (opt === userAnswer) cls += ' wrong';
              }
              return (
                <motion.button
                  key={opt}
                  className={cls}
                  onClick={() => handleQuizAnswer(opt)}
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  marginTop: 'var(--space-md)',
                  padding: 'var(--space-md)',
                  background: userAnswer === q.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `4px solid ${userAnswer === q.correct ? 'var(--success-green)' : 'var(--error-red)'}`,
                }}
              >
                <div style={{ fontWeight: 700, color: userAnswer === q.correct ? 'var(--success-green)' : 'var(--error-red)', marginBottom: 4 }}>
                  {userAnswer === q.correct ? '✅ Correct!' : '❌ Not quite!'}
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{q.explanation}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {answered && (
            <motion.button
              className="btn btn-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNextQuiz}
              style={{ fontSize: '1.125rem', padding: '14px 36px' }}
            >
              {quizIndex < REFLECT_QUESTIONS.length - 1 ? 'Next Question →' : '🏆 See My Badge!'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Badge screen
  if (phase === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)', textAlign: 'center' }}
      >
        <Confetti active={showConfetti} />

        <h2 style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-xl)' }}>🏅 You Earned a Badge!</h2>

        <BadgeDisplay
          icon={earnedBadge.icon}
          title={earnedBadge.title}
          description={earnedBadge.description}
          stars={stars}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 'var(--space-2xl)' }}
        >
          <p style={{ marginBottom: 'var(--space-xl)', maxWidth: 400 }}>
            You've completed the <strong style={{ color: 'var(--accent-gold)' }}>Numbers to 200</strong> module.
            You can replay to improve your score and earn more stars!
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              className="btn btn-primary"
              onClick={() => { narrationRef.current?.cancel(); stopNarration(); resetGame(); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontSize: '1.125rem', padding: '14px 36px' }}
            >
              🔄 Play Again!
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}
