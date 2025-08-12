import { api, API_ENDPOINTS } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Course Service
 * Handles all course-related API calls
 */
const courseService = {
  /**
   * Get all courses with optional filters
   * @param {Object} filters - Optional filters for querying courses
   * @returns {Promise<Object>} List of courses and pagination info
   */
  getCourses: async (filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.BASE, { 
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
   * Get a single course by ID
   * @param {string|number} id - Course ID
   * @returns {Promise<Object>} Course data
   */
  getCourseById: async (id) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.BY_ID(id));
      return {
        success: true,
        data: data.course
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new course
   * @param {Object} courseData - Course data
   * @returns {Promise<Object>} Created course data
   */
  createCourse: async (courseData) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.COURSES.BASE, courseData);
      return {
        success: true,
        data: data.course,
        message: 'Course created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a course
   * @param {string|number} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise<Object>} Updated course data
   */
  updateCourse: async (id, courseData) => {
    try {
      const { data } = await api.put(API_ENDPOINTS.COURSES.BY_ID(id), courseData);
      return {
        success: true,
        data: data.course,
        message: 'Course updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a course
   * @param {string|number} id - Course ID
   * @returns {Promise<Object>} Success message
   */
  deleteCourse: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.COURSES.BY_ID(id));
      return {
        success: true,
        message: 'Course deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get students enrolled in a course
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} List of enrolled students
   */
  getCourseStudents: async (courseId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.STUDENTS(courseId));
      return {
        success: true,
        data: data.students,
        count: data.count
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Add a student to a course
   * @param {string|number} courseId - Course ID
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Object>} Success message
   */
  addStudentToCourse: async (courseId, studentId) => {
    try {
      await api.post(API_ENDPOINTS.COURSES.STUDENTS(courseId), { studentId });
      return {
        success: true,
        message: 'Student added to course successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Remove a student from a course
   * @param {string|number} courseId - Course ID
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Object>} Success message
   */
  removeStudentFromCourse: async (courseId, studentId) => {
    try {
      await api.delete(`${API_ENDPOINTS.COURSES.STUDENTS(courseId)}/${studentId}`);
      return {
        success: true,
        message: 'Student removed from course successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get course attendance
   * @param {string|number} courseId - Course ID
   * @param {Object} filters - Optional filters (e.g., date, status)
   * @returns {Promise<Object>} Attendance records
   */
  getCourseAttendance: async (courseId, filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.ATTENDANCE(courseId), { 
        params: filters 
      });
      
      return {
        success: true,
        data: data.attendance,
        summary: data.summary
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Record attendance for a course
   * @param {string|number} courseId - Course ID
   * @param {Array} attendanceData - Array of attendance records
   * @returns {Promise<Object>} Success message
   */
  recordAttendance: async (courseId, attendanceData) => {
    try {
      const { data } = await api.post(
        API_ENDPOINTS.COURSES.ATTENDANCE(courseId), 
        { attendance: attendanceData }
      );
      
      return {
        success: true,
        data: data.results,
        message: 'Attendance recorded successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload course material
   * @param {string|number} courseId - Course ID
   * @param {File} file - File to upload
   * @param {Object} metadata - File metadata (title, description)
   * @returns {Promise<Object>} Upload result
   */
  uploadCourseMaterial: async (courseId, file, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', metadata.title || file.name);
      formData.append('description', metadata.description || '');

      const { data } = await api.post(
        API_ENDPOINTS.COURSES.MATERIALS(courseId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: true,
        data: data.material,
        message: 'Material uploaded successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get course materials
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} List of course materials
   */
  getCourseMaterials: async (courseId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.MATERIALS(courseId));
      return {
        success: true,
        data: data.materials
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a course material
   * @param {string|number} courseId - Course ID
   * @param {string|number} materialId - Material ID
   * @returns {Promise<Object>} Success message
   */
  deleteCourseMaterial: async (courseId, materialId) => {
    try {
      await api.delete(`${API_ENDPOINTS.COURSES.MATERIALS(courseId)}/${materialId}`);
      return {
        success: true,
        message: 'Material deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get course analytics
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} Course analytics data
   */
  getCourseAnalytics: async (courseId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.ANALYTICS(courseId));
      return {
        success: true,
        data: data.analytics
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get course assignments
   * @param {string|number} courseId - Course ID
   * @returns {Promise<Object>} List of course assignments
   */
  getCourseAssignments: async (courseId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.COURSES.ASSIGNMENTS(courseId));
      return {
        success: true,
        data: data.assignments
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default courseService;
