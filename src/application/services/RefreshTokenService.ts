import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { TokenServicePort } from '../ports/TokenServicePort';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { authConfig } from '../../shared/config/auth.config';

@injectable()
export class RefreshTokenService {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepo: RefreshTokenRepositoryPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,
  ) {}

  async create(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token     = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = new Date(Date.now() + authConfig.refreshToken.expiresInMs);

    const refreshToken = new RefreshToken(
      undefined,  // ID assigned by repository
      userId,
      tokenHash,
      expiresAt,
      new Date(),
    );

    await this.refreshTokenRepo.create(refreshToken);

    return { token, expiresAt };
  }
}