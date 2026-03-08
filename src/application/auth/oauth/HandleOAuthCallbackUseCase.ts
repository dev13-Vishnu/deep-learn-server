import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { ApplicationError } from '../../../shared/errors/ApplicationError';
import { OAuthStateStorePort } from '../../ports/OAuthStateStorePort';
import { OAuthConnectionRepositoryPort } from '../../ports/OAuthConnectionRepositoryPort';
import { OAuthProviderPort } from '../../ports/OAuthProviderPort';
import { UserRepositoryPort } from '../../ports/UserRepositoryPort';
import { TokenServicePort } from '../../ports/TokenServicePort';
import { CreateRefreshTokenPort } from '../../ports/CreateRefreshTokenPort';
import { OAuthConnection, OAuthProvider } from '../../../domain/entities/OAuthConnection';
import { Email } from '../../../domain/value-objects/Email';
import { UserRole } from '../../../domain/entities/UserRole';
import { IHandleOAuthCallbackUseCase } from '../../ports/inbound/auth/oauth/IHandleOAuthCallbackUseCase';

interface HandleOAuthCallbackInput {
  provider: OAuthProvider;
  code:     string;
  state:    string;
}

interface HandleOAuthCallbackOutput {
  user: { id: string; email: string; role: UserRole };
  accessToken:  string;
  refreshToken: string;
  isNewUser:    boolean;
}

@injectable()
export class HandleOAuthCallbackUseCase implements IHandleOAuthCallbackUseCase {
  constructor(
    @inject(TYPES.OAuthStateStorePort)
    private readonly stateStore: OAuthStateStorePort,
    @inject(TYPES.OAuthProviderRegistry)
    private readonly providerRegistry: Map<OAuthProvider, OAuthProviderPort>,
    @inject(TYPES.OAuthConnectionRepositoryPort)
    private readonly oauthConnectionRepo: OAuthConnectionRepositoryPort,
    @inject(TYPES.UserRepositoryPort)
    private readonly userRepo: UserRepositoryPort,
    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,
    @inject(TYPES.CreateRefreshTokenPort)
    private readonly createRefreshTokenPort: CreateRefreshTokenPort,
  ) {}

  async execute(input: HandleOAuthCallbackInput): Promise<HandleOAuthCallbackOutput> {
    const { provider, code, state } = input;

    const stateValid = await this.stateStore.consume(state);
    if (!stateValid) {
      throw new ApplicationError('OAUTH_STATE_INVALID', 'OAuth state is invalid or expired. Please try again.');
    }

    const adapter = this.providerRegistry.get(provider);
    if (!adapter) {
      throw new ApplicationError('OAUTH_PROVIDER_NOT_CONFIGURED', `OAuth provider "${provider}" is not configured`);
    }

    const profile = await adapter.exchangeCodeForProfile(code);
    const { user, isNewUser } = await this.findOrCreateUser(provider, profile);

    if (!user.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'User ID not found after OAuth');
    }

    const accessToken = this.tokenService.generateAccessToken({ userId: user.id, role: user.role });
    const { token: refreshToken } = await this.createRefreshTokenPort.execute(user.id);

    return {
      user: { id: user.id, email: user.email.getValue(), role: user.role },
      accessToken,
      refreshToken,
      isNewUser,
    };
  }

  private async findOrCreateUser(
    provider: OAuthProvider,
    profile:  { providerId: string; email: string; name: string; avatarUrl?: string }
  ) {
    const existingConnection = await this.oauthConnectionRepo.findByProvider(provider, profile.providerId);

    if (existingConnection) {
      const user = await this.userRepo.findById(existingConnection.userId);
      if (!user) {
        throw new ApplicationError('USER_NOT_FOUND', 'Linked user account not found');
      }
      return { user, isNewUser: false };
    }

    const email        = new Email(profile.email);
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser) {
      if (!existingUser.id) {
        throw new ApplicationError('INTERNAL_ERROR', 'User ID not found');
      }
      await this.oauthConnectionRepo.create(
        new OAuthConnection(undefined, existingUser.id, provider, profile.providerId,
          profile.email, profile.name, profile.avatarUrl, new Date())
      );
      return { user: existingUser, isNewUser: false };
    }

    const [firstName, ...rest] = profile.name.split(' ');
    const lastName = rest.join(' ') || undefined;

    const newUser = await this.userRepo.createOAuthUser({
      email: profile.email, firstName, lastName,
      avatar: profile.avatarUrl, provider, providerId: profile.providerId,
    });

    if (!newUser.id) {
      throw new ApplicationError('INTERNAL_ERROR', 'Failed to create user');
    }

    await this.oauthConnectionRepo.create(
      new OAuthConnection(undefined, newUser.id, provider, profile.providerId,
        profile.email, profile.name, profile.avatarUrl, new Date())
    );
    return { user: newUser, isNewUser: true };
  }
}