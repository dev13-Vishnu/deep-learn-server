import { Router, Request, Response } from 'express';
import { container } from '../../infrastructure/di/container';
import { TYPES } from '../../shared/di/types';
import { OAuthHttpAdapter } from '../http/OAuthHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';

const router = Router();

const oauthAdapter = container.get<OAuthHttpAdapter>(TYPES.OAuthHttpAdapter);

const bind = (fn: (req: any, res: any) => Promise<void>) =>
  (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

router.get('/:provider',          bind(oauthAdapter.initiate.bind(oauthAdapter)));
router.get('/:provider/callback', bind(oauthAdapter.callback.bind(oauthAdapter)));

export default router;