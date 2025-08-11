/**
 * Utility functions for handling file operations
 */

/**
 * Validates a file against size and type constraints
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in MB
 * @param {string[]} options.allowedTypes - Array of allowed MIME types
 * @returns {Object} Validation result with isValid and error message
 */
export const validateFile = (file, { maxSize = 5, allowedTypes = [] } = {}) => {
  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  // Check file size (convert MB to bytes)
  const maxSizeInBytes = maxSize * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { 
      isValid: false, 
      error: `File size exceeds ${maxSize}MB limit` 
    };
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/').pop())
      .join(', ');
    
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${allowedExtensions}` 
    };
  }

  return { isValid: true };
};

/**
 * Converts a file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} A promise that resolves with the base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Downloads a file from a URL or base64 string
 * @param {string} data - The file data (URL or base64 string)
 * @param {string} fileName - The name to save the file as
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadFile = (data, fileName, mimeType) => {
  // Handle URL
  if (data.startsWith('http')) {
    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  
  // Handle base64 data
  if (data.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  
  // Handle binary data
  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Gets the file extension from a filename or path
 * @param {string} filename - The filename or path
 * @returns {string} The file extension (without the dot)
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Gets the MIME type from a file extension
 * @param {string} extension - The file extension (with or without dot)
 * @returns {string} The corresponding MIME type or 'application/octet-stream' if unknown
 */
export const getMimeType = (extension) => {
  if (!extension) return 'application/octet-stream';
  
  // Remove leading dot if present
  const ext = extension.startsWith('.') ? extension.slice(1) : extension;
  
  const mimeTypes = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    
    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    
    // Code
    js: 'application/javascript',
    jsx: 'application/javascript',
    ts: 'application/typescript',
    tsx: 'application/typescript',
    json: 'application/json',
    html: 'text/html',
    css: 'text/css',
    
    // Audio/Video
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
  };
  
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};

/**
 * Gets a human-readable file size string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Creates a preview URL for an image file
 * @param {File} file - The image file
 * @returns {Promise<string>} A promise that resolves with the preview URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Checks if a file is an image based on its MIME type
 * @param {string} mimeType - The MIME type to check
 * @returns {boolean} True if the file is an image
 */
export const isImageFile = (mimeType) => {
  return mimeType.startsWith('image/');
};

/**
 * Gets the appropriate icon for a file type
 * @param {string} mimeType - The MIME type of the file
 * @returns {string} The name of the icon to use
 */
export const getFileIcon = (mimeType) => {
  if (!mimeType) return 'file';
  
  const [type, subtype] = mimeType.split('/');
  
  switch (type) {
    case 'image':
      return 'image';
    case 'audio':
      return 'volume-up';
    case 'video':
      return 'video';
    case 'application':
      switch (subtype) {
        case 'pdf':
          return 'file-pdf';
        case 'msword':
        case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
          return 'file-word';
        case 'vnd.ms-excel':
        case 'vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return 'file-excel';
        case 'vnd.ms-powerpoint':
        case 'vnd.openxmlformats-officedocument.presentationml.presentation':
          return 'file-powerpoint';
        case 'zip':
        case 'x-rar-compressed':
        case 'x-7z-compressed':
        case 'x-tar':
        case 'gzip':
          return 'file-archive';
        case 'json':
          return 'code';
        default:
          return 'file';
      }
    case 'text':
      return 'file-alt';
    default:
      return 'file';
  }
};
