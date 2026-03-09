import { injectable, inject } from 'inversify';
import crypto from 'crypto';
import { TYPES } from '../../../shared/di/types';
import { OAuthStateStorePort } from '../../ports/OAuthStateStorePort';
import { OAuthProviderRegistryPort } from '../../ports/OAuthProviderRegistryPort';
import { OAuthProvider } from '../../../domain/entities/OAuthConnection';
import { ApplicationError } from '../../../shared/errors/ApplicationError';
import { IInitiateOAuthUseCase } from '../../ports/inbound/auth/oauth/IInitiateOAuthUseCase';

interface InitiateOAuthOutput {
  redirectUrl: string;
  state: string;
}

@injectable()
export class InitiateOAuthUseCase implements IInitiateOAuthUseCase {
  constructor(
    @inject(TYPES.OAuthStateStorePort)
    private readonly stateStore: OAuthStateStorePort,

    @inject(TYPES.OAuthProviderRegistry)
    private readonly providerRegistry: OAuthProviderRegistryPort,
  ) {}

  async execute(provider: OAuthProvider): Promise<InitiateOAuthOutput> {
    const adapter = this.providerRegistry.getProvider(provider);

    if (!adapter) {
      throw new ApplicationError(
        'OAUTH_PROVIDER_NOT_CONFIGURED',
        `OAuth provider "${provider}" is not configured`,
      );
    }

    const state = crypto.randomBytes(32).toString('hex');
    await this.stateStore.save(state, 600);

    const redirectUrl = adapter.getAuthorizationUrl(state);

    return { redirectUrl, state };
  }
}