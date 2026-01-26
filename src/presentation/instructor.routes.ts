import { Router } from 'express';
import { jwtAuthMiddleware } from '../infrastructure/security/jwt-auth.middleware';
import { InstructorController } from './controllers/InstructorController';

export function instructorRoutes(controller: InstructorController) {
  const router = Router();

  router.post('/apply', jwtAuthMiddleware, controller.apply);
  router.get('/status', jwtAuthMiddleware, controller.status);

  return router;
}
