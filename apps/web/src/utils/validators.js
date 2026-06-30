// apps/web/src/utils/validators.js

/**
 * Validate an email address format.
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate an Ethiopian phone number format.
 * Accepts formats: 0911XXXXXXX, +251911XXXXXXX, 251911XXXXXXX
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if the phone number is valid
 */
export const isValidEthiopianPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^(\+?251|0)?[79]\d{8}$/;
  return phoneRegex.test(cleaned);
};

/**
 * Validate a password meets minimum security requirements.
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 *
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }

  return { isValid: true, message: 'Password is valid.' };
};

/**
 * Validate that a value is not empty.
 *
 * @param {string} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} Validation result
 */
export const isRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, message: `${fieldName} is required.` };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate that a number is within a range.
 *
 * @param {number} value - Number to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} Validation result
 */
export const isInRange = (value, min, max, fieldName = 'Value') => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} must be a valid number.` };
  }
  if (num < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min}.` };
  }
  if (num > max) {
    return { isValid: false, message: `${fieldName} must be at most ${max}.` };
  }
  return { isValid: true, message: '' };
};