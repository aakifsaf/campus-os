import axios from 'axios';
import queryString from 'query-string';
import { toast } from 'react-hot-toast';

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Default error message
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again later.';

// API Endpoints
const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    UPDATE_PASSWORD: '/auth/updatepassword',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: (token) => `/auth/resetpassword/${token}`,
    VERIFY_EMAIL: (token) => `/auth/verifyemail/${token}`,
    RESEND_VERIFICATION_EMAIL: '/auth/resendverification',
  },
  // Students
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id) => `/students/${id}`,
    PHOTO: (id) => `/students/${id}/photo`,
    PROFILE: '/students/me/profile',
    ENROLLMENTS: (studentId) => `/students/${studentId}/enrollments`,
  },
  // Faculty
  FACULTY: {
    BASE: '/faculty',
    BY_ID: (id) => `/faculty/${id}`,
    PHOTO: (id) => `/faculty/${id}/photo`,
    PROFILE: '/faculty/me/profile',
    COURSES: (facultyId) => `/faculty/${facultyId}/courses`,
  },
  // Courses
  COURSES: {
    BASE: '/courses',
    BY_ID: (id) => `/courses/${id}`,
    PHOTO: (id) => `/courses/${id}/photo`,
    ENROLLMENTS: (courseId) => `/courses/${courseId}/enrollments`,
  },
  // Enrollments
  ENROLLMENTS: {
    BASE: '/enrollments',
    BY_ID: (id) => `/enrollments/${id}`,
    ASSIGNMENT: (enrollmentId, assignmentId) => 
      `/enrollments/${enrollmentId}/assignments/${assignmentId}`,
    GRADE: (enrollmentId, assignmentId) => 
      `/enrollments/${enrollmentId}/assignments/${assignmentId}/grade`,
    ATTENDANCE: (enrollmentId) => 
      `/enrollments/${enrollmentId}/attendance`,
  },
  // Uploads
  UPLOAD: {
    BASE: '/upload',
    FILE: (filename) => `/upload/${filename}`,
  },
};

// Create axios instance with base URL and headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  paramsSerializer: (params) => {
    return queryString.stringify(params, { 
      arrayFormat: 'bracket',
      skipNull: true,
      skipEmptyString: true
    });
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Skip adding auth token for specific endpoints
    const skipAuthEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.REGISTER,
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      '/auth/verifyemail/',
      '/auth/resetpassword/'
    ];

    // Skip auth for these endpoints
    if (!config.skipAuth && !skipAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Add timestamp to prevent caching for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime(),
      };
    }
    
    // Add loading indicator for requests that take time
    if (config.showLoading !== false) {
      // You can add a loading indicator here if needed
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
      // Safely handle response with optional chaining
      if (response?.config?.showLoading !== false) {
        // Hide loading indicator if needed
      }
      
      // Return the response data if it exists
      return response?.data || response;
    },
    (error) => {
      // Handle error responses
      const { response } = error || {};
      
      // Handle network errors
      if (!response) {
        return Promise.reject({
          message: 'Network error. Please check your connection.',
          status: 0
        });
      }
  
      // Handle specific status codes
      if (response.status === 401) {
        // Clear auth data on 401 Unauthorized
        clearAuthToken();
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
  
      // Pass the error to the next handler
      return Promise.reject(handleApiError(error));
    }
  );


// Helper function to set base URL
const setBaseUrl = (url) => {
  api.defaults.baseURL = url;
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    if (status === 401) {
      // Handle unauthorized access
      setAuthToken(null);
      window.location.href = '/login';
    }
    
    return {
      success: false,
      status,
      message: data?.message || 'An error occurred',
      errors: data?.errors,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response from server. Please check your connection.',
    };
  } else {
    // Something happened in setting up the request
    return {
      success: false,
      message: error.message || 'An error occurred',
    };
  }
};


// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
};

// Export the configured axios instance and helper functions
export { 
  api, 
  setAuthToken, 
  setBaseUrl, 
  handleApiError,
  API_ENDPOINTS,
  clearAuthToken 
};

export default api;
