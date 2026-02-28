import { injectable, inject } from 'inversify';

import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { AppError } from '../../shared/errors/AppError';
import { authConfig } from '../../shared/config/auth.config';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import { CreateRefreshTokenUseCase } from './CreateRefreshTokenUseCase';



@injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,

    @inject(TYPES.UserRepositoryPort)
    private readonly userRepository: UserRepositoryPort,
    
    @inject(TYPES.CreateRefreshTokenUseCase)
    private readonly createRefreshTokenUseCase: CreateRefreshTokenUseCase,
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

  // Delegate creation of new refresh token
  const {
    token: newRefreshToken,
    expiresAt: refreshTokenExpiresAt,
  } = await this.createRefreshTokenUseCase.execute(user.id);

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
