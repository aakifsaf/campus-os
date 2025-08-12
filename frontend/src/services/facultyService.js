import { api, API_ENDPOINTS } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Faculty Service
 * Handles all faculty-related API calls
 */
const facultyService = {
  /**
   * Get all faculty members with optional filters
   * @param {Object} filters - Optional filters for querying faculty
   * @returns {Promise<Object>} List of faculty members and pagination info
   */
  getFaculty: async (filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.BASE, { 
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
   * Get a single faculty member by ID
   * @param {string|number} id - Faculty ID
   * @returns {Promise<Object>} Faculty member data
   */
  getFacultyById: async (id) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.BY_ID(id));
      return {
        success: true,
        data: data.faculty
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new faculty member
   * @param {Object} facultyData - Faculty data
   * @returns {Promise<Object>} Created faculty data
   */
  createFaculty: async (facultyData) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.FACULTY.BASE, facultyData);
      return {
        success: true,
        data: data.faculty,
        message: 'Faculty member created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a faculty member
   * @param {string|number} id - Faculty ID
   * @param {Object} facultyData - Updated faculty data
   * @returns {Promise<Object>} Updated faculty data
   */
  updateFaculty: async (id, facultyData) => {
    try {
      const { data } = await api.put(API_ENDPOINTS.FACULTY.BY_ID(id), facultyData);
      return {
        success: true,
        data: data.faculty,
        message: 'Faculty member updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a faculty member
   * @param {string|number} id - Faculty ID
   * @returns {Promise<Object>} Success message
   */
  deleteFaculty: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.FACULTY.BY_ID(id));
      return {
        success: true,
        message: 'Faculty member deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get faculty schedule
   * @param {string|number} facultyId - Faculty ID
   * @param {Object} filters - Optional filters (e.g., startDate, endDate)
   * @returns {Promise<Object>} Schedule data
   */
  getFacultySchedule: async (facultyId, filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.SCHEDULE(facultyId), { 
        params: filters 
      });
      
      return {
        success: true,
        data: data.schedule,
        summary: data.summary
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get courses taught by a faculty member
   * @param {string|number} facultyId - Faculty ID
   * @returns {Promise<Object>} List of courses
   */
  getFacultyCourses: async (facultyId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.COURSES(facultyId));
      return {
        success: true,
        data: data.courses,
        currentSemester: data.currentSemester
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload faculty photo
   * @param {string|number} facultyId - Faculty ID
   * @param {File} file - Photo file
   * @returns {Promise<Object>} Upload result
   */
  uploadFacultyPhoto: async (facultyId, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const { data } = await api.post(
        API_ENDPOINTS.FACULTY.PHOTO(facultyId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: data.photoUrl,
        message: 'Photo uploaded successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Search faculty members
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  searchFaculty: async (query) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.SEARCH, { 
        params: { q: query } 
      });
      
      return {
        success: true,
        data: data.results
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update faculty status (active/inactive)
   * @param {string|number} id - Faculty ID
   * @param {string} status - New status (active/inactive)
   * @returns {Promise<Object>} Success message
   */
  updateFacultyStatus: async (id, status) => {
    try {
      await api.patch(API_ENDPOINTS.FACULTY.STATUS(id), { status });
      return {
        success: true,
        message: `Faculty member marked as ${status} successfully`
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get faculty workload summary
   * @param {string|number} facultyId - Faculty ID
   * @returns {Promise<Object>} Workload data
   */
  getFacultyWorkload: async (facultyId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.WORKLOAD(facultyId));
      return {
        success: true,
        data: data.workload
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get faculty analytics
   * @param {string|number} facultyId - Faculty ID
   * @returns {Promise<Object>} Analytics data
   */
  getFacultyAnalytics: async (facultyId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.ANALYTICS(facultyId));
      return {
        success: true,
        data: data.analytics
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get faculty availability
   * @param {string|number} facultyId - Faculty ID
   * @returns {Promise<Object>} Availability data
   */
  getFacultyAvailability: async (facultyId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.FACULTY.AVAILABILITY(facultyId));
      return {
        success: true,
        data: data.availability
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update faculty availability
   * @param {string|number} facultyId - Faculty ID
   * @param {Object} availabilityData - Updated availability data
   * @returns {Promise<Object>} Success message
   */
  updateFacultyAvailability: async (facultyId, availabilityData) => {
    try {
      await api.put(API_ENDPOINTS.FACULTY.AVAILABILITY(facultyId), availabilityData);
      return {
        success: true,
        message: 'Availability updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default facultyService;
