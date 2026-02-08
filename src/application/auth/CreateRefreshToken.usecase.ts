import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import crypto from 'crypto';

interface CreateRefreshTokenOutput {
  token: string;
  expiresAt: Date;
}

@injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort
  ) {}

  async execute(userId: string): Promise<CreateRefreshTokenOutput> {
    // Generate token
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = this.calculateExpiration();

    // ✅ Create domain entity
    const refreshToken = new RefreshToken(
      undefined,  // ID assigned by repository
      userId,
      tokenHash,
      expiresAt,
      new Date()
    );

    // ✅ SAVE TO DATABASE
    await this.refreshTokenRepository.create(refreshToken);

    return { token, expiresAt };
  }

  private generateToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private calculateExpiration(): Date {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
    return new Date(Date.now() + expiresIn);
  }
}