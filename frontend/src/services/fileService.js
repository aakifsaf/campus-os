import api from '../config/api';

const fileService = {
  // Generic file upload
  uploadFile: async (file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add any additional data
      if (options.data) {
        Object.entries(options.data).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }
      
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (options.onProgress) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            options.onProgress(progress);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete file
  deleteFile: async (fileId) => {
    try {
      const response = await api.delete(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get file URL
  getFileUrl: (fileId) => {
    return `${api.defaults.baseURL}/files/${fileId}`;
  },

  // Download file
  downloadFile: async (fileId, fileName) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Preview file in new tab
  previewFile: (fileId) => {
    const url = `${api.defaults.baseURL}/files/${fileId}`;
    window.open(url, '_blank');
  },
};

export default fileService;
