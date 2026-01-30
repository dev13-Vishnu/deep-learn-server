import { injectable, inject } from 'inversify';

import { TYPES } from '../../shared/di/types';

import { RefreshTokenRepository } from '../../domain/auth/RefreshTokenRepository';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';

/**
 * Refresh-token TTL must match CreateRefreshTokenUseCase
 * Keep centralized in application layer.
 */
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

@injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepository,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort
  ) {}

  async execute(tokenHash: string): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
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

    if (!user) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new AppError('User not found', 401);
    }

    // Token rotation: revoke old refresh token
    await this.refreshTokenRepository.revoke(tokenHash);

    // Generate new refresh token
    const newRefreshToken = this.tokenService.generateRefreshToken();
    const newRefreshTokenHash =
      this.tokenService.hashToken(newRefreshToken);

    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_MS
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newRefreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt,
    };
  }
}
