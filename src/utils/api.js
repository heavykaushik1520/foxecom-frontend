// src/utils/api.js
// API utility functions for backend communication

import { APP_CONFIG, STORAGE_KEYS } from './constants';

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;
export const BASE_URL = APP_CONFIG.BASE_URL;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Helper function to get admin auth token
const getAdminToken = () => {
  return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
};

// Helper function for admin API requests (uses adminToken instead of regular token)
const adminApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAdminToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    // If backend sent a refreshed token, store it
    const refreshedToken = response.headers.get('x-auth-token');
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, refreshedToken);
    }
    
    // Handle 204 No Content and other responses with no body
    if (response.status === 204 || response.status === 201) {
      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { data: null, status: response.status };
      }
    }
    
    // Try to parse JSON, but handle empty responses gracefully
    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // If parsing fails, return the text as data
        data = text;
      }
    }
    
    if (!response.ok) {
      const message = (typeof data === 'string' ? data : data?.message) || 'API request failed';

      // Detect invalid/expired admin token and clear it
      const lowerMsg = String(message).toLowerCase();
      const isTokenError =
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
          ? lowerMsg.includes('invalid token') ||
            lowerMsg.includes('expired token') ||
            lowerMsg.includes('invalid or expired token')
          : false;

      if (isTokenError) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
        const err = new Error('Admin session expired. Please log in again.');
        err.isAdminTokenError = true;
        err.status = response.status;
        throw err;
      }

      throw new Error(message);
    }
    
    return { data, status: response.status };
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
};

// Import fallback image
import fallbackImage from '../assest/images/product-item1.jpg';

// Helper function to get full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return fallbackImage;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a backend upload path (starts with /uploads/), prepend base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // If it's already an imported image (object with src property or string path from import), return as is
  if (typeof imagePath === 'object' || (typeof imagePath === 'string' && !imagePath.startsWith('/'))) {
    return imagePath;
  }
  
  // If it's a local image path (starts with /images/), try to import it
  // Note: Dynamic imports don't work well in Vite, so we return the path
  // Components should import images directly when possible
  if (imagePath.startsWith('/images/')) {
    // Return fallback for now - components should import images directly
    return fallbackImage;
  }
  
  // Default: assume it's a backend upload path
  return `${BASE_URL}/${imagePath}`;
};

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);

    // If backend sent a refreshed token (sliding expiry), store it
    const refreshedToken = response.headers.get('x-auth-token');
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, refreshedToken);
    }

    // Handle 204 No Content and other responses with no body
    if (response.status === 204 || response.status === 201) {
      // Check if response has content before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { data: null, status: response.status };
      }
    }
    
    // Try to parse JSON, but handle empty responses gracefully
    let data = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // If parsing fails, return the text as data
        data = text;
      }
    }
    
    if (!response.ok) {
      // Handle invalid or expired token (401 Unauthorized or 403 Forbidden with token error)
      const isTokenError = (response.status === 401 || response.status === 403) && 
                          data && data.message && 
                          (data.message.toLowerCase().includes('invalid or expired token') || 
                           data.message.toLowerCase().includes('invalid token') ||
                           data.message.toLowerCase().includes('expired token') ||
                           data.message.toLowerCase().includes('token expired'));
      
      if (isTokenError) {
        // Clear invalid token
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        // Clear user-related data
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Create a custom error that can be caught and handled
        const error = new Error(data.message || 'Invalid or expired token');
        error.isTokenError = true;
        error.status = response.status;
        throw error;
      }
      throw new Error(data?.message || 'API request failed');
    }
    
    return { data, status: response.status };
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.isTokenError) {
      throw error;
    }
    console.error('API Error:', error);
    throw error;
  }
};

// Product APIs
export const productAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data.products || [];
  },
  
  getById: async (id) => {
    const { data } = await apiRequest(`/products/${id}`);
    return data;
  },
  
  search: async (name) => {
    const { data } = await apiRequest(`/products/search?name=${encodeURIComponent(name)}`);
    return data;
  },

  // Enhanced filtering and sorting
  filterAndSort: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products/filter${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },

  // Get available filter options
  getFilterOptions: async (categoryId = null) => {
    const endpoint = categoryId 
      ? `/products/filter/options?categoryId=${categoryId}`
      : '/products/filter/options';
    const { data } = await apiRequest(endpoint);
    return data;
  },
};

