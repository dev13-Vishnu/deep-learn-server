import { Router } from 'express';
import healthRoutes from './health.routes';

export function createApiRouter(
  publicCourseRouter:     Router,
  instructorCourseRouter: Router,
): Router {
  const router = Router();

  router.use('/health',     healthRoutes);
  router.use('/courses',    publicCourseRouter);
  router.use('/instructor', instructorCourseRouter);

  return router;
}
