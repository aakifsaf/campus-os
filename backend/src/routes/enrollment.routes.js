import express from 'express';
const router = express.Router();
import {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  submitAssignment,
  gradeAssignment,
  recordAttendance,
} from '../controllers/enrollment.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { fileUpload } from '../middleware/upload.js';
import advancedResults from '../middleware/advancedResults.js';
import Enrollment from '../models/Enrollment.js';

// Base route: /api/v1/enrollments
router
  .route('/')
  .get(
    protect,
    authorize('admin', 'faculty'),
    advancedResults(Enrollment, [
      { path: 'student', select: 'name studentId' },
      { path: 'course', select: 'title code' },
    ]),
    getEnrollments
  );

// Base route: /api/v1/courses/:courseId/enrollments
router
  .route('/')
  .get(
    protect,
    authorize('admin', 'faculty'),
    advancedResults(Enrollment, [
      { path: 'student', select: 'name studentId' },
      { path: 'course', select: 'title code' },
    ], 'course'),
    getEnrollments
  )
  .post(protect, authorize('student'), createEnrollment);

// Base route: /api/v1/students/:studentId/enrollments
router
  .route('/')
  .get(
    protect,
    authorize('student', 'admin', 'faculty'),
    advancedResults(Enrollment, [
      { path: 'course', select: 'title code credits faculty' },
      { path: 'student', select: 'name studentId' },
    ], 'student'),
    getEnrollments
  );

// Single enrollment routes
router
  .route('/:id')
  .get(protect, getEnrollment)
  .put(protect, authorize('admin', 'faculty'), updateEnrollment)
  .delete(protect, authorize('admin', 'faculty'), deleteEnrollment);

// Assignment submission
router
  .route('/:id/assignments/:assignmentId')
  .put(
    protect,
    authorize('student'),
    fileUpload.single('file'),
    submitAssignment
  );

// Assignment grading
router
  .route('/:id/assignments/:assignmentId/grade')
  .put(protect, authorize('faculty'), gradeAssignment);

// Attendance recording
router
  .route('/:id/attendance')
  .post(protect, authorize('faculty', 'admin'), recordAttendance);

export default router;
