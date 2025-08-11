import express from 'express';
const router = express.Router();
import {
  getFaculty,
  getSingleFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  uploadFacultyPhoto,
  getFacultyProfile,
} from '../controllers/faculty.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { fileUpload } from '../middleware/upload.js';

// Include other resource routers
import courseRouter from './course.routes.js';

// Re-route into other resource routers
router.use('/:facultyId/courses', courseRouter);

router
  .route('/')
  .get(protect, authorize('admin'), getFaculty)
  .post(protect, authorize('admin'), createFaculty);

router
  .route('/:id')
  .get(protect, getSingleFaculty)
  .put(protect, authorize('admin'), updateFaculty)
  .delete(protect, authorize('admin'), deleteFaculty);

router
  .route('/:id/photo')
  .put(
    protect,
    authorize('admin'),
    fileUpload.single('photo'),
    uploadFacultyPhoto
  );

// Get logged in faculty profile
router.get('/me/profile', protect, authorize('faculty'), getFacultyProfile);

export default router;
