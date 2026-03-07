import { injectable, inject } from 'inversify';

import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { CreateRefreshTokenPort } from '../ports/CreateRefreshTokenPort';

@injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,

    @inject(TYPES.CreateRefreshTokenPort)
    private readonly createRefreshTokenPort: CreateRefreshTokenPort,
  ) {}

  async execute(plainToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const tokenHash = this.tokenService.hashToken(plainToken);

    const existingToken =
      await this.refreshTokenRepository.findByHash(tokenHash);

    if (!existingToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    if (existingToken.expiresAt.getTime() < Date.now()) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new AppError('Refresh token expired', 401);
    }

    const user = await this.userRepository.findById(existingToken.userId);

    if (!user || !user.id) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new AppError('User not found', 401);
    }

    // Revoke old refresh token
    await this.refreshTokenRepository.revoke(tokenHash);

    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    // Delegate creation of new refresh token via port
    const { token: newRefreshToken, expiresAt: refreshTokenExpiresAt } =
      await this.createRefreshTokenPort.execute(user.id);

    return { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt };
  }
}