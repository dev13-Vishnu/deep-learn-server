import { Router, Request, Response } from 'express';
import { ProfileHttpAdapter } from '../http/ProfileHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';
import { jwtAuthMiddleware } from '../../infrastructure/security/middlewares';
import { upload } from '../middlewares/upload.middleware';

export function createProfileRouter(profileAdapter: ProfileHttpAdapter): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  router.use(jwtAuthMiddleware);

  router.get(   '/',       bind(profileAdapter.getProfile.bind(profileAdapter)));
  router.patch( '/',       bind(profileAdapter.updateProfile.bind(profileAdapter)));
  router.post(  '/avatar', upload.single('avatar'), bind(profileAdapter.uploadAvatar.bind(profileAdapter)));
  router.delete('/avatar', bind(profileAdapter.deleteAvatar.bind(profileAdapter)));

  return router;
}