import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { InitiateOAuthUseCase } from '../../application/auth/oauth/InitiateOAuthUseCase';
import { HandleOAuthCallbackUseCase } from '../../application/auth/oauth/HandleOAuthCallbackUseCase';
import { AppError } from '../../shared/errors/AppError';

@injectable()
export class OAuthController {
  constructor(
    @inject(TYPES.InitiateOAuthUseCase)
    private readonly initiateOAuthUseCase: InitiateOAuthUseCase,

    @inject(TYPES.HandleOAuthCallbackUseCase)
    private readonly handleOAuthCallbackUseCase: HandleOAuthCallbackUseCase,
  ) {}

  async initiate(provider: string): Promise<{ redirectUrl: string }> {
    // Use case throws AppError for unknown providers — no guard needed here
    const { redirectUrl } = await this.initiateOAuthUseCase.execute(provider as any);
    return { redirectUrl };
  }

  async callback(provider: string, code: string, state: string) {
    if (!code || !state) {
      throw new AppError('Missing OAuth callback parameters', 400);
    }
    return this.handleOAuthCallbackUseCase.execute({
      provider: provider as any,
      code,
      state,
    });
  }
}