// Category APIs
// Public banners (billboard) – no auth
export const bannersAPI = {
  getAll: async () => {
    const { data } = await apiRequest('/banners');
    return data?.banners ?? [];
  },
};

// Deal of the Week APIs
export const dealOfTheWeekAPI = {
  // Public: Get active deal
  getActive: async () => {
    const { data } = await apiRequest('/deal-of-the-week');
    return data?.deal || null;
  },
  
  // Admin: Get all deals
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/deal-of-the-week${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },
  
  // Admin: Get deal by ID
  getById: async (id) => {
    const { data } = await adminApiRequest(`/admin/deal-of-the-week/${id}`);
    return data;
  },
  
  // Admin: Create deal
  create: async (dealData) => {
    const { data } = await adminApiRequest('/admin/deal-of-the-week', {
      method: 'POST',
      body: JSON.stringify(dealData),
    });
    return data;
  },
  
  // Admin: Update deal
  update: async (id, dealData) => {
    const { data } = await adminApiRequest(`/admin/deal-of-the-week/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    });
    return data;
  },
  
  // Admin: Delete deal
  delete: async (id) => {
    const { data } = await adminApiRequest(`/admin/deal-of-the-week/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

// Buy One Get One APIs
export const buyOneGetOneAPI = {
  getActive: async () => {
    const { data } = await apiRequest('/buy-one-get-one');
    return data?.deal || null;
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/buy-one-get-one${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },

  getById: async (id) => {
    const { data } = await adminApiRequest(`/admin/buy-one-get-one/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await adminApiRequest('/admin/buy-one-get-one', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  update: async (id, payload) => {
    const { data } = await adminApiRequest(`/admin/buy-one-get-one/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data;
  },

  delete: async (id) => {
    const { data } = await adminApiRequest(`/admin/buy-one-get-one/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

// FOXECOM Originals APIs
export const foxcomOriginalsAPI = {
  // Public: Get active originals section
  getActive: async () => {
    const { data } = await apiRequest('/foxcom-originals');
    return data?.originals || null;
  },

  // Admin: Get all originals sections
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/foxcom-originals${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },

  // Admin: Get originals by ID
  getById: async (id) => {
    const { data } = await adminApiRequest(`/admin/foxcom-originals/${id}`);
    return data;
  },

  // Admin: Create originals section
  create: async (payload) => {
    const { data } = await adminApiRequest('/admin/foxcom-originals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },

  // Admin: Update originals section
  update: async (id, payload) => {
    const { data } = await adminApiRequest(`/admin/foxcom-originals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data;
  },

  // Admin: Delete originals section
  delete: async (id) => {
    const { data } = await adminApiRequest(`/admin/foxcom-originals/${id}`, {
      method: 'DELETE',
    });
    return data;
  },
};

export const categoryAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
  
  getById: async (id, options = {}) => {
    const params = new URLSearchParams();
    if (options.includeProducts === false) {
      params.set('includeProducts', 'false');
    }
    const qs = params.toString();
    const path = encodeURIComponent(String(id ?? ''));
    const endpoint = `/categories/${path}${qs ? `?${qs}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
};

// Mobile Brand APIs
export const mobileBrandAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/mobile-brands${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
  
  getById: async (id) => {
    const { data } = await apiRequest(`/mobile-brands/${id}`);
    return data;
  },
};

// Mobile Model APIs
export const mobileModelAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/mobile-models${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
  
  getById: async (id) => {
    const { data } = await apiRequest(`/mobile-models/${id}`);
    return data;
  },
};

// Guest Cart APIs
export const guestCartAPI = {
  create: async (guestCartId) => {
    const { data } = await apiRequest('/guest-cart', {
      method: 'POST',
      body: JSON.stringify({ guestCartId }),
    });
    return data;
  },
  
  get: async (guestCartId) => {
    const { data } = await apiRequest(`/guest-cart/${guestCartId}`);
    return data;
  },
  
  addItem: async (guestCartId, productId, quantity = 1) => {
    const { data } = await apiRequest(`/guest-cart/${guestCartId}/add`, {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return data;
  },
  
  updateItem: async (guestCartId, productId, quantity) => {
    const { data } = await apiRequest(`/guest-cart/${guestCartId}/update`, {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
    return data;
  },
  
  removeItem: async (guestCartId, productId) => {
    const { data, status } = await apiRequest(`/guest-cart/${guestCartId}/item/${productId}`, {
      method: 'DELETE',
    });
    // 204 No Content is expected for successful delete
    return { success: status === 204 || status === 200, data };
  },
};

// User Cart APIs (requires authentication)
export const userCartAPI = {
  get: async () => {
    const { data } = await apiRequest('/cart');
    return data;
  },
  
  addItem: async (productId, quantity = 1) => {
    const { data } = await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return data;
  },
  
  updateItem: async (productId, quantity) => {
    const { data } = await apiRequest('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    });
    return data;
  },
  
  removeItem: async (productId) => {
    const { data, status } = await apiRequest(`/cart/${productId}`, {
      method: 'DELETE',
    });
    // 204 No Content is expected for successful delete
    return { success: status === 204 || status === 200, data };
  },
  
  clear: async () => {
    const { data, status } = await apiRequest('/cart', {
      method: 'DELETE',
    });
    // 204 No Content is expected for successful delete
    return { success: status === 204 || status === 200, data };
  },
  
  mergeGuestCart: async (guestCartId) => {
    const { data } = await apiRequest('/merge-carts', {
      method: 'POST',
      body: JSON.stringify({ guestCartId }),
    });
    return data;
  },
  
  validateCheckout: async () => {
    const { data } = await apiRequest('/cart/validate-checkout');
    return data;
  },
};

// Checkout APIs
export const checkoutAPI = {
  getSummary: async (preferredPaymentMethod = 'OTHER') => {
    const q = preferredPaymentMethod ? `?preferredPaymentMethod=${encodeURIComponent(preferredPaymentMethod)}` : '';
    const { data } = await apiRequest(`/checkout/summary${q}`);
    return data;
  },
  
  validateAddress: async (addressData) => {
    const { data } = await apiRequest('/checkout/validate-address', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
    return data;
  },
  
  getPaymentMethods: async () => {
    const { data } = await apiRequest('/checkout/payment-methods');
    return data;
  },
};

// Review APIs (public: product reviews are managed by admin)
export const reviewAPI = {
  getByProduct: async (productId) => {
    const { data } = await apiRequest(`/products/${productId}/reviews`);
    return data;
  },
  getSellerReviewsByProduct: async (productId) => {
    const { data } = await apiRequest(`/products/${productId}/seller-reviews`);
    return data;
  },
  // Customer: create or update their review (requires auth token)
  createOrUpdateCustomerReview: async (productId, { rating, reviewText }) => {
    const payload = {
      rating,
      reviewText,
    };
    const { data } = await apiRequest(`/customer/products/${productId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  },
  // Customer: list your reviews (requires auth token)
  getMyReviews: async () => {
    const { data } = await apiRequest(`/customer/my-reviews`);
    return data;
  },
};

// Order APIs
export const orderAPI = {
  create: async (orderData) => {
    const { data } = await apiRequest('/order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return data;
  },

  // Customer: fetch my orders (requires auth token)
  // Backend supports `status`, `page`, `limit`.
  getMyOrders: async ({ status, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const qs = params.toString();
    const { data } = await apiRequest(`/order${qs ? `?${qs}` : ""}`);
    return data?.orders || [];
  },
  
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/order${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
  
  getById: async (id) => {
    const { data } = await apiRequest(`/order/${id}`);
    return data;
  },
  
  cancel: async (id) => {
    const { data } = await apiRequest(`/order/${id}/cancel`, {
      method: 'PUT',
    });
    return data;
  },

  trackOrder: async (orderId) => {
    const { data } = await apiRequest(`/track/${orderId}`);
    return data;
  },

  getShippingLabel: async (orderId) => {
    const { data } = await apiRequest(`/order/${orderId}/shipping-label`);
    return data;
  },
};

// Payment APIs
export const paymentAPI = {
  createPayuPayment: async (orderId) => {
    const { data } = await apiRequest('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
    return data;
  },
  
  verifyPayment: async (paymentData) => {
    const { data } = await apiRequest('/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return data;
  },
};

// Contact Form API (public)
export const contactAPI = {
  submit: async (payload) => {
    const { data } = await apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },
};

// Delhivery Shipping API – admin endpoints use admin token; pincode/TAT/track are public
// NOTE: API_BASE_URL already includes '/api', so do NOT prefix with '/api' here.
const DELHIVERY_BASE = '/shipping/delhivery';
export const shippingAPI = {
  getConfig: async () => {
    const { data } = await adminApiRequest(`${DELHIVERY_BASE}/config`);
    return data;
  },
  checkPincode: async (pincode) => {
    const pin = String(pincode || '').replace(/\D/g, '').slice(0, 6);
    const { data } = await apiRequest(`${DELHIVERY_BASE}/pincode/serviceability/${pin || '000000'}`);
    return data;
  },
  getTat: async (originPin, destPin) => {
    const params = new URLSearchParams();
    if (originPin) params.set('originPin', originPin);
    if (destPin) params.set('destPin', destPin);
    const { data } = await apiRequest(`${DELHIVERY_BASE}/tat?${params.toString()}`);
    return data;
  },
  createShipment: async (orderId, options = {}) => {
    const { data } = await adminApiRequest(`${DELHIVERY_BASE}/shipment/create`, {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        fetchWaybill: options.fetchWaybill === true,
        weightGm: options.weightGm,
        sellerGstTin: options.sellerGstTin,
        hsnCode: options.hsnCode,
      }),
    });
    return data;
  },
  getLabel: async (waybill) => {
    const { data } = await adminApiRequest(`${DELHIVERY_BASE}/shipment/label/${encodeURIComponent(waybill)}`);
    return data;
  },
  trackShipment: async (waybill) => {
    const { data } = await apiRequest(`${DELHIVERY_BASE}/shipment/track/${encodeURIComponent(waybill)}`);
    return data;
  },
  prepare: async (orderId, fetchWaybill = false) => {
    const { data } = await adminApiRequest(
      `${DELHIVERY_BASE}/order/${orderId}/prepare?fetchWaybill=${fetchWaybill ? 'true' : 'false'}`
    );
    return data;
  },
  bulkWaybill: async (count = 5) => {
    const { data } = await adminApiRequest(`${DELHIVERY_BASE}/waybill/bulk?count=${Math.min(Math.max(1, count), 100)}`);
    return data;
  },
};

// User Authentication APIs
export const userAuthAPI = {
  signup: async (email, password) => {
    const { data } = await apiRequest('/auth/user/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  },

  signin: async (email, password) => {
    const { data } = await apiRequest('/auth/user/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  },

  signout: async () => {
    const { data } = await apiRequest('/auth/user/signout', {
      method: 'POST',
    });
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await apiRequest('/auth/user/me');
    return data;
  },

  refreshToken: async () => {
    const { data } = await apiRequest('/auth/user/refresh-token', {
      method: 'POST',
    });
    if (data?.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    }
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await apiRequest('/auth/user/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  },

  resetPassword: async (token, newPassword) => {
    const { data } = await apiRequest('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
    return data;
  },
};

// User Profile APIs
export const userAPI = {
  getProfile: async () => {
    const { data } = await apiRequest('/me');
    return data;
  },

  updateProfile: async (userData) => {
    const { data } = await apiRequest('/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return data;
  },

  deleteAccount: async () => {
    const { data, status } = await apiRequest('/me', {
      method: 'DELETE',
    });
    return { success: status === 204 || status === 200, data };
  },
};

// Case Details APIs
export const caseDetailsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/case-details${queryString ? `?${queryString}` : ''}`;
    const { data } = await apiRequest(endpoint);
    return data;
  },
  getById: async (id) => {
    const { data } = await apiRequest(`/case-details/${id}`);
    return data;
  },
};

// Admin APIs
export const adminAPI = {
  // Admin Authentication (doesn't require admin token since it's login)
  login: async (email, password) => {
    const { data } = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return data;
  },

  // Admin Management - CRUD
  createAdmin: async (adminData) => {
    const { data } = await adminApiRequest('/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, admin: data };
  },

  getAllAdmins: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admins${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, admins: Array.isArray(data) ? data : [], pagination: {} };
  },

  getAdminById: async (id) => {
    const { data } = await adminApiRequest(`/admins/${id}`);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, admin: data };
  },

  updateAdmin: async (id, adminData) => {
    const { data } = await adminApiRequest(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, admin: data };
  },

  deleteAdmin: async (id) => {
    const { data } = await adminApiRequest(`/admins/${id}`, {
      method: 'DELETE',
    });
    // Handle both new format (with success) and legacy format
    if (data && data.success !== undefined) {
      return data;
    }
    return { success: true, message: 'Admin deleted successfully' };
  },

  // Dashboard Statistics
  getDashboardStats: async () => {
    const { data } = await adminApiRequest('/admin/dashboard/stats');
    return data;
  },

  // Dashboard Revenue by period (admin)
  getRevenueByPeriod: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/dashboard/revenue${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },

  /** Live visitors (heartbeat within last ~2 minutes on server) */
  getLiveVisitors: async () => {
    const { data } = await adminApiRequest('/admin/live-visitors');
    return data;
  },

  /** Live viewers on a product page (same online window as getLiveVisitors) */
  getProductLiveViewers: async (productId) => {
    const { data } = await adminApiRequest(`/admin/product-live-viewers/${encodeURIComponent(productId)}`);
    return data;
  },

  // Download Meta Product Catalog CSV feed (admin-protected)
  downloadMetaProductFeed: async () => {
    const token = getAdminToken();
    const response = await fetch(`${API_BASE_URL}/meta-product-feed.csv`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const refreshedToken = response.headers.get('x-auth-token');
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, refreshedToken);
    }

    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? 'Admin session expired. Please log in again.'
        : 'Failed to download Meta CSV feed';

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
        const err = new Error(message);
        err.isAdminTokenError = true;
        err.status = response.status;
        throw err;
      }

      throw new Error(message);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = 'meta-product-feed.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  },

  // Download GST monthly Excel (admin-protected)
  downloadGstMonthlyExcel: async (month) => {
    const token = getAdminToken();
    const params = new URLSearchParams();
    if (month) params.set("month", month);

    const response = await fetch(
      `${API_BASE_URL}/admin/orders/gst-export${params.toString() ? `?${params.toString()}` : ""}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    const refreshedToken = response.headers.get("x-auth-token");
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, refreshedToken);
    }

    if (!response.ok) {
      const message = response.status === 401 || response.status === 403
        ? "Admin session expired. Please log in again."
        : "Failed to download GST monthly Excel";

      if (response.status === 400 || response.status === 401 || response.status === 403) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
        const err = new Error(message);
        err.isAdminTokenError = true;
        err.status = response.status;
        throw err;
      }

      throw new Error(message);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `gst-details-${month || "current-month"}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  },

  // Banners (billboard) CMS
  getBanners: async () => {
    const { data } = await adminApiRequest('/admin/banners');
    return data?.banners ?? [];
  },
  createBanner: async (formData) => {
    const url = `${API_BASE_URL}/admin/banners`;
    const token = getAdminToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create banner');
    return data;
  },
  updateBanner: async (id, formData) => {
    const url = `${API_BASE_URL}/admin/banners/${id}`;
    const token = getAdminToken();
    const res = await fetch(url, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update banner');
    return data;
  },
  deleteBanner: async (id) => {
    const { data } = await adminApiRequest(`/admin/banners/${id}`, { method: 'DELETE' });
    return data;
  },
  reorderBanners: async (orderIds) => {
    const { data } = await adminApiRequest('/admin/banners/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order: orderIds }),
    });
    return data;
  },

  // Product Reviews (admin-managed CMS)
  getProductReviews: async (productId) => {
    const { data } = await adminApiRequest(`/admin/products/${productId}/reviews`);
    return data?.reviews ?? [];
  },
  getProductRatingSummary: async (productId) => {
    const { data } = await adminApiRequest(`/admin/products/${productId}/rating-summary`);
    return data?.ratingSummary ?? { count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 };
  },
  updateProductRatingSummary: async (productId, payload) => {
    const { data } = await adminApiRequest(`/admin/products/${productId}/rating-summary`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data?.ratingSummary ?? payload;
  },
  getAllReviews: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/reviews${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },
  createProductReview: async (productId, payload) => {
    const { data } = await adminApiRequest(`/admin/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data?.review ?? data;
  },
  updateProductReview: async (reviewId, payload) => {
    const { data } = await adminApiRequest(`/admin/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return data?.review ?? data;
  },
  deleteProductReview: async (reviewId) => {
    await adminApiRequest(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
  },

  // Seller reviews (admin-only; multipart for create/update)
  getSellerReviewPerProductStats: async () => {
    const { data } = await adminApiRequest('/admin/seller-reviews/stats/per-product');
    return data?.stats ?? [];
  },
  getSellerReviews: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/seller-reviews${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },
  getSellerReviewsByProduct: async (productId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/seller-reviews/by-product/${productId}${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },
  getSellerReview: async (id) => {
    const { data } = await adminApiRequest(`/admin/seller-reviews/${id}`);
    return data?.sellerReview ?? data;
  },
  createSellerReview: async (formData) => {
    const url = `${API_BASE_URL}/admin/seller-reviews`;
    const token = getAdminToken();
    const res = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const refreshedToken = res.headers.get('x-auth-token');
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, refreshedToken);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to create seller review');
    return data;
  },
  updateSellerReview: async (id, formData) => {
    const url = `${API_BASE_URL}/admin/seller-reviews/${id}`;
    const token = getAdminToken();
    const res = await fetch(url, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const refreshedToken = res.headers.get('x-auth-token');
    if (refreshedToken) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, refreshedToken);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update seller review');
    return data;
  },
  deleteSellerReview: async (id) => {
    await adminApiRequest(`/admin/seller-reviews/${id}`, { method: 'DELETE' });
  },

  getProductsByCategory: async (categoryId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },

  bulkDeleteProducts: async (productIds) => {
    const { data } = await adminApiRequest('/admin/products/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ productIds }),
    });
    return data;
  },

  // Category Management - CRUD
  createCategory: async (categoryData) => {
    const { data } = await adminApiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return data;
  },

  updateCategory: async (id, categoryData) => {
    const { data } = await adminApiRequest(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
    return data;
  },

  deleteCategory: async (id) => {
    await adminApiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Product Management - CRUD
  createProduct: async (formData) => {
    const token = getAdminToken();
    const url = `${API_BASE_URL}/products`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // FormData for file uploads
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product');
    }
    return data;
  },

  updateProduct: async (id, formData) => {
    const token = getAdminToken();
    const url = `${API_BASE_URL}/products/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // FormData for file uploads
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }
    return data;
  },

  deleteProduct: async (id) => {
    await adminApiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Mobile Brand Management - CRUD
  createMobileBrand: async (brandData) => {
    const { data } = await adminApiRequest('/mobile-brands', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
    return data;
  },

  updateMobileBrand: async (id, brandData) => {
    const { data } = await adminApiRequest(`/mobile-brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(brandData),
    });
    return data;
  },

  deleteMobileBrand: async (id) => {
    await adminApiRequest(`/mobile-brands/${id}`, {
      method: 'DELETE',
    });
  },

  // Mobile Model Management - CRUD
  createMobileModel: async (modelData) => {
    const { data } = await adminApiRequest('/mobile-models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
    return data;
  },

  updateMobileModel: async (id, modelData) => {
    const { data } = await adminApiRequest(`/mobile-models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
    return data;
  },

  deleteMobileModel: async (id) => {
    await adminApiRequest(`/mobile-models/${id}`, {
      method: 'DELETE',
    });
  },

  // Case Details Management - CRUD
  createCaseDetail: async (caseData) => {
    const { data } = await adminApiRequest('/case-details', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
    return data;
  },

  updateCaseDetail: async (id, caseData) => {
    const { data } = await adminApiRequest(`/case-details/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
    return data;
  },

  deleteCaseDetail: async (id) => {
    await adminApiRequest(`/case-details/${id}`, {
      method: 'DELETE',
    });
  },

  // User Management (Admin only) - CRUD
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },

  getUserProfile: async (userId) => {
    const { data } = await adminApiRequest(`/admin/users/${userId}`);
    return data;
  },

  getUserOrders: async (userId) => {
    const { data } = await adminApiRequest(`/admin/users/${userId}/orders`);
    return data;
  },

  updateUser: async (id, userData) => {
    const { data } = await adminApiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return data;
  },

  deleteUser: async (id) => {
    await adminApiRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin Orders - CRUD
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, data: data.data || data, pagination: data.pagination || {} };
  },

  getOrderById: async (id) => {
    const { data } = await adminApiRequest(`/admin/orders/${id}`);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, data: data.data || data };
  },

  // Order Status Update
  updateOrderStatus: async (id, statusData) => {
    const { data } = await adminApiRequest(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, data };
  },

  // Get Orders with Filters
  getOrdersWithFilters: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/orders/filter${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, data: data.data || [], pagination: data.pagination || {} };
  },

  // Admin Product Listing with Filters
  getAllProductsForAdmin: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, products: data.products || [], pagination: data.pagination || {} };
  },

  // Bulk Operations
  bulkDeleteCategories: async (categoryIds) => {
    const { data } = await adminApiRequest('/admin/categories/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ categoryIds }),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, message: 'Categories deleted successfully' };
  },

  bulkDeleteMobileBrands: async (brandIds) => {
    const { data } = await adminApiRequest('/mobile-brands/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ brandIds }),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, message: 'Brands deleted successfully' };
  },

  bulkDeleteMobileModels: async (modelIds) => {
    const { data } = await adminApiRequest('/mobile-models/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ modelIds }),
    });
    // Handle both new format (with success) and legacy format
    if (data.success !== undefined) {
      return data;
    }
    return { success: true, message: 'Models deleted successfully' };
  },
};

// Super Admin APIs (only for role superadmin; use same admin token)
export const superadminAPI = {
  getDashboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/superadmin/dashboard${queryString ? `?${queryString}` : ''}`;
    const { data } = await adminApiRequest(endpoint);
    return data;
  },
  createSuperAdmin: async (payload) => {
    const { data } = await adminApiRequest('/superadmin/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  },
};

/** Admin-only read; public recording is done from useTrackPageVisit via fetch. */
export const analyticsAPI = {
  getSummary: async () => {
    const { data } = await adminApiRequest('/analytics/summary');
    return data;
  },
  getPages: async () => {
    const { data } = await adminApiRequest('/analytics/pages');
    return data;
  },
  getDaily: async (days = 30) => {
    const n = Math.min(Math.max(Number(days) || 30, 1), 366);
    const { data } = await adminApiRequest(`/analytics/daily?days=${encodeURIComponent(n)}`);
    return data;
  },
  /** Order line-item sales (excludes cancelled orders). Omit days or use days=all for all time. */
  getSales: async ({ days, limit = 100 } = {}) => {
    const params = new URLSearchParams();
    if (days != null && days !== '' && String(days).toLowerCase() !== 'all') {
      const n = Math.min(Math.max(Number(days) || 0, 1), 3660);
      params.set('days', String(n));
    }
    const lim = Math.min(Math.max(Number(limit) || 100, 1), 200);
    params.set('limit', String(lim));
    const qs = params.toString();
    const { data } = await adminApiRequest(`/analytics/sales?${qs}`);
    return data;
  },
};

export default {
  productAPI,
  categoryAPI,
  bannersAPI,
  mobileBrandAPI,
  mobileModelAPI,
  guestCartAPI,
  userCartAPI,
  checkoutAPI,
  orderAPI,
  paymentAPI,
  contactAPI,
  shippingAPI,
  caseDetailsAPI,
  userAuthAPI,
  userAPI,
  adminAPI,
  superadminAPI,
  analyticsAPI,
};
