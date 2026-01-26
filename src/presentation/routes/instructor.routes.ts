import { Router } from 'express';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { InstructorController } from '../controllers/InstructorController';
import { validateRequest } from '../middlewares/validationRequest';
import { instructorApplySchema } from '../validators/instructorApply.schema';

export function instructorRoutes(controller: InstructorController) {
  const router = Router();

  router.post(
    '/apply',
    jwtAuthMiddleware,
    validateRequest(instructorApplySchema),
    controller.apply);

  router.get(
    '/status',
    jwtAuthMiddleware,
    controller.status);

  return router;
}
