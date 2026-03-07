import { Router, Request, Response } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { ProfileHttpAdapter } from '../http/ProfileHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { upload } from '../../infrastructure/middlewares/upload.middleware';
import { jwtAuthMiddleware } from '../../infrastructure/security/middlewares';

const router = Router();

const profileAdapter = container.get<ProfileHttpAdapter>(TYPES.ProfileHttpAdapter);

const bind = (fn: (req: any, res: any) => Promise<void>) =>
  (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

router.use(jwtAuthMiddleware);

router.get(   '/',       bind(profileAdapter.getProfile.bind(profileAdapter)));
router.patch( '/',       bind(profileAdapter.updateProfile.bind(profileAdapter)));
router.post(  '/avatar', upload.single('avatar'), bind(profileAdapter.uploadAvatar.bind(profileAdapter)));
router.delete('/avatar', bind(profileAdapter.deleteAvatar.bind(profileAdapter)));

export default router;