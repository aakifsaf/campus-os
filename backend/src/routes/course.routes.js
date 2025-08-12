import express from 'express';
const courseRouter = express.Router();
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  uploadCourseImage,
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { fileUpload } from '../middleware/upload.js';
import advancedResults from '../middleware/advancedResults.js';
import Course from '../models/Course.js';

// Include other resource routers
import enrollmentRouter from './enrollment.routes.js';

// Re-route into other resource routers
courseRouter.use('/:courseId/enrollments', enrollmentRouter);

courseRouter
  .route('/')
  .get(
    advancedResults(Course, {
      path: 'faculty',
      select: 'name employeeId department',
    }),
    getCourses
  )
  .post(protect, authorize('admin', 'faculty'), createCourse);

courseRouter
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'faculty'), updateCourse)
  .delete(protect, authorize('admin', 'faculty'), deleteCourse);

courseRouter
  .route('/:id/photo')
  .put(
    protect,
    authorize('admin', 'faculty'),
    fileUpload.single('image'),
    uploadCourseImage
  );

export default courseRouter;
