import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import api from '../config/api';

/**
 * Custom hook for handling API requests with loading, error, and data states
 * @param {Object} options - Configuration options
 * @param {boolean} options.manual - If true, the request won't fire automatically
 * @param {Function} options.onSuccess - Callback for successful requests
 * @param {Function} options.onError - Callback for failed requests
 * @param {boolean} options.showSuccess - Whether to show success toasts
 * @param {boolean} options.showError - Whether to show error toasts
 * @param {string} options.successMessage - Custom success message
 * @param {string} options.errorMessage - Custom error message
 * @param {number} options.cacheTime - Time in milliseconds to cache the response
 * @returns {Object} - API state and methods
 */
const useApi = (options = {}) => {
  const {
    manual = false,
    onSuccess,
    onError,
    showSuccess = true,
    showError = true,
    successMessage,
    errorMessage = 'An error occurred',
    cacheTime = 0,
  } = options;

  const [state, setState] = useState({
    data: null,
    error: null,
    loading: !manual,
    called: false,
  });

  const cache = useRef(new Map());
  const source = useRef(null);
  const mounted = useRef(false);

  // Set mounted flag on mount and cleanup on unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // Cancel any pending requests on unmount
      if (source.current) {
        source.current.cancel('Component unmounted');
      }
    };
  }, []);

  /**
   * Execute an API request
   * @param {Function} apiCall - The API call function to execute
   * @param {Object} callOptions - Options for this specific call
   * @returns {Promise} - The API response
   */
  const execute = useCallback(async (apiCall, callOptions = {}) => {
    const {
      localSuccessMessage,
      localErrorMessage,
      localShowSuccess = showSuccess,
      localShowError = showError,
      useCache = true,
      ...restOptions
    } = callOptions;

    const cacheKey = typeof apiCall === 'function' ? apiCall.toString() : '';
    const now = Date.now();

    // Check cache first if enabled
    if (useCache && cacheTime > 0 && cache.current.has(cacheKey)) {
      const { timestamp, data } = cache.current.get(cacheKey);
      if (now - timestamp < cacheTime) {
        return data;
      }
    }

    // Create a new cancel token for this request
    source.current = api.CancelToken.source();

    try {
      setState(prev => ({
        ...prev,
        loading: true,
        called: true,
      }));

      const response = await apiCall({
        cancelToken: source.current.token,
        ...restOptions,
      });

      // Only update state if component is still mounted
      if (mounted.current) {
        setState({
          data: response,
          error: null,
          loading: false,
          called: true,
        });
      }

      // Update cache
      if (useCache && cacheTime > 0) {
        cache.current.set(cacheKey, {
          timestamp: now,
          data: response,
        });
      }

      // Show success message if enabled
      if (localShowSuccess) {
        const message = localSuccessMessage || successMessage;
        if (message) {
          toast.success(message);
        }
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      // Don't update state if the request was canceled
      if (api.isCancel(error)) {
        return;
      }

      console.error('API Error:', error);
      
      const message = 
        error?.response?.data?.message || 
        error?.message || 
        localErrorMessage || 
        errorMessage;

      // Only update state if component is still mounted
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          error: {
            message,
            status: error?.response?.status,
            data: error?.response?.data,
          },
          loading: false,
          called: true,
        }));
      }

      // Show error message if enabled
      if (localShowError) {
        toast.error(message);
      }

      // Call error callback
      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [cacheTime, errorMessage, onError, onSuccess, showError, showSuccess, successMessage]);

  /**
   * Clear the cache
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  /**
   * Cancel the current request
   */
  const cancelRequest = useCallback(() => {
    if (source.current) {
      source.current.cancel('Request canceled by user');
    }
  }, []);

  return {
    ...state,
    execute,
    cancelRequest,
    clearCache,
    setData: (data) => setState(prev => ({ ...prev, data })),
    setError: (error) => setState(prev => ({ ...prev, error })),
    setLoading: (loading) => setState(prev => ({ ...prev, loading })),
  };
};

export default useApi;
