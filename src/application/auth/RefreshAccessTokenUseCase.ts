import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { TokenServicePort } from '../ports/TokenServicePort';
import { UserRepositoryPort } from '../ports/UserRepositoryPort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { CreateRefreshTokenPort } from '../ports/CreateRefreshTokenPort';
import { IRefreshAccessTokenUseCase } from '../ports/inbound/auth/IRefreshAccessTokenUseCase';

@injectable()
export class RefreshAccessTokenUseCase implements IRefreshAccessTokenUseCase {
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
    const tokenHash     = this.tokenService.hashToken(plainToken);
    const existingToken = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!existingToken) {
      throw new ApplicationError('TOKEN_INVALID', 'Invalid refresh token');
    }
    if (existingToken.expiresAt.getTime() < Date.now()) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new ApplicationError('TOKEN_EXPIRED', 'Refresh token expired');
    }

    const user = await this.userRepository.findById(existingToken.userId);
    if (!user || !user.id) {
      await this.refreshTokenRepository.revoke(tokenHash);
      throw new ApplicationError('USER_NOT_FOUND', 'User not found');
    }

    await this.refreshTokenRepository.revoke(tokenHash);

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role:   user.role,
    });
    const { token: newRefreshToken, expiresAt: refreshTokenExpiresAt } =
      await this.createRefreshTokenPort.execute(user.id);

    return { accessToken, refreshToken: newRefreshToken, refreshTokenExpiresAt };
  }
}