import { Router, Request, Response } from 'express';
import { CourseHttpAdapter } from '../http/CourseHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';

export function createPublicCourseRouter(
  courseAdapter: CourseHttpAdapter,
): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  // GET /api/courses          — public course listing (with filters)
  router.get('/',          bind(courseAdapter.getPublicCourses.bind(courseAdapter)));

  // GET /api/courses/:courseId — public course detail
  router.get('/:courseId', bind(courseAdapter.getPublicCourse.bind(courseAdapter)));

  return router;
}