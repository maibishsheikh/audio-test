// Place Value Utility Functions
// Handles number decomposition and word conversion for numbers 0-200

/**
 * Decomposes a number into hundreds, tens, and ones
 * @param {number} n - Number to decompose (0-200)
 * @returns {Object} - { hundreds, tens, ones }
 */
export function decompose(n) {
  if (n < 0 || n > 200) {
    throw new Error('Number must be between 0 and 200');
  }
  
  return {
    hundreds: Math.floor(n / 100),
    tens: Math.floor((n % 100) / 10),
    ones: n % 10,
  };
}

/**
 * Converts a number to expanded form array
 * @param {number} n - Number to expand (0-200)
 * @returns {Array} - Array of place value parts, e.g., [100, 30, 5] for 135
 */
export function toExpandedForm(n) {
  const { hundreds, tens, ones } = decompose(n);
  const parts = [];
  
  if (hundreds) parts.push(hundreds * 100);
  if (tens) parts.push(tens * 10);
  if (ones) parts.push(ones);
  
  return parts;
}

/**
 * Converts a number to English words
 * @param {number} n - Number to convert (0-200)
 * @returns {string} - English word representation
 */
export function toWords(n) {
  if (n < 0 || n > 200) {
    throw new Error('Number must be between 0 and 200');
  }
  
  // Special cases
  if (n === 0) return 'zero';
  if (n === 100) return 'one hundred';
  if (n === 200) return 'two hundred';
  
  // Lookup tables
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 
                 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  
  const { hundreds, tens: tensDigit, ones: onesDigit } = decompose(n);
  
  let result = '';
  
  // Hundreds place
  if (hundreds === 1) {
    result = 'one hundred';
  } else if (hundreds === 2) {
    result = 'two hundred';
  }
  
  // Tens and ones places
  const remainder = n % 100;
  
  if (remainder > 0) {
    if (result) result += ' and ';
    
    if (remainder < 10) {
      // Just ones
      result += ones[remainder];
    } else if (remainder < 20) {
      // Teens
      result += teens[remainder - 10];
    } else {
      // Tens and possibly ones
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += '-' + ones[onesDigit];
      }
    }
  }
  
  return result;
}

/**
 * Validates if a number is within the valid range (101-200)
 * @param {number} n - Number to validate
 * @returns {boolean} - True if valid
 */
export function isValidNumber(n) {
  return n >= 101 && n <= 200;
}

/**
 * Compares two numbers and returns comparison result
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {string} - '>', '<', or '='
 */
export function compare(a, b) {
  if (a > b) return '>';
  if (a < b) return '<';
  return '=';
}

/**
 * Generates a random number within a specified range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {number} - Random number
 */
export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random number from the module's range with distribution
 * 101-120: 20%, 121-150: 30%, 151-180: 30%, 181-200: 20%
 * @returns {number} - Random number following distribution
 */
export function randomDistributedNumber() {
  const rand = Math.random();
  
  if (rand < 0.2) {
    // 101-120 (20%)
    return randomNumber(101, 120);
  } else if (rand < 0.5) {
    // 121-150 (30%)
    return randomNumber(121, 150);
  } else if (rand < 0.8) {
    // 151-180 (30%)
    return randomNumber(151, 180);
  } else {
    // 181-200 (20%)
    return randomNumber(181, 200);
  }
}
