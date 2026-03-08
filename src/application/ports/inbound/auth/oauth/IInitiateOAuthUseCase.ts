import { OAuthProvider } from '../../../../../domain/entities/OAuthConnection';

export interface IInitiateOAuthUseCase {
  execute(provider: OAuthProvider): Promise<{ redirectUrl: string; state: string }>;
}