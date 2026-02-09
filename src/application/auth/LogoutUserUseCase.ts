import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import crypto from 'crypto';

@injectable()
export class LogoutUserUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort
  ) {}

  async execute(refreshToken: string): Promise<void> {
    // Hash the token to find it in database
    const tokenHash = this.hashToken(refreshToken);

    // Delete the refresh token from database
    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}