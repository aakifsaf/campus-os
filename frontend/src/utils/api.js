import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { showError, handleApiError } from './notifications';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    // Get the current user from Firebase Auth
    const auth = getAuth();
    const user = auth.currentUser;
    
    // If user is logged in, add the auth token to the request
    if (user) {
      try {
        const token = await user.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response.data;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      switch (status) {
        case 401: // Unauthorized
          // Handle unauthorized access (e.g., redirect to login)
          handleUnauthorized();
          break;
          
        case 403: // Forbidden
          // Handle forbidden access
          showError(data.message || 'You do not have permission to perform this action');
          break;
          
        case 404: // Not Found
          // Handle not found errors
          showError(data.message || 'The requested resource was not found');
          break;
          
        case 422: // Unprocessable Entity (validation errors)
          // Handle validation errors (return the error for form handling)
          return Promise.reject({
            ...error,
            isValidationError: true,
            errors: data.errors || { _error: data.message || 'Validation failed' },
          });
          
        case 429: // Too Many Requests
          // Handle rate limiting
          showError('Too many requests. Please try again later.');
          break;
          
        case 500: // Internal Server Error
          // Handle server errors
          showError('An unexpected error occurred. Please try again later.');
          break;
          
        default:
          // Handle other errors
          showError(data.message || 'An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      showError('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      showError(error.message || 'An error occurred while setting up the request');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Handle unauthorized access
 */
const handleUnauthorized = () => {
  // Clear any existing auth state
  const auth = getAuth();
  auth.signOut();
  
  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Make a GET request
 * @param {string} url - The URL to make the request to
 * @param {Object} params - Query parameters
 * @param {Object} headers - Custom headers
 * @returns {Promise} A promise that resolves with the response data
 */
export const get = async (url, params = {}, headers = {}) => {
  try {
    return await api.get(url, { params, headers });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a POST request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The request payload
 * @param {Object} headers - Custom headers
 * @returns {Promise} A promise that resolves with the response data
 */
export const post = async (url, data = {}, headers = {}) => {
  try {
    return await api.post(url, data, { headers });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PUT request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The request payload
 * @param {Object} headers - Custom headers
 * @returns {Promise} A promise that resolves with the response data
 */
export const put = async (url, data = {}, headers = {}) => {
  try {
    return await api.put(url, data, { headers });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a PATCH request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The request payload
 * @param {Object} headers - Custom headers
 * @returns {Promise} A promise that resolves with the response data
 */
export const patch = async (url, data = {}, headers = {}) => {
  try {
    return await api.patch(url, data, { headers });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Make a DELETE request
 * @param {string} url - The URL to make the request to
 * @param {Object} data - The request payload
 * @param {Object} headers - Custom headers
 * @returns {Promise} A promise that resolves with the response data
 */
export const del = async (url, data = {}, headers = {}) => {
  try {
    return await api.delete(url, { data, headers });
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Upload a file
 * @param {string} url - The URL to upload the file to
 * @param {File} file - The file to upload
 * @param {Object} data - Additional form data
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} A promise that resolves with the response data
 */
export const uploadFile = async (url, file, data = {}, onUploadProgress = null) => {
  const formData = new FormData();
  
  // Add file to form data
  formData.append('file', file);
  
  // Add additional data to form data
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  if (onUploadProgress) {
    config.onUploadProgress = onUploadProgress;
  }
  
  try {
    return await api.post(url, formData, config);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download a file
 * @param {string} url - The URL to download the file from
 * @param {string} filename - The name to save the file as
 * @param {Object} params - Query parameters
 * @returns {Promise} A promise that resolves when the download is complete
 */
export const downloadFile = async (url, filename, params = {}) => {
  try {
    const response = await api.get(url, {
      params,
      responseType: 'blob',
    });
    
    // Create a download link and trigger the download
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};

export default api;
