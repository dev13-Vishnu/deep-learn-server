import { OAuthProvider } from '../../../../../domain/entities/OAuthConnection';
import { UserRole } from '../../../../../domain/entities/UserRole';

export interface IHandleOAuthCallbackUseCase {
  execute(input: {
    provider: OAuthProvider;
    code:     string;
    state:    string;
  }): Promise<{
    user:         { id: string; email: string; role: UserRole };
    accessToken:  string;
    refreshToken: string;
    isNewUser:    boolean;
  }>;
}