import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '../../../shared/di/types';
import { OAuthStateStorePort } from '../../ports/OAuthStateStorePort';
import { OAuthProviderPort } from '../../ports/OAuthProviderPort';
import { OAuthProvider } from '../../../domain/entities/OAuthConnection';
import { AppError } from '../../../shared/errors/AppError';

interface InitiateOAuthOutput {
  redirectUrl: string;
  state: string;
}

@injectable()
export class InitiateOAuthUseCase {
  constructor(
    @inject(TYPES.OAuthStateStorePort)
    private readonly stateStore: OAuthStateStorePort,

    @inject(TYPES.OAuthProviderRegistry)
    private readonly providerRegistry: Map<OAuthProvider, OAuthProviderPort>
  ) {}

  async execute(provider: OAuthProvider): Promise<InitiateOAuthOutput> {
    const adapter = this.providerRegistry.get(provider);

    if (!adapter) {
      throw new AppError(`OAuth provider "${provider}" is not configured`, 400);
    }

    const state = crypto.randomBytes(32).toString('hex');
    await this.stateStore.save(state, 600); // 10 min TTL

    const redirectUrl = adapter.getAuthorizationUrl(state);

    return { redirectUrl, state };
  }
}