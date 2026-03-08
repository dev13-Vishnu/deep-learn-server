import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { IInitiateOAuthUseCase }       from '../../application/ports/inbound/auth/oauth/IInitiateOAuthUseCase';
import { IHandleOAuthCallbackUseCase } from '../../application/ports/inbound/auth/oauth/IHandleOAuthCallbackUseCase';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class OAuthController {
  constructor(
    @inject(TYPES.InitiateOAuthUseCase)
    private readonly initiateOAuthUseCase: IInitiateOAuthUseCase,

    @inject(TYPES.HandleOAuthCallbackUseCase)
    private readonly handleOAuthCallbackUseCase: IHandleOAuthCallbackUseCase,
  ) {}

  async initiate(provider: string): Promise<{ redirectUrl: string }> {
    const { redirectUrl } = await this.initiateOAuthUseCase.execute(provider as any);
    return { redirectUrl };
  }

  async callback(provider: string, code: string, state: string) {
    if (!code || !state) {
      throw new AppError('Missing OAuth callback parameters', 400);
    }
    return this.handleOAuthCallbackUseCase.execute({ provider: provider as any, code, state });
  }
}