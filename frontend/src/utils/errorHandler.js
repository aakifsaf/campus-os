/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from axios
 * @returns {Object} Standardized error response
 */
export const handleApiError = (error) => {
  // Default error message
  let errorMessage = 'An unexpected error occurred';
  let statusCode = 0;
  let errors = null;
  let data = null;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data: responseData } = error.response;
    statusCode = status;
    data = responseData;
    
    // Handle different error statuses
    switch (status) {
      case 400: // Bad Request
        errorMessage = responseData.message || 'Invalid request';
        errors = responseData.errors;
        break;
        
      case 401: // Unauthorized
        errorMessage = 'Your session has expired. Please log in again.';
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;
        
      case 403: // Forbidden
        errorMessage = 'You do not have permission to perform this action';
        break;
        
      case 404: // Not Found
        errorMessage = 'The requested resource was not found';
        break;
        
      case 422: // Validation Error
        errorMessage = 'Validation failed';
        errors = responseData.errors || [];
        // Get the first error message if available
        if (errors.length > 0) {
          errorMessage = errors[0].msg || errorMessage;
        }
        break;
        
      case 429: // Too Many Requests
        errorMessage = 'Too many requests. Please try again later.';
        break;
        
      case 500: // Internal Server Error
        errorMessage = 'A server error occurred. Please try again later.';
        break;
        
      default:
        errorMessage = responseData.message || `Error: ${status}`;
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your internet connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'Error setting up request';
  }

  // Log the error for debugging
  console.error('API Error:', { 
    message: errorMessage, 
    status: statusCode,
    errors,
    originalError: error 
  });

  // Return standardized error response
  return {
    success: false,
    message: errorMessage,
    status: statusCode,
    errors,
    data,
    originalError: process.env.NODE_ENV === 'development' ? error : undefined
  };
};

/**
 * Handles form validation errors
 * @param {Object} errors - Validation errors from the API
 * @param {Function} setError - React Hook Form's setError function
 */
export const handleFormErrors = (errors, setError) => {
  if (!errors || !Array.isArray(errors)) return;
  
  errors.forEach(({ param, msg }) => {
    setError(param, {
      type: 'manual',
      message: msg
    });
  });
};
