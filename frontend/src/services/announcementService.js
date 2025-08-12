import { api, API_ENDPOINTS } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Announcement Service
 * Handles all announcement-related API calls
 */
const announcementService = {
  /**
   * Get all announcements with optional filters
   * @param {Object} filters - Optional filters for querying announcements
   * @returns {Promise<Object>} List of announcements and pagination info
   */
  getAnnouncements: async (filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.BASE, { 
        params: filters,
        showLoading: true
      });
      
      return {
        success: true,
        data: data.data,
        pagination: data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get a single announcement by ID
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object>} Announcement data
   */
  getAnnouncementById: async (id) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
      return {
        success: true,
        data: data.announcement
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new announcement
   * @param {Object} announcementData - Announcement data
   * @returns {Promise<Object>} Created announcement data
   */
  createAnnouncement: async (announcementData) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.ANNOUNCEMENTS.BASE, announcementData);
      return {
        success: true,
        data: data.announcement,
        message: 'Announcement created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update an announcement
   * @param {string|number} id - Announcement ID
   * @param {Object} announcementData - Updated announcement data
   * @returns {Promise<Object>} Updated announcement data
   */
  updateAnnouncement: async (id, announcementData) => {
    try {
      const { data } = await api.put(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id), announcementData);
      return {
        success: true,
        data: data.announcement,
        message: 'Announcement updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete an announcement
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object>} Success message
   */
  deleteAnnouncement: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID(id));
      return {
        success: true,
        message: 'Announcement deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get announcements for a specific course
   * @param {string|number} courseId - Course ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} List of course announcements
   */
  getCourseAnnouncements: async (courseId, filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.COURSE(courseId), { 
        params: filters 
      });
      
      return {
        success: true,
        data: data.announcements,
        pagination: data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get announcements for the current user
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} List of user's announcements
   */
  getMyAnnouncements: async (filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.MY_ANNOUNCEMENTS, { 
        params: filters 
      });
      
      return {
        success: true,
        data: data.announcements,
        unreadCount: data.unreadCount,
        pagination: data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark an announcement as read
   * @param {string|number} id - Announcement ID
   * @returns {Promise<Object>} Success message
   */
  markAsRead: async (id) => {
    try {
      await api.post(API_ENDPOINTS.ANNOUNCEMENTS.MARK_AS_READ(id));
      return {
        success: true,
        message: 'Announcement marked as read'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Mark all announcements as read
   * @returns {Promise<Object>} Success message
   */
  markAllAsRead: async () => {
    try {
      await api.post(API_ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_AS_READ);
      return {
        success: true,
        message: 'All announcements marked as read'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get announcement statistics
   * @returns {Promise<Object>} Announcement statistics
   */
  getAnnouncementStats: async () => {
    try {
      const { data } = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.STATS);
      return {
        success: true,
        data: data.stats
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload announcement attachment
   * @param {string|number} announcementId - Announcement ID
   * @param {File} file - File to upload
   * @returns {Promise<Object>} Upload result
   */
  uploadAttachment: async (announcementId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(
        API_ENDPOINTS.ANNOUNCEMENTS.ATTACHMENTS(announcementId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: data.attachment,
        message: 'Attachment uploaded successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete an announcement attachment
   * @param {string|number} announcementId - Announcement ID
   * @param {string|number} attachmentId - Attachment ID
   * @returns {Promise<Object>} Success message
   */
  deleteAttachment: async (announcementId, attachmentId) => {
    try {
      await api.delete(
        `${API_ENDPOINTS.ANNOUNCEMENTS.ATTACHMENTS(announcementId)}/${attachmentId}`
      );
      return {
        success: true,
        message: 'Attachment deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get announcement recipients
   * @param {string|number} announcementId - Announcement ID
   * @returns {Promise<Object>} List of recipients and read status
   */
  getAnnouncementRecipients: async (announcementId) => {
    try {
      const { data } = await api.get(
        API_ENDPOINTS.ANNOUNCEMENTS.RECIPIENTS(announcementId)
      );
      
      return {
        success: true,
        data: data.recipients,
        readCount: data.readCount,
        unreadCount: data.unreadCount
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default announcementService;
