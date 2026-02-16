import { Router } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { OAuthController } from '../controllers/OAuthController';

const router = Router();

const oauthController = container.get<OAuthController>(TYPES.OAuthController);

router.get('/:provider', (req, res, next) =>
  oauthController.initiate(req, res, next)
);

router.get('/:provider/callback', (req, res, next) =>
  oauthController.callback(req, res, next)
);

export default router;