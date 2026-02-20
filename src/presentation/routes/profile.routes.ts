import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { ProfileController } from '../controllers/ProfileController';
import { jwtAuthMiddleware } from '../../infrastructure/security/jwt-auth.middleware';
import { upload } from '../../infrastructure/middlewares/upload.middleware';

const router = Router();

const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);

// All profile routes are protected
router.use(jwtAuthMiddleware);

router.get('/', profileController.getProfile.bind(profileController));
router.patch('/', profileController.updateProfile.bind(profileController));
router.post(
  '/avatar',
  upload.single('avatar'),
  profileController.uploadAvatar.bind(profileController)
);
router.delete('/avatar', profileController.deleteAvatar.bind(profileController));

export default router;