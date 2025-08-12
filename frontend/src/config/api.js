import axios from 'axios';
import queryString from 'query-string';
import { toast } from 'react-hot-toast';

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Default error message
const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again later.';

// API Endpoints
export const API_ENDPOINTS = {
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
    if (!skipAuthEndpoints.some(endpoint => config.url.includes(endpoint))) {
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
    // Hide loading indicator if it was shown
    if (response.config.showLoading !== false) {
      // Hide loading indicator
    }
    
    // Process successful responses
    return response.data; // Return only the data part of the response
  },
  (error) => {
    const { response } = error;
    
    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login page if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Handle forbidden access
          console.error('Access Denied: You do not have permission to access this resource');
          break;
        case 404:
          // Handle not found errors
          console.error('The requested resource was not found');
          break;
        case 500:
          // Handle server errors
          console.error('A server error occurred');
          break;
        default:
          console.error('An error occurred');
      }
      
      // Return a normalized error object
      return Promise.reject({
        status: response.status,
        message: response.data?.message || 'An error occurred',
        errors: response.data?.errors,
        data: response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server. Please check your connection.');
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        isNetworkError: true,
      });
    }
    
    // Something happened in setting up the request that triggered an Error
    return Promise.reject(error);
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Hide loading indicator if it was shown
    if (response.config.showLoading !== false) {
      // Hide loading indicator
    }
    
    // Process successful responses
    return response.data; // Return only the data part of the response
  },
  (error) => {
    // Hide loading indicator if it was shown
    if (error.config?.showLoading !== false) {
      // Hide loading indicator
    }
    
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || DEFAULT_ERROR_MESSAGE;
      
      // Handle specific status codes
      switch (status) {
        case 401: // Unauthorized
          // Clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          
          // Only redirect if not on login or register page
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            toast.error('Your session has expired. Please log in again.');
            window.location.href = '/login';
          }
          break;
          
        case 403: // Forbidden
          toast.error('You do not have permission to access this resource.');
          window.location.href = '/unauthorized';
          break;
          
        case 404: // Not Found
          toast.error('The requested resource was not found.');
          break;
          
        case 422: // Validation Error
          // Handle validation errors (show first error message)
          const firstError = data?.errors?.[0]?.msg;
          if (firstError) {
            toast.error(firstError);
          } else {
            toast.error(errorMessage);
          }
          break;
          
        case 429: // Too Many Requests
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500: // Internal Server Error
          toast.error('A server error occurred. Please try again later.');
          break;
          
        default:
          toast.error(errorMessage);
      }
      
      return Promise.reject({
        status,
        message: errorMessage,
        errors: data?.errors || null,
        data: data?.data || null,
      });
      
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Unable to connect to the server. Please check your internet connection.');
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your internet connection.',
      });
      
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject({
        status: -1,
        message: 'An error occurred while setting up the request',
      });
    }
  }
);

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

// Export the configured axios instance and helper functions
export { 
  api, 
  setAuthToken, 
  setBaseUrl, 
  handleApiError,
  API_ENDPOINTS 
};

export default api;
