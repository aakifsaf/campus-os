import express from 'express';
const router = express.Router();
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProfile,
  uploadStudentPhoto,
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { fileUpload } from '../middleware/upload.js';

// Include other resource routers
import enrollmentRouter from './enrollment.routes.js';

// Re-route into other resource routers
router.use('/:studentId/enrollments', enrollmentRouter);

router
  .route('/')
  .get(protect, getStudents)
  .post(protect, authorize('admin', 'faculty'), createStudent);

router
  .route('/:id')
  .get(protect, getStudent)
  .put(protect, authorize('admin', 'faculty'), updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

router
  .route('/:id/photo')
  .put(
    protect,
    authorize('admin', 'faculty'),
    fileUpload.single('photo'),
    uploadStudentPhoto
  );

// Get logged in student profile
router.get('/me/profile', protect, getStudentProfile);

export default router;
