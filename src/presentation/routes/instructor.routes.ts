import { Router, Request, Response, RequestHandler } from 'express';
import { InstructorHttpAdapter } from '../http/InstructorHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { adminAuthMiddleware } from '../../infrastructure/security/admin-auth.middleware';
import { validateRequest }     from '../middlewares/validationRequest';
import { applyForInstructorSchema, rejectApplicationSchema } from '../validators/instructor.validators';

export function createInstructorRouter(
  instructorAdapter: InstructorHttpAdapter,
  jwtAuthMiddleware: RequestHandler,
): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  router.post('/apply',  jwtAuthMiddleware, validateRequest(applyForInstructorSchema), bind(instructorAdapter.apply.bind(instructorAdapter)));
  router.get( '/status', jwtAuthMiddleware, bind(instructorAdapter.getStatus.bind(instructorAdapter)));

  router.get( '/applications',                        jwtAuthMiddleware, adminAuthMiddleware, bind(instructorAdapter.listApplications.bind(instructorAdapter)));
  router.post('/applications/:applicationId/approve', jwtAuthMiddleware, adminAuthMiddleware, bind(instructorAdapter.approveApplication.bind(instructorAdapter)));
  router.post('/applications/:applicationId/reject',  jwtAuthMiddleware, adminAuthMiddleware, validateRequest(rejectApplicationSchema), bind(instructorAdapter.rejectApplication.bind(instructorAdapter)));

  return router;
}