import { injectable, inject } from 'inversify';
import { HttpRequest, HttpResponse } from './HttpContext';
import { OAuthController } from '../controllers/OAuthController';
import { env } from '../../shared/config/env';
import { authConfig } from '../../shared/config/auth.config';
import { PRESENTATION_TYPES } from '../di/presentationTypes';

@injectable()
export class OAuthHttpAdapter {
  constructor(
    @inject(PRESENTATION_TYPES.OAuthController)
    private readonly oauthController: OAuthController,
  ) {}

  async initiate(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { redirectUrl } = await this.oauthController.initiate(req.params.provider);
    res.redirect(redirectUrl);
  }

  async callback(req: HttpRequest, res: HttpResponse): Promise<void> {
    const { error: providerError, code, state } = req.query;

    if (providerError) {
      res.redirect(`${env.frontendOrigin}/auth/error?reason=access_denied`);
      return;
    }

    const result = await this.oauthController.callback(req.params.provider, code, state);

    const isCrossSite = env.isProduction || env.isTunnel;
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure:   isCrossSite,
      sameSite: isCrossSite ? 'none' : 'lax',
      maxAge:   authConfig.refreshToken.expiresInMs,
    });

    res.redirect(
      `${env.frontendOrigin}/auth/callback?token=${result.accessToken}&redirect=/home`
    );
  }
}