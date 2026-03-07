import { Router, Request, Response } from 'express';
import { CourseHttpAdapter } from '../http/CourseHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { jwtAuthMiddleware }    from '../../infrastructure/security/middlewares';
import { tutorAuthMiddleware }  from '../../infrastructure/security/tutor-auth.middleware';
import { validateRequest }      from '../middlewares/validationRequest';
import {
  createCourseSchema, updateCourseSchema,
  addModuleSchema, updateModuleSchema, reorderSchema,
  addLessonSchema, updateLessonSchema,
  addChapterSchema, updateChapterSchema,
  getVideoUploadUrlSchema, confirmVideoUploadSchema,
} from '../validators/course.validators';
import { upload } from '../middlewares/upload.middleware';

export function createCourseRouter(courseAdapter: CourseHttpAdapter): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  const auth = [jwtAuthMiddleware, tutorAuthMiddleware] as const;

  // Public
  router.get('/',          bind(courseAdapter.getPublicCourses.bind(courseAdapter)));
  router.get('/:courseId', bind(courseAdapter.getPublicCourse.bind(courseAdapter)));

  // Tutor — course CRUD
  router.post('/',               ...auth, validateRequest(createCourseSchema), bind(courseAdapter.createCourse.bind(courseAdapter)));
  router.get( '/my',             ...auth, bind(courseAdapter.getMyCourses.bind(courseAdapter)));
  router.get( '/my/:courseId',   ...auth, bind(courseAdapter.getMyCourse.bind(courseAdapter)));
  router.put( '/my/:courseId',   ...auth, validateRequest(updateCourseSchema), bind(courseAdapter.updateCourse.bind(courseAdapter)));
  router.delete('/my/:courseId', ...auth, bind(courseAdapter.deleteCourse.bind(courseAdapter)));
  router.post('/my/:courseId/thumbnail', ...auth, upload.single('thumbnail'), bind(courseAdapter.uploadThumbnail.bind(courseAdapter)));

  // Status transitions
  router.post('/my/:courseId/publish',   ...auth, bind(courseAdapter.publishCourse.bind(courseAdapter)));
  router.post('/my/:courseId/unpublish', ...auth, bind(courseAdapter.unpublishCourse.bind(courseAdapter)));
  router.post('/my/:courseId/archive',   ...auth, bind(courseAdapter.archiveCourse.bind(courseAdapter)));

  // Modules
  router.post(  '/my/:courseId/modules',                 ...auth, validateRequest(addModuleSchema),    bind(courseAdapter.addModule.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/reorder',         ...auth, validateRequest(reorderSchema),      bind(courseAdapter.reorderModules.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/:moduleId',       ...auth, validateRequest(updateModuleSchema), bind(courseAdapter.updateModule.bind(courseAdapter)));
  router.delete('/my/:courseId/modules/:moduleId',       ...auth, bind(courseAdapter.removeModule.bind(courseAdapter)));

  // Lessons
  router.post(  '/my/:courseId/modules/:moduleId/lessons',                 ...auth, validateRequest(addLessonSchema),    bind(courseAdapter.addLesson.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/:moduleId/lessons/reorder',         ...auth, validateRequest(reorderSchema),      bind(courseAdapter.reorderLessons.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/:moduleId/lessons/:lessonId',       ...auth, validateRequest(updateLessonSchema), bind(courseAdapter.updateLesson.bind(courseAdapter)));
  router.delete('/my/:courseId/modules/:moduleId/lessons/:lessonId',       ...auth, bind(courseAdapter.removeLesson.bind(courseAdapter)));

  // Chapters
  router.post(  '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters',                  ...auth, validateRequest(addChapterSchema),   bind(courseAdapter.addChapter.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/reorder',          ...auth, validateRequest(reorderSchema),       bind(courseAdapter.reorderChapters.bind(courseAdapter)));
  router.put(   '/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',       ...auth, validateRequest(updateChapterSchema), bind(courseAdapter.updateChapter.bind(courseAdapter)));
  router.delete('/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId',       ...auth, bind(courseAdapter.removeChapter.bind(courseAdapter)));

  // Video
  router.post('/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/video-upload-url', ...auth, validateRequest(getVideoUploadUrlSchema),  bind(courseAdapter.getVideoUploadUrl.bind(courseAdapter)));
  router.post('/my/:courseId/modules/:moduleId/lessons/:lessonId/chapters/:chapterId/confirm-upload',   ...auth, validateRequest(confirmVideoUploadSchema), bind(courseAdapter.confirmVideoUpload.bind(courseAdapter)));

  return router;
}