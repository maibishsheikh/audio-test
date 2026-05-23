import { createContext, useContext, useReducer, useEffect } from 'react';

const GameContext = createContext();

// Initial state shape per TRD
const initialState = {
  phase: 'intro', // 'intro' | 'wonder' | 'story' | 'simulate' | 'play' | 'reflect'
  audioEnabled: true,
  score: 0,
  streak: 0,
  maxStreak: 0,
  questionsAnswered: 0,
  questionsCorrect: 0,
  sessionQuestions: [], // Shuffled 100-question array for this session
  currentQuestionIndex: 0,
  simulateProgress: {
    stationA: { completed: false, attempts: 0 },
    stationB: { completed: false, attempts: 0 },
    stationC: { completed: false, attempts: 0 },
  },
  badges: [], // Earned badge IDs
  stars: 0, // 0–3 based on final score %
};

// Action types
const ACTIONS = {
  SET_PHASE: 'SET_PHASE',
  TOGGLE_AUDIO: 'TOGGLE_AUDIO',
  ANSWER_CORRECT: 'ANSWER_CORRECT',
  ANSWER_INCORRECT: 'ANSWER_INCORRECT',
  COMPLETE_STATION: 'COMPLETE_STATION',
  SET_SESSION_QUESTIONS: 'SET_SESSION_QUESTIONS',
  ADVANCE_QUESTION: 'ADVANCE_QUESTION',
  AWARD_BADGE: 'AWARD_BADGE',
  SET_STARS: 'SET_STARS',
  RESET_GAME: 'RESET_GAME',
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_PHASE:
      return { ...state, phase: action.payload };

    case ACTIONS.TOGGLE_AUDIO:
      return { ...state, audioEnabled: !state.audioEnabled };

    case ACTIONS.ANSWER_CORRECT: {
      const newStreak = state.streak + 1;
      const newMaxStreak = Math.max(newStreak, state.maxStreak);
      
      // Base score
      let points = 10;
      
      // Streak bonuses per TRD scoring system
      if (newStreak >= 5) {
        points += 20; // ×3 multiplier
      } else if (newStreak >= 3) {
        points += 10; // ×2 multiplier
      }
      
      return {
        ...state,
        score: state.score + points,
        streak: newStreak,
        maxStreak: newMaxStreak,
        questionsAnswered: state.questionsAnswered + 1,
        questionsCorrect: state.questionsCorrect + 1,
      };
    }

    case ACTIONS.ANSWER_INCORRECT:
      return {
        ...state,
        streak: 0, // Reset streak on incorrect answer
        questionsAnswered: state.questionsAnswered + 1,
      };

    case ACTIONS.COMPLETE_STATION: {
      const stationKey = action.payload; // 'stationA', 'stationB', or 'stationC'
      return {
        ...state,
        score: state.score + 15, // +15 points per station completion
        simulateProgress: {
          ...state.simulateProgress,
          [stationKey]: {
            completed: true,
            attempts: state.simulateProgress[stationKey].attempts + 1,
          },
        },
      };
    }

    case ACTIONS.SET_SESSION_QUESTIONS:
      return {
        ...state,
        sessionQuestions: action.payload,
        currentQuestionIndex: 0,
      };

    case ACTIONS.ADVANCE_QUESTION:
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };

    case ACTIONS.AWARD_BADGE:
      return {
        ...state,
        badges: [...state.badges, action.payload],
      };

    case ACTIONS.SET_STARS: {
      // Calculate stars based on accuracy percentage
      const accuracy = state.questionsAnswered > 0 
        ? (state.questionsCorrect / state.questionsAnswered) * 100 
        : 0;
      
      let stars = 0;
      if (accuracy >= 90) stars = 3;
      else if (accuracy >= 70) stars = 2;
      else if (accuracy >= 50) stars = 1;
      
      return { ...state, stars };
    }

    case ACTIONS.RESET_GAME:
      return initialState;

    default:
      return state;
  }
}

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook for using game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }

  const { state, dispatch } = context;

  // Helper functions
  const setPhase = (phase) => {
    dispatch({ type: ACTIONS.SET_PHASE, payload: phase });
  };

  const toggleAudio = () => {
    dispatch({ type: ACTIONS.TOGGLE_AUDIO });
  };

  const answerCorrect = () => {
    dispatch({ type: ACTIONS.ANSWER_CORRECT });
  };

  const answerIncorrect = () => {
    dispatch({ type: ACTIONS.ANSWER_INCORRECT });
  };

  const completeStation = (stationKey) => {
    dispatch({ type: ACTIONS.COMPLETE_STATION, payload: stationKey });
  };

  const setSessionQuestions = (questions) => {
    dispatch({ type: ACTIONS.SET_SESSION_QUESTIONS, payload: questions });
  };

  const advanceQuestion = () => {
    dispatch({ type: ACTIONS.ADVANCE_QUESTION });
  };

  const awardBadge = (badgeId) => {
    dispatch({ type: ACTIONS.AWARD_BADGE, payload: badgeId });
  };

  const calculateStars = () => {
    dispatch({ type: ACTIONS.SET_STARS });
  };

  const resetGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
  };

  // Phase progression helper - linear flow
  const advancePhase = () => {
    const phaseOrder = ['intro', 'wonder', 'story', 'simulate', 'play', 'reflect'];
    const currentIndex = phaseOrder.indexOf(state.phase);
    if (currentIndex < phaseOrder.length - 1) {
      setPhase(phaseOrder[currentIndex + 1]);
    }
  };

  return {
    // State
    phase: state.phase,
    audioEnabled: state.audioEnabled,
    score: state.score,
    streak: state.streak,
    maxStreak: state.maxStreak,
    questionsAnswered: state.questionsAnswered,
    questionsCorrect: state.questionsCorrect,
    sessionQuestions: state.sessionQuestions,
    currentQuestionIndex: state.currentQuestionIndex,
    simulateProgress: state.simulateProgress,
    badges: state.badges,
    stars: state.stars,
    
    // Actions
    setPhase,
    toggleAudio,
    answerCorrect,
    answerIncorrect,
    completeStation,
    setSessionQuestions,
    advanceQuestion,
    awardBadge,
    calculateStars,
    resetGame,
    advancePhase,
  };
}

export { ACTIONS };
