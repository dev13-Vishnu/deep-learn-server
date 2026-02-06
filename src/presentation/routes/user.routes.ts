import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';


  const router = Router();

  const userController = container.get<UserController>(TYPES.UserController)

  router.patch(
    '/me/profile',
    jwtAuthMiddleware,
    userController.updateMyProfile.bind(userController)
  );

  export default router;

