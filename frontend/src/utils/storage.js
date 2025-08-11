/**
 * Local storage utility with type safety and expiration support
 */

// Storage keys
const STORAGE_KEYS = {
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences',
  AUTH_STATE: 'auth_state',
  REDIRECT_AFTER_LOGIN: 'redirect_after_login',
  NOTIFICATIONS: 'notifications',
  RECENT_SEARCHES: 'recent_searches',
};

/**
 * Get an item from localStorage with type safety and expiration support
 * @param {string} key - The key to get from localStorage
 * @param {*} defaultValue - The default value to return if the key doesn't exist or is invalid
 * @returns {*} The stored value or defaultValue
 */
const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }
    
    const { value, expiresAt } = JSON.parse(item);
    
    // Check if the item has expired
    if (expiresAt && new Date().getTime() > expiresAt) {
      // Remove expired item
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    return value !== undefined ? value : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage with optional expiration
 * @param {string} key - The key to set in localStorage
 * @param {*} value - The value to store
 * @param {Object} options - Options object
 * @param {number} options.ttl - Time to live in milliseconds
 */
const setItem = (key, value, { ttl } = {}) => {
  try {
    const item = { value };
    
    // Add expiration if TTL is provided
    if (ttl) {
      item.expiresAt = new Date().getTime() + ttl;
    }
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
  }
};

/**
 * Remove an item from localStorage
 * @param {string} key - The key to remove from localStorage
 */
const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error}`);
  }
};

/**
 * Clear all items from localStorage (except those in the excluded list)
 * @param {string[]} exclude - Array of keys to exclude from clearing
 */
const clear = (exclude = []) => {
  try {
    if (exclude.length === 0) {
      localStorage.clear();
      return;
    }
    
    // Store items to keep
    const itemsToKeep = {};
    exclude.forEach(key => {
      const item = localStorage.getItem(key);
      if (item !== null) {
        itemsToKeep[key] = item;
      }
    });
    
    // Clear all
    localStorage.clear();
    
    // Restore items to keep
    Object.entries(itemsToKeep).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

/**
 * Get a namespaced storage utility for a specific prefix
 * @param {string} namespace - The namespace to use for all keys
 * @returns {Object} An object with namespaced storage methods
 */
const createNamespacedStorage = (namespace) => {
  const prefix = `${namespace}.`;
  
  return {
    getItem: (key, defaultValue) => getItem(prefix + key, defaultValue),
    setItem: (key, value, options) => setItem(prefix + key, value, options),
    removeItem: (key) => removeItem(prefix + key),
    clear: () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    },
  };
};

// Export the storage utility with predefined keys
export default {
  // Core methods
  getItem,
  setItem,
  removeItem,
  clear,
  createNamespacedStorage,
  
  // Predefined keys
  KEYS: STORAGE_KEYS,
  
  // Convenience methods for common use cases
  
  /**
   * Get the current theme from storage
   * @returns {string} The current theme ('light' or 'dark')
   */
  getTheme: () => getItem(STORAGE_KEYS.THEME, 'light'),
  
  /**
   * Set the current theme in storage
   * @param {string} theme - The theme to set ('light' or 'dark')
   */
  setTheme: (theme) => setItem(STORAGE_KEYS.THEME, theme),
  
  /**
   * Get user preferences from storage
   * @returns {Object} User preferences object
   */
  getUserPreferences: () => getItem(STORAGE_KEYS.USER_PREFERENCES, {}),
  
  /**
   * Set user preferences in storage
   * @param {Object} preferences - User preferences object
   */
  setUserPreferences: (preferences) => 
    setItem(STORAGE_KEYS.USER_PREFERENCES, preferences),
  
  /**
   * Get the redirect URL to use after login
   * @returns {string|null} The redirect URL or null if not set
   */
  getRedirectAfterLogin: () => {
    const url = getItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN);
    removeItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN); // Clear after reading
    return url;
  },
  
  /**
   * Set the redirect URL to use after login
   * @param {string} url - The URL to redirect to after login
   */
  setRedirectAfterLogin: (url) => 
    setItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, url),
  
  /**
   * Add a recent search query
   * @param {string} query - The search query to add
   * @param {number} maxItems - Maximum number of recent searches to keep (default: 5)
   */
  addRecentSearch: (query, maxItems = 5) => {
    if (!query || typeof query !== 'string') return;
    
    const searches = getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
    
    // Remove duplicates and add to the beginning
    const updatedSearches = [
      query,
      ...searches.filter(item => item.toLowerCase() !== query.toLowerCase())
    ].slice(0, maxItems);
    
    setItem(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
  },
  
  /**
   * Get recent search queries
   * @returns {string[]} Array of recent search queries
   */
  getRecentSearches: () => getItem(STORAGE_KEYS.RECENT_SEARCHES, []),
  
  /**
   * Clear recent search history
   */
  clearRecentSearches: () => removeItem(STORAGE_KEYS.RECENT_SEARCHES),
  
  /**
   * Store a notification in local storage (for showing after page reload)
   * @param {Object} notification - Notification object with type and message
   * @param {string} notification.type - Notification type ('success', 'error', 'info', 'warning')
   * @param {string} notification.message - Notification message
   */
  storeNotification: (notification) => {
    if (!notification || !notification.type || !notification.message) return;
    
    const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    notifications.push({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    });
    
    // Keep only the last 5 notifications
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifications.slice(-5));
  },
  
  /**
   * Get stored notifications and clear them from storage
   * @returns {Array} Array of stored notifications
   */
  getAndClearStoredNotifications: () => {
    const notifications = getItem(STORAGE_KEYS.NOTIFICATIONS, []);
    removeItem(STORAGE_KEYS.NOTIFICATIONS);
    return notifications;
  },
};
