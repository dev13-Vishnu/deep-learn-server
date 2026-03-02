import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { CourseController } from '../controllers/CourseController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { tutorAuthMiddleware } from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import { createCourseSchema, updateCourseSchema } from '../validators/course.validators';
import { upload } from '../../infrastructure/middlewares/upload.middleware';

const router = Router();

const courseController = container.get<CourseController>(TYPES.CourseController);


router.post(
  '/',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(createCourseSchema),
  courseController.createCourse.bind(courseController)
);

router.get(
  '/my',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.getMyCourses.bind(courseController)
);

router.get(
  '/my/:courseId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.getMyCourse.bind(courseController)
);

router.put(
  '/my/:courseId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(updateCourseSchema),
  courseController.updateCourse.bind(courseController)
);

router.delete(
  '/my/:courseId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.deleteCourse.bind(courseController)
);

router.post(
  '/my/:courseId/thumbnail',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  upload.single('thumbnail'),
  courseController.uploadThumbnail.bind(courseController)
);

router.post(
  '/my/:courseId/publish',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.publishCourse.bind(courseController)
);

router.post(
  '/my/:courseId/unpublish',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.unpublishCourse.bind(courseController)
);

router.post(
  '/my/:courseId/archive',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.archiveCourse.bind(courseController)
);

export default router;