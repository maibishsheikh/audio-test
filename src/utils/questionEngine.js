// Question Engine for Numbers to 200
// Handles shuffling and serving questions from the bank

import QUESTION_BANK from '../data/questions.js';

/**
 * Fisher-Yates shuffle algorithm (in-place)
 * @param {Array} arr - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export function fisherYates(arr) {
  const shuffled = [...arr]; // Create copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Builds a shuffled session of 100 questions
 * Guarantees: first 6 questions = 1 of each QT type
 * Remainder: round-robin shuffled from all types
 * @returns {Array} - Array of 100 question objects
 */
export function buildSessionQuestions() {
  const QT_TYPES = ['QT-1', 'QT-2', 'QT-3', 'QT-4', 'QT-5', 'QT-6'];
  
  // Shuffle each question type pool
  const shuffled = {};
  QT_TYPES.forEach(type => {
    const typeQuestions = QUESTION_BANK.filter(q => q.type === type);
    shuffled[type] = fisherYates(typeQuestions);
  });
  
  // Build session array
  const session = [];
  
  // First 6 questions: one of each type (guaranteed coverage)
  QT_TYPES.forEach(type => {
    if (shuffled[type].length > 0) {
      session.push(shuffled[type].shift());
    }
  });
  
  // Remainder: round-robin from shuffled pools until we have 100
  let typeIndex = 0;
  while (session.length < 100) {
    const type = QT_TYPES[typeIndex % QT_TYPES.length];
    
    if (shuffled[type].length > 0) {
      session.push(shuffled[type].shift());
    }
    
    typeIndex++;
    
    // Safety check: if all pools are empty, break
    const allEmpty = QT_TYPES.every(t => shuffled[t].length === 0);
    if (allEmpty) break;
  }
  
  return session;
}

/**
 * Gets a specific question by ID
 * @param {string} id - Question ID
 * @returns {Object|null} - Question object or null if not found
 */
export function getQuestionById(id) {
  return QUESTION_BANK.find(q => q.id === id) || null;
}

/**
 * Gets all questions of a specific type
 * @param {string} type - Question type (QT-1 through QT-6)
 * @returns {Array} - Array of questions
 */
export function getQuestionsByType(type) {
  return QUESTION_BANK.filter(q => q.type === type);
}

/**
 * Gets questions by difficulty level
 * @param {number} difficulty - Difficulty level (1, 2, or 3)
 * @returns {Array} - Array of questions
 */
export function getQuestionsByDifficulty(difficulty) {
  return QUESTION_BANK.filter(q => q.difficulty === difficulty);
}

/**
 * Validates that the question bank meets requirements
 * @returns {Object} - Validation result with details
 */
export function validateQuestionBank() {
  const QT_TYPES = ['QT-1', 'QT-2', 'QT-3', 'QT-4', 'QT-5', 'QT-6'];
  const EXPECTED_COUNTS = {
    'QT-1': 18,
    'QT-2': 17,
    'QT-3': 18,
    'QT-4': 15,
    'QT-5': 17,
    'QT-6': 15,
  };
  
  const validation = {
    valid: true,
    total: QUESTION_BANK.length,
    expectedTotal: 100,
    typeCounts: {},
    errors: [],
  };
  
  // Check total count
  if (QUESTION_BANK.length !== 100) {
    validation.valid = false;
    validation.errors.push(`Expected 100 questions, found ${QUESTION_BANK.length}`);
  }
  
  // Check counts per type
  QT_TYPES.forEach(type => {
    const count = QUESTION_BANK.filter(q => q.type === type).length;
    validation.typeCounts[type] = count;
    
    if (count !== EXPECTED_COUNTS[type]) {
      validation.valid = false;
      validation.errors.push(`${type}: expected ${EXPECTED_COUNTS[type]}, found ${count}`);
    }
  });
  
  // Check for duplicate IDs
  const ids = QUESTION_BANK.map(q => q.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    validation.valid = false;
    validation.errors.push('Duplicate question IDs found');
  }
  
  return validation;
}
