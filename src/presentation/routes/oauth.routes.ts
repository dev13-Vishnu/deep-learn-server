import { Router, Request, Response } from 'express';
import { OAuthHttpAdapter } from '../http/OAuthHttpAdapter';
import { toHttpRequest, toHttpResponse } from '../../infrastructure/http/ExpressBridge';

export function createOAuthRouter(oauthAdapter: OAuthHttpAdapter): Router {
  const router = Router();

  const bind = (fn: (req: any, res: any) => Promise<void>) =>
    (req: Request, res: Response) => fn(toHttpRequest(req), toHttpResponse(res));

  router.get('/:provider',          bind(oauthAdapter.initiate.bind(oauthAdapter)));
  router.get('/:provider/callback', bind(oauthAdapter.callback.bind(oauthAdapter)));

  return router;
}