import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../shared/di/types';
import { InitiateOAuthUseCase } from '../../application/auth/oauth/InitiateOAuthUseCase';
import { HandleOAuthCallbackUseCase } from '../../application/auth/oauth/HandleOAuthCallbackUseCase';
import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../shared/config/env';
import { authConfig } from '../../shared/config/auth.config';

const VALID_PROVIDERS: OAuthProvider[] = ['google', 'facebook', 'microsoft'];

@injectable()
export class OAuthController {
  constructor(
    @inject(TYPES.InitiateOAuthUseCase)
    private readonly initiateOAuthUseCase: InitiateOAuthUseCase,

    @inject(TYPES.HandleOAuthCallbackUseCase)
    private readonly handleOAuthCallbackUseCase: HandleOAuthCallbackUseCase
  ) {}

  async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as OAuthProvider;

      if (!VALID_PROVIDERS.includes(provider)) {
        throw new AppError(`Unknown OAuth provider: ${provider}`, 400);
      }

      const { redirectUrl } = await this.initiateOAuthUseCase.execute(provider);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  async callback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const provider = req.params.provider as OAuthProvider;
      const { code, state, error: providerError } = req.query as Record<string, string>;

     if (providerError) {
        return res.redirect(`${env.frontendOrigin}/auth/error?reason=access_denied`) as unknown as void;
      }

      if (!code || !state) {
        throw new AppError('Missing OAuth callback parameters', 400);
      }

      if (!VALID_PROVIDERS.includes(provider)) {
        throw new AppError(`Unknown OAuth provider: ${provider}`, 400);
      }

      const result = await this.handleOAuthCallbackUseCase.execute({
        provider,
        code,
        state,
      });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: 'lax',
        maxAge: authConfig.refreshToken.expiresInMs,
      });

      const redirectTo = '/home'
      res.redirect(
        `${env.frontendOrigin}/auth/callback?token=${result.accessToken}&redirect=${redirectTo}`
      );
    } catch (error) {
      next(error);
    }
  }
}