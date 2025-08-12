import { api, setAuthToken, API_ENDPOINTS } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Authentication Service
 * Handles all authentication related API calls
 */
const authService = {
    /**
     * Login user with email and password
     * @param {Object} credentials - User credentials
     * @param {string} credentials.email - User's email
     * @param {string} credentials.password - User's password
     * @param {boolean} credentials.remember - Whether to remember the user
     * @returns {Promise<Object>} Response with user data and token
     */
    login: async ({ email, password, remember = false }) => {
      try {
        const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { 
          email, 
          password 
        }, {
          // Ensure we don't add auth token for login request
          skipAuth: true
        });
        console.log(response);
  
        if (response?.token) {
          // Set auth token
          setAuthToken(response.token);
          
          // Store user data
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Store remember preference
          if (remember) {
            localStorage.setItem('rememberMe', 'true');
          } else {
            sessionStorage.setItem('sessionActive', 'true');
          }
  
          return {
            success: true,
            data: response,
            message: 'Login successful'
          };
        }
  
        return {
          success: false,
          message: 'Invalid response from server'
        };
      } catch (error) {
        return handleApiError(error);
      }
    },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} Current user data
   */
  getCurrentUser: async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.ME);
      console.log("data",data);
      return {
        success: true,
        user: data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const { data } = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, userData);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return {
        success: true,
        user: data.user,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update status
   */
  updatePassword: async (currentPassword, newPassword) => {
    try {
      await api.put(API_ENDPOINTS.AUTH.UPDATE_PASSWORD, {
        currentPassword,
        newPassword
      });
      
      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Request password reset email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Request status
   */
  forgotPassword: async (email) => {
    try {
      await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} password - New password
   * @returns {Promise<Object>} Reset status
   */
  resetPassword: async (token, password) => {
    try {
      await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD(token), { password });
      return {
        success: true,
        message: 'Password has been reset successfully.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} Verification status
   */
  verifyEmail: async (token) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(token));
      return {
        success: true,
        message: data.message || 'Email verified successfully.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User's email
   * @returns {Promise<Object>} Resend status
   */
  resendVerificationEmail: async (email) => {
    try {
      await api.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION_EMAIL, { email });
      return {
        success: true,
        message: 'Verification email has been resent.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    try {
      // Clear all auth data
      setAuthToken(null);
      localStorage.removeItem('user');
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      return { success: false, message: 'Error during logout' };
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data or null if not found
   */
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
