// ─────────────────────────────────────────────────────────────────────────────
// USE CASE: HandleOAuthCallbackUseCase
// Shared callback logic for ALL three providers.
// Reuses your existing CreateRefreshTokenUseCase + TokenServicePort — no duplication.
// ─────────────────────────────────────────────────────────────────────────────

import { injectable, inject } from 'inversify';
import { TYPES } from '../../../shared/di/types';
import { AppError } from '../../../shared/errors/AppError';
import { OAuthStateStorePort } from '../../ports/OAuthStateStorePort';
import { OAuthConnectionRepositoryPort } from '../../ports/OAuthConnectionRepositoryPort';
import { OAuthProviderPort } from '../../ports/OAuthProviderPort';
import { UserRepositoryPort } from '../../ports/UserRepositoryPort';
import { TokenServicePort } from '../../ports/TokenServicePort';
import { CreateRefreshTokenUseCase } from '../CreateRefreshTokenUseCase';
import { OAuthConnection, OAuthProvider } from '../../../domain/entities/OAuthConnection';
import { Email } from '../../../domain/value-objects/Email';
import { UserRole } from '../../../domain/entities/UserRole';

interface HandleOAuthCallbackInput {
  provider: OAuthProvider;
  code: string;
  state: string;
}

interface HandleOAuthCallbackOutput {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

@injectable()
export class HandleOAuthCallbackUseCase {
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

    @inject(TYPES.CreateRefreshTokenUseCase)
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase
  ) {}

  async execute(input: HandleOAuthCallbackInput): Promise<HandleOAuthCallbackOutput> {
    const { provider, code, state } = input;

    const stateValid = await this.stateStore.consume(state);
    if (!stateValid) {
      throw new AppError('OAuth state is invalid or expired. Please try again.', 400);
    }

    const adapter = this.providerRegistry.get(provider);
    if (!adapter) {
      throw new AppError(`OAuth provider "${provider}" is not configured`, 400);
    }

    const profile = await adapter.exchangeCodeForProfile(code);

    const { user, isNewUser } = await this.findOrCreateUser(provider, profile);

    if (!user.id) {
      throw new AppError('User ID not found after OAuth', 500);
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    const { token: refreshToken } = await this.createRefreshTokenUseCase.execute(user.id);

    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        role: user.role,
      },
      accessToken,
      refreshToken,
      isNewUser,
    };
  }

  private async findOrCreateUser(
    provider: OAuthProvider,
    profile: { providerId: string; email: string; name: string; avatarUrl?: string }
  ) {
    const existingConnection = await this.oauthConnectionRepo.findByProvider(
      provider,
      profile.providerId
    );

    if (existingConnection) {
      const user = await this.userRepo.findById(existingConnection.userId);
      if (!user) {
        throw new AppError('Linked user account not found', 404);
      }
      return { user, isNewUser: false };
    }

    const email = new Email(profile.email);
    const existingUser = await this.userRepo.findByEmail(email);

    if (existingUser) {
      if (!existingUser.id) throw new AppError('User ID not found', 500);

      await this.oauthConnectionRepo.create(
        new OAuthConnection(
          undefined,
          existingUser.id,
          provider,
          profile.providerId,
          profile.email,
          profile.name,
          profile.avatarUrl,
          new Date()
        )
      );

      return { user: existingUser, isNewUser: false };
    }

    const [firstName, ...rest] = profile.name.split(' ');
    const lastName = rest.join(' ') || undefined;

    const newUser = await this.userRepo.createOAuthUser({
      email: profile.email,
      firstName,
      lastName,
      avatar: profile.avatarUrl,
      provider,
      providerId: profile.providerId,
    });

    if (!newUser.id) throw new AppError('Failed to create user', 500);

    await this.oauthConnectionRepo.create(
      new OAuthConnection(
        undefined,
        newUser.id,
        provider,
        profile.providerId,
        profile.email,
        profile.name,
        profile.avatarUrl,
        new Date()
      )
    );

    return { user: newUser, isNewUser: true };
  }
}