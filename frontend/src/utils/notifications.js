import toast from 'react-hot-toast';

const defaultOptions = {
  position: 'top-right',
  duration: 5000,
};

export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    className: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800',
  });
};

export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    ...options,
    className: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200 border border-red-200 dark:border-red-800',
  });
};

export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: '⚠️',
    className: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800',
  });
};

export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: 'ℹ️',
    className: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800',
  });
};

export const showLoading = (message, options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
    duration: Infinity, // Don't auto-dismiss loading toasts
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const updateToast = (toastId, options) => {
  toast.dismiss(toastId);
  return toast(options);
};

// Helper to handle API errors
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  const message = error.response?.data?.message || 
                error.message || 
                defaultMessage;
  
  showError(message);
  return message;
};

// Helper to handle API success
export const handleApiSuccess = (message = 'Operation successful') => {
  showSuccess(message);
};

// Custom toast container configuration
export const toastOptions = {
  // Define default options for toast container
  style: {
    maxWidth: '500px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  // Success/error icons
  success: {
    iconTheme: {
      primary: '#10B981',
      secondary: 'white',
    },
  },
  error: {
    iconTheme: {
      primary: '#EF4444',
      secondary: 'white',
    },
  },
};
