import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { CourseController } from '../controllers/CourseController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { tutorAuthMiddleware } from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest } from '../middlewares/validationRequest';
import {
  createCourseSchema,
  updateCourseSchema,
  addModuleSchema,
  updateModuleSchema,
  reorderSchema,
  addLessonSchema,
  updateLessonSchema,
  // Feature 11
  addChapterSchema,
  updateChapterSchema,
  getVideoUploadUrlSchema,
  confirmVideoUploadSchema,
} from '../validators/course.validators';
import { upload } from '../../infrastructure/middlewares/upload.middleware';

const router = Router();

const courseController = container.get<CourseController>(TYPES.CourseController);

router.get(
  '/',
  courseController.getPublicCourses.bind(courseController)
);

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

// Module Management 

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

// Lesson Management

router.post(
  '/my/:courseId/modules/:moduleId/lessons',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(addLessonSchema),
  courseController.addLesson.bind(courseController)
);

router.put(
  '/my/:courseId/modules/:moduleId/lessons/reorder',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(reorderSchema),
  courseController.reorderLessons.bind(courseController)
);

router.put(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(updateLessonSchema),
  courseController.updateLesson.bind(courseController)
);

router.delete(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.removeLesson.bind(courseController)
);

//Chapter Management

router.post(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(addChapterSchema),
  courseController.addChapter.bind(courseController)
);

// NOTE: reorder must be declared before /:chapterId to avoid route collision
router.put(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/reorder',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(reorderSchema),
  courseController.reorderChapters.bind(courseController)
);

router.put(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(updateChapterSchema),
  courseController.updateChapter.bind(courseController)
);

router.delete(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  courseController.removeChapter.bind(courseController)
);

// Video Upload

router.post(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/video-upload-url',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(getVideoUploadUrlSchema),
  courseController.getVideoUploadUrl.bind(courseController)
);

router.post(
  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/confirm-upload',
  jwtAuthMiddleware,
  tutorAuthMiddleware,
  validateRequest(confirmVideoUploadSchema),
  courseController.confirmVideoUpload.bind(courseController)
);

export default router;