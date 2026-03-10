import { Router, Request, Response, RequestHandler } from 'express';
import { CourseHttpAdapter } from '../http/CourseHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { tutorAuthMiddleware } from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest }     from '../middlewares/validationRequest';
import {
  createCourseSchema, updateCourseSchema,
  addModuleSchema, updateModuleSchema, reorderSchema,
  addLessonSchema, updateLessonSchema,
  addChapterSchema, updateChapterSchema,
  getVideoUploadUrlSchema, confirmVideoUploadSchema,
} from '../validators/course.validators';
import { upload } from '../middlewares/upload.middleware';

export function createInstructorCourseRouter(
  courseAdapter:     CourseHttpAdapter,
  jwtAuthMiddleware: RequestHandler,
): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  const auth = [jwtAuthMiddleware, tutorAuthMiddleware] as const;

  // Course CRUD
  router.post(  '/courses',           ...auth, validateRequest(createCourseSchema), bind(courseAdapter.createCourse.bind(courseAdapter)));
  router.get(   '/courses',           ...auth, bind(courseAdapter.getMyCourses.bind(courseAdapter)));
  router.get(   '/courses/:courseId', ...auth, bind(courseAdapter.getMyCourse.bind(courseAdapter)));
  router.put(   '/courses/:courseId', ...auth, validateRequest(updateCourseSchema), bind(courseAdapter.updateCourse.bind(courseAdapter)));
  router.delete('/courses/:courseId', ...auth, bind(courseAdapter.deleteCourse.bind(courseAdapter)));

  // Thumbnail
  router.post('/courses/:courseId/thumbnail', ...auth, upload.single('thumbnail'), bind(courseAdapter.uploadThumbnail.bind(courseAdapter)));

  // Status transitions
  router.post('/courses/:courseId/publish',   ...auth, bind(courseAdapter.publishCourse.bind(courseAdapter)));
  router.post('/courses/:courseId/unpublish', ...auth, bind(courseAdapter.unpublishCourse.bind(courseAdapter)));
  router.post('/courses/:courseId/archive',   ...auth, bind(courseAdapter.archiveCourse.bind(courseAdapter)));

  // Modules
  router.post(  '/courses/:courseId/modules',           ...auth, validateRequest(addModuleSchema),    bind(courseAdapter.addModule.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/reorder',   ...auth, validateRequest(reorderSchema),      bind(courseAdapter.reorderModules.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/:moduleId', ...auth, validateRequest(updateModuleSchema), bind(courseAdapter.updateModule.bind(courseAdapter)));
  router.delete('/courses/:courseId/modules/:moduleId', ...auth, bind(courseAdapter.removeModule.bind(courseAdapter)));

  // Lessons
  router.post(  '/courses/:courseId/modules/:moduleId/lessons',           ...auth, validateRequest(addLessonSchema),    bind(courseAdapter.addLesson.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/:moduleId/lessons/reorder',   ...auth, validateRequest(reorderSchema),      bind(courseAdapter.reorderLessons.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/:moduleId/lessons/:lessonId', ...auth, validateRequest(updateLessonSchema), bind(courseAdapter.updateLesson.bind(courseAdapter)));
  router.delete('/courses/:courseId/modules/:moduleId/lessons/:lessonId', ...auth, bind(courseAdapter.removeLesson.bind(courseAdapter)));

  // Chapters
  router.post(  '/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters',                  ...auth, validateRequest(addChapterSchema),   bind(courseAdapter.addChapter.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters/reorder',          ...auth, validateRequest(reorderSchema),       bind(courseAdapter.reorderChapters.bind(courseAdapter)));
  router.put(   '/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',       ...auth, validateRequest(updateChapterSchema), bind(courseAdapter.updateChapter.bind(courseAdapter)));
  router.delete('/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',       ...auth, bind(courseAdapter.removeChapter.bind(courseAdapter)));

  // Video upload (presigned S3 flow)
  router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/video-upload-url', ...auth, validateRequest(getVideoUploadUrlSchema),  bind(courseAdapter.getVideoUploadUrl.bind(courseAdapter)));
  router.post('/courses/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/confirm-upload',   ...auth, validateRequest(confirmVideoUploadSchema), bind(courseAdapter.confirmVideoUpload.bind(courseAdapter)));

  return router;
}