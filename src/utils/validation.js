import { VALIDATION, ERROR_MESSAGES } from './constants';

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates password
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PASSWORD };
  }
  if (password.length > VALIDATION.PASSWORD_MAX_LENGTH) {
    return { isValid: false, error: `Password must be less than ${VALIDATION.PASSWORD_MAX_LENGTH} characters` };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates name
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  if (name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_NAME };
  }
  if (name.trim().length > VALIDATION.NAME_MAX_LENGTH) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_NAME };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates phone number
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  if (!VALIDATION.PHONE_REGEX.test(phone.trim())) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PHONE };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field (optional)
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'Field') => {
  if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: '' };
};

/**
 * Validates number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateNumberRange = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  if (num < min || num > max) {
    return { isValid: false, error: `Value must be between ${min} and ${max}` };
  }
  return { isValid: true, error: '' };
};

/**
 * Sanitizes string input (basic XSS prevention)
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates form data object
 * @param {object} formData - Form data to validate
 * @param {object} rules - Validation rules { fieldName: validationFunction }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach((fieldName) => {
    const rule = rules[fieldName];
    const value = formData[fieldName];
    const result = rule(value, formData);

    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
