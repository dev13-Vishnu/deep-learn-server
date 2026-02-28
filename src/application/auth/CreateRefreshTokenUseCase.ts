import { injectable, inject } from 'inversify';
import { TYPES } from '../../shared/di/types';
import { RefreshTokenRepositoryPort } from '../ports/RefreshTokenRepositoryPort';
import { RefreshToken } from '../../domain/entities/RefreshToken';
import crypto from 'crypto';
import { TokenServicePort } from '../ports/TokenServicePort';
import { authConfig } from '../../shared/config/auth.config';

interface CreateRefreshTokenOutput {
  token: string;
  expiresAt: Date;
}

@injectable()
export class CreateRefreshTokenUseCase {
  constructor(
    @inject(TYPES.RefreshTokenRepositoryPort)
    private readonly refreshTokenRepository: RefreshTokenRepositoryPort,

    @inject(TYPES.TokenServicePort)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(userId: string): Promise<CreateRefreshTokenOutput> {
    // Generate token
    const token = this.tokenService.generateRefreshToken();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = new Date(
      Date.now() + authConfig.refreshToken.expiresInMs
    );
    // Create domain entity
    const refreshToken = new RefreshToken(
      undefined,  // ID assigned by repository
      userId,
      tokenHash,
      expiresAt,
      new Date()
    );

    // SAVE TO DATABASE
    await this.refreshTokenRepository.create(refreshToken);

    return { token, expiresAt };
  }
}