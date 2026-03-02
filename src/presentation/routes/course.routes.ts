import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { CourseController } from '../controllers/CourseController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { tutorAuthMiddleware } from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import { createCourseSchema, updateCourseSchema } from '../validators/course.validators';
import { upload } from '../../infrastructure/middlewares/upload.middleware';
import {
  addModuleSchema,
  updateModuleSchema,
  reorderSchema,
} from '../validators/course.validators';

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

// ─── Module Management ────────────────────────────────────────────────────────

router.post(
  '/my/:courseId/modules',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(addModuleSchema),
  courseController.addModule.bind(courseController)
);

router.put(
  '/my/:courseId/modules/reorder',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(reorderSchema),
  courseController.reorderModules.bind(courseController)
);

router.put(
  '/my/:courseId/modules/:moduleId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(updateModuleSchema),
  courseController.updateModule.bind(courseController)
);

router.delete(
  '/my/:courseId/modules/:moduleId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.removeModule.bind(courseController)
);



export default router;