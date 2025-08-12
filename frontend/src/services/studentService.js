import { api, API_ENDPOINTS } from '../config/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Student Service
 * Handles all student-related API calls
 */
const studentService = {
  /**
   * Get all students with optional filters
   * @param {Object} filters - Optional filters for querying students
   * @returns {Promise<Object>} List of students and pagination info
   */
  getStudents: async (filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.BASE, { 
        params: filters,
        showLoading: true // Show loading indicator for this request
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
   * Get a single student by ID
   * @param {string|number} id - Student ID
   * @returns {Promise<Object>} Student data
   */
  getStudentById: async (id) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.BY_ID(id));
      return {
        success: true,
        data: data.student
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Create a new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student data
   */
  createStudent: async (studentData) => {
    try {
      const { data } = await api.post(API_ENDPOINTS.STUDENTS.BASE, studentData);
      return {
        success: true,
        data: data.student,
        message: 'Student created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Update a student
   * @param {string|number} id - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Updated student data
   */
  updateStudent: async (id, studentData) => {
    try {
      const { data } = await api.put(API_ENDPOINTS.STUDENTS.BY_ID(id), studentData);
      return {
        success: true,
        data: data.student,
        message: 'Student updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Delete a student
   * @param {string|number} id - Student ID
   * @returns {Promise<Object>} Success message
   */
  deleteStudent: async (id) => {
    try {
      await api.delete(API_ENDPOINTS.STUDENTS.BY_ID(id));
      return {
        success: true,
        message: 'Student deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get student attendance
   * @param {string|number} studentId - Student ID
   * @param {Object} filters - Optional filters (e.g., startDate, endDate)
   * @returns {Promise<Object>} Attendance records
   */
  getStudentAttendance: async (studentId, filters = {}) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.ATTENDANCE(studentId), { 
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
   * Get student grades
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Object>} Grade records
   */
  getStudentGrades: async (studentId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.GRADES(studentId));
      return {
        success: true,
        data: data.grades,
        gpa: data.gpa
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Upload student photo
   * @param {string|number} studentId - Student ID
   * @param {File} file - Photo file
   * @returns {Promise<Object>} Upload result
   */
  uploadStudentPhoto: async (studentId, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const { data } = await api.post(
        API_ENDPOINTS.STUDENTS.PHOTO(studentId),
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
   * Search students by name, email, or ID
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  searchStudents: async (query) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.SEARCH, { 
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
   * Import students from CSV/Excel file
   * @param {File} file - File containing student data
   * @returns {Promise<Object>} Import result
   */
  importStudents: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(API_ENDPOINTS.STUDENTS.IMPORT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: data.results,
        message: `${data.imported} students imported successfully`
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get student's enrolled courses
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Object>} List of enrolled courses
   */
  getEnrolledCourses: async (studentId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.ENROLLMENTS(studentId));
      return {
        success: true,
        data: data.courses
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get student's academic progress
   * @param {string|number} studentId - Student ID
   * @returns {Promise<Object>} Academic progress data
   */
  getAcademicProgress: async (studentId) => {
    try {
      const { data } = await api.get(API_ENDPOINTS.STUDENTS.PROGRESS(studentId));
      return {
        success: true,
        data: data.progress
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default studentService;
