import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { OAuthProviderPort } from '../../application/ports/OAuthProviderPort';
import { OAuthProviderRegistryPort } from '../../application/ports/OAuthProviderRegistryPort';

export class OAuthProviderRegistry implements OAuthProviderRegistryPort {
  private readonly providers: Map<OAuthProvider, OAuthProviderPort>;

  constructor(providers: Map<OAuthProvider, OAuthProviderPort>) {
    this.providers = providers;
  }

  getProvider(provider: OAuthProvider): OAuthProviderPort | undefined {
    return this.providers.get(provider);
  }
}