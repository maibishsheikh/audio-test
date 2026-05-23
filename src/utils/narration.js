// Narration Scripts for Numbers to 200
// All text matches on-screen UI text exactly
// Content policy: paragraphs & questions only, never titles

import { say, ask, cheer, emphasize, think, celebrate, encourage } from './audio.js';

/**
 * Intro Screen Narration (3 segments)
 */
export function introNarration() {
  return [
    ask("Ready to explore numbers beyond 100?"),
    say("Join Xiao Ming on a journey to understand numbers 101 to 200 through stories, simulations, and fun games!"),
    think("Let's discover how hundreds, tens, and ones work together to make bigger numbers."),
  ];
}

/**
 * Wonder Phase Narration (4 segments)
 */
export function wonderNarration() {
  return [
    ask("I have 1 hundred, 3 tens and 5 ones. What number am I?"),
    think("Let's think about this together."),
    emphasize("When we count past ninety-nine, we reach one hundred."),
    say("One hundred is a very special number. It's made of 10 tens!"),
  ];
}

/**
 * Story Phase - Scene 1 Narration (5 segments)
 */
export function storyScene1Narration() {
  return [
    say("Xiao Ming went to the market one sunny morning."),
    say("He saw a big box filled with mangoes."),
    emphasize("The sign said: 100 mangoes in this box!"),
    think("Xiao Ming wondered, what does 100 really mean?"),
    say("The shopkeeper explained: 100 is the same as 10 groups of 10. That's 10 tens!"),
  ];
}

/**
 * Story Phase - Scene 2 Narration (5 segments)
 */
export function storyScene2Narration() {
  return [
    say("Next, Xiao Ming saw bags of mangoes on the table."),
    say("Each bag had exactly 10 mangoes."),
    say("There were 4 bags, plus 7 single mangoes on the side."),
    emphasize("The shopkeeper said: That's 1 hundred, 4 tens, and 7 ones."),
    say("Together, they make 147 mangoes!"),
  ];
}

/**
 * Story Phase - Scene 3 Narration (4 segments)
 */
export function storyScene3Narration() {
  return [
    say("The shopkeeper showed Xiao Ming a special chart."),
    emphasize("It had three columns: Hundreds, Tens, and Ones."),
    say("Each digit in a number has its own place and its own value."),
    celebrate("Now Xiao Ming understood! The position of each digit tells us how much it's worth!"),
  ];
}

/**
 * Simulate Phase - Station A Introduction (3 segments)
 */
export function simulateStationAIntro() {
  return [
    think("Welcome to Station A: Build It!"),
    say("You'll see a number on the screen. Your job is to build it using base-ten blocks."),
    say("Drag the correct number of hundreds, tens, and ones blocks to the chart."),
  ];
}

/**
 * Simulate Phase - Station B Introduction (3 segments)
 */
export function simulateStationBIntro() {
  return [
    think("Welcome to Station B: Read It!"),
    say("You'll see blocks arranged on the place value chart."),
    say("Can you figure out what number they represent? Choose the correct answer!"),
  ];
}

/**
 * Simulate Phase - Station C Introduction (3 segments)
 */
export function simulateStationCIntro() {
  return [
    think("Welcome to Station C: Compare It!"),
    ask("Which number is greater?"),
    say("Look at both arrangements carefully and decide: greater than, less than, or equal to?"),
  ];
}

/**
 * Simulate Phase - Correct Answer Feedback (2 segments)
 */
export function simulateCorrectNarration() {
  return [
    encourage("That's correct! Well done!"),
    celebrate("You're really understanding place value!"),
  ];
}

/**
 * Simulate Phase - Incorrect Answer Feedback (2 segments)
 */
export function simulateIncorrectNarration() {
  return [
    encourage("Not quite right, but that's okay!"),
    think("Let's try again. Look carefully at each place value column."),
  ];
}

/**
 * Play Phase - Introduction (2 segments)
 */
export function playIntroNarration() {
  return [
    say("Now it's time to test your skills with 100 questions!"),
    encourage("Answer correctly to build your streak and earn bonus points. You've got this!"),
  ];
}

/**
 * Play Phase - Streak Milestone Narration
 * @param {number} streak - Current streak count
 * @returns {Array} - Narration segments
 */
export function streakNarration(streak) {
  if (streak === 3) {
    return [
      celebrate("Amazing! You've got a 3-question streak!"),
      encourage("Keep going to earn even more bonus points!"),
    ];
  } else if (streak === 5) {
    return [
      celebrate("Incredible! 5 in a row! You're on fire!"),
      cheer("You're earning maximum bonus points now!"),
    ];
  } else if (streak === 10) {
    return [
      celebrate("Wow! 10 correct answers in a row! You're a place value master!"),
      cheer("Keep up this amazing work!"),
    ];
  }
  return [];
}

/**
 * Reflect Phase - Summary Narration
 * @param {number} stars - Number of stars earned (0-3)
 * @returns {Array} - Narration segments
 */
export function reflectNarration(stars) {
  const segments = [];
  
  if (stars === 3) {
    segments.push(celebrate("Outstanding work! You earned 3 stars!"));
    segments.push(cheer("You've mastered numbers to 200!"));
  } else if (stars === 2) {
    segments.push(celebrate("Great job! You earned 2 stars!"));
    segments.push(encourage("You're doing really well with place value!"));
  } else if (stars === 1) {
    segments.push(encourage("Good effort! You earned 1 star!"));
    segments.push(say("Keep practicing and you'll get even better!"));
  } else {
    segments.push(encourage("Thanks for trying!"));
    segments.push(say("Practice makes progress. Try again to improve your score!"));
  }
  
  segments.push(say("Let's review what you learned about hundreds, tens, and ones."));
  segments.push(ask("Are you ready to see your achievements?"));
  
  return segments;
}

/**
 * Generic celebration for milestones
 */
export function genericCelebration() {
  return [
    celebrate("Fantastic work!"),
    cheer("You're doing an amazing job!"),
  ];
}

/**
 * Generic encouragement
 */
export function genericEncouragement() {
  return [
    encourage("Keep trying! You're learning!"),
    think("Every mistake helps us learn something new."),
  ];
}
