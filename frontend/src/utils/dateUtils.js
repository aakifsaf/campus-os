import { format, parseISO, isToday, isTomorrow, isThisWeek, isThisYear, addDays, subDays, differenceInDays, isBefore, isAfter } from 'date-fns';

// Common date formats used throughout the app
export const DATE_FORMATS = {
  DATE: 'yyyy-MM-dd',
  DATE_TIME: 'yyyy-MM-dd HH:mm',
  DATE_TIME_SECONDS: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY_DATE: 'MMM d, yyyy',
  DISPLAY_DATE_TIME: 'MMM d, yyyy h:mm a',
  DISPLAY_TIME: 'h:mm a',
  DISPLAY_DAY_DATE: 'EEEE, MMM d, yyyy',
  DISPLAY_MONTH_DAY: 'MMM d',
  DISPLAY_MONTH_YEAR: 'MMM yyyy',
  ISO_DATE: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (defaults to DISPLAY_DATE)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY_DATE) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format a date to a relative time string (e.g., "2 days ago", "in 1 hour")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, DATE_FORMATS.DISPLAY_TIME)}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, DATE_FORMATS.DISPLAY_TIME)}`;
  }
  
  const diffInDays = differenceInDays(dateObj, now);
  
  if (diffInDays < 0) {
    // Past dates
    if (diffInDays === -1) {
      return `Yesterday at ${format(dateObj, DATE_FORMATS.DISPLAY_TIME)}`;
    }
    if (diffInDays >= -7) {
      return `${Math.abs(diffInDays)} days ago`;
    }
    if (isThisYear(dateObj)) {
      return format(dateObj, `'on' MMM d 'at' ${DATE_FORMATS.DISPLAY_TIME}`);
    }
    return format(dateObj, `'on' MMM d, yyyy 'at' ${DATE_FORMATS.DISPLAY_TIME}`);
  } else {
    // Future dates
    if (diffInDays === 1) {
      return `Tomorrow at ${format(dateObj, DATE_FORMATS.DISPLAY_TIME)}`;
    }
    if (diffInDays <= 7) {
      return `In ${diffInDays} days`;
    }
    if (isThisYear(dateObj)) {
      return format(dateObj, `'on' MMM d 'at' ${DATE_FORMATS.DISPLAY_TIME}`);
    }
    return format(dateObj, `'on' MMM d, yyyy 'at' ${DATE_FORMATS.DISPLAY_TIME}`);
  }
};

/**
 * Check if a date is within a date range
 * @param {Date} date - The date to check
 * @param {Date} startDate - Start of the range
 * @param {Date} endDate - End of the range
 * @returns {boolean} True if the date is within the range
 */
export const isDateInRange = (date, startDate, endDate) => {
  return isAfter(date, startDate) && isBefore(date, endDate);
};

/**
 * Get the start and end dates of the current week
 * @returns {Object} Object with startOfWeek and endOfWeek Date objects
 */
export const getCurrentWeekRange = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const startOfWeek = subDays(now, currentDay === 0 ? 6 : currentDay - 1); // Start from Monday
  const endOfWeek = addDays(startOfWeek, 6);
  
  return {
    startOfWeek: new Date(startOfWeek.setHours(0, 0, 0, 0)),
    endOfWeek: new Date(endOfWeek.setHours(23, 59, 59, 999))
  };
};

/**
 * Format a duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2h 30m", "1d 5h", "1h")
 */
export const formatDuration = (ms) => {
  if (!ms && ms !== 0) return '';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (remainingHours > 0) parts.push(`${remainingHours}h`);
  if (remainingMinutes > 0 && days === 0) parts.push(`${remainingMinutes}m`);
  
  return parts.length > 0 ? parts.join(' ') : '< 1m';
};

/**
 * Get the time difference between two dates in a human-readable format
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date (defaults to now)
 * @returns {string} Formatted time difference (e.g., "2h 30m", "1d 5h", "1h")
 */
export const getTimeDifference = (startDate, endDate = new Date()) => {
  if (!startDate) return '';
  
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffInMs = end - start;
  return formatDuration(diffInMs);
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isBefore(dateObj, new Date());
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isAfter(dateObj, new Date());
};
