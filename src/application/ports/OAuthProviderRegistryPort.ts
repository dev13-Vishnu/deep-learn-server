import { OAuthProvider } from '../../domain/entities/OAuthConnection';
import { OAuthProviderPort } from './OAuthProviderPort';

export interface OAuthProviderRegistryPort {
  getProvider(provider: OAuthProvider): OAuthProviderPort | undefined;
}