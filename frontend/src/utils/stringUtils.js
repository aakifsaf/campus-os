/**
 * String utility functions
 */

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} The capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a string to title case
 * @param {string} str - The string to convert
 * @returns {string} The title-cased string
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Truncate a string to a specified length and add an ellipsis if needed
 * @param {string} str - The string to truncate
 * @param {number} maxLength - The maximum length of the string
 * @param {boolean} [keepWords=true] - Whether to keep whole words
 * @returns {string} The truncated string
 */
export const truncate = (str, maxLength, keepWords = true) => {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= maxLength) return str;
  
  if (keepWords) {
    // Find the last space before maxLength
    let lastSpace = str.lastIndexOf(' ', maxLength);
    if (lastSpace === -1) lastSpace = maxLength;
    return str.substring(0, lastSpace) + '...';
  }
  
  return str.substring(0, maxLength) + '...';
};

/**
 * Generate a URL-friendly slug from a string
 * @param {string} str - The string to convert to a slug
 * @returns {string} The generated slug
 */
export const slugify = (str) => {
  if (!str) return '';
  
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};

/**
 * Check if a string is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Check if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Mask sensitive information in a string (e.g., email, phone number)
 * @param {string} str - The string to mask
 * @param {Object} options - Masking options
 * @param {number} [options.visibleStart=2] - Number of characters to keep at the start
 * @param {number} [options.visibleEnd=2] - Number of characters to keep at the end
 * @param {string} [options.maskChar='*'] - The character to use for masking
 * @returns {string} The masked string
 */
export const maskSensitive = (
  str,
  { visibleStart = 2, visibleEnd = 2, maskChar = '*' } = {}
) => {
  if (!str || typeof str !== 'string') return '';
  
  const length = str.length;
  if (length <= visibleStart + visibleEnd) return str; // Not enough characters to mask
  
  const start = str.substring(0, visibleStart);
  const end = visibleEnd > 0 ? str.substring(length - visibleEnd) : '';
  const masked = maskChar.repeat(Math.max(0, length - visibleStart - visibleEnd));
  
  return start + masked + end;
};

/**
 * Generate a random string of a specified length
 * @param {number} length - The length of the random string
 * @returns {string} A random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Remove HTML tags from a string
 * @param {string} str - The string to remove HTML tags from
 * @returns {string} The string with HTML tags removed
 */
export const stripHtml = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

/**
 * Convert a string to kebab-case
 * @param {string} str - The string to convert
 * @returns {string} The kebab-cased string
 */
export const toKebabCase = (str) => {
  if (!str) return '';
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-');
};

/**
 * Convert a string to camelCase
 * @param {string} str - The string to convert
 * @returns {string} The camelCased string
 */
export const toCamelCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (first) => first.toLowerCase());
};

/**
 * Convert a string to PascalCase
 * @param {string} str - The string to convert
 * @returns {string} The PascalCased string
 */
export const toPascalCase = (str) => {
  if (!str) return '';
  return (str.match(/[a-zA-Z0-9]+/g) || [])
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Convert a string to snake_case
 * @param {string} str - The string to convert
 * @returns {string} The snake_cased string
 */
export const toSnakeCase = (str) => {
  if (!str) return '';
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');
};

/**
 * Convert a string to a URL-friendly filename
 * @param {string} str - The string to convert
 * @returns {string} A URL-friendly filename
 */
export const toFileName = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/-+/g, '-')            // Replace multiple - with single -
    .replace(/^-+|-+$/g, '');       // Trim - from start and end
};

/**
 * Count the number of words in a string
 * @param {string} str - The string to count words in
 * @returns {number} The number of words
 */
export const countWords = (str) => {
  if (!str || typeof str !== 'string') return 0;
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Count the number of characters in a string (excluding spaces)
 * @param {string} str - The string to count characters in
 * @returns {number} The number of characters (excluding spaces)
 */
export const countChars = (str) => {
  if (!str || typeof str !== 'string') return 0;
  return str.replace(/\s+/g, '').length;
};

/**
 * Extract the domain from a URL
 * @param {string} url - The URL to extract the domain from
 * @returns {string} The domain or an empty string if invalid
 */
export const extractDomain = (url) => {
  if (!url) return '';
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch {
    return '';
  }
};

/**
 * Generate initials from a name
 * @param {string} name - The full name
 * @param {number} [maxLength=2] - Maximum number of initials to return
 * @returns {string} The initials
 */
export const getInitials = (name, maxLength = 2) => {
  if (!name) return '';
  
  return name
    .split(/\s+/)
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase())
    .slice(0, maxLength)
    .join('');
};
