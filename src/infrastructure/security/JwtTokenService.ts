import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, TokenServicePort } from '../../application/ports/TokenServicePort';
import { ApplicationError } from '../../shared/errors/ApplicationError';
import { JwtConfig } from '../../shared/config/types/JwtConfig';
import { TYPES } from '../../shared/di/types';

@injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    @inject(TYPES.JwtConfig)
    private readonly config: JwtConfig,
  ) {}

  generateAccessToken(payload: TokenPayload): string {
    if (!this.config.secret) {
      throw new ApplicationError('CONFIGURATION_ERROR', 'JWT access secret not configured');
    }
    return jwt.sign(payload, this.config.secret, {
      expiresIn: this.config.expiresIn as any,
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    if (!this.config.secret) {
      throw new ApplicationError('CONFIGURATION_ERROR', 'JWT access secret not configured');
    }
    try {
      return jwt.verify(token, this.config.secret) as TokenPayload;
    } catch {
      throw new ApplicationError('TOKEN_INVALID', 'Invalid or expired access token');
    }
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}