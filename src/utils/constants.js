// Application Constants
// BASENAME must match Vite's base in vite.config.js so script paths and router stay in sync
const getBasename = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) {
    const b = import.meta.env.BASE_URL;
    return typeof b === 'string' && b.length ? b : '/';
  }
  return '/';
};

export const APP_CONFIG = {
  //  BASE_URL: 'https://www.foxecom.in/backend',
  // API_BASE_URL: 'https://www.foxecom.in/backend/api',
  
  BASE_URL: 'http://localhost:3000',
  API_BASE_URL: 'http://localhost:3000/api',
  BASENAME: getBasename(),
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  ADMIN_TOKEN: 'adminToken',
  ADMIN_ROLE: 'adminRole',
  GUEST_CART_ID: 'guestCartId',
  IS_ADMIN: 'isAdmin',
  USER: 'user',
  /** Persistent anonymous id for website analytics and live visitor session_id (localStorage) */
  VISITOR_ID: 'visitorId',
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  ADMIN_DEFAULT_LIMIT: 20,
};

// Debounce Delays (in milliseconds)
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  FILTER: 500,
  INPUT: 300,
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  INVALID_NAME: `Name must be between ${VALIDATION.NAME_MIN_LENGTH} and ${VALIDATION.NAME_MAX_LENGTH} characters`,
  INVALID_PHONE: 'Please enter a valid phone number',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  SIGNUP: 'Account created successfully',
  UPDATE: 'Updated successfully',
  DELETE: 'Deleted successfully',
  CREATE: 'Created successfully',
  CART_ADD: 'Item added to cart',
  CART_REMOVE: 'Item removed from cart',
  ORDER_PLACED: 'Order placed successfully',
};

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Payment Methods
export const PAYMENT_METHODS = {
  PAYU: 'payu',
  COD: 'cod',
};
